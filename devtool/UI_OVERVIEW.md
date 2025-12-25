# DevTools UI Overview

## Visual Components

### 1. Floating Button
```
┌─────────────────────────────────────────┐
│                                         │
│  Your Application Content               │
│                                         │
│                                         │
│                              ┌────────┐ │
│                              │   🔧   │ │  ← Floating button
│                              └────────┘ │     (bottom-right)
└─────────────────────────────────────────┘
```

**Features:**
- Purple gradient background
- Smooth hover animation (scales to 1.1x)
- Position configurable: bottom-right, bottom-left, top-right, top-left
- Only visible in development mode

### 2. DevTools Panel (Closed State)
```
Click the 🔧 button to open the panel
```

### 3. DevTools Panel (Open - Feature Selection)
```
┌──────────────────────────────┐
│ 🔧 DevTools              × │  ← Header with close button
├──────────────────────────────┤
│                              │
│  Select a feature to manage: │
│                              │
│  ┌────────────────────────┐  │
│  │ 👤 Users              │  │  ← Feature buttons
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ 📅 Events             │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ 👥 Groups             │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ 🔖 User Profiles      │  │
│  └────────────────────────┘  │
│                              │
└──────────────────────────────┘
```

### 4. Feature List View (Example: Users)
```
┌──────────────────────────────┐
│ 🔧 DevTools              × │
├──────────────────────────────┤
│ ← Back                      │  ← Back button
│                              │
│ [+ Create New]              │  ← Create button
│                              │
│ ┌──────────────────────────┐ │
│ │ testuser                 │ │
│ │ ID: 1                    │ │
│ │ [Edit] [Delete]          │ │  ← Action buttons
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │ john_doe                 │ │
│ │ ID: 2                    │ │
│ │ [Edit] [Delete]          │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │ jane_smith               │ │
│ │ ID: 3                    │ │
│ │ [Edit] [Delete]          │ │
│ └──────────────────────────┘ │
│                              │
└──────────────────────────────┘
```

### 5. Create/Edit Form (Example: User)
```
┌──────────────────────────────┐
│ 🔧 DevTools              × │
├──────────────────────────────┤
│ ← Back                      │
│                              │
│ Username *                   │
│ ┌──────────────────────────┐ │
│ │ testuser                 │ │  ← Input fields
│ └──────────────────────────┘ │
│                              │
│ Email *                      │
│ ┌──────────────────────────┐ │
│ │ test@example.com         │ │
│ └──────────────────────────┘ │
│                              │
│ Created At                   │
│ ┌──────────────────────────┐ │
│ │ 2024-12-25T12:00:00     │ │  ← Read-only fields
│ └──────────────────────────┘ │
│                              │
│ Updated At                   │
│ ┌──────────────────────────┐ │
│ │ 2024-12-25T12:00:00     │ │
│ └──────────────────────────┘ │
│                              │
│         [Cancel] [Create]    │  ← Form actions
│                              │
└──────────────────────────────┘
```

## Color Scheme

### Primary Colors
- **Header Background**: Purple gradient (#667eea to #764ba2)
- **Button Primary**: #667eea
- **Button Hover**: #5568d3
- **Button Danger**: #ef4444
- **Button Danger Hover**: #dc2626

### Panel
- **Background**: White (#ffffff)
- **Border**: Light gray (#e0e0e0)
- **Shadow**: rgba(0, 0, 0, 0.2)

### Text
- **Primary**: #333
- **Secondary**: #666
- **Meta**: #999
- **Error**: #c33 on #fee background

## Responsive Behavior

### Panel Dimensions
- **Width**: 420px (fixed)
- **Max Height**: 600px
- **Overflow**: Scroll when content exceeds height

### Mobile Considerations
While the panel is fixed-width, it's designed for development use on larger screens. For mobile development testing, the panel may need to be closed or positioned differently.

## Interaction Flow

### User Journey: Creating a New Event

1. **Click floating button** 🔧
   → Panel opens with feature selection

2. **Click "📅 Events"**
   → Shows list of existing events with [+ Create New] button

3. **Click [+ Create New]**
   → Form appears with fields:
   - Title (required)
   - Description
   - Creator ID (required)
   - Start Time
   - End Time
   - Location

4. **Fill form and click [Create]**
   → API POST to /devtools/events
   → Success: Returns to list with new event
   → Error: Shows error message above form

5. **New event appears in list**
   → Can now [Edit] or [Delete]

### User Journey: Editing a User

1. **Click floating button** 🔧
2. **Click "👤 Users"**
3. **Click [Edit] on a user**
   → Form pre-filled with current values
4. **Modify fields** (e.g., email)
5. **Click [Update]**
   → API PUT to /devtools/users/:id
   → Returns to list with updated user

### User Journey: Deleting a Group

1. **Click floating button** 🔧
2. **Click "👥 Groups"**
3. **Click [Delete] on a group**
   → Browser confirm dialog: "Are you sure?"
4. **Click OK**
   → API DELETE to /devtools/groups/:id
   → Group removed from list

## Accessibility Features

### Keyboard Navigation
- Tab through buttons and form fields
- Enter to submit forms
- Escape to close panel (planned enhancement)

### Visual Feedback
- Hover states on all interactive elements
- Loading states during API calls
- Error messages in red with clear text
- Success feedback (returned to list view)

### Screen Readers
- Semantic HTML structure
- Button labels
- Form field labels
- Error announcements

## Performance

### Lazy Loading
- DevTools code only loaded in development mode
- Panel components loaded on-demand
- No impact on production bundle size

### Optimizations
- API calls debounced/throttled where appropriate
- List items rendered efficiently
- Minimal re-renders via React best practices

## Browser Compatibility

Tested and working on:
- Chrome/Edge (Chromium) 90+
- Firefox 88+
- Safari 14+

Uses modern JavaScript features:
- ES Modules
- Async/await
- Fetch API
- CSS Grid/Flexbox
- CSS Custom Properties

## Configuration Impact on UI

### When Features Disabled
If a feature is disabled in config:
```json
{
  "features": {
    "users": false,
    "events": true,
    "groups": true,
    "profiles": true
  }
}
```

The Users button won't appear in the feature selection screen.

### Position Configuration
```json
{
  "position": "top-left"
}
```

Changes floating button placement:
```
┌────────┐                     
│   🔧   │  ← Floating button (top-left)
└────────┘                     
┌─────────────────────────────┐
│  Panel appears below button │
└─────────────────────────────┘
```

### API URL Configuration
```json
{
  "apiUrl": "/api/devtools"
}
```

Changes the base URL for all API calls:
- GET /api/devtools/users
- POST /api/devtools/events
- etc.

## Error States

### Network Error
```
┌──────────────────────────────┐
│ ❌ Failed to load items      │
│ Network error occurred       │
└──────────────────────────────┘
```

### Validation Error
```
┌──────────────────────────────┐
│ ❌ No valid columns provided │
│ Please fill required fields  │
└──────────────────────────────┘
```

### Empty State
```
┌──────────────────────────────┐
│                              │
│      No items found          │
│                              │
│   Click [+ Create New]       │
│   to add your first item     │
│                              │
└──────────────────────────────┘
```

## Future Enhancements (Not in Scope)

Potential UI improvements for future iterations:
- **Search/Filter**: Add search box to filter list items
- **Pagination**: Add pagination controls for large lists
- **Bulk Actions**: Checkbox selection for bulk operations
- **Drag & Drop**: Reorder items via drag and drop
- **Dark Mode**: Toggle for dark theme
- **Keyboard Shortcuts**: Cmd/Ctrl+K to open panel
- **Undo/Redo**: Undo recent changes
- **Export/Import**: JSON export/import functionality
- **Custom Modal**: Replace browser confirm with styled modal
- **Toast Notifications**: Success/error toast messages
- **Animations**: Smooth transitions between views
