# HTML Graveyard - Project Plan

## Project Overview

An interactive "Garden of Memories" cemetery built during HTML in Hyde #1. Users can:

- Click and drag to create custom-sized tombstones
- Inscribe names, dates, and epitaphs on tombstones
- View peaceful garden setting with 3D clouds, trees, and flowers
- All data persists in localStorage

## Current Status

- **Core functionality**: ✅ Complete
- **Visual design**: ✅ Complete with 3D clouds and 2D cemetery
- **Deployment**: ✅ Fixed - Added package.json with build script
- **Mobile experience**: ✅ Complete - VR popups disabled + double-tap tombstones

## Recent Changes

- ✅ **Fixed deployment configuration** - Added `package.json` with build script that copies files to `dist/` directory
- ✅ **Added `.gitignore`** - Excludes build output and common artifacts
- ✅ **Build process working** - `bun run build` successfully creates deployment-ready `dist/` directory
- ✅ **Fixed mobile VR popup** - Completely disabled VR/immersive mode requests:
  - Added comprehensive A-Frame VR/AR disabling attributes
  - Added JavaScript to override VR functions and prevent permission requests
  - Added CSS to hide any remaining VR UI elements
  - Added meta tags to prevent mobile browser VR behaviors
- ✅ **Added OpenGraph support** - Enhanced social media sharing:
  - Comprehensive OpenGraph meta tags for Facebook, LinkedIn, etc.
  - Twitter Card support for better Twitter previews
  - Custom og-image.png showing the cemetery with tombstones
  - SEO-optimized meta tags and descriptions
- ✅ **Added mobile double-tap support** - Enhanced mobile tombstone creation:
  - Double-tap anywhere to create standard-sized tombstone (120x150px)
  - Touch drag still works for custom-sized tombstones
  - Visual feedback animation on double-tap
  - Prevents conflicts between touch and mouse events
- ✅ **Added mobile long press delete** - Enhanced mobile tombstone management:
  - Long press any tombstone (600ms) to delete it immediately
  - Visual feedback with red overlay and pulsing animation
  - Triple haptic feedback buzz for deletion
- ✅ **Added haptic feedback** - Enhanced tactile experience:
  - Single buzz when creating tombstones (both double-tap and drag)
  - Triple buzz when deleting tombstones (long press)
- ✅ **Fixed text selection issues** - Improved mobile/desktop interaction:
  - Prevented text selection on tombstones and inscription text
  - Fixed long press conflict with text selection
  - Added pointer-events: none to inscription text for better UX
- ✅ **Added footer navigation** - Portfolio discovery:
  - Subtle footer link to home.rayzhu.me for project discovery
  - Modern glass-morphism design with backdrop blur
  - Non-intrusive positioning that doesn't interfere with cemetery interaction

## Next Steps

1. **Test mobile experience** - Verify site works properly on mobile devices
2. **Test deployment** - Verify that Coolify/Nixpacks successfully deploys the updated site
3. **Monitor for any remaining mobile issues**

## Technical Architecture

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **3D Elements**: A-Frame.js for clouds (VR disabled for mobile compatibility)
- **Storage**: localStorage for persistence
- **Deployment**: Static file hosting (Coolify + Nixpacks)

## File Structure

```
html-graveyard/
├── index.html          # Main page with 3D clouds and 2D cemetery
├── script.js           # Interactive functionality (740+ lines)
├── styles.css          # Styling with peaceful garden theme (650+ lines)
├── og-image.png        # OpenGraph/social media preview image (1.7MB)
├── package.json        # Build configuration for deployment
├── .gitignore          # Excludes build artifacts
├── plan.md             # Project planning documentation
├── README.md           # Project documentation
└── dist/               # Build output directory (auto-generated)
```

## Features Implemented

- Interactive tombstone creation via drag & drop
- 3D floating clouds using A-Frame
- Layered 2D cemetery with hills, trees, flowers
- Modal for inscriptions
- Mobile responsive design with VR functionality disabled and double-tap tombstone creation
- Auto-save functionality
- OpenGraph/social media preview support
