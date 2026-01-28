# shadcn MCP Server Setup

This document explains how to use the shadcn MCP (Model Context Protocol) server to browse, search, and install components from registries directly through Cursor AI.

## Overview

The shadcn MCP server allows AI assistants (like Cursor's AI) to:
- Browse available components from multiple registries
- Search for specific components by name or functionality
- Install components using natural language prompts
- Access both public and private component registries

## Configuration

The MCP server is already configured in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

## Available Registries

The following registries are configured in `components.json`:

### @magicui
- **Description**: UI Library for Design Engineers. 150+ free and open-source animated components and effects
- **Use Cases**: Animated components, effects, micro-interactions
- **Example**: `npx shadcn add @magicui/animated-beam`

### @shadcnblocks
- **Description**: A registry with hundreds of extra blocks for shadcn ui
- **Use Cases**: Complete page sections, layouts, complex components
- **Example**: `npx shadcn add @shadcnblocks/hero-section`

### @commercn
- **Description**: Shadcn UI Blocks for Ecommerce websites
- **Use Cases**: Product cards, shopping carts, checkout flows, product listings
- **Example**: `npx shadcn add @commercn/product-card`

### @shadcraft
- **Description**: A collection of polished shadcn/ui components and marketing blocks
- **Use Cases**: Marketing pages, landing sections, high-quality components
- **Example**: `npx shadcn add @shadcraft/pricing-table`

### @beste-ui
- **Description**: Production-ready UI blocks for landing pages, dashboards, and web apps
- **Use Cases**: Dashboard components, admin panels, landing page sections
- **Example**: `npx shadcn add @beste-ui/dashboard-card`

### @tailark
- **Description**: Shadcn blocks designed for building modern marketing websites
- **Use Cases**: Marketing websites, landing pages, promotional sections
- **Example**: `npx shadcn add @tailark/cta-section`

## Using the MCP Server in Cursor

### Enable the MCP Server

1. Open **Cursor Settings** (File → Preferences → Settings)
2. Navigate to **MCP Servers** section
3. Find **shadcn** in the list
4. Click to **Enable** it (you should see a green dot when enabled)

### Example Prompts

Once enabled, you can use natural language to interact with registries:

#### Browse Components
```
Show me all available components in the shadcn registry
Find me a product card component from the commercn registry
List all animated components from magicui
```

#### Search for Components
```
Search for login form components across all registries
Find me a pricing table component
Show me checkout-related components
```

#### Install Components
```
Add a product card component from commercn
Install an animated button from magicui
Create a pricing section using shadcraft components
```

#### Work with Namespaces
```
Show me components from @magicui registry
Install @commercn/product-card
Build a landing page using hero, features and testimonials from @shadcraft
```

## Adding More Registries

To add additional registries, edit `components.json`:

```json
{
  "registries": {
    "@your-registry": "https://your-registry.com/r/{name}.json"
  }
}
```

### Popular Registries to Consider

- **@magicui** - Animated components and effects (already added)
- **@shadcnblocks** - Extra blocks (already added)
- **@commercn** - Ecommerce components (already added)
- **@aceternity** - Modern interactive components
- **@shadcnui-blocks** - Premium production-ready blocks
- **@ui-layouts** - Layout components and effects
- **@formcn** - Form building components
- **@supabase** - Supabase-integrated components

## Private Registries

For private registries requiring authentication, add headers in `components.json`:

```json
{
  "registries": {
    "@internal": {
      "url": "https://internal.company.com/r/{name}.json",
      "headers": {
        "Authorization": "Bearer ${REGISTRY_TOKEN}"
      }
    }
  }
}
```

Then set the environment variable in `.env.local`:

```bash
REGISTRY_TOKEN=your_token_here
```

## Troubleshooting

### MCP Server Not Responding

1. **Check Configuration**: Verify `.cursor/mcp.json` exists and is correct
2. **Restart Cursor**: Restart Cursor after configuration changes
3. **Enable Server**: Ensure the shadcn MCP server is enabled in Cursor Settings
4. **Check Logs**: View → Output → Select `MCP: project-*` in dropdown

### Components Not Installing

1. **Check Registry URL**: Verify registry URLs in `components.json` are correct
2. **Test Network**: Ensure you can access the registry URLs
3. **Check Namespace**: Use correct namespace syntax (`@registry/component`)
4. **Verify Dependencies**: Ensure required dependencies are installed

### No Tools or Prompts

If you see "No tools or prompts":
1. Clear npx cache: `npx clear-npx-cache`
2. Re-enable the MCP server in Cursor Settings
3. Check MCP logs in Cursor (View → Output)

## Best Practices

1. **Review Before Installing**: Always review component code before installation
2. **Test Components**: Test components in development before deploying
3. **Customize Components**: Components are copy-paste ready - customize as needed
4. **Keep Registries Updated**: Regularly check for new components in registries
5. **Use Namespaces**: Use namespace syntax for clarity (`@registry/component`)

## Resources

- [shadcn Registry Directory](https://ui.shadcn.com/registry)
- [MCP Documentation](https://modelcontextprotocol.io)
- [shadcn MCP Server Docs](https://ui.shadcn.com/docs/registry/mcp-server)
- [Cursor MCP Documentation](https://docs.cursor.com/en/context/mcp)

## Quick Reference

### Common Commands

```bash
# Install from default shadcn registry
npx shadcn add button

# Install from specific registry
npx shadcn add @magicui/animated-beam
npx shadcn add @commercn/product-card

# List available components (via MCP)
Show me all components in @magicui registry
```

### Registry URLs

All configured registries use the pattern: `https://registry.com/r/{name}.json`

The `{name}` placeholder is replaced with the component name when installing.
