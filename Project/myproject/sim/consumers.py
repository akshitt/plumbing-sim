from channels.generic.websocket import AsyncWebsocketConsumer
import json
from sim.models import Game
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async

class MyConsumer(AsyncWebsocketConsumer):

	@database_sync_to_async
	def save(self,game):
		game.save()

	@database_sync_to_async
	def check(self,game_id):
		return Game.objects.filter(game_id=game_id).exists()

	@database_sync_to_async
	def get_game(self,game_id):
		return Game.objects.get(game_id=game_id)

	@database_sync_to_async
	def delete_game(self,game_id):
		Game.objects.filter(game_id=game_id).delete()
	
	def __init__(self,x):
		super(MyConsumer,self).__init__(x)
		self.game_id = ''

	async def init_game(self,data):
		game_id = data['game_id']
		
		if await self.check(game_id):
			content = {
				'command' : 'fail'
			}
			await self.send(text_data=json.dumps(content))
		else:
			self.game_id = game_id
			pressure = []
			grid = []
			size = 15
			for i in range(size):
				row = []
				prow = []
				for j in range(size):
					row.append('blank')
					prow.append('')
				grid.append(row)
				pressure.append(prow)
			row = size-1
			col = 0
			grid[row][col] = 'active'
			pressure[row][col] = '60'
			json_grid = json.dumps(grid)
			json_pressure = json.dumps(pressure)
			game = Game(game_id=game_id,size=size,row=row,col=col,grid=json_grid,pressure=json_pressure)
			await self.save(game)
			await self.sendMessage(grid,size,row,col,pressure,game.initial_pressure)
		
	async def reset(self,data):
		game_id = data['game_id']
		pressure = []
		grid = []
		size = 15
		for i in range(size):
			row = []
			prow = []
			for j in range(size):
				row.append('blank')
				prow.append('')
			grid.append(row)
			pressure.append(prow)
		row = size-1
		col = 0
		grid[row][col] = 'active'
		pressure[row][col] = '60'
		game =  await self.get_game(game_id)
		game.pressure = json.dumps(pressure)
		game.grid = json.dumps(grid)
		game.row = row
		game.col = col
		game.initial_pressure = '60'
		await self.save(game)
		await self.sendMessage(grid,size,row,col,pressure,game.initial_pressure)

	async def block_click(self,data):
		game_id = data['game_id']
		game = await self.get_game(game_id)
		i = int(data['i'])
		j = int(data['j'])
		row = game.row
		col = game.col
		size = game.size
		pressure = json.loads(game.pressure)
		grid = json.loads(game.grid)
		#print(i)
		#print(grid[6][3])
		if(grid[i][j]=='split'):
			grid[i][j] = 'active'
			grid[row][col] = 'split'
			game.grid = json.dumps(grid)
			game.row = i
			game.col = j
			await self.save(game)
			await self.sendMessage(grid,size,i,j,pressure,game.initial_pressure)

	async def delete_pipe(self,data):
		game_id = data['game_id']
		game = await self.get_game(game_id)
		i = int(data['i'])
		j = int(data['j'])
		currSplitX = game.row
		currSplitY = game.col
		size = game.size
		pressure = json.loads(game.pressure)
		initial_pressure = game.initial_pressure
		grid = json.loads(game.grid)
		if j+1<game.size and grid[i][j+1].split('_')[0] == 'pipe':
			ni = i
			nj = j+1
			split1X = i
			split1Y = j-1
			split2X = i
			split2Y = j+2
		elif j-1>=0 and grid[i][j-1].split('_')[0] == 'pipe':
			ni = i
			nj = j-1
			split1X = i
			split1Y = j+1
			split2X = i
			split2Y = j-2
		elif i+1<game.size and grid[i+1][j].split('_')[0] == 'pipe':
			ni = i+1
			nj = j
			split1X = i-1
			split1Y = j
			split2X = i+2
			split2Y = j
		else:
			ni = i-1
			nj = j
			split1X = i+1
			split1Y = j
			split2X = i-2
			split2Y = j
		grid[i][j] = 'blank'
		grid[ni][nj] = 'blank'
		if await self.emptySplit(split1X,split1Y,grid,size):
			print('fff')
			if not (split1X == size-1 and split1Y == 0):
				print(split1X,split1Y)
				grid[split1X][split1Y] = 'blank'
			else:
				grid[split1X][split1Y] = 'split'
			if currSplitX == split1X and currSplitY == split1Y:
				grid[size-1][0] = 'active'
				currSplitX = size-1
				currSplitY = 0
		if await self.emptySplit(split2X,split2Y,grid,size):
			print('fff')
			if not (split2X == size-1 and split2Y == 0):
				print(split2X,split2Y)
				grid[split2X][split2Y] = 'blank'
			else:
				grid[split2X][split2Y] = 'split'
			if currSplitX == split2X and currSplitY == split2Y:
				grid[size-1][0] = 'active'
				currSplitX = size-1
				currSplitY = 0
		game.row = currSplitX
		game.col = currSplitY
		pressure = await self.calc_pressure(initial_pressure,grid,size)
		game.grid = json.dumps(grid)
		game.pressure = json.dumps(pressure)
		await self.save(game)
		await self.sendMessage(grid,game.size,game.row,game.col,pressure,game.initial_pressure)

	async def emptySplit(self,i,j,grid,size):
		ret = True
		if i+1<size and grid[i+1][j] != 'blank':
			ret = False
		if i-1>=0 and grid[i-1][j] != 'blank':
			ret = False
		if j+1<size and grid[i][j+1] != 'blank':
			ret = False
		if j-1>=0 and grid[i][j-1] != 'blank':
			ret = False
		return ret

	async def change_size(self,data):
		game_id = data['game_id']
		game = await self.get_game(game_id)
		pipe_size = data['pipe_size']
		i = int(data['i'])
		j = int(data['j'])
		size = game.size
		grid = json.loads(game.grid)
		pressure = json.loads(game.pressure)
		initial_pressure = game.initial_pressure
		direction = grid[i][j].split('_')[1]
		if j+1<game.size and grid[i][j+1].split('_')[0] == 'pipe':
			ni = i
			nj = j+1
		elif j-1>=0 and grid[i][j-1].split('_')[0] == 'pipe':
			ni = i
			nj = j-1
		elif i+1<game.size and grid[i+1][j].split('_')[0] == 'pipe':
			ni = i+1
			nj = j
		else:
			ni = i-1
			nj = j
		grid[i][j] = 'pipe' + '_' + direction + '_' + pipe_size
		grid[ni][nj] = 'pipe' + '_' + direction + '_' + pipe_size
		pressure = await self.calc_pressure(initial_pressure,grid,size)
		game.grid = json.dumps(grid)
		game.pressure = json.dumps(pressure)
		await self.save(game)
		await self.sendMessage(grid,game.size,game.row,game.col,pressure,game.initial_pressure)

	async def cycle_check(self,grid,row,col,xpos,ypos,size):
		visited = []
		for i in range(size):
			temp = []
			for j in range(size):
				temp.append(False)
			visited.append(temp)
		visited[row][col] = True
		queue = []
		queue.append((row,col))
		while queue:
			u = queue.pop(0)
			visited[u[0]][u[1]] = True			
			if u[0]+1<size and grid[u[0]+1][u[1]]!='blank' and (not visited[u[0]+3][u[1]]):
				queue.append((u[0]+3,u[1]))
			if u[0]-1>=0 and grid[u[0]-1][u[1]]!='blank' and (not visited[u[0]-3][u[1]]):
				queue.append((u[0]-3,u[1]))
			if u[1]+1<size and grid[u[0]][u[1]+1]!='blank' and (not visited[u[0]][u[1]+3]):
				queue.append((u[0],u[1]+3))
			if u[1]-1>=0 and grid[u[0]][u[1]-1]!='blank' and (not visited[u[0]][u[1]-3]):
				queue.append((u[0],u[1]-3))
		if visited[xpos][ypos]:
			return False
		else:
			return True


	async def direction_click(self,data):
		game_id = data['game_id']
		game = await self.get_game(game_id)
		direction = data['direction']
		pipe_size = data['pipe_size']
		row = game.row
		col = game.col
		size = game.size
		grid = json.loads(game.grid)
		pressure = json.loads(game.pressure)
		initial_pressure = str(game.initial_pressure)
		currIndex = (row,col)
		idx1 = None
		idx2 = None 
		idx3 = None
		if(direction=='U'):
			idx1 = (row-1,col)
			idx2 = (row-2,col)
			idx3 = (row-3,col)
		elif(direction=='D'):
			idx1 = (row+1,col)
			idx2 = (row+2,col)
			idx3 = (row+3,col)
		elif(direction=='L'):
			idx1 = (row,col-1)
			idx2 = (row,col-2)
			idx3 = (row,col-3)
		else:
			idx1 = (row,col+1)
			idx2 = (row,col+2)
			idx3 = (row,col+3)
		valid = False
		if 0<=idx3[0]<size and 0<=idx3[1]<size:
			if grid[idx1[0]][idx1[1]] == 'blank' and grid[idx2[0]][idx2[1]] == 'blank' and grid[idx3[0]][idx3[1]] == 'blank':
				valid = True
			elif grid[idx1[0]][idx1[1]] == 'blank' and grid[idx2[0]][idx2[1]] == 'blank' and grid[idx3[0]][idx3[1]] == 'split':
				valid = await self.cycle_check(grid,row,col,idx3[0],idx3[1],size)
		if valid:
			grid[row][col] = 'split'
			grid[idx1[0]][idx1[1]] = 'pipe' + '_' + direction + '_' + pipe_size
			grid[idx2[0]][idx2[1]] = 'pipe'+ '_' + direction + '_' + pipe_size
			grid[idx3[0]][idx3[1]] = 'active' 
			#print(grid[idx1[0]][idx1[1]])
			row = idx3[0]
			col = idx3[1]
			pressure = await self.calc_pressure(initial_pressure,grid,size)
			game.row = row 
			game.col = col
			game.grid = json.dumps(grid)
			game.pressure = json.dumps(pressure)
			await self.save(game)
			await self.sendMessage(grid,size,row,col,pressure,game.initial_pressure)

	async def change_init_pressure(self,data):
		game_id = data['game_id']
		game = await self.get_game(game_id)
		initial_pressure = data['initial_pressure']
		game.initial_pressure = initial_pressure
		grid = json.loads(game.grid)
		size = game.size
		pressure = await self.calc_pressure(initial_pressure,grid,size)
		game.pressure = json.dumps(pressure)
		await self.save(game)
		await self.sendMessage(grid,game.size,game.row,game.col,pressure,game.initial_pressure)

	async def calc_pressure(self,initial_pressure,grid,size):

		pressure = []
		visited = []
		for i in range(size):
			prow = []
			temp = []
			for j in range(size):
				prow.append('')
				temp.append(False)
			pressure.append(prow)
			visited.append(temp)

		pressure[size-1][0] = initial_pressure
		pressure_drop = {}
		pressure_drop["large"] = 1
		pressure_drop["medium"] = 4
		pressure_drop["small"] = 12

		queue = []
		queue.append((size-1,0))
		

		while queue:
			u = queue.pop(0)
			visited[u[0]][u[1]] = True
			current_pressure = int(pressure[u[0]][u[1]])
			if u[0]+1<size and grid[u[0]+1][u[1]]!='blank' and (not visited[u[0]+3][u[1]]):
				pipe_size = grid[u[0]+1][u[1]].split('_')[2]
				pressure[u[0]+3][u[1]] = str(max(current_pressure - pressure_drop[pipe_size],0))
				queue.append((u[0]+3,u[1]))
			if u[0]-1>=0 and grid[u[0]-1][u[1]]!='blank' and (not visited[u[0]-3][u[1]]):
				pipe_size = grid[u[0]-1][u[1]].split('_')[2]
				pressure[u[0]-3][u[1]] = str(max(current_pressure - pressure_drop[pipe_size],0))
				queue.append((u[0]-3,u[1]))
			if u[1]+1<size and grid[u[0]][u[1]+1]!='blank' and (not visited[u[0]][u[1]+3]):
				pipe_size = grid[u[0]][u[1]+1].split('_')[2]
				pressure[u[0]][u[1]+3] = str(max(current_pressure - pressure_drop[pipe_size],0))
				queue.append((u[0],u[1]+3))
			if u[1]-1>=0 and grid[u[0]][u[1]-1]!='blank' and (not visited[u[0]][u[1]-3]):
				pipe_size = grid[u[0]][u[1]-1].split('_')[2]
				pressure[u[0]][u[1]-3] = str(max(current_pressure - pressure_drop[pipe_size],0))
				queue.append((u[0],u[1]-3))

		return pressure


	async def sendMessage(self,grid,size,row,col,pressure,initial_pressure):
		content = {
			'command' : 'game',
			'grid' : grid,
			'size' : size,
			'row' : row,
			'col' : col,
			'pressure': pressure,
			'initial_pressure': initial_pressure
		}
		await self.send(text_data=json.dumps(content))

	async def connect(self):
		print('connected')

		await self.accept()

	async def initial(self):
		pass

	async def disconnect(self, close_code):
		await self.delete_game(self.game_id)
		pass

	async def receive(self, text_data):
		json_data = json.loads(text_data)
		if(json_data['command']=='init'):
			await self.init_game(json_data)
		elif(json_data['command']=='reset'):
			await self.reset(json_data)
		elif(json_data['command']=='block_click'):
			await self.block_click(json_data)
		elif(json_data['command']=='direction_click'):
			await self.direction_click(json_data)
		elif(json_data['command']=='change_size'):
			await self.change_size(json_data)
		elif(json_data['command']=='delete_pipe'):
			await self.delete_pipe(json_data)
		elif json_data['command'] == 'change_init_pressure':
			await self.change_init_pressure(json_data)