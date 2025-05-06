#!/bin/bash

COMMIT_EXAMPLE_NEXT=$(git merge-base HEAD main)
COMMIT_KEYCHAIN=$(git rev-parse HEAD)

while [[ $# -gt 0 ]]; do
  case $1 in
    --commit-example)
      COMMIT_EXAMPLE_NEXT="$2"
      shift 2
      ;;
    --commit-keychain)
      COMMIT_KEYCHAIN="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--commit-example COMMIT] [--commit-keychain COMMIT]"
      exit 1
      ;;
  esac
done

echo "Using example-next commit: $COMMIT_EXAMPLE_NEXT"
echo "Using keychain commit: $COMMIT_KEYCHAIN"

PACKAGE_EXAMPLE_NEXT="@cartridge/controller-example-next"
PACKAGE_KEYCHAIN="@cartridge/keychain"

WORKTREE_EXAMPLE_NEXT_PATH="../controller-example-next"
WORKTREE_KEYCHAIN_PATH="../controller-keychain"

ORIGINAL_DIR=$(pwd)
DEV_EXAMPLE_NEXT_PID=""
DEV_KEYCHAIN_PID=""

cleanup() {
  echo "Cleaning up..."
  cd "$ORIGINAL_DIR"
  if [[ -n "$DEV_EXAMPLE_NEXT_PID" && $(ps -p $DEV_EXAMPLE_NEXT_PID -o comm=) ]]; then
    kill $DEV_EXAMPLE_NEXT_PID
  fi
  if [[ -n "$DEV_KEYCHAIN_PID" && $(ps -p $DEV_KEYCHAIN_PID -o comm=) ]]; then
    kill $DEV_KEYCHAIN_PID
  fi

  sleep 1

  if [ -d "$WORKTREE_EXAMPLE_NEXT_PATH" ]; then
    cd "$ORIGINAL_DIR"
    git worktree remove "$WORKTREE_EXAMPLE_NEXT_PATH" --force || echo "WARN: Failed to remove worktree example-next cleanly via git. Attempting rm -rf..." && rm -rf "$WORKTREE_EXAMPLE_NEXT_PATH"
  fi
  if [ -d "$WORKTREE_KEYCHAIN_PATH" ]; then
    cd "$ORIGINAL_DIR"
    git worktree remove "$WORKTREE_KEYCHAIN_PATH" --force || echo "WARN: Failed to remove worktree keychain cleanly via git. Attempting rm -rf..." && rm -rf "$WORKTREE_KEYCHAIN_PATH"
  fi

  git worktree prune
}

trap cleanup EXIT INT TERM

for path in "$WORKTREE_EXAMPLE_NEXT_PATH" "$WORKTREE_KEYCHAIN_PATH"; do
  if [ -d "$path" ]; then
    read -p "Worktree directory '$path' already exists. Remove it to continue? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      rm -rf "$path"
      git worktree prune # Clean up git's records as well
    else
      echo "Aborting. Please remove the directory '$path' manually or choose a different path."
      exit 1
    fi
  fi
done


git worktree add "$WORKTREE_EXAMPLE_NEXT_PATH" "$COMMIT_EXAMPLE_NEXT"
if [ $? -ne 0 ]; then echo "ERROR: Failed to create worktree example-next at $COMMIT_EXAMPLE_NEXT."; exit 1; fi

cd "$WORKTREE_EXAMPLE_NEXT_PATH"
if [ $? -ne 0 ]; then echo "ERROR: Failed to cd into worktree example-next."; exit 1; fi

pnpm install
if [ $? -ne 0 ]; then echo "ERROR: pnpm install failed in worktree example-next."; exit 1; fi

pnpm build
if [ $? -ne 0 ]; then echo "ERROR: pnpm build failed in worktree example-next."; exit 1; fi

pnpm --filter "$PACKAGE_EXAMPLE_NEXT" dev &
DEV_EXAMPLE_NEXT_PID=$!
echo "$PACKAGE_EXAMPLE_NEXT dev server started with PID $DEV_EXAMPLE_NEXT_PID."
sleep 5

cd "$ORIGINAL_DIR"

git worktree add "$WORKTREE_KEYCHAIN_PATH" "$COMMIT_KEYCHAIN"
if [ $? -ne 0 ]; then echo "ERROR: Failed to create worktree keychain at $COMMIT_KEYCHAIN."; exit 1; fi

cd "$WORKTREE_KEYCHAIN_PATH"
if [ $? -ne 0 ]; then echo "ERROR: Failed to cd into worktree keychain."; exit 1; fi

pnpm install
if [ $? -ne 0 ]; then echo "ERROR: pnpm install failed in worktree keychain."; exit 1; fi

pnpm build
if [ $? -ne 0 ]; then echo "ERROR: pnpm build failed in worktree keychain."; exit 1; fi

pnpm --filter "$PACKAGE_KEYCHAIN" dev &
DEV_KEYCHAIN_PID=$!
echo "$PACKAGE_KEYCHAIN dev server started with PID $DEV_KEYCHAIN_PID."
sleep 5

cd "$ORIGINAL_DIR"

echo ""
echo "-----------------------------------------------------"
echo ">>> Setup complete. Servers are running:"
echo "  - $PACKAGE_EXAMPLE_NEXT (Commit $COMMIT_EXAMPLE_NEXT) - PID: $DEV_EXAMPLE_NEXT_PID"
echo "  - $PACKAGE_KEYCHAIN (Commit $COMMIT_KEYCHAIN) - PID: $DEV_KEYCHAIN_PID"
echo ""
echo "  Press Ctrl+C in this terminal to stop both servers"
echo "  and automatically clean up the worktrees."
echo "-----------------------------------------------------"

wait
