import { FileType, Uri, window, workspace } from 'vscode';
import { logger } from './logger';

const PROCESS_FOLDERS_OPTION_CANCEL = 'Cancel';
const PROCESS_FOLDERS_OPTION_FILES_ONLY = 'Files only (ignore folders)';
const PROCESS_FOLDERS_OPTION_ALL = 'Include folder contents (recursive)';

/**
 * Flattens selected files and folder content
 */
export async function resolveSelectedItems(uris: Uri[]): Promise<string[] | null> {
  const folders: Uri[] = [];
  const files: Uri[] = [];

  for (const uri of uris) {
    if (uri.scheme !== 'file') {
      continue;
    }
    try {
      const stat = await workspace.fs.stat(uri);
      if (stat.type === FileType.Directory) {
        folders.push(uri);
      } else if (stat.type === FileType.File) {
        files.push(uri);
      }
    } catch (err) {
      logger.error(`Error reading ${uri}`);
      logger.error(`Error message reading ${JSON.stringify(err)}`);
    }
  }

  const filesPaths = files.map((u) => u.fsPath);

  if (folders.length === 0) {
    return filesPaths;
  }

  const choice = await chooseFolderAction(folders, files);
  if (!choice || choice === PROCESS_FOLDERS_OPTION_CANCEL) {
    return null;
  }
  if (choice === PROCESS_FOLDERS_OPTION_FILES_ONLY) {
    return filesPaths;
  }

  const expandedFromFolders = await flatFolderContentRecursively(folders);
  const allFiles = [...filesPaths, ...expandedFromFolders];
  return Array.from(new Set(allFiles));
}

async function chooseFolderAction(folders: Uri[], files: Uri[]): Promise<string | undefined> {
  const folderNames = folders.map((f) => f.fsPath.split(/[\\/]/).pop()).join(', ');
  const message =
    files.length > 0
      ? `The selection contains ${folders.length} folder(s) (${folderNames}) and ${files.length} loose file(s). What do you want to do?`
      : `The selection contains ${folders.length} folder(s) (${folderNames}). What do you want to do?`;

  const options = [
    PROCESS_FOLDERS_OPTION_ALL,
    ...(files.length > 0 ? [PROCESS_FOLDERS_OPTION_FILES_ONLY] : []),
    PROCESS_FOLDERS_OPTION_CANCEL,
  ];

  const choice = await window.showInformationMessage(message, ...options);
  return choice;
}

async function flatFolderContentRecursively(folders: Uri[]): Promise<string[]> {
  const result: string[] = [];

  async function walk(uri: Uri): Promise<void> {
    let entries: Array<[string, FileType]> = [];
    try {
      entries = await workspace.fs.readDirectory(uri);
    } catch {
      return;
    }
    for (const [name, type] of entries) {
      const childUri = Uri.joinPath(uri, name);
      if (type === FileType.File) {
        result.push(childUri.fsPath);
      } else if (type === FileType.Directory) {
        await walk(childUri);
      }
    }
  }

  for (const folder of folders) {
    await walk(folder);
  }
  return result;
}
