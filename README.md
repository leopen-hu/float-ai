# Float AI Chrome Extension

A Chrome browser AI assistant extension that provides intelligent conversation services using the DeepSeek API.

## Features

- Integration with DeepSeek API for intelligent conversations
- Support for streaming responses, displaying AI replies in real-time
- Clean sidebar interface
- Configurable API key and model selection

## Tech Stack

- React 19
- TypeScript
- Vite
- Chrome Extension API
- OpenAI SDK

## Development Requirements

- Node.js
- pnpm package manager
- Chrome browser (version >= 80)

## Installation

1. Clone the project and install dependencies:

```bash
pnpm install
```

2. Run in development mode:

```bash
pnpm dev
```

3. Build the extension:

```bash
pnpm build
```

## Using in Chrome

1. Open Chrome browser and go to the extensions management page (chrome://extensions/)
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the project's dist directory

## Configuration

1. After installing the extension, click the extension icon
2. Configure the DeepSeek API key in settings
3. Optionally select the model to use (default is deepseek-chat)

## Usage

1. Click the extension icon in the browser toolbar to open the sidebar
2. Enter your question in the chat box
3. The AI assistant will return answers in real-time streaming

## Development Guide

- `src/background.ts`: Extension's background script, handles communication with DeepSeek API
- `src/components/`: Contains all React components
- `public/manifest.json`: Chrome extension configuration file

## License

MIT License
