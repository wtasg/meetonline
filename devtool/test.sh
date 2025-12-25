#!/bin/bash

# Test script for DevTools
# Verifies that all files and dependencies are in place

echo "============================================"
echo "Testing DevTools Installation"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Test 1: Check server build
echo -n "Checking server build... "
if [ -f "server/dist/index.js" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS+1))
fi

# Test 2: Check client build
echo -n "Checking client build... "
if [ -f "client/dist/index.js" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS+1))
fi

# Test 3: Check server link
echo -n "Checking server link... "
if [ -d "../server/node-server-app/node_modules/@meetonline/devtools-server" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS+1))
fi

# Test 4: Check client link
echo -n "Checking client link... "
if [ -d "../client/react-client-app/node_modules/@meetonline/devtools-client" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS+1))
fi

# Test 5: Check server integration
echo -n "Checking server integration... "
if grep -q "setupDevTools" ../server/node-server-app/src/server.js; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS+1))
fi

# Test 6: Check client integration
echo -n "Checking client integration... "
if grep -q "DevTools" ../client/react-client-app/src/App.tsx; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS+1))
fi

# Test 7: Check config files
echo -n "Checking server config... "
if [ -f "../server/node-server-app/devtool.config.json" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS+1))
fi

echo -n "Checking client config... "
if [ -f "../client/react-client-app/devtool.config.json" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS+1))
fi

echo ""
echo "============================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    echo "============================================"
    exit 0
else
    echo -e "${RED}$ERRORS test(s) failed${NC}"
    echo "============================================"
    echo ""
    echo "Run './install.sh' to fix installation issues."
    exit 1
fi
