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

# Set default status to success
status="Success"

if [ "$extension" = "cpp" ]; then
    # Use timeout to limit compilation time to 5 seconds
    timeout 5s g++ -o user_program "$filename" 2> "${output_directory}/compiler_output.txt" || status="Compilation took longer than 5 seconds"
    if [ "$status" == "Success" ]; then
        # Use timeout to limit execution time to 10 seconds
        timeout 10s ./user_program > "${output_directory}/program_output.txt" 2> "${output_directory}/program_errors.txt" || status="Runtime took longer than 10 seconds"
    fi
elif [ "$extension" = "c" ]; then
    timeout 5s gcc -o user_program "$filename" 2> "${output_directory}/compiler_output.txt" || status="Compilation took longer than 5 seconds"
    if [ "$status" == "Success" ]; then
        timeout 10s ./user_program > "${output_directory}/program_output.txt" 2> "${output_directory}/program_errors.txt" || status="Runtime took longer than 10 seconds"
    fi
elif [ "$extension" = "py" ]; then
    # Use timeout to limit execution time to 10 seconds
    timeout 10s python3 "$filename" > "${output_directory}/program_output.txt" 2> "${output_directory}/program_errors.txt" || status="Runtime took longer than 10 seconds"
else
    echo "Unsupported file type. Please provide a .cpp, .c, or .py file." > "${output_directory}/program_errors.txt"
    status="Unsupported file type"
fi

# Write status to status file
echo "$status" > "${output_directory}/status.txt"
