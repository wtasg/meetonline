#!/bin/bash

# DevTools Installation Script
# This script builds and links DevTools packages for development use

set -e

echo "============================================"
echo "Installing MeetOnline DevTools"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the script directory (devtool/)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Project root: $PROJECT_ROOT"
echo ""

# Build and link server devtools
echo -e "${YELLOW}[1/4] Building server devtools...${NC}"
cd "$SCRIPT_DIR/server"
npm install
npm run build
echo -e "${GREEN}✓ Server devtools built${NC}"
echo ""

echo -e "${YELLOW}[2/4] Linking server devtools...${NC}"
npm link
echo -e "${GREEN}✓ Server devtools linked${NC}"
echo ""

# Build and link client devtools
echo -e "${YELLOW}[3/4] Building client devtools...${NC}"
cd "$SCRIPT_DIR/client"
npm install
npm run build
echo -e "${GREEN}✓ Client devtools built${NC}"
echo ""

echo -e "${YELLOW}[4/4] Linking client devtools...${NC}"
npm link
echo -e "${GREEN}✓ Client devtools linked${NC}"
echo ""

# Link to server app
echo -e "${YELLOW}Linking devtools to server app...${NC}"
cd "$PROJECT_ROOT/server/node-server-app"
npm link @meetonline/devtools-server
echo -e "${GREEN}✓ Server devtools linked to server app${NC}"
echo ""

# Link to client app
echo -e "${YELLOW}Linking devtools to client app...${NC}"
cd "$PROJECT_ROOT/client/react-client-app"
npm link @meetonline/devtools-client
echo -e "${GREEN}✓ Client devtools linked to client app${NC}"
echo ""

echo "============================================"
echo -e "${GREEN}DevTools installation complete!${NC}"
echo "============================================"
echo ""
echo "DevTools will automatically activate when running in development mode."
echo ""
echo "To start the server with DevTools:"
echo "  cd server/node-server-app"
echo "  npm run dev"
echo ""
echo "To start the client with DevTools:"
echo "  cd client/react-client-app"
echo "  npm run dev"
echo ""
echo "DevTools will appear as a floating button in the bottom-right corner."
echo ""
