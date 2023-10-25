#!/bin/bash

if [ $# -ne 1 ]; then
    echo "Usage: $0 <source_code_file.cpp>"
    exit 1
fi

g++ -o user_program "$1" 

if [ $? -eq 0 ]; then
    ./user_program
else
    echo "Compilation failed."
fi
