# Context Bundler

Bundle the content of multiple files into a single context file, ready to paste into ChatGPT, Gemini, Claude or any other LLM — without opening each file manually.

## Why?

When working with an LLM, you often need to provide context from several files. The usual workflow is painful: open file → Ctrl+A → Ctrl+C → switch to browser → Ctrl+V → repeat for every file.

Context Bundler lets you build a pool of files, generate a single concatenated bundle, and copy it to the clipboard in one click.

## Features

### Context Bundler Pool panel

A dedicated panel in the Explorer sidebar (and Activity Bar) showing your current file pool:

- **Checkboxes** to select which files to include in the next bundle (all checked by default).
- **✕ button** (on hover) to remove individual files from the pool.
- **⚡ Generate** — concatenates all checked files into a bundle file, with clear start/end markers per file.
- **📋 Copy** — copies the last generated bundle to the clipboard.
- **Last generated** timestamp and a link to open the bundle file directly in the editor.

### Panel toolbar icons

| Icon           | Action                          |
| -------------- | ------------------------------- |
| 🔄 Refresh     | Refreshes the panel             |
| ✅ Select All  | Checks all files in the pool    |
| ✖ Deselect All | Unchecks all files in the pool  |
| 🗑 Clear Pool  | Removes all files from the pool |

### Explorer context menu

Right-click any file or folder in the Explorer:

**Single file:**

- `Context Bundler: Add File to Pool`
- `Context Bundler: Remove File from Pool`

**Multiple files selected or folder:**

- `Context Bundler: Add All to Pool`
- `Context Bundler: Remove All from Pool`

When a selection contains both files and folders, a confirmation popup asks whether to expand folders recursively or process only the loose files.

### Command Palette

All commands are available via `Ctrl+Shift+P`:

- `Context Bundler: Add Active Tab File to Pool` — adds the file open in the current editor tab.
- `Context Bundler: Remove Active Tab File from Pool`
- `Context Bundler: Add All Open Tabs to Pool`
- `Context Bundler: Remove All Open Tabs from Pool`

### Bundle format

Each file in the bundle is wrapped with clear markers using its relative path:

```
// ========== START: src/app/my.component.ts ==========
... file content ...
// ========== END: src/app/my.component.ts ==========
```

The bundle is saved to your system's temp folder (`os.tmpdir()/context-bundler/bundle.txt`) and is not added to your workspace.

### Persistence

The file pool is saved per workspace. It survives closing and reopening VS Code as long as you work in the same workspace folder.

## Requirements

No external dependencies.

## Release Notes

### 1.0.0

First stable release. See [CHANGELOG](CHANGELOG.md) for full details.
