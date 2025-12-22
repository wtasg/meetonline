#!/usr/bin/env bash

# Colors and formatting
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color
INFO="ℹ️  "
SUCCESS="✅  "

echo -e "${BLUE}${INFO}Running build for all packages...${NC}"

# Move to repo root
REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT" || exit

# Server
echo -e "${BLUE}--------------------------------------------------${NC}"
echo -e "${BLUE}${INFO}Building Server (server/node-server-app)...${NC}"
echo -e "${BLUE}--------------------------------------------------${NC}"
cd server/node-server-app || exit
npm run build
SERVER_EXIT_CODE=$?

# Client
echo -e "${BLUE}--------------------------------------------------${NC}"
echo -e "${BLUE}${INFO}Building Client (client/react-client-app)...${NC}"
echo -e "${BLUE}--------------------------------------------------${NC}"
cd ../../client/react-client-app || exit
npm run build
CLIENT_EXIT_CODE=$?

echo -e "${BLUE}--------------------------------------------------${NC}"
if [ $SERVER_EXIT_CODE -eq 0 ] && [ $CLIENT_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}${SUCCESS}Build complete.${NC}"
else
    echo -e "${BLUE}Build finished with errors.${NC}"
    exit 1
fi
