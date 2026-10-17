#!/usr/bin/env bash
#
# contextual-help installer
#
# Installs the contextual-help skill into ~/.claude/skills so Claude Code picks it up
# automatically.
#
# Works two ways:
#
#   Remote (one-liner):
#     curl -fsSL https://raw.githubusercontent.com/iamshubhransh/contextual-help/main/install.sh | bash
#
#   Local (from a clone):
#     ./install.sh
#
set -euo pipefail

REPO_URL="https://github.com/iamshubhransh/contextual-help.git"
REPO_TARBALL="https://github.com/iamshubhransh/contextual-help/archive/refs/heads/main.tar.gz"
SKILL_NAME="contextual-help"
SKILLS_ROOT="plugins/contextual-help/skills"
DEST_BASE="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"

# ---- pretty output ---------------------------------------------------------
if [ -t 1 ]; then
  BOLD=$(printf '\033[1m'); GREEN=$(printf '\033[32m'); YELLOW=$(printf '\033[33m')
  RED=$(printf '\033[31m'); DIM=$(printf '\033[2m'); RESET=$(printf '\033[0m')
else
  BOLD=""; GREEN=""; YELLOW=""; RED=""; DIM=""; RESET=""
fi
info()  { printf '%s\n' "${BOLD}==>${RESET} $*"; }
ok()    { printf '%s\n' "${GREEN}✓${RESET} $*"; }
warn()  { printf '%s\n' "${YELLOW}!${RESET} $*"; }
die()   { printf '%s\n' "${RED}✗${RESET} $*" >&2; exit 1; }

# ---- locate the skill source -----------------------------------------------
# If this script is being run from inside a checkout, copy from there.
# Otherwise download a fresh copy into a temp dir.
SOURCE_ROOT=""
CLEANUP_TMP=""

SCRIPT_DIR=""
if [ -n "${BASH_SOURCE:-}" ] && [ -f "${BASH_SOURCE[0]:-}" ]; then
  SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
fi

if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/$SKILLS_ROOT/$SKILL_NAME/SKILL.md" ]; then
  SOURCE_ROOT="$SCRIPT_DIR/$SKILLS_ROOT"
  info "Installing from local checkout."
else
  TMP=$(mktemp -d 2>/dev/null || mktemp -d -t contextual-help)
  CLEANUP_TMP="$TMP"
  trap '[ -n "$CLEANUP_TMP" ] && rm -rf "$CLEANUP_TMP"' EXIT
  if command -v git >/dev/null 2>&1; then
    info "Fetching contextual-help…"
    git clone --depth 1 "$REPO_URL" "$TMP/repo" >/dev/null 2>&1 \
      || die "git clone failed. Check your network or clone manually from $REPO_URL"
    SOURCE_ROOT="$TMP/repo/$SKILLS_ROOT"
  elif command -v curl >/dev/null 2>&1; then
    info "Fetching contextual-help (tarball)…"
    curl -fsSL "$REPO_TARBALL" | tar -xz -C "$TMP" \
      || die "Download failed. Check your network or install git and retry."
    SOURCE_ROOT="$TMP/contextual-help-main/$SKILLS_ROOT"
  else
    die "Need either git or curl to download. Please install one and retry."
  fi
fi

SOURCE="$SOURCE_ROOT/$SKILL_NAME"
[ -f "$SOURCE/SKILL.md" ] || die "Could not find the skill in the download. Please report this issue."

# ---- install ---------------------------------------------------------------
mkdir -p "$DEST_BASE"
DEST_DIR="$DEST_BASE/$SKILL_NAME"
if [ -d "$DEST_DIR" ]; then
  warn "Existing install at $DEST_DIR — replacing it."
  rm -rf "$DEST_DIR"
fi
cp -R "$SOURCE" "$DEST_DIR"
ok "Installed ${BOLD}$SKILL_NAME${RESET} to ${DIM}$DEST_DIR${RESET}"

echo
info "Next steps"
printf '  %s\n' "1. Restart Claude Code (or start a new session) so it loads the skill."
printf '  %s\n' "2. Ask Claude to add tooltips or help text, design an empty state, or review your app's help — or run /contextual-help."
echo
printf '%s\n' "${DIM}Prefer the marketplace? /plugin marketplace add iamshubhransh/contextual-help${RESET}"
