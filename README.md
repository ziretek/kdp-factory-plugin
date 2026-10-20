# KDP Factory Plugin

An MCP server that exposes the KDP Factory workflow to ChatGPT and Codex.

## Local test

```bash
npm install
npm run check
npm start
```

The MCP endpoint is `http://localhost:8787/mcp`.

To connect it to ChatGPT during development, expose the server with an HTTPS tunnel such as `ngrok http 8787`, then add the resulting `https://.../mcp` URL through **Plugins → Add custom MCP server**.

This initial plugin exposes planning and routing tools. The existing local KDP skills remain the detailed production implementation and can be added to the plugin package as reusable instructions or invoked in the local Codex environment.
