# Playground

The No.JS Playground is an interactive code editor where you can experiment
with the framework in real-time, right in your browser.

## Getting Started

Navigate to [Playground](#/playground) to start coding. The playground
loads with a starter project showcasing state, binding, events, loops,
and conditionals. Your edits are **automatically saved** to localStorage.

## Features

### Multi-File Editor
Edit HTML, CSS, templates (.tpl), and JSON data files. All default files
open as tabs in the editor. **Create new files** with the `+` button
in the tab bar. Changes are reflected in the preview immediately.

### Auto-Save
All your edits are automatically saved to `localStorage`. Close the
browser and come back later — your work will be right where you left it.
Use "Reset" to start fresh.

### Live Preview
An isolated iframe renders your code in real-time with a 300ms debounce.
The No.JS framework is automatically loaded and initialized.

### Console
An integrated console captures `console.log`, `console.warn`,
`console.error`, and `console.info` from your code, plus No.JS debug
messages.

### Share
Click "Share" to copy a URL that encodes your code. Send it to anyone
and they'll see your exact playground state.

### Download
Export your project as a single HTML file with all templates and CSS
inlined.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Tab | Insert 2 spaces |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Ctrl+S | Save (prevent default) |

## Limitations

- **No server-side code** — The playground runs entirely in the browser
- **No npm packages** — Only No.JS is available
- **Limited file system** — Files are stored in memory
- **CORS restrictions** — External API calls from the iframe may be
  blocked; use inline JSON data instead
