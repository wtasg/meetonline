#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

tree -I "node_modules/" \
    -I "dist/" \
    -I "test-results" \
    -I "coverage/" >.editor/tree.txt
