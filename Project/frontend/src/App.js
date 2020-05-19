import React from 'react';
import logo from './logo.svg';
import './App.css';
import Colors from './colors';
import WebSocketInstance from './WebSocket';

class LoginComponent extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      game_id : ''
    }

  }

  gameIdChangeHandler = (event) => {
    //console.log(window.location.origin.replace(/^http/,'ws')+'/ws/sim')
    this.setState({
      game_id: event.target.value
    });
  }

  render() {
    return(
      <div className="login">
        <form onSubmit={(e) => this.props.handleLogin(e, this.state.game_id)}>
          <input 
            type="text"
            onChange = {this.gameIdChangeHandler}
            value = {this.state.game_id}
            placeholder = "Game Id"
            required 
          />
          <button className="submit" type="submit">
            Let's Go
          </button>
        </form>
      </div>
    );
  }


}

function Block(props){
  return (
    <button className="square" style={{background:props.color}} onClick={props.onClick} onContextMenu={props.onContextMenu}>
    </button>
  )
}

class Grid extends React.Component{

  renderBlock(i,j){
  	console.log(this.props.grid[i][j])
    let color = Colors[this.props.grid[i][j]]
    return <Block
      x={i}
      y={j}
      color={color}
      onClick={() => this.props.onClick(i,j)}
      onContextMenu={(e) => this.handleContextMenu(e,i,j)}
    />
  }

  handleContextMenu = (e,i,j) => {
    this.props.handleContextMenu(e,i,j)
  }

  renderRow(i,n){
    let row = []
    for(let j = 0; j<n; j++){
      row.push(this.renderBlock(i,j));
    }
    return row;
  }

  renderGrid(n){
    let grid = []
    for(let i=0; i<n; i++){
      grid.push(<div className="board-row">{this.renderRow(i,n)}</div>);
    }
    return grid;
  }

  render(){
    const n = this.props.size;
    return(
      <div>
        {this.renderGrid(n)}
      </div>
    )
  }
}

function Direction(props){
  return(
    <button className="direction" onClick={props.onClick}>
      {props.text}
    </button>
  )
}

function Blank(props){
  return(
    <button className="blank">
    </button>
  )
}



class Controls extends React.Component{

  renderDirection(text){
    return <Direction
      text={text}
      onClick={() => this.props.onClick(text)}
    />;
  }
  renderBlank(){
    return <Blank />;
  }

  render() {
    return(
      <div>
        <div className="board-row">
          {this.renderBlank()}
          {this.renderDirection("U")}
          {this.renderBlank()}
        </div>
        <div className="board-row">
          {this.renderDirection("L")}
          {this.renderBlank()}
          {this.renderDirection("R")}
        </div>
        <div className="board-row">
          {this.renderBlank()}
          {this.renderDirection("D")}
          {this.renderBlank()}
        </div>
      </div>
    )
  }
}

function Reset(props){
  return(
    <button className="reset" onClick={props.onClick}>
      Reset
    </button>
  )
}

class SelectPipe extends React.Component{
	constructor(props) {
		super(props)
		this.state = {
			selectedOption: 'large'
		}
	}

	handleChange = (e) => {
		this.setState({
			selectedOption: e.target.value
		})
		this.props.handleOptionChange(e);
		
	}

	render() {
		return(
		<form>
			<input type="radio" value="small" checked = {this.state.selectedOption=="small"} onChange = {this.handleChange} />
				0.5 inch
			
			<input type="radio" value="medium" checked = {this.state.selectedOption=="medium"} onChange = {this.handleChange} />
				0.75 inch
		
			<input type="radio" value="large" checked = {this.state.selectedOption=="large"} onChange = {this.handleChange} />
				1 inch
			
		</form>
		)
	}
}

class App extends React.Component{

  constructor(props) {
    super(props);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    let size = 15
    let grid = []
    let row = size-1
    let col = 0
    for(let i=0;i<size;i++){
      let row = Array(size).fill("blank")
      grid.push(row)
    }
    grid[row][col] = "active"
    this.state = {
      size:size,
      grid: grid,
      row: row,
      col: col,
      game_id: '',
      loggedIn: false,
      pipe_size: 'large',
    };
   
  }
    waitForSocketConnection(callback) {
        const component = this;
        setTimeout(
            function(){
                if(WebSocketInstance.state() === 1){
                    console.log('Connection is made');
                    callback()
                    return;
                }
                else{
                    console.log("Waiting for connection..");
                    component.waitForSocketConnection(callback);
                }
            }, 100);
    }

  handleDirectionClick(direction) {
    let game_id = this.state.game_id
    let pipe_size = this.state.pipe_size
    WebSocketInstance.directionClick(game_id,direction,pipe_size)
  }

  handleBlockClick(i,j){
    let game_id = this.state.game_id
    WebSocketInstance.blockClick(game_id,i,j)
  }

  handleReset(){
    console.log("reset")
    WebSocketInstance.reset(this.state.game_id)
  }

  handleLogin = (e,game_id) => {
    e.preventDefault();
    this.setState({
      //loggedIn: true,
      game_id: game_id
    })

    WebSocketInstance.connect();
    this.waitForSocketConnection(() => { 
      WebSocketInstance.initUser(game_id);
      WebSocketInstance.addCallbacks(this.gameUpdate.bind(this))
    });
  }

  handleOptionChange = (event) => {
  	//event.preventDefault();
  	console.log(event.target.value)
  	this.setState({
  		pipe_size: event.target.value
  	})
  }

  gameUpdate(parsedData){
    console.log('update')
    const grid = parsedData['grid']
    const row = parsedData['row']
    const col = parsedData['col']
    const size = parsedData['size']
    this.setState({
    	loggedIn: true,
      grid: grid,
      row: row,
      col: col
    })
    
  }

  handleContextMenu(e,i,j){
    const grid = this.state.grid;
    if(grid[i][j].split("_")[0]=="pipe"){
      e.preventDefault()
      console.log(i,j)
    }
  }


  render() {
    const size = this.state.size
    const grid = this.state.grid
    const loggedIn = this.state.loggedIn
    return(
       loggedIn ?
      <div>
        <Grid 
          size={size}
          grid={grid}
          onClick = {(i,j) => this.handleBlockClick(i,j)}
          handleContextMenu = {this.handleContextMenu}

        />
        <Controls
          onClick = {(direction) => this.handleDirectionClick(direction)}
        />
        <SelectPipe
        	handleOptionChange = {this.handleOptionChange}
        	selectedOption = {this.state.pipe_size}
        />
        <Reset
          onClick = {() => this.handleReset()}
        />
        {this.state.selectedOption}
      </div>
      :
      <LoginComponent
        handleLogin = {this.handleLogin} />
    )
  }
}

export default App;
