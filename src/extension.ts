import { ExtensionContext, window } from 'vscode';
import { registerCommands } from './commands';
import { FilePool } from './pool';
import { FilePoolWebviewProvider } from './pool-webview-provider';
import { initLogger, logger } from './logger';

export function activate(context: ExtensionContext) {
  context.subscriptions.push(initLogger());

  logger.info('Context Bundler is now active!');

  const pool = new FilePool(context);

  const webviewProvider = new FilePoolWebviewProvider(pool, context.extensionUri);

  context.subscriptions.push(
    window.registerWebviewViewProvider(FilePoolWebviewProvider.viewType, webviewProvider, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
    window.registerWebviewViewProvider(FilePoolWebviewProvider.viewTypeActivity, webviewProvider, {
      webviewOptions: { retainContextWhenHidden: true },
    })
  );

  registerCommands(context, pool, webviewProvider);
}

export function deactivate() {}
