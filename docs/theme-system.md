# Theme System Documentation

## Overview

The meetonline application now includes a comprehensive theme system that provides users with customizable appearance options. The system is built around three independent dimensions:

1. **Theme (Color Palette)**: gray, teal, pink
2. **Scheme (Light/Dark Mode)**: light, dark, high-contrast
3. **Filter (Color Adjustment)**: default, natural, vivid, muted

## Architecture

### Database Layer

The `user_settings` table has been updated with three new columns:

- `theme` VARCHAR(64) - Color palette selection (gray, teal, pink)
- `scheme` VARCHAR(32) - Display scheme (light, dark, high-contrast)
- `filter` VARCHAR(32) - Color filter (default, natural, vivid, muted)

**Defaults:**
- theme: 'gray'
- scheme: 'light'
- filter: 'default'

### Server Layer

**Models** (`server/node-server-app/src/models/userSettingsModel.js`):
- `VALID_THEMES`: ["gray", "teal", "pink"]
- `VALID_SCHEMES`: ["light", "dark", "high-contrast"]
- `VALID_FILTERS`: ["default", "natural", "vivid", "muted"]

**Database** (`server/node-server-app/src/database/user_settings.js`):
- Validates theme values on update
- Creates default settings for new users
- Supports individual theme component updates

### Client Layer

**CSS** (`client/react-client-app/src/theme.css`):
- Base color palettes for each theme
- Semantic color tokens
- Scheme-specific color overrides
- Filter modifiers using CSS custom properties

**Utilities** (`client/react-client-app/src/utils/theme.js`):
- `applyTheme(theme)` - Sets data-theme attribute
- `applyScheme(scheme)` - Adds/removes scheme CSS classes
- `applyFilter(filter)` - Sets data-filter attribute
- `applyThemeConfig(config)` - Applies complete theme configuration
- `getStoredThemeConfig()` - Retrieves stored theme settings

**Actions** (`client/react-client-app/src/actions/userSettingsActions.js`):
- `updateTheme(value)` - Updates theme on server
- `updateScheme(value)` - Updates scheme on server
- `updateFilter(value)` - Updates filter on server

**Components**:
- `UserSettings` - Settings UI with theme controls
- `ThemePlayground` - Developer testing page at `/theme-playground`

## Usage

### For Users

1. Navigate to Settings (click on menu)
2. Under "Theme" section, select:
   - Color Palette (gray, teal, pink)
   - Scheme (light, dark, high-contrast)
   - Color Filter (default, natural, vivid, muted)
3. Changes apply immediately

### For Developers

Visit `/theme-playground` to test all theme combinations interactively. The playground includes:
- Quick theme switchers
- Sample UI elements (buttons, forms, cards, alerts)
- Current theme configuration display

### Programmatic Usage

```javascript
import { applyTheme, applyScheme, applyFilter } from './utils/theme.js';

// Apply individual settings
applyTheme('teal');
applyScheme('dark');
applyFilter('vivid');

// Or apply complete configuration
import { applyThemeConfig } from './utils/theme.js';
applyThemeConfig({
    theme: 'pink',
    scheme: 'high-contrast',
    filter: 'natural'
});
```

## CSS Custom Properties

The theme system uses CSS custom properties that can be referenced in your styles:

### Semantic Colors
- `--background-primary`, `--background-secondary`, `--background-tertiary`
- `--text-primary`, `--text-secondary`, `--text-tertiary`
- `--border-primary`, `--border-secondary`
- `--interactive-primary`, `--interactive-primary-hover`
- `--card-background`, `--card-border`
- `--state-success-*`, `--state-warning-*`, `--state-danger-*`, `--state-info-*`

### Base Colors
- `--base-gray-50` through `--base-gray-950`
- `--base-accent-primary`, `--base-accent-secondary`, etc.

### Legacy Compatibility
The system maintains backward compatibility with existing color variables:
- `--background`, `--foreground`
- `--primary`, `--secondary`
- `--card`, `--border`
- etc.

## How It Works

1. **Root Attributes**: Theme and filter are set via `data-theme` and `data-filter` attributes on `<html>`
2. **CSS Classes**: Scheme is set via CSS classes (`.dark`, `.high-contrast`)
3. **Cascading Variables**: CSS custom properties cascade based on selectors
4. **Filter Modifiers**: `--filter-chroma-multiplier` adjusts color saturation across all schemes

Example DOM structure:
```html
<html data-theme="teal" data-filter="vivid" class="dark">
  <!-- App content -->
</html>
```

## Testing

### Unit Tests
- Client: `client/react-client-app/src/utils/settings.test.js` (109 tests passing)
- Server: `server/node-server-app/tests-jest/models/userSettingsModel.test.js` (112 tests passing)

### Manual Testing
1. Run the application
2. Navigate to `/theme-playground`
3. Test all combinations of theme, scheme, and filter
4. Verify color consistency and accessibility

## Browser Compatibility

The theme system uses modern CSS features:
- CSS Custom Properties (CSS Variables)
- OKLCH color space
- `oklch(from ...)` relative color syntax
- `@custom-variant` (if supported)

Ensure your browser supports these features for optimal experience.

## Accessibility

- **High Contrast Mode**: Provides maximum contrast ratios for visibility
- **Semantic Colors**: Clear state indicators (success, warning, danger, info)
- **Filter Options**: Natural/muted filters reduce eye strain
- **Keyboard Navigation**: All theme controls are keyboard accessible

## Migration Notes

For existing installations:
1. The database schema includes new columns with defaults
2. Existing `theme` values are no longer used - they map to the new system
3. Users will start with: gray theme, light scheme, default filter
4. First login after migration will create default settings

## Future Enhancements

Potential additions:
- Custom theme colors
- More color palettes
- Automatic dark mode based on system preferences
- Per-page theme overrides
- Theme import/export
