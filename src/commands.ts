import { commands, ExtensionContext, TabInputText, Uri, window } from 'vscode';
import { FilePool } from './pool';
import { resolveSelectedItems } from './selected-item-resolver';
import { FilePoolWebviewProvider } from './pool-webview-provider';
import { logger } from './logger';

function resolveSelection(uri?: Uri, uris?: Uri[]): Uri[] {
  if (uris && uris.length > 0) {
    return uris;
  }
  if (uri) {
    return [uri];
  }
  return [];
}

export function registerCommands(
  context: ExtensionContext,
  pool: FilePool,
  webviewProvider: FilePoolWebviewProvider
): void {
  // ─── Pestaña activa ──────────────────────────────────────────────────────────

  context.subscriptions.push(
    commands.registerCommand('context-bundler.addActiveFile', async () => {
      const uri = window.activeTextEditor?.document.uri;
      if (!uri || uri.scheme !== 'file') {
        window.showWarningMessage('Context Bundler: no active valid file.');
        logger.warn('Context Bundler: no active valid file.');
        return;
      }
      const added = await pool.add(uri.fsPath);
      logger.info(
        added
          ? `Context Bundler: added to pool (${pool.size()} total).`
          : 'Context Bundler: file was already in the pool.'
      );
    }),

    commands.registerCommand('context-bundler.removeActiveFile', async () => {
      const uri = window.activeTextEditor?.document.uri;
      if (!uri || uri.scheme !== 'file') {
        window.showWarningMessage('Context Bundler: no active valid file.');
        logger.warn('Context Bundler: no active valid file.');
        return;
      }
      const removed = await pool.remove(uri.fsPath);
      logger.info(
        removed
          ? `Context Bundler: removed from pool (${pool.size()} total).`
          : 'Context Bundler: file was not in the pool.'
      );
    }),

    // ─── Explorer single ───────────────────────────────────────────────────────

    commands.registerCommand('context-bundler.addFile', async (uri?: Uri) => {
      if (!uri || uri.scheme !== 'file') {
        window.showWarningMessage('Context Bundler: no valid file.');
        logger.warn('Context Bundler: no valid file.');
        return;
      }
      const added = await pool.add(uri.fsPath);
      logger.info(
        added
          ? `Context Bundler: added to pool (${pool.size()} total).`
          : 'Context Bundler: file was already in the pool.'
      );
    }),

    commands.registerCommand('context-bundler.removeFile', async (uri?: Uri) => {
      if (!uri || uri.scheme !== 'file') {
        window.showWarningMessage('Context Bundler: no valid file.');
        logger.warn('Context Bundler: no valid file.');
        return;
      }
      const removed = await pool.remove(uri.fsPath);
      logger.info(
        removed
          ? `Context Bundler: removed from pool (${pool.size()} total).`
          : 'Context Bundler: file was not in the pool.'
      );
    }),

    // ─── Explorer multi ────────────────────────────────────────────────────────

    commands.registerCommand('context-bundler.addSelected', async (uri?: Uri, uris?: Uri[]) => {
      const paths = await resolveSelectedItems(resolveSelection(uri, uris));
      if (paths === null) {
        return;
      }
      if (paths.length === 0) {
        window.showWarningMessage('Context Bundler: no valid files in selection.');
        logger.warn('Context Bundler: no valid files in selection.');
        return;
      }
      const count = await pool.addMany(paths);
      logger.info(`Context Bundler: ${count} file(s) added (${pool.size()} total).`);
    }),

    commands.registerCommand('context-bundler.removeSelected', async (uri?: Uri, uris?: Uri[]) => {
      const paths = await resolveSelectedItems(resolveSelection(uri, uris));
      if (paths === null) {
        return;
      }
      if (paths.length === 0) {
        window.showWarningMessage('Context Bundler: no valid files in selection.');
        logger.warn('Context Bundler: no valid files in selection.');
        return;
      }
      const count = await pool.removeMany(paths);
      logger.info(`Context Bundler: ${count} file(s) removed (${pool.size()} total).`);
    }),

    // ─── Pestañas abiertas ─────────────────────────────────────────────────────

    commands.registerCommand('context-bundler.addAllOpenTabs', async () => {
      const uris: Uri[] = [];
      for (const group of window.tabGroups.all) {
        for (const tab of group.tabs) {
          if (tab.input instanceof TabInputText && tab.input.uri.scheme === 'file') {
            uris.push(tab.input.uri);
          }
        }
      }
      if (uris.length === 0) {
        logger.warn('Context Bundler: no open file tabs.');
        return;
      }
      const count = await pool.addMany(uris.map((u) => u.fsPath));
      logger.info(`Context Bundler: ${count} file(s) added from open tabs (${pool.size()} total).`);
    }),

    commands.registerCommand('context-bundler.removeAllOpenTabs', async () => {
      const uris: Uri[] = [];
      for (const group of window.tabGroups.all) {
        for (const tab of group.tabs) {
          if (tab.input instanceof TabInputText && tab.input.uri.scheme === 'file') {
            uris.push(tab.input.uri);
          }
        }
      }
      if (uris.length === 0) {
        logger.warn('Context Bundler: no open file tabs.');
        return;
      }
      const count = await pool.removeMany(uris.map((u) => u.fsPath));
      logger.info(
        `Context Bundler: ${count} file(s) removed from open tabs (${pool.size()} total).`
      );
    }),

    // ─── Comandos de cabecera del WebviewView ──────────────────────────────────

    commands.registerCommand('context-bundler.refreshPool', () => {
      webviewProvider.refresh();
    }),

    commands.registerCommand('context-bundler.selectAll', () => {
      webviewProvider.selectAll();
    }),

    commands.registerCommand('context-bundler.deselectAll', () => {
      webviewProvider.deselectAll();
    }),

    commands.registerCommand('context-bundler.clearPool', async () => {
      const confirm = await window.showWarningMessage(
        'Context Bundler: remove all files from pool?',
        'Yes',
        'Cancel'
      );
      if (confirm === 'Yes') {
        await webviewProvider.clearPool();
      }
    }),

    // ─── Debug ─────────────────────────────────────────────────────────────────

    commands.registerCommand('context-bundler.debugListPool', () => {
      const files = pool.getAll();
      console.log(`Context Bundler pool (${files.length}):`);
      files.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
      logger.info(`Context Bundler: ${files.length} file(s) in pool (see Debug Console).`);
    })
  );
}
