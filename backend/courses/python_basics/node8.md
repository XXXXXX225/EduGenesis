# Capstone Project: Adaptive Calculator

Apply all concepts in a test-driven calculator project.

## Requirements
1. Basic: +, -, *, /
2. Advanced: ** (power), sqrt
3. History tracking
4. Input validation and error handling

## Architecture
calculator/
  __init__.py
  operations.py    # Core math
  parser.py        # Input parsing
  history.py       # History
  main.py          # CLI entry
  test_calc.py     # Tests

## Core Functions
def add(a, b): return a + b
def divide(a, b):
    if b == 0: raise ValueError('Cannot divide by zero')
    return a / b

## Tests
def test_add():
    assert add(2, 3) == 5
    assert add(-1, 1) == 0

**Key Takeaway**: TDD + modular design = production-ready.
