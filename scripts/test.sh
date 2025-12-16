#!/usr/bin/env bash

# Unified test runner for meetonline project
# Usage: ./scripts/test.sh [all|server|client|e2e]
# Default: all

set -e

# Colors for output
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Move to repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$REPO_ROOT" || exit 1

# Parse argument
TARGET="${1:-all}"

# Track results
SERVER_RESULT=0
CLIENT_RESULT=0
E2E_RESULT=0

run_server_tests() {
    echo -e "${CYAN}ℹ️  Running server tests...${NC}"
    cd "$REPO_ROOT/server/node-server-app" || exit 1
    npm run test
    SERVER_RESULT=$?
    cd "$REPO_ROOT"
    if [[ "$SERVER_RESULT" -eq 0 ]]; then
        echo -e "${GREEN}✅ Server tests passed${NC}"
    else
        echo -e "${RED}❌ Server tests failed${NC}"
    fi
}

run_client_tests() {
    echo -e "${CYAN}ℹ️  Running client tests...${NC}"
    cd "$REPO_ROOT/client/react-client-app" || exit 1
    npm run test -- --run
    CLIENT_RESULT=$?
    cd "$REPO_ROOT"
    if [[ "$CLIENT_RESULT" -eq 0 ]]; then
        echo -e "${GREEN}✅ Client tests passed${NC}"
    else
        echo -e "${RED}❌ Client tests failed${NC}"
    fi
}

run_e2e_tests() {
    echo -e "${CYAN}ℹ️  Running E2E tests...${NC}"
    "$SCRIPT_DIR/run-e2e.sh"
    E2E_RESULT=$?
    if [[ "$E2E_RESULT" -eq 0 ]]; then
        echo -e "${GREEN}✅ E2E tests passed${NC}"
    else
        echo -e "${RED}❌ E2E tests failed${NC}"
    fi
}

case "$TARGET" in
    server)
        run_server_tests
        ;;
    client)
        run_client_tests
        ;;
    e2e)
        run_e2e_tests
        ;;
    all)
        run_server_tests
        echo ""
        run_client_tests
        echo ""
        run_e2e_tests
        ;;
    *)
        echo -e "${YELLOW}Usage: $0 [all|server|client|e2e]${NC}"
        echo "  all    - Run all tests (default)"
        echo "  server - Run server unit tests"
        echo "  client - Run client unit tests"
        echo "  e2e    - Run end-to-end tests"
        exit 1
        ;;
esac

# Summary for 'all' target
if [[ "$TARGET" == "all" ]]; then
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}           Test Summary${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    [[ "$SERVER_RESULT" -eq 0 ]] && echo -e "  Server: ${GREEN}✅ PASSED${NC}" || echo -e "  Server: ${RED}❌ FAILED${NC}"
    [[ "$CLIENT_RESULT" -eq 0 ]] && echo -e "  Client: ${GREEN}✅ PASSED${NC}" || echo -e "  Client: ${RED}❌ FAILED${NC}"
    [[ "$E2E_RESULT" -eq 0 ]] && echo -e "  E2E:    ${GREEN}✅ PASSED${NC}" || echo -e "  E2E:    ${RED}❌ FAILED${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
fi

# Exit with failure if any test failed
if [[ "$SERVER_RESULT" -ne 0 || "$CLIENT_RESULT" -ne 0 || "$E2E_RESULT" -ne 0 ]]; then
    exit 1
fi

exit 0
