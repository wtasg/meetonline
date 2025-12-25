# DevTools Client

Client-side UI components for MeetOnline DevTools.

## Installation

```bash
npm install
npm run build
npm link
```

## Usage

In your React application:

```tsx
import { DevToolsPanel } from '@meetonline/devtools-client';
import '@meetonline/devtools-client/dist/styles.css';

function App() {
    return (
        <>
            {/* Your app content */}
            {process.env.NODE_ENV === 'development' && (
                <DevToolsPanel
                    config={{
                        enabled: true,
                        position: 'bottom-right',
                        apiUrl: '/devtools'
                    }}
                />
            )}
        </>
    );
}
```

## Configuration

Pass configuration via props:

```tsx
<DevToolsPanel
    config={{
        enabled: true,
        position: 'bottom-right', // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
        features: {
            users: true,
            events: true,
            groups: true,
            profiles: true
        },
        apiUrl: '/devtools'
    }}
/>
```

## Features

- **Floating UI**: Non-intrusive floating button
- **Feature CRUD**: Create, read, update, delete operations
- **Responsive**: Works on different screen sizes
- **Configurable**: Position and enabled features
- **Type-safe**: Full TypeScript support

## Components

### DevToolsPanel

Main component that renders the floating button and panel.

```tsx
<DevToolsPanel config={config} />
```

### FeatureCrud

CRUD interface for a specific feature.

```tsx
<FeatureCrud
    feature={featureDefinition}
    apiUrl="/devtools"
    onBack={() => {}}
/>
```

## API Utilities

```typescript
import {
    listFeatureItems,
    getFeatureItem,
    createFeatureItem,
    updateFeatureItem,
    deleteFeatureItem,
    getAvailableFeatures
} from '@meetonline/devtools-client';

// List all users
const response = await listFeatureItems('users', '/devtools');

// Create a new event
const response = await createFeatureItem('events', {
    title: 'My Event',
    description: 'Event description'
}, '/devtools');
```

## Development

```bash
npm run dev      # Watch mode
npm run build    # Build
npm run lint     # Lint
```

## Styling

Import the styles in your app:

```tsx
import '@meetonline/devtools-client/dist/styles.css';
```

Or customize by creating your own CSS based on the class names:
- `.devtools-container`
- `.devtools-panel`
- `.devtools-toggle`
- etc.
