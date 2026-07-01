# Change Log

All notable changes to the "context-bundler" extension will be documented in this file.
Format based on [Keep a Changelog](http://keepachangelog.com/).

## [1.0.0] - 2026-07-01

### Added

- **Context Bundler Pool panel** in the Explorer sidebar with full file pool management.
- **Checkboxes** per file to select which files to include in the next bundle (all checked by default).
- **⚡ Generate** button — concatenates all checked files into a single bundle file with clear `START`/`END` markers per file using relative paths.
- **📋 Copy** button — copies the last generated bundle to the clipboard without regenerating.
- **Last generated** timestamp and link to open the bundle file directly in the editor.
- **Panel toolbar icons**: Refresh, Select All, Deselect All, Clear Pool.
- **Activity Bar panel** — the pool is also accessible from a dedicated Activity Bar icon.
- **Explorer context menu** for single files: Add to Pool / Remove from Pool.
- **Explorer context menu** for multi-selection: Toggle in Pool / Add All to Pool / Remove All from Pool.
- **Folder support** — right-clicking a folder adds all its files recursively. When a selection contains both files and folders, a confirmation popup lets the user choose whether to expand folders or process loose files only.
- **Command Palette** commands: Add/Remove active file, Add/Remove all open tabs.
- **Per-workspace persistence** — the pool survives closing and reopening VS Code.
- **File icons by extension** in the pool panel (emoji-based).
- Bundle saved to system temp folder (`os.tmpdir()/context-bundler/bundle.txt`), not added to the workspace.
