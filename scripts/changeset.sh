#!/bin/bash

# ============================================================================
# changeset.sh - Generate a ChangeSet markdown file from the last commit
# ============================================================================

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the root directory of the git repository
REPO_ROOT=$(git rev-parse --show-toplevel)
CHANGES_DIR="${REPO_ROOT}/changes"

# Get current date and time
DATE=$(date +%Y.%m.%d)
TIME=$(date +%H.%M)

# Get current branch name
CURRENT_BRANCH=$(git branch --show-current)

# Get last commit and previous commit hashes
LAST_COMMIT=$(git rev-parse --short HEAD)
PREVIOUS_COMMIT=$(git rev-parse --short HEAD~1 2>/dev/null || echo "none")
LAST_COMMIT_FULL=$(git rev-parse HEAD)
LAST_COMMIT_MSG=$(git log -1 --format="%s")

# Output file - includes branch name, previous commit, and time
OUTPUT_FILE="${CHANGES_DIR}/ChangeSet-${CURRENT_BRANCH}-${PREVIOUS_COMMIT}-${DATE}-${TIME}.md"

echo -e "${BLUE}ℹ️  Generating ChangeSet from last commit '${LAST_COMMIT}' (previous: ${PREVIOUS_COMMIT})${NC}"

# Create changes directory if it doesn't exist
mkdir -p "${CHANGES_DIR}"

# Check for uncommitted changes
STAGED_CHANGES=$(git diff --cached --name-status 2>/dev/null)
UNSTAGED_CHANGES=$(git diff --name-status 2>/dev/null)
UNTRACKED_FILES=$(git ls-files --others --exclude-standard 2>/dev/null)

# Exit if there are unstaged changes
if [ -n "$UNSTAGED_CHANGES" ]; then
    echo -e "${YELLOW}⚠️  Unstaged changes detected. Please stage your changes first:${NC}"
    echo ""
    echo -e "${BLUE}  git add <files>      # Stage specific files${NC}"
    echo -e "${BLUE}  git add -A           # Stage all changes${NC}"
    echo ""
    echo -e "${YELLOW}Unstaged files:${NC}"
    echo "$UNSTAGED_CHANGES" | while read -r status file; do
        echo "  $status  $file"
    done
    exit 1
fi

HAS_UNCOMMITTED=false
if [ -n "$STAGED_CHANGES" ] || [ -n "$UNTRACKED_FILES" ]; then
    HAS_UNCOMMITTED=true
fi

# Start generating the markdown file
cat > "${OUTPUT_FILE}" << EOF
# ChangeSet - ${DATE}

**Branch:** \`${CURRENT_BRANCH}\`  
**Commit:** \`${LAST_COMMIT}\` - ${LAST_COMMIT_MSG}  
**Previous Commit:** \`${PREVIOUS_COMMIT}\`  
**Date:** $(date +%Y-%m-%d)  
**Time:** $(date +%H:%M)

## Summary

This changeset documents the changes in commit \`${LAST_COMMIT}\` compared to \`${PREVIOUS_COMMIT}\`.

## Git Commands

\`\`\`bash
# View this commit
git show ${LAST_COMMIT}

# View commit details
git log -1 ${LAST_COMMIT}

# View file change summary for this commit
git diff ${PREVIOUS_COMMIT}..${LAST_COMMIT} --stat

# View file status (A=Added, M=Modified, D=Deleted)
git diff ${PREVIOUS_COMMIT}..${LAST_COMMIT} --name-status

# View full diff of this commit
git diff ${PREVIOUS_COMMIT}..${LAST_COMMIT}

# View changes for a specific file
git diff ${PREVIOUS_COMMIT}..${LAST_COMMIT} -- <file-path>

# Revert this commit
git revert ${LAST_COMMIT}

# Cherry-pick this commit to another branch
git cherry-pick ${LAST_COMMIT}
\`\`\`

## Commit

| Hash | Message |
|------|---------|
| \`${LAST_COMMIT}\` | ${LAST_COMMIT_MSG} |
EOF

# Add uncommitted changes section if any exist
if [ "$HAS_UNCOMMITTED" = true ]; then
    cat >> "${OUTPUT_FILE}" << 'EOF'

---

## ⚠️ Uncommitted Changes

> [!WARNING]
> The following changes are not yet committed and will be included in the next commit.

EOF

    # Staged changes
    if [ -n "$STAGED_CHANGES" ]; then
        echo "### 📦 Staged Changes (ready to commit)" >> "${OUTPUT_FILE}"
        echo "" >> "${OUTPUT_FILE}"
        echo "| Status | File |" >> "${OUTPUT_FILE}"
        echo "|--------|------|" >> "${OUTPUT_FILE}"
        echo "$STAGED_CHANGES" | while read -r status file; do
            case "$status" in
                A) status_name="Added" ;;
                M) status_name="Modified" ;;
                D) status_name="Deleted" ;;
                R*) status_name="Renamed" ;;
                *) status_name="$status" ;;
            esac
            echo "| ${status_name} | \`${file}\` |" >> "${OUTPUT_FILE}"
        done
        echo "" >> "${OUTPUT_FILE}"
    fi

    # Untracked files
    if [ -n "$UNTRACKED_FILES" ]; then
        echo "### 🆕 Untracked Files (not in git)" >> "${OUTPUT_FILE}"
        echo "" >> "${OUTPUT_FILE}"
        echo "| File |" >> "${OUTPUT_FILE}"
        echo "|------|" >> "${OUTPUT_FILE}"
        echo "$UNTRACKED_FILES" | while read -r file; do
            echo "| \`${file}\` |" >> "${OUTPUT_FILE}"
        done
        echo "" >> "${OUTPUT_FILE}"
    fi
fi

cat >> "${OUTPUT_FILE}" << 'EOF'

---

## Committed Changes by Status

EOF

# Function to map file extension to human-readable name
get_extension_name() {
    local ext="$1"
    case "$ext" in
        js)         echo "JavaScript" ;;
        jsx)        echo "React JSX" ;;
        ts)         echo "TypeScript" ;;
        tsx)        echo "React TSX" ;;
        mjs)        echo "ES Module" ;;
        cjs)        echo "CommonJS" ;;
        mts)        echo "TS Module" ;;
        cts)        echo "TS CommonJS" ;;
        json)       echo "JSON" ;;
        md)         echo "Markdown" ;;
        markdown)   echo "Markdown" ;;
        css)        echo "CSS" ;;
        scss)       echo "SCSS" ;;
        sass)       echo "Sass" ;;
        less)       echo "Less" ;;
        html)       echo "HTML" ;;
        htm)        echo "HTML" ;;
        xml)        echo "XML" ;;
        yml)        echo "YAML" ;;
        yaml)       echo "YAML" ;;
        sh)         echo "Shell" ;;
        bash)       echo "Bash" ;;
        zsh)        echo "Zsh" ;;
        ps1)        echo "PowerShell" ;;
        py)         echo "Python" ;;
        rb)         echo "Ruby" ;;
        go)         echo "Go" ;;
        rs)         echo "Rust" ;;
        java)       echo "Java" ;;
        c)          echo "C" ;;
        cpp)        echo "C++" ;;
        h)          echo "C Header" ;;
        hpp)        echo "C++ Header" ;;
        sql)        echo "SQL" ;;
        txt)        echo "Text" ;;
        log)        echo "Log" ;;
        png)        echo "PNG Image" ;;
        jpg|jpeg)   echo "JPEG Image" ;;
        gif)        echo "GIF Image" ;;
        svg)        echo "SVG" ;;
        webp)       echo "WebP Image" ;;
        ico)        echo "Icon" ;;
        env)        echo "Environment" ;;
        lock)       echo "Lock File" ;;
        map)        echo "Source Map" ;;
        flow)       echo "Flow Types" ;;
        eslintrc)   echo "ESLint Config" ;;
        prettierrc) echo "Prettier Config" ;;
        babelrc)    echo "Babel Config" ;;
        editorconfig) echo "EditorConfig" ;;
        gitignore)  echo "Git Ignore" ;;
        dockerignore) echo "Docker Ignore" ;;
        npmignore)  echo "NPM Ignore" ;;
        Dockerfile) echo "Dockerfile" ;;
        no-ext)     echo "No Extension" ;;
        *)          echo "${ext^^}" ;;  # Uppercase for unknown extensions
    esac
}

# Function to get extension stats from a list of files (outputs table rows)
get_extension_stats() {
    local files="$1"
    echo "$files" | while read -r file; do
        if [ -n "$file" ]; then
            # Extract extension (handle files without extension)
            ext="${file##*.}"
            if [ "$ext" = "$file" ] || [ -z "$ext" ]; then
                echo "no-ext"
            else
                echo "$ext"
            fi
        fi
    done | sort | uniq -c | sort -rn | while read -r count ext; do
        local name=$(get_extension_name "$ext")
        echo "| ${name} | ${count} |"
    done
}

# Function to add files by status
add_files_by_status() {
    local status_code="$1"
    local status_name="$2"
    local emoji="$3"
    
    local files=$(git diff "${PREVIOUS_COMMIT}..${LAST_COMMIT}" --name-status | grep "^${status_code}" | cut -f2)
    
    if [ -n "$files" ]; then
        local file_count=$(echo "$files" | wc -l)
        local ext_stats=$(get_extension_stats "$files")
        
        echo "### ${emoji} ${status_name} (${file_count})" >> "${OUTPUT_FILE}"
        echo "" >> "${OUTPUT_FILE}"
        echo "**By Type:**" >> "${OUTPUT_FILE}"
        echo "" >> "${OUTPUT_FILE}"
        echo "| Type | Count |" >> "${OUTPUT_FILE}"
        echo "|------|-------|" >> "${OUTPUT_FILE}"
        echo "$ext_stats" >> "${OUTPUT_FILE}"
        echo "" >> "${OUTPUT_FILE}"
        echo "**Files:**" >> "${OUTPUT_FILE}"
        echo "" >> "${OUTPUT_FILE}"
        echo "| File |" >> "${OUTPUT_FILE}"
        echo "|------|" >> "${OUTPUT_FILE}"
        echo "$files" | while read -r file; do
            echo "| \`${file}\` |" >> "${OUTPUT_FILE}"
        done
        echo "" >> "${OUTPUT_FILE}"
    fi
}

add_files_by_status "A" "Added Files" "➕"
add_files_by_status "M" "Modified Files" "✏️"
add_files_by_status "D" "Deleted Files" "🗑️"

# Add statistics
STATS=$(git diff "${PREVIOUS_COMMIT}..${LAST_COMMIT}" --stat | tail -1)
ADDED=$(git diff "${PREVIOUS_COMMIT}..${LAST_COMMIT}" --name-status | grep -c "^A" || echo "0")
MODIFIED=$(git diff "${PREVIOUS_COMMIT}..${LAST_COMMIT}" --name-status | grep -c "^M" || echo "0")
DELETED=$(git diff "${PREVIOUS_COMMIT}..${LAST_COMMIT}" --name-status | grep -c "^D" || echo "0")
TOTAL=$((ADDED + MODIFIED + DELETED))

# Extract insertions and deletions from stats
INSERTIONS=$(echo "$STATS" | grep -oP '\d+(?= insertion)' || echo "0")
DELETIONS=$(echo "$STATS" | grep -oP '\d+(?= deletion)' || echo "0")

cat >> "${OUTPUT_FILE}" << EOF
---

## Statistics

| Metric | Value |
|--------|-------|
| Total files changed | ${TOTAL} |
| New files | ${ADDED} |
| Modified files | ${MODIFIED} |
| Deleted files | ${DELETED} |
| Insertions | +${INSERTIONS:-0} |
| Deletions | -${DELETIONS:-0} |
EOF

echo -e "${GREEN}✅ ChangeSet generated: ${OUTPUT_FILE}${NC}"
echo -e "${BLUE}ℹ️  Commit ${LAST_COMMIT}, ${TOTAL} file(s) changed${NC}"

# Remind user about uncommitted changes
if [ "$HAS_UNCOMMITTED" = true ]; then
    echo -e "${YELLOW} DONE! ${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  You have uncommitted changes! Don't forget to commit:${NC}"
    echo ""
    echo -e "${BLUE}  git commit -m \"your commit message\"${NC}"
    echo ""
fi
