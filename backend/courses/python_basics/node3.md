# Control Flow and Conditional Branching

Control flow determines execution paths based on conditions.

## If-Elif-Else
if score >= 90:
    grade = 'A'
elif score >= 80:
    grade = 'B'
else:
    grade = 'C'

## Comparison Operators
- ==, !=, <, >, <=, >=
- is / is not (identity)
- in / not in (membership)

## Logical Operators
- and, or, not
- Short-circuit evaluation: a or b returns a if truthy else b

## Ternary Expression
result = 'pass' if score >= 60 else 'fail'

## Match-Case (Python 3.10+)
match command:
    case 'start': start_service()
    case _: print('Unknown')

**Key Takeaway**: Always handle the else case.
