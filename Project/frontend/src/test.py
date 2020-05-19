import json

grid = []

for i in range(10):
	row = []
	for j in range(10):
		row.append('blank')
	grid.append(row)

grid[9][0] = 'active'

print(grid)

print(json.dumps(grid))