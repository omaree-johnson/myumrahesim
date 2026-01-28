# Cursor MCP Configuration

This directory contains Cursor-specific configuration files.

## MCP Server Configuration

The `.cursor/mcp.json` file configures the shadcn MCP server, which allows Cursor AI to:
- Browse components from shadcn registries
- Search for components across multiple registries
- Install components using natural language

### Setup

The MCP server is already configured. To enable it:

1. Open Cursor Settings
2. Navigate to MCP Servers
3. Enable the "shadcn" server

### Usage

Once enabled, you can use natural language prompts like:
- "Show me all components in the shadcn registry"
- "Add a product card from commercn"
- "Find me an animated button component"

See `docs/SHADCN_MCP_SETUP.md` for complete documentation.
