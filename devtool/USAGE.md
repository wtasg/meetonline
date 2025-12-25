# DevTools Usage Guide

This guide explains how to install, configure, and use the MeetOnline DevTools system.

## Quick Start

### 1. Installation

From the project root, run:

```bash
cd devtool
./install.sh
```

This will:
- Build both client and server devtools packages
- Link them globally via npm
- Link them to the main server and client applications

### 2. Start Development Servers

**Terminal 1 - Server:**
```bash
cd server/node-server-app
NODE_ENV=development npm run dev
```

**Terminal 2 - Client:**
```bash
cd client/react-client-app
npm run dev
```

### 3. Access DevTools

Open your browser and navigate to the application (typically `https://localhost:5173`).

You should see a purple floating button (🔧) in the bottom-right corner. Click it to open the DevTools panel.

## Features

### CRUD Operations

DevTools provides one-click CRUD (Create, Read, Update, Delete) operations for:

- **Users** (👤) - Manage user accounts
- **Events** (📅) - Create and manage events
- **Groups** (👥) - Manage user groups
- **Profiles** (🔖) - Edit user profiles

### Using the CRUD Interface

1. **Click the floating DevTools button** to open the panel
2. **Select a feature** (Users, Events, Groups, or Profiles)
3. **Perform operations:**
   - **List:** View all items (automatically loaded)
   - **Create:** Click "Create New" and fill in the form
   - **Edit:** Click "Edit" on any item to modify it
   - **Delete:** Click "Delete" to remove an item (with confirmation)

## Configuration

### Server Configuration

Edit `server/node-server-app/devtool.config.json`:

```json
{
    "enabled": true,
    "features": {
        "users": true,      // Enable/disable user management
        "events": true,     // Enable/disable event management
        "groups": true,     // Enable/disable group management
        "profiles": true    // Enable/disable profile management
    },
    "apiPrefix": "/devtools"  // API endpoint prefix
}
```

### Client Configuration

Edit `client/react-client-app/devtool.config.json`:

```json
{
    "enabled": true,
    "position": "bottom-right",  // Position: bottom-right, bottom-left, top-right, top-left
    "features": {
        "users": true,
        "events": true,
        "groups": true,
        "profiles": true
    },
    "apiUrl": "/devtools"  // Server API endpoint
}
```

## API Endpoints

When DevTools are enabled, the following endpoints are available:

### List Features
```
GET /devtools/features
```
Returns list of enabled features.

### User Operations
```
GET    /devtools/users           # List all users
GET    /devtools/users/:id       # Get specific user
POST   /devtools/users           # Create user
PUT    /devtools/users/:id       # Update user
DELETE /devtools/users/:id       # Delete user
```

### Event Operations
```
GET    /devtools/events          # List all events
GET    /devtools/events/:id      # Get specific event
POST   /devtools/events          # Create event
PUT    /devtools/events/:id      # Update event
DELETE /devtools/events/:id      # Delete event
```

### Group Operations
```
GET    /devtools/groups          # List all groups
GET    /devtools/groups/:id      # Get specific group
POST   /devtools/groups          # Create group
PUT    /devtools/groups/:id      # Update group
DELETE /devtools/groups/:id      # Delete group
```

### Profile Operations
```
GET    /devtools/profiles        # List all profiles
GET    /devtools/profiles/:id    # Get specific profile
POST   /devtools/profiles        # Create profile
PUT    /devtools/profiles/:id    # Update profile
DELETE /devtools/profiles/:id    # Delete profile
```

## Creating Custom Plugins

### Server Plugin

Create a new file in `devtool/server/src/plugins/my-plugin.ts`:

```typescript
import { Router } from 'express';
import type { DevToolsPlugin, PluginDependencies } from '../types';

export class MyPlugin implements DevToolsPlugin {
    name = 'my-plugin';
    version = '1.0.0';

    async initialize({ app, database, config }: PluginDependencies): Promise<void> {
        const router = Router();

        router.get('/custom', async (req, res) => {
            // Your custom endpoint logic
            res.json({ message: 'Custom endpoint' });
        });

        app.use(config.apiPrefix, router);
        console.log(`[DevTools] ${this.name} initialized`);
    }
}
```

Then register it in `devtool/server/src/index.ts`:

```typescript
import { MyPlugin } from './plugins/my-plugin';

const plugins: DevToolsPlugin[] = [
    new CrudPlugin(),
    new MyPlugin()  // Add your plugin
];
```

### Client Plugin

Create a component in `devtool/client/src/components/MyFeature.tsx`:

```tsx
import React from 'react';

export const MyFeature: React.FC = () => {
    return (
        <div>
            <h4>My Custom Feature</h4>
            {/* Your custom UI */}
        </div>
    );
};
```

## Troubleshooting

### DevTools Not Appearing

1. **Check environment**: Ensure `NODE_ENV=development`
2. **Check configuration**: Verify `enabled: true` in config files
3. **Check console**: Look for DevTools log messages
4. **Verify installation**: Run `./devtool/install.sh` again

### API Errors

1. **403 Forbidden**: DevTools only work in development mode
2. **404 Not Found**: Server DevTools not properly registered
3. **Network Error**: Check server is running and CORS is configured

### Build Errors

If you encounter build errors:

```bash
# Rebuild server devtools
cd devtool/server
npm run build

# Rebuild client devtools
cd devtool/client
npm run build
```

### Link Errors

If npm link is not working:

```bash
# Unlink and relink
cd devtool/server
npm unlink -g
npm link

cd ../../server/node-server-app
npm unlink @meetonline/devtools-server
npm link @meetonline/devtools-server

# Same for client
cd ../../devtool/client
npm unlink -g
npm link

cd ../../client/react-client-app
npm unlink @meetonline/devtools-client
npm link @meetonline/devtools-client
```

## Security Notes

⚠️ **IMPORTANT**: DevTools are for development only!

- DevTools are **automatically disabled** in production (`NODE_ENV=production`)
- All DevTools endpoints are **protected** by development-mode checks
- **Never** deploy with DevTools enabled to production
- CRUD operations are **unrestricted** in development mode

## Best Practices

1. **Use for development only**: Never enable in production
2. **Configure features**: Disable features you don't need
3. **Test thoroughly**: Always test your changes before production
4. **Keep updated**: Rebuild devtools after changes
5. **Document custom plugins**: If you create plugins, document them

## Examples

### Creating a Test User

1. Open DevTools panel
2. Click "Users" (👤)
3. Click "Create New"
4. Fill in:
   - Username: `testuser`
   - Email: `test@example.com`
5. Click "Create"

### Creating a Test Event

1. Open DevTools panel
2. Click "Events" (📅)
3. Click "Create New"
4. Fill in:
   - Title: `Test Event`
   - Description: `A test event`
   - Creator ID: (use a valid user ID)
   - Start Time: (select date/time)
   - End Time: (select date/time)
   - Location: `Online`
5. Click "Create"

## Further Reading

- [Main DevTools README](../devtool/README.md)
- [Server DevTools README](../devtool/server/README.md)
- [Client DevTools README](../devtool/client/README.md)
- [Architecture Documentation](../docs/architecture.md)
