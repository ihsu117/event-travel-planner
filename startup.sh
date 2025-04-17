#!/bin/bash

# Define paths
BACKEND_DIR="/home/poseidon/event-travel-planner/backend"
FRONTEND_DIR="/home/poseidon/event-travel-planner"
NODE_PATH="/home/poseidon/.nvm/versions/node/v22.13.1/bin/node"
NPM_PATH="/home/poseidon/.nvm/versions/node/v22.13.1/bin/npm"

# Check if a branch name is passed as an argument, else prompt the user
if [ $# -eq 0 ]; then
    read -p "Enter the branch name (default: main): " BRANCH
    BRANCH=${BRANCH:-main}  # Default to 'main' if no input
else
    BRANCH=$1  # Use the argument passed to the script
fi

# Function to update a repository
update_repo() {
    local dir=$1
    echo "Updating repo in $dir..."
    cd "$dir" || exit
    git reset --hard
    git pull origin "$BRANCH"
    git submodule update
    source "$HOME/.nvm/nvm.sh"
    npm install
}

# Function to run "npm i" in PoseidonDesignSys
pds_npm_install() {
    local dir=$FRONTEND_DIR
    echo "Running 'npm i' in PoseidonDesignSys"
    cd "$dir/Poseidon-Design-System/PoseidonDesignSys" || exit
    source "$HOME/.nvm/nvm.sh"
    npm install
}


# Update the backend and frontend repositories
update_repo "$BACKEND_DIR"
update_repo "$FRONTEND_DIR"
pds_npm_install

# Start backend server in a new terminal window with interactive shell
echo "Starting backend in a new terminal..."
gnome-terminal -- bash -i -c "cd $BACKEND_DIR && $NODE_PATH ./server.js; exec bash" &

# Start frontend server (test mode) in a new terminal window with interactive shell
echo "Starting frontend (test mode) in a new terminal..."
gnome-terminal -- bash -i -c "cd $FRONTEND_DIR && $NPM_PATH run dev; exec bash" &

echo "Both servers started successfully!"

