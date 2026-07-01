import { EventEmitter, ExtensionContext } from 'vscode';

const STORAGE_KEY = 'context-bundler.pool';

export class FilePool {
  private files: Set<string>;
  private _onDidChange = new EventEmitter<void>();
  readonly onDidChange = this._onDidChange.event;

  constructor(private readonly context: ExtensionContext) {
    const stored = context.workspaceState.get<string[]>(STORAGE_KEY, []);
    this.files = new Set(stored);
  }

  private async persist(): Promise<void> {
    await this.context.workspaceState.update(STORAGE_KEY, Array.from(this.files));
    this._onDidChange.fire();
  }

  private has(fsPath: string): boolean {
    return this.files.has(fsPath);
  }

  private addInternal(fsPath: string): boolean {
    if (this.has(fsPath)) {
      return false;
    }
    this.files.add(fsPath);
    return true;
  }

  private removeInternal(fsPath: string): boolean {
    if (!this.has(fsPath)) {
      return false;
    }
    this.files.delete(fsPath);
    return true;
  }

  public async add(fsPath: string, persist = true): Promise<boolean> {
    const added = this.addInternal(fsPath);
    if (added && persist) {
      await this.persist();
    }
    return added;
  }

  public async remove(fsPath: string, persist = true): Promise<boolean> {
    const removed = this.removeInternal(fsPath);
    if (removed && persist) {
      await this.persist();
    }
    return removed;
  }

  public async addMany(fsPaths: string[], persist = true): Promise<number> {
    let count = 0;
    for (const p of fsPaths) {
      if (this.addInternal(p)) {
        count++;
      }
    }
    if (count > 0 && persist) {
      await this.persist();
    }
    return count;
  }

  public async removeMany(fsPaths: string[], persist = true): Promise<number> {
    let count = 0;
    for (const p of fsPaths) {
      if (this.removeInternal(p)) {
        count++;
      }
    }
    if (count > 0 && persist) {
      await this.persist();
    }
    return count;
  }

  public async clear(): Promise<void> {
    this.files.clear();
    await this.persist();
  }

  public getAll(): string[] {
    return Array.from(this.files);
  }

  public size(): number {
    return this.files.size;
  }
}
