#!/bin/bash

# Function to kill processes running on a specific port
kill_port_processes() {
  PORT=$1
  echo "Killing processes running on port $PORT"
  
  # Find all process IDs using the specified port
  PIDS=$(sudo lsof -t -i :$PORT)
  
  # Check if any PIDs were found
  if [ -z "$PIDS" ]; then
    echo "No processes found running on port $PORT"
  else
    # Loop through each PID and kill it
    for PID in $PIDS; do
      echo "Killing process with PID $PID"
      sudo kill -9 $PID
    done
  fi
}

# Kill processes on port 80
kill_port_processes 80

# Kill processes on port 443
kill_port_processes 443

echo "All processes on ports 80 and 443 have been killed."

