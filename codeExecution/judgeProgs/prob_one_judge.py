import subprocess

'''
Runs a program, providing input file through stdin pipe
and capturing stdout pipe to judge output of program.
'''
def run_program(program_path, input_data, *args):
  if args:
    popen_args = [program_path, *args]
  else:
    popen_args = [program_path]
  process = subprocess.Popen(popen_args,
                             stdin=subprocess.PIPE,
                             stdout=subprocess.PIPE,
                             stderr=subprocess.STDOUT,
                             universal_newlines=True)

  data = open(input_data).read()
  process.stdin.write(data)
  output, _ = process.communicate()

  return output


def judge(output):
  '''
  Process student output here and return score.
  '''
  score = output  # stub that just returns the input
  return score


if __name__ == "__main__":
  import sys

  if len(sys.argv) < 3:
    print("Usage:", sys.argv[0], "<input_data_file> <program_path> <program_args>")
    sys.exit(1)

  input_data = sys.argv[1]
  program_path = sys.argv[2]
  program_args = sys.argv[3:]

  if len(program_args) > 0:
    output = run_program(program_path, input_data, *program_args)
  else:
    output = run_program(program_path, input_data)

  # Process the captured output here
  print(int(judge(output)) * 3)
