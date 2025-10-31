# cross-env — Use Case, Need, and  Alternatives

## cross-env kya hai?
`cross-env` is a Node.js package which we use to set environment variables, it works with same syntax (Windows, Mac, Linux) ,
## Why do we need?
 - use diff syntax for diff environment variables .  
`cross-env` solve problem by giving common command.

Example:
```json
"scripts": {
  "start": "cross-env NODE_ENV=production node server.js"
}

#alternatives
- dotenv load from .env file
- works with docker

