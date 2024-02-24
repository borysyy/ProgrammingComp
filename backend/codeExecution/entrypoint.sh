#!/bin/bash

echo "" > /output/compiler_output.txt
echo "" > /output/program_output.txt
echo "" > /output/program_errors.txt

if [ $# -lt 1 ]; then
    echo "Usage: $0 <source_code_file> [<source_code_file> ...]"
    exit 1
fi

filename="$1"
declare -a file_array=()

for filename in "$@"; do
    file_array+=("$filename")
done

if [ "${#file_array[@]}" -eq 1 ]; then
    extension="${file_array[0]##*.}"
    if [ "$extension" = "cpp" ]; then
        g++ -o user_program "${file_array[0]}" 2> /output/compiler_output.txt
        if [ $? -eq 0 ]; then
            ./user_program > /output/program_output.txt 2> /output/program_errors.txt
        fi
    elif [ "$extension" = "c" ]; then
        gcc -o user_program "${file_array[0]}" 2> /output/compiler_output.txt
        if [ $? -eq 0 ]; then
            ./user_program > /output/program_output.txt 2> /output/program_errors.txt
        fi
    elif [ "$extension" = "py" ]; then
        python3 -m py_compile "${file_array[0]}" 2> /output/compiler_output.txt
        if [ $? -eq 0 ]; then
            echo "current directory '.': " > /output/debug.txt
            pwd >> /output/debug.txt
            python3 "${file_array[0]}" > /output/program_output.txt 2> /output/program_errors.txt
        fi
    elif [ "$extension" = "java" ]; then
        if [ $? -eq 0 ]; then
            java "${file_array[0]}" > /output/program_output.txt 2> /output/program_errors.txt
        fi
    elif [ "$extension" = "js" ]; then
        node "${file_array[0]}" > /output/program_output.txt 2> /output/program_errors.txt
    else
        echo "Unsupported file type. Please provide a .cpp, .c, .py, or a .java file." > /output/program_errors.txt
    fi
elif [ "${#file_array[@]}" -ne 0 ]; then
    javac "${file_array[@]}" 2> /output/compiler_output.txt
    if [ $? -eq 0 ]; then
        for file in "${file_array[@]}"; do
            classname=$(basename "$file" .java)
            if grep -q 'public static void main' "$file"; then
                classpath=$(dirname "$file")
                java -cp "$classpath" "$classname" > /output/program_output.txt 2> /output/program_errors.txt
            fi
        done
    fi
fi
