# MeetOnline Architecture - PlantUML Diagrams

PlantUML source code for architecture diagrams. Render these using PlantUML tools or IDE plugins.

---

## System Overview

```plantuml
@startuml System Overview
!theme plain
skinparam backgroundColor #FEFEFE

title MeetOnline System Architecture

cloud "Internet" as internet

package "Client Tier" {
    actor User
    component [Web Browser] as browser
    component [React SPA\nVite + React 19] as react
}

package "Presentation Tier" {
    component [NGINX Proxy\n:443] as nginx
}

package "Application Tier" {
    component [Express.js API\n:9443 HTTPS\n:9006 HTTP] as express
}

package "Data Tier" {
    database "PostgreSQL 18\n:5432" as postgres
}

User --> browser
browser --> react
react --> internet
internet --> nginx
nginx --> express
express --> postgres

@enduml
```

---

## Component Diagram

```plantuml
@startuml Component Diagram
!theme plain
skinparam backgroundColor #FEFEFE
skinparam componentStyle rectangle

title MeetOnline Component Architecture

package "React Client" {
    package "Features" {
        [Login] as login
        [Signup] as signup
        [Groups] as groups
        [UserProfile] as profile
        [UserSettings] as settings
    }
    
    package "Actions Layer" {
        [authActions] as authActions
        [groupActions] as groupActions
        [userProfileActions] as profileActions
        [userSettingsActions] as settingsActions
    }
    
    package "Network Layer" {
        [authenticatedFetch] as authFetch
        [csrf.js] as csrf
        [net/auth.js] as netAuth
        [net/group.js] as netGroup
    }
    
    package "Utilities" {
        [jwt.js] as jwt
        [storage.js] as storage
        [session.js] as session
    }
}

login --> authActions
signup --> authActions
groups --> groupActions
profile --> profileActions
settings --> settingsActions

authActions --> authFetch
groupActions --> authFetch
profileActions --> authFetch
settingsActions --> authFetch

authFetch --> csrf
authFetch --> jwt
authFetch --> netAuth
authFetch --> netGroup

@enduml
```

---

## Server Component Diagram

```plantuml
@startuml Server Components
!theme plain
skinparam backgroundColor #FEFEFE
skinparam componentStyle rectangle

title Express.js Server Architecture

package "Express Application" {
    package "Middleware Chain" {
        [Helmet] as helmet
        [CORS] as cors
        [Compression] as compression
        [Cookie Parser] as cookie
        [CSRF Protection] as csrfMw
        [Morgan Logger] as morgan
        [Rate Limiter] as rateLimit
        [JWT Auth] as jwtAuth
    }
    
    package "Route Handlers" {
        [authHandler] as auth
        [groupHandler] as group
        [userProfileHandler] as profileH
        [userSettingsHandler] as settingsH
        [uploadHandler] as upload
    }
    
    package "Database Layer" {
        [user_account.js] as dbUser
        [user_profile.js] as dbProfile
        [group.js] as dbGroup
        [jwt_tokens.js] as dbJwt
    }
    
    package "Utilities" {
        [jwt.js] as jwtUtil
        [hash.js] as hash
        [store.js] as store
    }
}

database "PostgreSQL" as postgres

helmet --> cors
cors --> compression
compression --> cookie
cookie --> csrfMw
csrfMw --> morgan
morgan --> rateLimit

auth --> jwtAuth
auth --> dbUser
auth --> dbJwt
auth --> jwtUtil
auth --> hash

group --> dbGroup
profileH --> dbProfile
settingsH --> dbProfile

dbUser --> postgres
dbProfile --> postgres
dbGroup --> postgres
dbJwt --> postgres

@enduml
```

---

## Entity Relationship Diagram

```plantuml
@startuml ER Diagram
!theme plain
skinparam backgroundColor #FEFEFE

title MeetOnline Database Schema

entity "user_account" as ua {
    * id : bigserial <<PK>>
    --
    * username : varchar(1024) <<UK>>
    * salt : varchar(1024)
    * password : varchar(1024)
    * is_active : boolean
    * is_deleted : boolean
    * is_blocked : boolean
    * is_forgotten : boolean
    * created_at : timestamp
    * modified_at : timestamp
}

entity "user_profile" as up {
    * id : bigserial <<PK>>
    --
    * user_id : bigint <<FK>>
    profile_name : varchar(128)
    * display_name : varchar(128)
    phone_number : varchar(128)
    email : varchar(128)
    address : varchar(512)
    website_url : varchar(128)
    * created_at : timestamp
    * modified_at : timestamp
}

entity "user_settings" as us {
    * id : bigserial <<PK>>
    --
    * user_profile_id : bigint <<FK, UK>>
    * theme : varchar(64)
    * font_size : varchar(32)
    * font_family : varchar(128)
    * font_contrast : varchar(32)
    * notifications : boolean
    * online_presence : boolean
    * sounds : boolean
    * created_at : timestamp
    * modified_at : timestamp
}

entity "group" as g {
    * id : bigserial <<PK>>
    --
    * user_profile_id : bigint <<FK>>
    * group_name : varchar(256)
    description : text
    * is_public : boolean
    members : text
    tags : text
    categories : text
    * is_deleted : boolean
    * is_hidden : boolean
    * is_archived : boolean
    * created_at : timestamp
    * modified_at : timestamp
}

entity "event" as e {
    * id : bigserial <<PK>>
    --
    * organiser_id : bigint <<FK>>
    group_id : bigint <<FK>>
    * title : varchar(1024)
    description : text
    online_location : varchar(1024)
    * start_at : timestamp
    * end_at : timestamp
    * is_paid : boolean
    * is_broadcast : boolean
    broadcast_type : varchar(64)
    * created_at : timestamp
    * modified_at : timestamp
}

entity "jwt_tokens" as jwt {
    * id : bigserial <<PK>>
    --
    * user_id : bigint <<FK>>
    * access_token : varchar(1024)
    * refresh_token : varchar(1024)
    * access_token_expires_at : timestamp
    * refresh_token_expires_at : timestamp
    * is_revoked : boolean
    * created_at : timestamp
    * modified_at : timestamp
}

entity "kv_store" as kv {
    * k : varchar(1024) <<PK>>
    --
    * v : varchar(1024)
    * created_at : timestamp
}

ua ||--o{ up : "has"
ua ||--o{ jwt : "has"
up ||--o| us : "has"
up ||--o{ g : "owns"
up ||--o{ e : "organizes"
g ||--o{ e : "contains"

@enduml
```

---

## JWT Authentication Sequence

```plantuml
@startuml JWT Authentication
!theme plain
skinparam backgroundColor #FEFEFE

title JWT Authentication Flow

actor User
participant "React Client" as Client
participant "Express Server" as Server
database "PostgreSQL" as DB

== Login ==
User -> Client: Enter credentials
Client -> Server: POST /auth_token\n{username, password}
Server -> DB: getUserAccountByUsername()
DB --> Server: User record
Server -> Server: comparePassword()
alt Valid credentials
    Server -> DB: revokeAllJwtTokensForUser()
    Server -> Server: generateAccessToken()\ngenerateRefreshToken()
    Server -> DB: createJwtTokenPair()
    Server --> Client: {accessToken, refreshToken,\naccessTokenExpiresAt}
    Client -> Client: Store in localStorage
else Invalid credentials
    Server --> Client: 401 Unauthorized
end

@enduml
```

---

## Token Refresh Sequence

```plantuml
@startuml Token Refresh
!theme plain
skinparam backgroundColor #FEFEFE

title JWT Token Refresh Flow

participant "React Client" as Client
participant "Express Server" as Server
database "PostgreSQL" as DB

Client -> Server: POST /auth_refresh\n{refreshToken}
Server -> Server: verifyToken(refreshToken)

alt Token signature valid
    Server -> DB: getJwtTokenByRefreshToken()
    DB --> Server: Token record
    
    alt Token not revoked & not expired
        Server -> DB: revokeJwtToken(oldId)
        Server -> Server: generateAccessToken()\ngenerateRefreshToken()
        Server -> DB: createJwtTokenPair()
        Server --> Client: {newAccessToken,\nnewRefreshToken}
        Client -> Client: Update localStorage
    else Token revoked or expired
        Server --> Client: 401 Token revoked/expired
    end
else Token signature invalid
    Server --> Client: 401 Invalid token
end

@enduml
```

---

## Authenticated Request Sequence

```plantuml
@startuml Authenticated Request
!theme plain
skinparam backgroundColor #FEFEFE

title Authenticated API Request Flow

participant "React Client" as Client
participant "authenticatedFetch" as AuthFetch
participant "Express Server" as Server
participant "jwtMiddleware" as JWT
database "PostgreSQL" as DB

Client -> AuthFetch: Request data
AuthFetch -> AuthFetch: Check token expiry

alt Token expired
    AuthFetch -> Server: POST /auth_refresh
    Server --> AuthFetch: New tokens
    AuthFetch -> AuthFetch: Update localStorage
end

AuthFetch -> Server: GET /resource\nAuthorization: Bearer {token}
Server -> JWT: Verify request

JWT -> JWT: Extract token from header
JWT -> JWT: verifyToken(token)
JWT -> DB: getJwtTokenByAccessToken()
DB --> JWT: Token record

alt Valid & not revoked
    JWT -> JWT: Set req.user
    JWT --> Server: next()
    Server -> DB: Execute query
    DB --> Server: Result
    Server --> Client: JSON response
else Invalid, expired, or revoked
    JWT --> Client: 401 Unauthorized
end

@enduml
```

---

## User Signup Sequence

```plantuml
@startuml Signup Flow
!theme plain
skinparam backgroundColor #FEFEFE

title User Signup Flow

actor User
participant "React Client" as Client
participant "Express Server" as Server
participant "Token Store" as TokenStore
database "PostgreSQL" as DB

== Get Signup Token ==
User -> Client: Navigate to /signup
Client -> Server: GET /signup
Server -> Server: Generate UUID token
Server -> TokenStore: store(token, timestamp)
Server --> Client: {token}\nSet-Cookie: signup_token

== Submit Registration ==
User -> Client: Enter username & password
Client -> Server: POST /signup\n{username, password, token}
Server -> TokenStore: retrieve(token)

alt Token valid (< 2 min old)
    Server -> Server: saltWithRounds()
    Server -> Server: hashWithSalt(password)
    Server -> DB: createUserAccount()
    DB --> Server: Success
    Server --> Client: {ok: true,\nsignup: {username}}
    Client -> Client: Navigate to /login
else Token expired
    Server -> TokenStore: Generate new token
    Server --> Client: 400 "Old token. Retry!"
end

@enduml
```

---

## Deployment Diagram

```plantuml
@startuml Deployment
!theme plain
skinparam backgroundColor #FEFEFE

title Docker Compose Deployment

node "Docker Host" {
    
    artifact "docker-compose.yml" as compose
    
    node "meetonline-proxy" <<nginx:stable>> {
        component [NGINX] as nginx
        portin ":443" as nginxPort
    }
    
    node "meetonline-client" <<node>> {
        component [Vite Build] as vite
        artifact "dist/" as dist
    }
    
    node "meetonline-server" <<node>> {
        component [Express.js] as express
        portin ":9443" as httpsPort
        portin ":9006" as httpPort
    }
    
    node "meetonline-database" <<postgres:18>> {
        component [PostgreSQL] as postgres
        portin ":5432" as dbPort
        storage "db_data" as dbData
    }
    
    storage "server_uploads" as uploads
    storage "server_certs" as certs
    storage "client_certs" as clientCerts
}

cloud "Internet" as internet

internet --> nginxPort
nginx --> httpsPort
express --> dbPort

vite --> dist
dist --> nginx

uploads --> express
certs --> express
certs --> nginx
clientCerts --> nginx

@enduml
```

---

## Security Layers

```plantuml
@startuml Security Layers
!theme plain
skinparam backgroundColor #FEFEFE

title Security Architecture - Defense in Depth

rectangle "Layer 1: Transport Security" as L1 #LightBlue {
    card "TLS 1.2+" as tls
    card "HTTPS All Endpoints" as https
}

rectangle "Layer 2: Request Filtering" as L2 #LightGreen {
    card "CORS Whitelist" as cors
    card "Rate Limiting\n(12 req/min)" as rate
    card "Helmet Headers" as helmet
}

rectangle "Layer 3: CSRF Protection" as L3 #LightYellow {
    card "Double-Submit Cookie" as csrf
    card "Token Validation" as csrfVal
}

rectangle "Layer 4: Authentication" as L4 #LightCoral {
    card "JWT Access Token\n(15m expiry)" as access
    card "JWT Refresh Token\n(7d expiry)" as refresh
    card "Single Session\nEnforcement" as single
    card "Token Revocation" as revoke
}

rectangle "Layer 5: Password Security" as L5 #Plum {
    card "bcrypt Hashing" as bcrypt
    card "Per-User Salt" as salt
}

rectangle "Layer 6: Data Protection" as L6 #LightGray {
    card "Input Sanitization" as sanitize
    card "Parameterized Queries" as param
    card "Soft Delete\n(GDPR Support)" as gdpr
}

L1 -[hidden]-> L2
L2 -[hidden]-> L3
L3 -[hidden]-> L4
L4 -[hidden]-> L5
L5 -[hidden]-> L6

@enduml
```

---

## Group Management Sequence

```plantuml
@startuml Group Management
!theme plain
skinparam backgroundColor #FEFEFE

title Group Management Flow

actor User
participant "React Client" as Client
participant "Express Server" as Server
database "PostgreSQL" as DB

== Create Group ==
User -> Client: Fill group form
Client -> Server: POST /group\n{groupName, description, isPublic}
Server -> Server: Validate session
Server -> DB: getUserProfileByUsername()
DB --> Server: Profile
Server -> DB: createGroup()
DB --> Server: New group
Server --> Client: {ok: true, group: {...}}

== Join Group ==
User -> Client: Click "Join"
Client -> Server: POST /group/:id/join
Server -> DB: getGroupById()
DB --> Server: Group

alt Group is public
    Server -> DB: addGroupMember()
    DB --> Server: Updated group
    Server --> Client: {ok: true}
else Group is private
    Server --> Client: 403 Forbidden
end

== Search Groups ==
User -> Client: Enter search term
Client -> Server: GET /group/search?q=term
Server -> DB: searchGroupsByName()
DB --> Server: Matching groups
Server --> Client: {groups: [...]}

@enduml
```

---

## Rendering Instructions

### Using PlantUML CLI

```bash
# Install PlantUML
brew install plantuml  # macOS
apt install plantuml   # Debian/Ubuntu

# Render single diagram
plantuml -tsvg docs/arch.puml.md

# Render all diagrams to PNG
plantuml -tpng docs/arch.puml.md
```

### Using VS Code

1. Install "PlantUML" extension
2. Open this file
3. Alt+D to preview diagrams

### Using IntelliJ IDEA

1. Install "PlantUML Integration" plugin
2. Open this file
3. Click the PlantUML diagram icon

### Online Renderer

Paste code blocks into [PlantUML Web Server](https://www.plantuml.com/plantuml/uml/)
