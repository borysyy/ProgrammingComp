#!/bin/bash

# Checking if username was entered
if [ $# -ne 1 ]; then
    echo "Usage: $0 <username>"
    exit 1
fi

username="$1"

# Printing that the container was successful 
echo "Running $username's container"

# Running the docker image
docker run -t -v ~/tmp:/tmp -e USER="$username" -p 22:22 users 
 

   
