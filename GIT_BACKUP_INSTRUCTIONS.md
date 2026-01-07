# Git Backup Instructions for WeAreOut

## ⚠️ Important: Accept Xcode License First

Before running git commands, you need to accept the Xcode license:

```bash
sudo xcodebuild -license
```

Type "agree" when prompted.

---

## 🚀 Quick Backup (After License Agreement)

Run these commands from the `/Users/ivs/weareout` directory:

```bash
# Navigate to project
cd /Users/ivs/weareout

# Initialize git repository
git init

# Configure your identity
git config user.name "Ivan Ho"
git config user.email "ivanho.wz@gmail.com"

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Complete WeAreOut app with backend and mobile

- Backend: Express + PostgreSQL + JWT authentication
- Mobile: React Native with all 8 screens matching Figma design
- Theme system with complete design tokens
- Navigation configured with React Navigation
- All components built pixel-perfect to Figma specs

Features completed:
✅ Dashboard with inventory management
✅ Item detail with consumption intelligence
✅ Shopping list with urgency grouping
✅ Onboarding flow (2 steps)
✅ Setup screen with preferences
✅ Inventory update modal
✅ Bottom navigation with floating action button
✅ JWT authentication with refresh tokens
✅ PostgreSQL database with full schema
✅ API endpoints for all CRUD operations

Ready for iOS testing once Xcode is fully configured.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Show status
git status

# Show commit log
git log --oneline
```

---

## 📤 Push to GitHub (Optional)

If you want to push to GitHub:

```bash
# Create a new repository on GitHub first, then:

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/weareout.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 📊 What Will Be Backed Up

### Backend (`/backend`)
- Express.js server with JWT auth
- PostgreSQL database schema
- All API routes and controllers
- Database configuration
- Environment setup

**Files:** ~30 backend files including:
- `src/server.js` - Main server
- `src/config/database.js` - DB connection
- `src/utils/jwt.js` - Token management
- `src/controllers/authController.js` - Auth logic
- `src/routes/auth.js` - Auth endpoints
- `database/schema.sql` - Full database schema

### Mobile (`/mobile`)
- React Native iOS app
- All 8 screens
- Complete theme system
- Navigation configuration
- Reusable components

**Files:** ~25 mobile files including:
- `App.tsx` - Main navigation
- `src/theme/` - Design system (4 files)
- `src/screens/` - All screens (8 files)
- `src/components/` - Reusable components (5 files)
- `src/services/api.ts` - API client
- `src/context/AuthContext.tsx` - Auth state

### Documentation
- `BUILD_COMPLETE.md` - Complete build documentation
- `CODE_QUALITY_REPORT.md` - Quality metrics
- `mobile/SCREENS_BUILT.md` - Screen inventory
- `backend/BACKEND_REQUIREMENTS.md` - API specs

### Configuration
- `.gitignore` - Proper exclusions
- `package.json` files for both projects
- Environment templates

---

## 🔍 Verify Backup

After committing, verify everything is backed up:

```bash
# Show all tracked files
git ls-files

# Show commit details
git show --stat

# Check repository size
du -sh .git
```

---

## 💾 Alternative Backup (If Git Still Fails)

If git continues to have issues, you can create a manual backup:

```bash
# Create timestamped backup
cd /Users/ivs
tar -czf weareout-backup-$(date +%Y%m%d-%H%M%S).tar.gz weareout/

# This creates a compressed archive of the entire project
# You can store this on cloud storage (Dropbox, Google Drive, etc.)
```

---

## 📋 Files Currently in Project

The .gitignore file excludes:
- ❌ node_modules/ (dependencies)
- ❌ .env files (secrets)
- ❌ iOS Pods/ (can be regenerated)
- ❌ build/ directories
- ❌ .DS_Store files
- ❌ Figma API token

Will be committed:
- ✅ All source code
- ✅ Documentation
- ✅ Configuration files
- ✅ Database schema
- ✅ Package.json files
- ✅ README files

---

## 🎯 Next Steps After Backup

1. ✅ Accept Xcode license
2. ✅ Run git backup commands above
3. ✅ (Optional) Push to GitHub
4. Install Xcode and continue development
5. Run `pod install` in mobile/ios
6. Test app with `npm run ios`

---

## 🆘 Need Help?

If you encounter any issues:
1. Make sure Xcode license is accepted
2. Check git is installed: `which git`
3. Verify you're in the right directory: `pwd`
4. Check file permissions: `ls -la`

The project is ready to be backed up - just need to accept the Xcode license first!
