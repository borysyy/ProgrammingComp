#!/bin/bash

echo "" > /output/compiler_output.txt
echo "" > /output/program_output.txt
echo "" > /output/program_errors.txt

if [ $# -ne 1 ]; then
    echo "Usage: $0 <source_code_file>"
    exit 1
fi

filename="$1"
extension="${filename##*.}"  # Extract file extension

if [ "$extension" = "cpp" ]; then
    g++ -o user_program "$filename" 2> /output/compiler_output.txt
    if [ $? -eq 0 ]; then
        ./user_program > /output/program_output.txt 2> /output/program_errors.txt
    fi
elif [ "$extension" = "c" ]; then
    gcc -o user_program "$filename" 2> /output/compiler_output.txt
    if [ $? -eq 0 ]; then
        ./user_program > /output/program_output.txt 2> /output/program_errors.txt
    fi
elif [ "$extension" = "py" ]; then
    python3 -m py_compile "$filename" 2> /output/compiler_output.txt
    if [ $? -eq 0 ]; then
        python3 "$filename" > /output/program_output.txt 2> /output/program_errors.txt
    fi
else
    echo "Unsupported file type. Please provide a .cpp or .py file." > /output/program_errors.txt
fi
