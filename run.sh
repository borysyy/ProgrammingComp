#!/bin/bash

if [ $# -ne 1 ]; then
    echo "Usage: $0 <username>"
    exit 1
fi

username="$1"

docker run -t -v ~/tmp:/tmp -e USER="$username" -p 22:22 users