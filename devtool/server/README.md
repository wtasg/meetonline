# DevTools Server

Server-side plugin system for MeetOnline DevTools.

## Installation

```bash
npm install
npm run build
npm link
```

## Usage

In your server application:

```javascript
import { registerDevToolsPlugins } from '@meetonline/devtools-server';

// Only in development
if (process.env.NODE_ENV === 'development') {
    await registerDevToolsPlugins(app, {
        database: pool,
        config: './devtool.config.json'
    });
}
```

## Configuration

Create `devtool.config.json`:

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

## API Endpoints

- `GET /devtools/features` - List available features
- `GET /devtools/:feature` - List items (users, events, groups, profiles)
- `GET /devtools/:feature/:id` - Get single item
- `POST /devtools/:feature` - Create item
- `PUT /devtools/:feature/:id` - Update item
- `DELETE /devtools/:feature/:id` - Delete item

## Custom Plugins

Create custom plugins:

```typescript
import { registerCustomPlugin } from '@meetonline/devtools-server';

registerCustomPlugin({
    name: 'my-plugin',
    version: '1.0.0',
    initialize: async ({ app, database, config }) => {
        app.get('/devtools/custom', (req, res) => {
            res.json({ message: 'Custom endpoint' });
        });
    }
});
```

## Development

```bash
npm run dev      # Watch mode
npm run build    # Build
npm run lint     # Lint
```
