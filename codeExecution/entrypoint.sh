#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Usage: <source_code_file(s)>, <judging_prog>, <testing_file>"
    exit 1
fi


declare -a file_array=()

# Get all of the program files 
for ((i = 1; i <= $# - 2; i++)); do
    filename=${!i}  # Get the argument at index i
    file_array+=("$filename")  # Add the argument to the array
done

extension="${file_array[0]##*.}"

# Create a unique output directory for each user
output_directory="/output"

# Set up all of the text files
program_output="${output_directory}/program_output.txt"
compiler_output="${output_directory}/compiler_output.txt"
score_output="${output_directory}/score_output.txt"


echo $'\n' >$program_output
echo $'\n' >$compiler_output
echo $'\n' >$score_output

# Get the judging program from the 2nd to last arg.
judging_prog="${@: -2:1}"
# Get the test file from the last arg. 
test_file="${@: -1}"

# Compile and run the compiled languages
compile_run_code() {
    # Get the compiler
    compiler="$1"

    # Compile the program, with a 60 second limit, capturing compiler errors
    timeout 60s "$compiler" -o user_program "${file_array[0]}" 2>$compiler_output 

    if [ -s $compiler_output ]; then
        status="An error has occurred:" 
        sed -i -e "1i$status\ " "$compiler_output"
    fi

    # Set the runtime limit to 60 seconds
    runtime=`timeout 60s ./user_program < "$test_file"`
    runtime_status=$?
    # If the exit status is 124 then notify user 
    if [ $runtime_status -eq 124 ]; then
    echo "Runtime took longer than 60s"  > "$program_output"
    else
        # Send the output of the code to the program_output file
        echo "$runtime" &> "$program_output"
        sed -i '50001, $ d' "$program_output"
        # Judge the code with the test file and user program
        python3 "$judging_prog" "$test_file" ./user_program 1> $score_output
    fi
}

# Run the interpreted languages
run_interpreted_code() {
    # Get the interpreter
    interpreter="$1"

    if [ $interpreter != "javac" ]; then

        # Set the runtime limit to 60 seconds
        runtime=`timeout 60s "$interpreter" "${file_array[0]}" < "$test_file"`
        # If the exit status is 124 then notify user 
        runtime_status=$?
        if [ $runtime_status -eq 124 ]; then
        echo "Runtime took longer than 10s" > "$program_output"
        else
            # Send the output of the code to the program_output file
            echo "$runtime" &> "$program_output"
            sed -i '50001, $ d' "$program_output"
            # Judge the code with the test file and user program
            python3 "$judging_prog" "$test_file" "$interpreter" "${file_array[0]}" &>$score_output
        fi

     elif [ $interpreter == "javac" ]; then
        # Set the runtime limit to 60 seconds
        compiletime=`timeout 60s "$interpreter" "${file_array[@]}" < "$test_file"`

        # If the exit status is 124 then notify user 
        compiletime=$?

        if [ $compiletime -eq 124 ]; then
            echo "Compiletime longer than 10s" > "$program_output"
        else
            for file in "${file_array[@]}"; do
                if grep -q 'public static void main' "$file"; then
                    classname=$(basename "$file" .java)

                    # Set the runtime limit to 60 seconds
                    runtime=`timeout 60s java -classpath "$(dirname "$file")" "$classname" < "$test_file"`

                    # If the exit status is 124 then notify user 
                    runtime_status=$?

                    if [ $runtime_status -eq 124 ]; then
                        echo "Runtime took longer than 10s" > "$program_output"
                    else
                        # Send the output of the code to the program_output file
                        echo "$runtime" &> "$program_output"
                        sed -i '50001, $ d' "$program_output"
                        # Judge the code with the test file and user program
                        python3 "$judging_prog" "$test_file" java -classpath "$(dirname "$file")" "$classname" < "$test_file" &>$score_output
                    fi
                    break
                else
                    echo "Public Static Void Main (String[] args) not found." > "$program_output"
                fi
            done

        fi
    fi
}

if [ "${#file_array[@]}" -eq 1 ]; then

    # Run C++
    if [ "$extension" = "cpp" ]; then
    
        compiler="g++"

        compile_run_code "$compiler"
    
    # Run C
    elif [ "$extension" = "c" ]; then

        compiler="gcc"
        
        compile_run_code "$compiler"
         
    # Run Python
    elif [ "$extension" = "py" ]; then

        interpreter="python3"

        run_interpreted_code "$interpreter"

    # Run Java
    elif [ "$extension" = "java" ]; then

        interpreter="java"

        run_interpreted_code "$interpreter"

    # Run JavaScript
    elif [ "$extension" = "js" ]; then

        interpreter="node"

        run_interpreted_code "$interpreter"

    else
        echo "Unsupported file type. Please provide a .cpp, .c, .py, or a .java file." > $program_output
    fi

elif [ "${#file_array[@]}" -gt 1 ]; then
    # Check if all files in the array have the .java extension
        all_java=true
        for file in "${file_array[@]}"; do
            if [[ ! "$file" =~ \.java$ ]]; then
                all_java=false
                break
            fi
        done

        if [ "$all_java" = true ]; then
            interpreter="javac"
            run_interpreted_code "$interpreter"
        else
            echo "Multiple file support is only available for Java." > $program_output

    fi
fi