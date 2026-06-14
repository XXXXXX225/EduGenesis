# Functions and Modular Programming

Functions encapsulate reusable logic for clean, maintainable code.

## Function Basics
def greet(name, greeting='Hello'):
    '''Return a greeting string.'''
    return f'{greeting}, {name}!'

## Parameter Types
- Positional: def f(a, b)
- Default: def f(a, b=10)
- Keyword: f(b=20, a=10)
- *args: variable positional
- **kwargs: variable keyword

## Scope (LEGB)
- Local -> Enclosing -> Global -> Built-in
- global and nonlocal keywords
- Closures: inner function captures outer variables

## Lambda
square = lambda x: x ** 2
sorted(items, key=lambda x: x['score'])

## Decorators
def timer(func):
    def wrapper(*args, **kwargs):
        t0 = time.time()
        result = func(*args, **kwargs)
        print(f'{func.__name__} took {time.time()-t0:.2f}s')
        return result
    return wrapper

## Modules
- import math
- from math import sqrt
- Avoid: from module import *
- import numpy as np

**Key Takeaway**: Small, single-responsibility functions with docstrings.
