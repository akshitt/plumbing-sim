import pickle
import os
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

grid = []
wallx = [0,3,24]
wally = [9,30,42,51]
for i in range(31):
	row = []
	for j in range(52):
		if (i in wallx) or (j in wally):
			row.append('blank')
		elif (i==1 or i==2) and (j in [3,12,21]):
			row.append('blank')
		elif (4<=i<=8) and (j in [12,15,33,36]):
			row.append('blank')
		elif (i==9) and j>=9 and j!=16 and j!=17:
			row.append('blank')
		elif (10<=i<=11) and j==21:
			row.append('blank')
		elif (j==33 or j==39) and i>=3:
			row.append('blank')
		elif i==15 and ((j<=33) or (j>=39)):
			row.append('blank')
		elif (i==21 and j<=45):
			row.append('blank')
		elif i==30 and (j<=33 or j>=39):
			row.append('blank')
		elif j==12 and i>=15:
			row.append('blank')
		elif j==45 and (15<=i<=21):
			row.append('blank')
		elif j==15 and (i>=24):
			row.append('blank')
		elif j==21 and ((i>=21) or (9<=i<=15)):
			row.append('blank')
		elif i==27 and (15<=j<=21):
			row.append('blank')
		elif (j==18 or j==27) and (15<=i<=21):
			row.append('blank')
		elif j==3 and i>=12:
			row.append('blank')
		elif i==12 and (3<=j<=9):
			row.append('blank')
		elif j==18 and (3<=i<=9):
			row.append('blank')
		else:
			row.append('wall')
	grid.append(row)

grid[30][51] = "tap"
grid[9][21] = "tap"
grid[9][51] = "tap"
Grids['new'] = grid
file_path = './sim/vars'
if os.path.exists(file_path):
	with open('./vars','rb') as f:
		Grids['sub_opt'] = pickle.load(f)

Size = {}
Size['small'] = '0.5 inch'
Size['medium'] = '0.75 inch'
Size['large'] = '1 inch'

Direction = {}
Direction['U'] = 'Up'
Direction['D'] = 'Down'
Direction['L'] = 'Left'
Direction['R'] = 'Right'

GridSize = {}
GridSize['small'] = 'Small'
GridSize['mid'] = 'Medium'
GridSize['large'] = 'Large'
GridSize[13] = 'small'
GridSize[22] = 'mid'
GridSize[31] = 'large'
GridSize['sub_opt'] = 'Sub Optimal'