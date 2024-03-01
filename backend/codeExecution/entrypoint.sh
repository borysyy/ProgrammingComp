#!/bin/bash

if [ $# -ne 2 ]; then
    echo "Usage: $0 <username> <source_code_file>"
    exit 1
fi

username="$1"
filename="$2"
extension="${filename##*.}" # Extract file extension

# Create a unique output directory for each user
output_directory="/output/${username}"

# Set default status to success
status="Success"

program_output="${output_directory}/${username}_program_output.txt"
compiler_output="${output_directory}/${username}_compiler_output.txt"

echo $'\n' >$program_output
echo $'\n' >$compiler_output

if [ "$extension" = "cpp" ]; then
    # Compile the program, with a 10 second limit, capturing compiler errors
    timeout 10s g++ -o user_program "$filename" 2>$compiler_output || {
        if [ -s $compiler_output ]; then
            status="An error as occurred"
        else
            status="Compilation took longer than 10 seconds"
        fi
    }
    # Run the program, with a 10 second limit, capturing stdout and stderr
    timeout 10s ./user_program &>$program_output || {
        if [ -s $program_output ]; then
            status="An error as occurred"
        else
            status="Runtime took longer than 10 seconds"
        fi
    }

elif [ "$extension" = "c" ]; then
    # Compile the program, with a 10 second limit, capturing compiler errors
    timeout 10s gcc -o user_program "$filename" 2>$compiler_output || {
        if [ -s $compiler_output ]; then
            status="An error as occurred"
        else
            status="Compilation took longer than 10 seconds"
        fi
    }
    # Run the program, with a 10 second limit, capturing stdout and stdin
    timeout 10s ./user_program &>$program_output || {
        if [ -s $program_output ]; then
            status="An error as occurred"
        else
            status="Runtime took longer than 10 seconds"
        fi
    }

elif [ "$extension" = "py" ]; then
    # Run the program, with a 10 second limit, capturing stdout and stdin
    timeout 10s python3 "$filename" &>$program_output || {
        if [ -s $program_output ]; then
            status="An error as occurred"
        else
            status="Runtime took longer than 10 seconds"
        fi
    }

else
    status="Unsupported file type: Please provide a .cpp, .c, or .py file."

fi

# Write status to program_output file
sed -i "1s/^/${status//\//\\/}\n\n/" "$program_output"
