# Variables and Basic Data Types

Python dynamic type system is powerful but requires discipline.

## Core Types
- int: arbitrary-precision, e.g. x = 42
- float: IEEE 754 double, e.g. pi = 3.14159
- str: immutable sequence, e.g. name = Alice
- bool: True / False
- None: represents absence of value

## Type Conversion
int('5') -> 5 | float(3) -> 3.0 | str(42) -> '42'

## String Operations
- f-strings: f'Hello {name}'
- Methods: .upper(), .lower(), .strip(), .split(), .join()
- Indexing and slicing: s[0], s[1:3]

## Variable Rules
- Dynamic typing: variables can be reassigned to different types
- Naming: snake_case, start with letter or underscore
- Multiple assignment: a, b = 1, 2

**Key Takeaway**: Validate types at function boundaries.
