import { Uri, workspace } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { randomUUID } from 'crypto';
import { logger } from './logger';

const BUNDLE_DIR = path.join(os.tmpdir(), 'context-bundler');
const SESSION_ID = randomUUID();
const BUNDLE_FILE = path.join(BUNDLE_DIR, `bundle-${SESSION_ID}.txt`);

export interface BundleState {
  fsPath: string;
  generatedAt: Date | null;
  fileCount: number;
  exists: boolean;
}

/**
 * Takes the selected fsPaths, reads their contents, and generates a bundle file
 * concatenated in the system's temporary folder.
 * Each file is preceded and followed by a comment with its relative path.
 */
export async function generateBundle(fsPaths: string[]): Promise<BundleState> {
  if (!fs.existsSync(BUNDLE_DIR)) {
    fs.mkdirSync(BUNDLE_DIR, { recursive: true });
  }

  const parts: string[] = [];

  for (const fsPath of fsPaths) {
    const fileUri = Uri.file(fsPath);
    const workspaceFolder = workspace.getWorkspaceFolder(fileUri);
    const relativePath = workspaceFolder
      ? path.relative(workspaceFolder.uri.fsPath, fsPath)
      : fsPath;

    let content: string;
    try {
      content = fs.readFileSync(fsPath, 'utf-8');
    } catch (err) {
      logger.error(`Error reading ${fsPath}`);
      logger.error(`Error message reading ${JSON.stringify(err)}`);

      content = '[Error: could not read file]';
    }

    parts.push(
      `// ========== START: ${relativePath} ==========\n` +
        content +
        `\n// ========== END: ${relativePath} ==========\n`
    );
  }

  const bundle = parts.join('\n');
  fs.writeFileSync(getBundlePath(), bundle, 'utf-8');

  return {
    fsPath: getBundlePath(),
    generatedAt: new Date(),
    fileCount: fsPaths.length,
    exists: true,
  };
}

/**
 * Lee el contenido del bundle actual desde disco.
 * Lanza error si no existe todavía.
 */
export function readBundle(): string {
  if (!bundleExists()) {
    throw new Error('No bundle generated yet.');
  }
  return fs.readFileSync(getBundlePath(), 'utf-8');
}

export function getBundlePath(): string {
  return BUNDLE_FILE;
}

export function bundleExists(): boolean {
  return fs.existsSync(getBundlePath());
}
