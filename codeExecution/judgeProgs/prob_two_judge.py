import subprocess 
import sys

DEBUG = False # set True for extra output

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
                             stderr=subprocess.PIPE,
                             universal_newlines=True)

  data = open(input_data).read()
  try:
    process.stdin.write(data)
  except:
     pass
  output, _ = process.communicate()

  return output


'''
output: the student program output
input_data: the data file for the challenge
'''
def judge(output, input_data):
    '''
    Process student output here and return score.
    '''

    if DEBUG:
        print(output)

    '''
    Read in the input data file
    '''
    all_lines = open(input_data, 'r').read().split('\n')
    size = int(all_lines[0].split()[1])
    acorns = int(all_lines[1].split()[1])
    piles = int(all_lines[2].split()[1])

    raw_yard = [list(x) for x in all_lines[3:] if x]

    '''
    Make a Squirrel class to encapsulate its X and Y postions
    '''
    class Squirrel:
        def __init__(self):
            self.x = -1
            self.y = -1

    loc = Squirrel()

    '''
    Generate the empty 2D yard structure from the raw yard input
    '''
    yard = [None] * size
    for i in range(size):
        yard[i] = [None] * size

    '''
    Populate the yard and position the squirrel
    '''
    for row in range(size):
        for col in range(size):
            s = raw_yard[row][col]
            if s.isdigit():
                yard[row][col] = int(s)
            elif s == '.':
                yard[row][col] = 0
            elif s == '@':
                loc.x, loc.y = col, row
                yard[row][col] = 0

    operation_cnt = 0  # No actions by the squirrel yet
    holding = False  # The squirrel is not holding an acorn

#    while output != None:
    for c in output:
        new_operation = False
        if c == 'W':
            loc.x = loc.x - 1 if loc.x > 0 else 0
            new_operation = True
        elif c == 'E':
            loc.x = loc.x + 1 if loc.x < size - 1 else size - 1
            new_operation = True
        elif c == 'N':
            loc.y = loc.y - 1 if loc.y > 0 else 0
            new_operation = True
        elif c == 'S':
            loc.y = loc.y + 1 if loc.y < size - 1 else size - 1
            new_operation = True
        elif c == 'P' and not holding and yard[loc.y][loc.x] > 0:
            yard[loc.y][loc.x] -= 1
            holding = True
            new_operation = True
        elif c == 'D' and holding:
            yard[loc.y][loc.x] += 1
            holding = False
            new_operation = True

        if new_operation:
            operation_cnt += 1
            if DEBUG:
                print(loc.x, loc.y)
#        try:
#            s = input()
#        except:
#            s = None

    def mark_pile(yard, size, x, y):
        if 0 <= x < size and 0 <= y < size and yard[x][y] > 0:
            yard[x][y] = 0
            mark_pile(yard, size, x-1, y)
            mark_pile(yard, size, x, y-1)
            mark_pile(yard, size, x, y+1)
            mark_pile(yard, size, x+1, y)

    piles = 0

    yard_copy = [yard[i][:] for i in range(size)]

    for y in range(size):
        for x in range(size):
            if yard_copy[x][y] > 0:
                mark_pile(yard_copy, size, x, y)
                piles += 1

    # 2N/3 is the average manhattan distance between 2 point in an NxN grid
    score = int( (2 * acorns * size**3) / (3 * piles) - operation_cnt )
    
    if holding:
        score // 2

    if DEBUG:
        for x in yard:
            print(x)
        print(loc.x, loc.y)
        print('piles', piles)
        print('operation cnt', operation_cnt)
        print('score ', end = '')

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

  # Process the captured output here and print the associated score
  print(int(judge(output, input_data)))
