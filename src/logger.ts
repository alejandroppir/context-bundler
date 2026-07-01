import { LogOutputChannel, window } from 'vscode';

let channel: LogOutputChannel;

export function initLogger(): LogOutputChannel {
  channel = window.createOutputChannel('Context Bundler', { log: true });
  return channel;
}

export const logger = {
  info: (msg: string) => channel.appendLine(`[INFO]  ${timestamp()} ${msg}`),
  warn: (msg: string) => channel.appendLine(`[WARN]  ${timestamp()} ${msg}`),
  error: (msg: string, show = true) => {
    channel.appendLine(`[ERROR] ${timestamp()} ${msg}`);
    if (show) {
      channel.show(true);
    }
  },
  debug: (msg: string) => channel.appendLine(`[DEBUG] ${timestamp()} ${msg}`),
};

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}
