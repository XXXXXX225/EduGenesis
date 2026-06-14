# Loop Structures and Iteration

Loops enable repetitive execution of code blocks.

## While Loop
count = 0
while count < 5:
    print(count)
    count += 1
- break: exit immediately
- continue: skip to next iteration
- else: executes if no break occurred

## For Loop
for item in [1, 2, 3]:
    print(item)

for i in range(5):  # 0..4
    print(i)

for k, v in {'a': 1}.items():
    print(k, v)

## Comprehensions
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]

## Helpers
- enumerate(): index + value
- zip(): parallel iteration
- reversed(), sorted()

**Key Takeaway**: Prefer for loops with iterables over while with manual counters.
