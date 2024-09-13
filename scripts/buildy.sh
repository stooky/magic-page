#!/bin/bash

# Find all processes with the name "next"
processes=$(pgrep next)

if [ -z "$processes" ]; then
  echo "No 'next' processes found."
else
  echo "Killing the following 'next' processes: $processes"
  for pid in $processes; do
    kill -9 $pid
    echo "Killed process $pid"
  done
fi

#
echo "building the runs"
 npm run build --verbose

#
echo "starting the nexts"
 npm start
