# MeetOnline DevTools

Internal development tools for the MeetOnline project, providing enhanced developer experience for feature CRUD operations and development workflows.

## Overview

The DevTools system consists of two main components:

1. **Client DevTools** (`devtool/client/`) - UI components for developer tools in the browser
2. **Server DevTools** (`devtool/server/`) - Server-side plugin system for dev-only API endpoints

## Features

- 🔧 **Plugin System**: Extensible architecture for both client and server
- 🎨 **Floating DevTools UI**: Non-intrusive floating panel in development mode
- ⚡ **Feature CRUD**: Auto-generated CRUD interfaces for users, events, groups, and profiles
- 🔒 **Development-Only**: Only active when `NODE_ENV=development`
- 📦 **npm link Support**: Easy installation during development via npm link
- ⚙️ **Configurable**: JSON-based configuration files for customization

## Quick Start

### Installation (Development)

```bash
# Install server devtools
cd devtool/server
npm install
npm link

# In your server directory
cd ../../server/node-server-app
npm link @meetonline/devtools-server

# Install client devtools
cd ../../devtool/client
npm install
npm link

# In your client directory
cd ../../client/react-client-app
npm link @meetonline/devtools-client
```

### Server Integration

```javascript
// server/node-server-app/src/server.js
import { registerDevToolsPlugins } from '@meetonline/devtools-server';

// Only in development mode
if (process.env.NODE_ENV === 'development') {
    registerDevToolsPlugins(app, {
        database: pool,
        config: './devtool.config.json'
    });
}
```

### Client Integration

```jsx
// client/react-client-app/src/App.tsx
import { DevToolsPanel } from '@meetonline/devtools-client';

function App() {
    return (
        <>
            {/* Your app content */}
            {process.env.NODE_ENV === 'development' && <DevToolsPanel />}
        </>
    );
}
```

## Configuration

### Server Configuration

Create `devtool.config.json` in `server/node-server-app/`:

```json
{
    "enabled": true,
    "features": {
        "users": true,
        "events": true,
        "groups": true,
        "profiles": true
    },
    "apiPrefix": "/devtools"
}
```

### Client Configuration

Create `devtool.config.json` in `client/react-client-app/`:

```json
{
    "enabled": true,
    "position": "bottom-right",
    "features": {
        "users": true,
        "events": true,
        "groups": true,
        "profiles": true
    }
}
```

## Architecture

### Server Plugin System

The server plugin system uses dependency injection to provide plugins with necessary resources:

```typescript
interface DevToolsPlugin {
    name: string;
    initialize(dependencies: PluginDependencies): void;
}

interface PluginDependencies {
    app: Express.Application;
    database: pg.Pool;
    config: DevToolsConfig;
}
```

### Client Plugin System

Client plugins receive React context and router:

```typescript
interface ClientPlugin {
    name: string;
    component: React.ComponentType;
    initialize(dependencies: ClientPluginDependencies): void;
}

interface ClientPluginDependencies {
    store: SessionStore;
    router: Router;
}
```

## API Endpoints

When enabled, the following dev-only endpoints are available:

- `GET /devtools/features` - List available features
- `GET /devtools/:feature` - List all items of a feature
- `POST /devtools/:feature` - Create new item
- `GET /devtools/:feature/:id` - Get specific item
- `PUT /devtools/:feature/:id` - Update item
- `DELETE /devtools/:feature/:id` - Delete item

## Security

⚠️ **Important**: DevTools are **only** for development environments.

- All endpoints are guarded by `NODE_ENV === 'development'` checks
- CRUD operations are unrestricted in dev mode
- **NEVER** deploy with devtools enabled in production
- Docker compose files should set `NODE_ENV=production` for production builds

## Development

### Project Structure

```
devtool/
├── README.md
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── plugins/
│   │   ├── utils/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── server/
    ├── src/
    │   ├── plugins/
    │   ├── middleware/
    │   ├── utils/
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
```

### Adding New Features

1. **Server**: Create a new plugin in `devtool/server/src/plugins/`
2. **Client**: Add UI component in `devtool/client/src/components/`
3. **Config**: Update both config files to enable the feature

## Troubleshooting

### DevTools not appearing
- Check `NODE_ENV` is set to `development`
- Verify config file has `"enabled": true`
- Check browser console for errors

### npm link issues
- Run `npm unlink` and `npm link` again
- Clear node_modules and reinstall
- Check symlinks in node_modules

## Contributing

Follow the MeetOnline contribution guidelines:
- Use TypeScript for all devtools code
- Follow existing code style (4 spaces, kebab-case files)
- Add tests for new plugins
- Update documentation

## License

Same as MeetOnline project: Unlicensed
