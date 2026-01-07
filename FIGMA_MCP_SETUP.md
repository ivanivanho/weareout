# Figma MCP Integration Setup for WeAreOut

## Overview
This guide connects your Figma design files to the WeAreOut codebase via Model Context Protocol (MCP), enabling AI agents to automatically generate code from your UX designs.

## Architecture

```
Figma Make (UX Designs)
    ↓
Figma MCP Server
    ↓
Claude Code / AI Agents
    ↓
Multi-Agent System (Gus, Marco, Dice)
    ↓
WeAreOut iOS App (React Native)
```

---

## Step 1: Get Figma API Access Token

1. Go to **Figma Settings**: https://www.figma.com/settings
2. Scroll to **"Personal access tokens"** section
3. Click **"Create new token"**
4. Name: `WeAreOut MCP Integration`
5. **Copy the token** (shown only once!)
6. Save it securely

---

## Step 2: Configure Figma MCP Server

### Option A: Official Figma Desktop MCP Server (Recommended for Active Design Work)

**Advantages:**
- Real-time access to open files
- No API token needed
- Automatic updates
- Works with local Figma desktop app

**Setup:**
1. **Open Figma Desktop App** (update to latest version)
2. Switch to **Dev Mode** (bottom toolbar)
3. In the **Inspect panel**, find **MCP server section**
4. Click **"Enable desktop MCP server"**
5. Server runs at: `http://127.0.0.1:3845/mcp`

**Add to Claude Code MCP Config:**

Location: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "figma-desktop": {
      "command": "node",
      "args": ["-e", "require('http').request('http://127.0.0.1:3845/mcp')"]
    }
  }
}
```

### Option B: Remote Figma MCP Server (Best for Production)

**Advantages:**
- Access any Figma file via API
- Works without desktop app
- Better for automated workflows

**Setup with Claude Code:**

Add to: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "figma-api": {
      "command": "npx",
      "args": [
        "-y",
        "figma-developer-mcp",
        "--figma-api-key=YOUR_FIGMA_API_KEY_HERE",
        "--stdio"
      ]
    }
  }
}
```

**Replace `YOUR_FIGMA_API_KEY_HERE` with your actual token from Step 1**

---

## Step 3: Integration with Multi-Agent System

### A. Create Figma Design Bridge Service

Create a service that syncs Figma designs to the RAG knowledge base:

**File: `/Users/ivs/weareout/figma-sync/sync-designs.js`**

This service will:
1. Fetch designs from Figma via MCP
2. Extract component specs, layouts, colors, typography
3. Store in ChromaDB RAG for agent access
4. Notify Gus when new designs are ready

### B. Update Agent Workflow

**Enhanced Workflow:**

```
1. Designer creates/updates screens in Figma
2. Figma MCP syncs to RAG knowledge base
3. You tell Gus: "Implement the Dashboard screen from Figma"
4. Gus queries RAG for design specs
5. Dice (Mobile Agent) generates React Native components matching Figma
6. Marco (Backend Agent) ensures API matches data requirements
```

---

## Step 4: Workflow Examples

### Example 1: Implement New Screen from Figma

**Command to Claude Code:**
```
"Implement the Login screen exactly as designed in Figma file
'WeAreOut Mobile App', frame 'Login Screen v2'"
```

**What Happens:**
1. Claude Code queries Figma MCP for "Login Screen v2"
2. Extracts: layout, colors, spacing, typography, components
3. Passes specs to Dice (mobile agent)
4. Dice generates React Native code matching pixel-perfect design
5. Applies design tokens (colors, fonts, spacing)

### Example 2: Extract Design System

**Command:**
```
"Extract the design system from Figma and create a React Native
theme configuration"
```

**What Happens:**
1. Queries Figma for all color styles, text styles, spacing
2. Generates:
   - `theme/colors.ts` - Color palette
   - `theme/typography.ts` - Font styles
   - `theme/spacing.ts` - Spacing scale
   - `components/design-system/` - Base components

### Example 3: Sync Component Library

**Command:**
```
"Update all Button components to match the Figma design system"
```

**What Happens:**
1. Fetches Button component specs from Figma
2. Compares with existing code components
3. Updates props, styles, variants to match Figma
4. Maintains TypeScript types and functionality

---

## Step 5: Best Practices

### 1. Naming Conventions

**In Figma:**
- Screens: `ScreenName - State` (e.g., "Dashboard - Default", "Login - Error")
- Components: `ComponentType/VariantName` (e.g., "Button/Primary", "Input/Email")
- Frames: Use descriptive names matching code component names

### 2. Design Tokens

**Set up in Figma:**
- Create **Styles** for colors (Primary, Secondary, etc.)
- Create **Text Styles** for typography (Heading1, Body, Caption)
- Use **Variables** for spacing and sizing
- Export as design tokens via MCP

### 3. Component Mapping

**Create a mapping file:**

**File: `/Users/ivs/weareout/design-system/figma-mapping.json`**

```json
{
  "components": {
    "Button/Primary": "src/components/Button.tsx",
    "Input/Email": "src/components/Input.tsx",
    "Card/Product": "src/components/ProductCard.tsx"
  },
  "screens": {
    "Dashboard": "src/screens/DashboardScreen.tsx",
    "Login": "src/screens/auth/LoginScreen.tsx"
  }
}
```

---

## Step 6: Testing the Integration

### Test 1: Fetch Figma File Info

In Claude Code, ask:
```
"What files do I have access to in Figma?"
```

You should see a list of your Figma files.

### Test 2: Extract Component Details

```
"Show me the design specs for the 'Login Button' component from Figma"
```

Should return: colors, dimensions, typography, spacing.

### Test 3: Generate Code from Design

```
"Generate a React Native component for the 'Dashboard Card' from Figma"
```

Should produce TypeScript code matching the Figma design.

---

## Step 7: Automation Workflow

### Option A: Manual Sync

Run whenever designs change:
```bash
cd /Users/ivs/weareout/figma-sync
node sync-designs.js
```

### Option B: Automated Sync (Future Enhancement)

Set up Figma webhook → triggers sync → notifies agents

---

## Troubleshooting

### MCP Server Not Found

1. Check Claude Code config file exists: `~/Library/Application Support/Claude/claude_desktop_config.json`
2. Restart Claude Code after config changes
3. Verify Figma API token is valid

### Can't Access Figma Files

1. Ensure API token has read permissions
2. Check you're a member of the Figma team/project
3. Verify file URLs are correct

### Desktop MCP Server Not Running

1. Update Figma desktop app to latest version
2. Toggle to Dev Mode
3. Check Inspect panel for MCP server section
4. Try restarting Figma app

---

## Next Steps

1. **Get Figma API Token** ✅
2. **Configure MCP Server** ✅
3. **Create Figma Sync Service** (Next)
4. **Update Agent Prompts to Use Design Context** (Next)
5. **Build Design-to-Code Automation** (Next)

---

## Key Files Created

- `/Users/ivs/weareout/FIGMA_MCP_SETUP.md` - This guide
- `/Users/ivs/weareout/figma-sync/` - Design sync service (to be created)
- `/Users/ivs/weareout/design-system/figma-mapping.json` - Component mapping (to be created)

---

## Resources

- Figma MCP Docs: https://developers.figma.com/docs/figma-mcp-server/
- Figma API Docs: https://www.figma.com/developers/api
- MCP Protocol: https://modelcontextprotocol.io/
- Claude Code MCP Guide: https://docs.claude.com/en/docs/claude-code/mcp

---

**Status:** Setup guide created. Ready to configure once you have your Figma API token.

**Next Action:** Get your Figma API token and paste it into the MCP config, or enable the desktop MCP server in Figma.
