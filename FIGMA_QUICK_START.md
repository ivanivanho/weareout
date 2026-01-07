# Figma MCP Integration - Quick Start Guide

## 🎯 Goal
Connect your Figma Make designs to the WeAreOut codebase so AI agents can automatically generate pixel-perfect React Native code from your UX designs.

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Get Figma API Token (2 min)

1. Visit: https://www.figma.com/settings
2. Scroll to "Personal access tokens"
3. Click "Create new token"
4. Name it: `WeAreOut MCP`
5. **Copy the token** (save it somewhere safe!)

### Step 2: Choose Your MCP Setup Method

#### **Option A: Desktop MCP Server** (Easiest - for active design work)

**When to use:** You're actively working in Figma and want real-time access

1. Open **Figma Desktop App** (make sure it's updated)
2. Open any file and switch to **Dev Mode** (bottom toolbar)
3. In the right panel, find **"MCP server"** section
4. Click **"Enable desktop MCP server"**
5. ✅ Done! Server runs at `http://127.0.0.1:3845/mcp`

**No configuration needed in Claude Code!** I can already access your open Figma files.

---

#### **Option B: API MCP Server** (Best for production/automation)

**When to use:** You want to access any Figma file without opening Figma desktop

**I'll set this up for you if you provide your Figma API token!**

Just paste your token from Step 1, and I'll configure everything automatically.

---

## 🚀 Test the Integration

Once setup is complete, try these commands in Claude Code:

### Test 1: List Your Figma Files
```
"What Figma files do I have access to?"
```

### Test 2: Extract Component Details
```
"Show me the design specs for the Login button from my WeAreOut Figma file"
```

### Test 3: Generate Code from Design
```
"Create a React Native component based on the Dashboard screen in Figma"
```

---

## 💡 Example Workflows

### Workflow 1: Implement a New Screen

**You say:**
```
"Implement the Dashboard screen from Figma exactly as designed"
```

**What happens:**
1. ✅ I fetch the Dashboard frame from Figma
2. ✅ Extract all design specs (layout, colors, spacing, fonts)
3. ✅ Generate React Native TypeScript code
4. ✅ Apply design tokens and styling
5. ✅ Create the screen file with proper navigation

### Workflow 2: Update Component to Match Figma

**You say:**
```
"Update the Button component to match the latest Figma design"
```

**What happens:**
1. ✅ Fetch Button component from Figma
2. ✅ Compare with current code
3. ✅ Update styles, variants, and props
4. ✅ Maintain TypeScript types and functionality

### Workflow 3: Extract Design System

**You say:**
```
"Extract the color palette and typography from Figma and create theme files"
```

**What happens:**
1. ✅ Query Figma for all color styles
2. ✅ Query for all text styles
3. ✅ Generate `theme/colors.ts` and `theme/typography.ts`
4. ✅ Create design tokens matching Figma exactly

---

## 📋 Figma Best Practices for Better Code Generation

### 1. Naming Convention

**Screens:**
- Format: `ScreenName - State`
- Examples: "Dashboard - Default", "Login - Error State"

**Components:**
- Format: `Type/Variant`
- Examples: "Button/Primary", "Input/Email", "Card/Product"

### 2. Use Figma Features

- **Styles:** Create color and text styles (I'll extract them as design tokens)
- **Variables:** Use for spacing and sizing (I'll convert to code constants)
- **Auto Layout:** I'll convert to React Native Flexbox automatically
- **Components:** I'll map to React components

### 3. Frame Structure

```
Page: WeAreOut Mobile
  ├── 📱 Screens
  │   ├── Dashboard - Default
  │   ├── Dashboard - Loading
  │   ├── Login - Default
  │   └── Login - Error
  └── 🎨 Components
      ├── Button/Primary
      ├── Button/Secondary
      ├── Input/Email
      └── Card/Item
```

---

## 🔗 Integration with Multi-Agent System

Once Figma MCP is configured, here's how it works with your agents:

```
You: "Build the Dashboard screen from Figma"
  ↓
Gus (Coordinator): Analyzes Figma design specs
  ↓
Dice (Mobile Agent): Generates React Native code matching design
  ↓
Marco (Backend Agent): Ensures APIs match data requirements
  ↓
Result: Pixel-perfect implementation with backend integration
```

---

## 📁 Files Created

✅ `/Users/ivs/weareout/FIGMA_MCP_SETUP.md` - Detailed setup guide
✅ `/Users/ivs/weareout/FIGMA_QUICK_START.md` - This quick start
✅ `/Users/ivs/weareout/design-system/figma-mapping.json` - Component mapping
✅ `/Users/ivs/weareout/figma-sync/` - Sync automation directory (ready)

---

## ❓ What Do You Need to Do?

**Choose one:**

### Option A: Desktop MCP (Recommended to start)
1. Open Figma Desktop App
2. Enable MCP server in Dev Mode
3. Test by asking me "What Figma files do I see?"

### Option B: API MCP (For production)
1. Get your Figma API token from https://www.figma.com/settings
2. Share it with me (I'll configure everything)
3. Test by asking me "List my Figma files"

---

## 🎉 Next Steps After Setup

1. **Share your WeAreOut Figma file link** → I'll analyze the design structure
2. **Tell me which screens to build first** → I'll generate production code
3. **I'll sync the design system** → Colors, fonts, spacing extracted automatically
4. **We iterate together** → You design in Figma, I generate matching code

---

**Ready to connect? Just paste your Figma API token, or enable the desktop MCP server and let me know!**
