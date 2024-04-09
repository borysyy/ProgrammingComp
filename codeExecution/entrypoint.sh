#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Usage: <source_code_file(s)>, <judging_prog>, <testing_file>"
    exit 1
fi


declare -a file_array=()

for ((i = 1; i <= $# - 2; i++)); do
    filename=${!i}  # Get the argument at index i
    file_array+=("$filename")  # Add the argument to the array
done

extension="${file_array[0]##*.}"

# Create a unique output directory for each user
output_directory="/output"

# Set default status to success
status="Success"

program_output="${output_directory}/program_output.txt"
compiler_output="${output_directory}/compiler_output.txt"
score_output="${output_directory}/score_output.txt"


echo $'\n' >$program_output
echo $'\n' >$compiler_output
echo $'\n' >$score_output

judging_prog="${@: -2:1}"
test_file="${@: -1}"


if [ "${#file_array[@]}" -eq 1 ]; then

    if [ "$extension" = "cpp" ]; then
        # # Compile the program, with a 10 second limit, capturing compiler errors
        # timeout 10s g++ -o user_program "$filename" 2>$compiler_output || {
        #     if [ -s $compiler_output ]; then
        #         status="An error as occurred"
        #     else
        #         status="Compilation took longer than 10 seconds"
        #     fi
        # }
        # # Run the program, with a 10 second limit, capturing stdout and stderr
        # timeout 10s ./user_program $test_file  &>$program_output || {
        #     if [ -s $program_output ]; then
        #         status="An error as occurred"
        #     else
        #         status="Runtime took longer than 10 seconds"
        #     fi
        # }

        g++ -o user_program "${file_array[0]}" 2>$compiler_output

        ./user_program < "$test_file" &>$program_output

        python3 "$judging_prog" "$test_file" ./user_program &>$score_output

    elif [ "$extension" = "c" ]; then
        # # Compile the program, with a 10 second limit, capturing compiler errors
        # timeout 10s gcc -o user_program "$filename" 2>$compiler_output || {
        #     if [ -s $compiler_output ]; then
        #         status="An error as occurred"
        #     else
        #         status="Compilation took longer than 10 seconds"
        #     fi
        # }
        # # Run the program, with a 10 second limit, capturing stdout and stdin
        # timeout 10s ./user_program &>$program_output || {
        #     if [ -s $program_output ]; then
        #         status="An error as occurred"
        #     else
        #         status="Runtime took longer than 10 seconds"
        #     fi
        # }

          gcc -o user_program "${file_array[0]}" 2>$compiler_output

        ./user_program < "$test_file" &>$program_output

        python3 "$judging_prog" "$test_file" ./user_program &>$score_output

    elif [ "$extension" = "py" ]; then
        # timeout 10s python3 "$filename" &>$program_output || {
        #     if [ -s $program_output ]; then
        #         status="An error as occurred"
        #     else
        #         status="Runtime took longer than 10 seconds"
        #     fi
        # }
            python3 "${file_array[0]}" < "$test_file" &>$program_output

            python3 "$judging_prog" "$test_file" python3 "${file_array[0]}" &>$score_output

    elif [ "$extension" = "java" ]; then
        # timeout 10s java "$filename" &>$program_output || {
        #     if [ -s $program_output ]; then
        #         status="An error as occurred"
        #     else
        #         status="Runtime took longer than 10 seconds"
        #     fi
        # }

        java "${file_array[0]}" < "$test_file" $>$program_output

        python3 "$judging_prog" "$test_file" java "${file_array[0]}" &>$score_output

        
    elif [ "$extension" = "js" ]; then
        # timeout 10s node "$filename" &>$program_output || {
        #     if [ -s $program_output ]; then
        #         status="An error as occurred"
        #     else
        #         status="Runtime took longer than 10 seconds"
        #     fi
        # }

        node "${file_array[0]}" < "$test_file" $>$program_output

        python3 "$judging_prog" "$test_file" node "${file_array[0]}" &>$score_output
    else
        echo "Unsupported file type. Please provide a .cpp, .c, .py, or a .java file." > $program_output
    fi

elif [ "${#file_array[@]}" -gt 1 ]; then
    javac "${file_array[@]}" 2> $compiler_output
    if [ $? -eq 0 ]; then
        for file in "${file_array[@]}"; do
            classname=$(basename "$file" .java)
            if grep -q 'public static void main' "$file"; then
                java -classpath "$(dirname "$file")" "$classname" &> $program_output
            fi
        done
    fi
fi