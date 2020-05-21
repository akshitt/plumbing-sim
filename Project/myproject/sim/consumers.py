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
	
	async def init_game(self,data):
		game_id = data['game_id']
		if await self.check(game_id):
			content = {
				'command' : 'fail'
			}
			await self.send(text_data=json.dumps(content))
		else:
			
			grid = []
			size = 15
			for i in range(size):
				row = []
				for j in range(size):
					row.append('blank')
				grid.append(row)
			cost = 0
			row = size-1
			col = 0
			grid[row][col] = 'active'
			json_grid = json.dumps(grid)
			game = Game(game_id=game_id,size=size,row=row,col=col,grid=json_grid)
			await self.save(game)
			await self.sendMessage(grid,size,row,col,cost)
		
	async def reset(self,data):
		game_id = data['game_id']
		grid = []
		size = 15
		for i in range(size):
			row = []
			for j in range(size):
				row.append('blank')
			grid.append(row)
		row = size-1
		col = 0
		cost = 0 
		grid[row][col] = 'active'
		json_grid = json.dumps(grid)
		game =  await self.get_game(game_id)
		game.grid = json_grid
		game.row = row
		game.col = col
		await self.save(game)
		await self.sendMessage(grid,size,row,col,cost)

	async def block_click(self,data):
		game_id = data['game_id']
		game = await self.get_game(game_id)
		i = int(data['i'])
		j = int(data['j'])
		row = game.row
		col = game.col
		size = game.size
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
			await self.sendMessage(grid,size,i,j)

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
		cost = game.cost
		grid = json.loads(game.grid)
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
			print(grid[idx1[0]][idx1[1]])
			row = idx3[0]
			col = idx3[1]
			game.row = row 
			game.col = col
			game.grid = json.dumps(grid)
			
			if pipe_size=="large":
				cost += 50*0.9
			elif pipe_size=="medium":
				cost += 30*0.67
			elif pipe_size=="small":
				cost += 15*0.57
			print(cost)
			await self.save(game)
			await self.sendMessage(grid,size,row,col,cost)



	async def sendMessage(self,grid,size,row,col,cost):
		content = {
			'command' : 'game',
			'grid' : grid,
			'size' : size,
			'row' : row,
			'col' : col,
			'cost': cost
		}
		await self.send(text_data=json.dumps(content))

	async def connect(self):
		print('connected')

		await self.accept()

	async def initial(self):
		pass

	async def disconnect(self, close_code):
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