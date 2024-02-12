#!/bin/bash

if [ $# -ne 2 ]; then
    echo "Usage: $0 <username> <source_code_file>"
    exit 1
fi

username="$1"
filename="$2"
extension="${filename##*.}"  # Extract file extension

# Create a unique output directory for each user
output_directory="/output/${username}"

# Clear the program output file at the start of each run
> "${output_directory}/compiler_output.txt"
> "${output_directory}/program_errors.txt"
> "${output_directory}/program_output.txt"


if [ "$extension" = "cpp" ]; then
    g++ -o user_program "$filename" 2> "${output_directory}/compiler_output.txt"
    if [ $? -eq 0 ]; then
        ./user_program > "${output_directory}/program_output.txt" 2> "${output_directory}/program_errors.txt"
    fi
elif [ "$extension" = "c" ]; then
    gcc -o user_program "$filename" 2> "${output_directory}/compiler_output.txt"
    if [ $? -eq 0 ]; then
        ./user_program > "${output_directory}/program_output.txt" 2> "${output_directory}/program_errors.txt"
    fi
elif [ "$extension" = "py" ]; then
    python3 -m py_compile "$filename" 2> "${output_directory}/compiler_output.txt"
    if [ $? -eq 0 ]; then
        python3 "$filename" > "${output_directory}/program_output.txt" 2> "${output_directory}/program_errors.txt"
    fi
else
    echo "Unsupported file type. Please provide a .cpp, .c, or .py file." > "${output_directory}/program_errors.txt"
fi
