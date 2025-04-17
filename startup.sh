#!/usr/bin/env bash

# Figure out where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Point FRONTEND_DIR at the directory this script lives in,
# and BACKEND_DIR at its "backend" subfolder
FRONTEND_DIR="$SCRIPT_DIR"
BACKEND_DIR="$SCRIPT_DIR/backend"

# If you still want to pin a Node version via nvm, source nvm here:
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Check for branch argument (default to main)
if [ $# -eq 0 ]; then
    read -p "Enter the branch name (default: main): " BRANCH
    BRANCH=${BRANCH:-main}
else
    BRANCH=$1
fi

# Update a repo given by its path
update_repo() {
    local dir=$1
    echo "Updating repo in $dir…"
    cd "$dir" || exit
    git reset --hard
    git pull origin "$BRANCH"
    git submodule update --init --recursive
    # ensure correct Node version is active, if you use an .nvmrc
    [ -f .nvmrc ] && nvm use
    npm install
}

# Install PoseidonDesignSys within the frontend tree
pds_npm_install() {
    echo "Installing PoseidonDesignSys…"
    cd "$FRONTEND_DIR/Poseidon-Design-System/PoseidonDesignSys" || exit
    [ -f .nvmrc ] && nvm use
    npm install
}

# Do the updates
update_repo "$BACKEND_DIR"
update_repo "$FRONTEND_DIR"
pds_npm_install

# Launch servers in new terminals
echo "Starting backend in a new terminal…"
gnome-terminal -- bash -i -c "cd \"$BACKEND_DIR\" && node server.js; exec bash" &

echo "Starting frontend (test mode) in a new terminal…"
gnome-terminal -- bash -i -c "cd \"$FRONTEND_DIR\" && npm run dev; exec bash" &

echo "Both servers started successfully!"
