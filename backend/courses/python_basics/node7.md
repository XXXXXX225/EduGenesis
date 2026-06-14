# Exception Handling and File I/O

Robust programs handle errors and persist data through filesystem operations.

## Try-Except
try:
    result = 10 / divisor
except ZeroDivisionError:
    result = float('inf')
except (TypeError, ValueError) as e:
    print(f'Error: {e}')
else:
    print('Success')
finally:
    print('Cleanup')

## Custom Exceptions
class ValidationError(Exception):
    pass

## File Reading
with open('data.txt', 'r', encoding='utf-8') as f:
    content = f.read()
    for line in f:
        process(line)

## File Writing
with open('output.txt', 'w', encoding='utf-8') as f:
    f.write('Hello World\n')

import json
with open('config.json', 'w') as f:
    json.dump(data, f, indent=2)

**Key Takeaway**: Always use with for files, never suppress exceptions silently.
