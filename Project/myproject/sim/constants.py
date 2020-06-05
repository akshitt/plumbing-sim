Cost = {}
Cost['large'] = 45
Cost['medium'] = 33
Cost['small'] = 28
Cost['junction'] = 100

Grids = {}

grid = []
wallx = [0,6,12,15,21]
wally = [3,9,12,21]

for i in range(22):
	row = []
	for j in range(22):
		if (i in wallx) or (j in wally):
			row.append('blank')
		elif i == 3 and (3 <= j <=9):
			row.append('blank')
		elif i == 18 and j >= 15:
			row.append('blank')
		elif j == 15 and i >= 15:
			row.append('blank')
		elif j == 18 and (6 <= i <= 12):
			row.append('blank')
		else:
			row.append('wall')
	grid.append(row)

Grids['mid'] = grid



grid = [ ['blank']*31 for i in range(31)]
Grids['large'] = grid
grid = [ ['blank']*13 for i in range(13)]
Grids['small'] = grid