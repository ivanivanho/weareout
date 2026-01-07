# Figma → WeAreOut Integration Overview

## 🏗️ Complete Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     DESIGN WORKSTREAM                            │
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐                         │
│  │ Figma Make   │──────▶│ UX Designs   │                         │
│  │ (You Design) │      │ & Components │                         │
│  └──────────────┘      └──────┬───────┘                         │
│                                │                                  │
└────────────────────────────────┼──────────────────────────────────┘
                                 │
                                 │ Figma MCP Protocol
                                 │
┌────────────────────────────────┼──────────────────────────────────┐
│                     MCP INTEGRATION LAYER                         │
│                                 │                                  │
│  ┌──────────────────────────────▼────────────────────────────┐   │
│  │             Figma MCP Server                              │   │
│  │  (Option A: Desktop http://127.0.0.1:3845/mcp)           │   │
│  │  (Option B: API via figma-developer-mcp)                 │   │
│  └──────────────────────────────┬────────────────────────────┘   │
│                                 │                                  │
│  ┌──────────────────────────────▼────────────────────────────┐   │
│  │         Claude Code MCP Client                            │   │
│  │  - Queries Figma for designs                             │   │
│  │  - Extracts component specs                              │   │
│  │  - Retrieves design tokens                               │   │
│  └──────────────────────────────┬────────────────────────────┘   │
│                                 │                                  │
└────────────────────────────────┼──────────────────────────────────┘
                                 │
                                 │ Design Context
                                 │
┌────────────────────────────────┼──────────────────────────────────┐
│                     AI AGENT SYSTEM                               │
│                                 │                                  │
│  ┌──────────────────────────────▼────────────────────────────┐   │
│  │          Multi-Agent Observability + RAG                  │   │
│  │  - ChromaDB stores design specs                          │   │
│  │  - Agents query RAG for Figma context                    │   │
│  │  - OpenTelemetry tracks build process                    │   │
│  └──────────────┬──────────────────────────────┬─────────────┘   │
│                 │                              │                  │
│  ┌──────────────▼──────────┐   ┌──────────────▼──────────┐      │
│  │  Gus (Coordinator)      │   │  Design System Manager  │      │
│  │  - Analyzes designs     │   │  - Extracts tokens      │      │
│  │  - Plans implementation │   │  - Syncs components     │      │
│  └──────────────┬──────────┘   └─────────────────────────┘      │
│                 │                                                 │
│  ┌──────────────┼──────────────────────────────┐                │
│  │              │                              │                 │
│  │  ┌───────────▼──────────┐   ┌──────────────▼─────────┐      │
│  │  │ Marco (Backend)      │   │ Dice (Mobile iOS)      │      │
│  │  │ - Ensures API match  │   │ - Generates RN code    │      │
│  │  │ - Database structure │   │ - Applies design       │      │
│  │  └──────────────────────┘   │ - Creates components   │      │
│  │                              └────────────────────────┘      │
│  └──────────────────────────────────────────────────────────────┘
│                                                                   │
└────────────────────────────────┬──────────────────────────────────┘
                                 │
                                 │ Generated Code
                                 │
┌────────────────────────────────┼──────────────────────────────────┐
│                     CODE OUTPUT                                   │
│                                 │                                  │
│  ┌──────────────────────────────▼────────────────────────────┐   │
│  │              WeAreOut iOS App                             │   │
│  │                                                            │   │
│  │  Backend (Node.js/PostgreSQL)  Mobile (React Native)     │   │
│  │  ├── API endpoints             ├── Screens               │   │
│  │  ├── Database schema            ├── Components            │   │
│  │  ├── Business logic             ├── Design tokens         │   │
│  │  └── Tests                      └── Tests                 │   │
│  │                                                            │   │
│  │  Status: ✅ Backend Running     🚧 Mobile In Progress     │   │
│  │         http://localhost:3001                             │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Workflow Example: Dashboard Screen Implementation

### Step 1: Design in Figma Make
```
You design the Dashboard screen with:
- Fuel gauge visualization
- Item list with cards
- Navigation tabs
- Color palette: Primary Blue (#0066FF), etc.
- Typography: SF Pro Display
```

### Step 2: Request Implementation
```
You: "Implement the Dashboard screen from Figma"
```

### Step 3: AI Agent Workflow
```
Claude Code (via MCP)
  ↓ Fetches "Dashboard - Default" frame from Figma
  ↓ Extracts:
    - Layout structure (Flexbox/Auto Layout)
    - Component hierarchy
    - Colors, spacing, typography
    - Interactive elements

Gus (Coordinator)
  ↓ Analyzes design requirements
  ↓ Breaks down into tasks:
    - Create DashboardScreen component
    - Extract design tokens
    - Implement fuel gauge component
    - Create item card component
    - Setup navigation

Dice (Mobile Agent)
  ↓ Generates React Native code:
    ├── DashboardScreen.tsx (main screen)
    ├── FuelGauge.tsx (custom component)
    ├── ItemCard.tsx (reusable card)
    ├── theme/colors.ts (from Figma styles)
    └── theme/typography.ts (from Figma text styles)

Marco (Backend Agent)
  ↓ Ensures backend supports design:
    ├── GET /api/items/dashboard (fuel gauge data)
    ├── GET /api/items/recent (item list)
    └── Tests for dashboard endpoints
```

### Step 4: Code Generated
```typescript
// mobile/src/screens/DashboardScreen.tsx
import { FuelGauge } from '../components/FuelGauge';
import { ItemCard } from '../components/ItemCard';
import { colors } from '../theme/colors'; // From Figma

const DashboardScreen = () => {
  return (
    <View style={styles.container}>
      <FuelGauge percentage={75} /> {/* Matches Figma design */}
      <ItemList />
    </View>
  );
};

// Styles match Figma pixel-perfect
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background, // #FFFFFF from Figma
    padding: spacing.md, // 16px from Figma
  }
});
```

---

## 📊 Data Flow

### Design → Code Flow
```
Figma File
  │
  ├─ Screens (Frames)
  │   ├─ Dashboard - Default
  │   │   └─ Extract: Layout, Colors, Components
  │   │
  │   └─ Login - Error State
  │       └─ Extract: Error styling, Layout
  │
  ├─ Components (Figma Components)
  │   ├─ Button/Primary
  │   │   └─ Generate: Button.tsx with variant="primary"
  │   │
  │   └─ Card/Item
  │       └─ Generate: ItemCard.tsx
  │
  └─ Styles (Design Tokens)
      ├─ Colors → colors.ts
      ├─ Text Styles → typography.ts
      └─ Spacing → spacing.ts
```

### Code → Figma Mapping
```
figma-mapping.json
  │
  ├─ Components mapping
  │   Button/Primary ←→ mobile/src/components/Button.tsx
  │   Input/Email ←→ mobile/src/components/Input.tsx
  │
  ├─ Screens mapping
  │   Dashboard ←→ mobile/src/screens/DashboardScreen.tsx
  │   Login ←→ mobile/src/screens/auth/LoginScreen.tsx
  │
  └─ Design tokens mapping
      Colors ←→ mobile/src/theme/colors.ts
      Typography ←→ mobile/src/theme/typography.ts
```

---

## 🎯 Key Benefits

### 1. **Design-Code Consistency**
- No manual translation from design to code
- Pixel-perfect implementations
- Design changes automatically propagate

### 2. **Faster Development**
- Generate screens in minutes, not hours
- Component library syncs automatically
- Design system extracted automatically

### 3. **Better Collaboration**
- Designers and developers work from same source
- Design specs always up-to-date
- Clear mapping between Figma and code

### 4. **Quality Assurance**
- AI agents ensure design accuracy
- Automated tests generated with code
- Design tokens prevent inconsistencies

---

## 📁 Integration Files Structure

```
/Users/ivs/weareout/
│
├── FIGMA_MCP_SETUP.md ..................... Detailed setup guide
├── FIGMA_QUICK_START.md ................... 5-minute quick start
├── FIGMA_INTEGRATION_OVERVIEW.md .......... This file
│
├── design-system/
│   ├── figma-mapping.json ................. Component mappings
│   └── tokens/ ............................ Design tokens (auto-generated)
│       ├── colors.json
│       ├── typography.json
│       └── spacing.json
│
├── figma-sync/
│   ├── sync-designs.js .................... Sync automation script
│   └── README.md .......................... Sync documentation
│
├── mobile/src/
│   ├── screens/ ........................... Generated from Figma frames
│   ├── components/ ........................ Generated from Figma components
│   └── theme/ ............................. Extracted from Figma styles
│       ├── colors.ts
│       ├── typography.ts
│       └── spacing.ts
│
└── backend/
    └── (Ensures APIs match design requirements)
```

---

## ✅ Setup Status

| Step | Status | Action Required |
|------|--------|-----------------|
| 1. Setup guides created | ✅ Complete | None |
| 2. Directory structure | ✅ Complete | None |
| 3. Component mapping file | ✅ Complete | Update with Figma IDs |
| 4. Figma API token | ⏳ Pending | Get from Figma settings |
| 5. MCP server config | ⏳ Pending | Choose Desktop or API method |
| 6. Test integration | ⏳ Pending | After step 4 & 5 |

---

## 🚀 Next Actions

### Immediate (You do this):
1. **Get Figma API token** from https://www.figma.com/settings
   OR
2. **Enable Figma Desktop MCP** in Figma app (Dev Mode)

### After Setup (I do this automatically):
1. ✅ Query your Figma files
2. ✅ Extract design system (colors, fonts, spacing)
3. ✅ Map components to code files
4. ✅ Generate screens from Figma frames
5. ✅ Keep design and code in sync

---

## 🎓 Learning Resources

- **Figma MCP Docs**: https://developers.figma.com/docs/figma-mcp-server/
- **MCP Protocol**: https://modelcontextprotocol.io/
- **Claude Code MCP**: https://docs.claude.com/en/docs/claude-code/mcp
- **Figma API**: https://www.figma.com/developers/api

---

**Ready to connect Figma? Share your API token or enable desktop MCP and we'll start generating production-quality code from your designs! 🎨→💻**
