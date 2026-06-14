# Core Data Structures

Mastering built-in data structures enables efficient data manipulation.

## Lists
- Mutable, ordered: items = [1, 2, 3]
- Methods: .append(), .extend(), .insert(), .remove(), .pop(), .sort()
- Slicing: items[1:3], items[::-1] (reverse)
- Comprehension: [x*2 for x in range(5)]

## Tuples
- Immutable, ordered: point = (3, 4)
- Unpacking: x, y = point
- Used as dict keys and return values

## Dictionaries
- Key-value: user = {'name': 'Alice', 'age': 25}
- .get(), .keys(), .values(), .items()
- Dict comprehension: {k: v**2 for k, v in pairs}

## Sets
- Unordered, unique: tags = {'python', 'coding'}
- Set ops: union, intersection, difference
- Dedup: list(set(duplicates))

**Key Takeaway**: Lists for order, dicts for lookup, sets for uniqueness.
