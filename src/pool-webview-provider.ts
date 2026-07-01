import * as path from 'path';
import * as fs from 'fs';
import { FilePool } from './pool';
import {
  generateBundle,
  readBundle,
  getBundlePath,
  bundleExists,
  BundleState,
} from './bundle-generator';
import {
  CancellationToken,
  commands,
  env,
  Uri,
  WebviewView,
  WebviewViewProvider,
  WebviewViewResolveContext,
  window,
} from 'vscode';
import { logger } from './logger';

type WebviewMessage =
  | { command: 'removeFile'; fsPath: string }
  | { command: 'toggleCheck'; fsPath: string; checked: boolean }
  | { command: 'generateBundle'; selected: string[] }
  | { command: 'copyBundle' }
  | { command: 'openBundle' }
  | { command: 'ready' };

export class FilePoolWebviewProvider implements WebviewViewProvider {
  public static readonly viewType = 'contextBundlerPool';
  public static readonly viewTypeActivity = 'contextBundlerPoolActivity';

  private _views: WebviewView[] = [];
  private _checkedFiles: Set<string> = new Set();
  private _bundleState: BundleState = {
    fsPath: getBundlePath(),
    generatedAt: null,
    fileCount: 0,
    exists: bundleExists(),
  };

  constructor(
    private readonly pool: FilePool,
    private readonly _extensionUri: Uri
  ) {
    this._initCheckedFiles();

    pool.onDidChange(() => {
      const current = pool.getAll();
      for (const f of current) {
        if (!this._checkedFiles.has(f)) {
          this._checkedFiles.add(f);
        }
      }
      for (const f of this._checkedFiles) {
        if (!current.includes(f)) {
          this._checkedFiles.delete(f);
        }
      }
      this._refresh();
    });
  }

  resolveWebviewView(
    webviewView: WebviewView,
    _context: WebviewViewResolveContext,
    _token: CancellationToken
  ): void {
    this._views.push(webviewView);

    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this._getHtml();

    webviewView.webview.onDidReceiveMessage(async (message: WebviewMessage) => {
      switch (message.command) {
        case 'ready':
          this._refresh();
          break;

        case 'removeFile':
          await this.pool.remove(message.fsPath);
          break;

        case 'toggleCheck':
          if (message.checked) {
            this._checkedFiles.add(message.fsPath);
          } else {
            this._checkedFiles.delete(message.fsPath);
          }
          break;

        case 'generateBundle': {
          const selected = Array.from(this._checkedFiles);
          if (selected.length === 0) {
            window.showWarningMessage('Context Bundler: no files selected for bundle.');
            logger.warn('Context Bundler: no files selected for bundle.');
            return;
          }
          try {
            this._bundleState = await generateBundle(selected);
            this._refresh();
            window.showInformationMessage(
              `Context Bundler: bundle generated with ${this._bundleState.fileCount} file(s).`
            );
            logger.info(
              `Context Bundler: bundle generated with ${this._bundleState.fileCount} file(s).`
            );
          } catch (e) {
            window.showErrorMessage(`Context Bundler: error generating bundle — ${e}`);
            logger.error(`Context Bundler: error generating bundle — ${e}`);
          }
          break;
        }

        case 'copyBundle':
          try {
            const content = readBundle();
            await env.clipboard.writeText(content);
            window.showInformationMessage('Context Bundler: bundle copied to clipboard.');
            logger.info('Context Bundler: bundle copied to clipboard.');
          } catch (e) {
            window.showWarningMessage('Context Bundler: generate a bundle first.');
            logger.warn(`Context Bundler: error copying bundle — ${e}`);
          }
          break;

        case 'openBundle':
          await commands.executeCommand('vscode.open', Uri.file(getBundlePath()));
          break;
      }
    });
  }

  public refresh(): void {
    this._refresh();
  }

  public selectAll(): void {
    this._initCheckedFiles();
    this._refresh();
  }

  public deselectAll(): void {
    this._checkedFiles.clear();
    this._refresh();
  }

  public async clearPool(): Promise<void> {
    await this.pool.clear();
    this._initCheckedFiles();
    this._refresh();
  }

  private _initCheckedFiles() {
    this._checkedFiles = new Set(this.pool.getAll());
  }

  private _refresh(): void {
    if (this._views.length === 0) {
      return;
    }
    const message = {
      command: 'update',
      files: this.pool.getAll().map((fsPath) => ({
        fsPath,
        label: path.basename(fsPath),
        description: fsPath,
        checked: this._checkedFiles.has(fsPath),
      })),
      bundleInfo: this._bundleState.generatedAt ? this._bundleState : null,
    };
    for (const view of this._views) {
      view.webview.postMessage(message);
    }
  }

  private _getHtml(): string {
    const nonce = getNonce();
    const htmlPath = path.join(this._extensionUri.fsPath, 'media', 'pool-panel.html');
    let html = fs.readFileSync(htmlPath, 'utf-8');
    html = html.replace(/\{\{NONCE\}\}/g, nonce);
    return html;
  }
}

/**
 * Generates a random nonce string used for CSP in VS Code WebViews.
 * @returns  A 32-character alphanumeric string used as a nonce.
 */
function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
