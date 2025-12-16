#!/usr/bin/env bash

# Colors and formatting
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
INFO="ℹ️  "
WARN="⚠️  "

echo -e "${BLUE}${INFO}Running update and audit...${NC}"

# Move to repo root
REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT" || exit

# Server
echo -e "${BLUE}--------------------------------------------------${NC}"
echo -e "${BLUE}${INFO}Processing Server (server/node-server-app)...${NC}"
echo -e "${BLUE}--------------------------------------------------${NC}"
cd server/node-server-app || exit
echo -e "${BLUE}${INFO}Installing packages...${NC}"
npm install 
echo -e "${BLUE}${INFO}Updating packages...${NC}"
npm update --save
echo -e "${BLUE}${INFO}Auditing packages...${NC}"
npm audit
SERVER_EXIT_CODE=$?

# Client
echo -e "${BLUE}--------------------------------------------------${NC}"
echo -e "${BLUE}${INFO}Processing Client (client/react-client-app)...${NC}"
echo -e "${BLUE}--------------------------------------------------${NC}"
cd ../../client/react-client-app || exit
echo -e "${BLUE}${INFO}Installing packages...${NC}"
npm install 
echo -e "${BLUE}${INFO}Updating packages...${NC}"
npm update --save
echo -e "${BLUE}${INFO}Auditing packages...${NC}"
npm audit
CLIENT_EXIT_CODE=$?

echo -e "${BLUE}--------------------------------------------------${NC}"
echo -e "${BLUE}${INFO}Update and Audit Complete.${NC}"

if [ $SERVER_EXIT_CODE -ne 0 ] || [ $CLIENT_EXIT_CODE -ne 0 ]; then
    echo -e "${YELLOW}${WARN}Warning: audit found issues (or other errors occurred).${NC}"
    # We don't exit with error here to ensure both run, but we warn at the end.
fi
