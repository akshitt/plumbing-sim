import React from 'react';
import logo from './logo.svg';
import './App.css';
import Colors from './colors';
import WebSocketInstance from './WebSocket';

class LoginComponent extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      username : ''
    }
  }

  usernameChangeHandler = (event) => {
    this.setState({
      username: event.target.value
    });
  }

  render() {
    return(
      <div className="login">
        <form onSubmit={(e) => this.props.handleLogin(e, this.state.username)}>
          <input 
            type="text"
            onChange = {this.usernameChangeHandler}
            value = {this.state.username}
            placeholder = "username"
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
    <button className="square" style={{backgroundColor:props.color}} onClick={props.onClick}>
    </button>
  )
}

class Grid extends React.Component{

  renderBlock(i,j){
    let color = Colors[this.props.grid[i][j]]
    return <Block
      x={i}
      y={j}
      color={color}
      onClick={() => this.props.onClick(i,j)}
    />
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

class App extends React.Component{

  constructor(props) {
    super(props);
    let size = 10
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
      username: '',
      loggedIn: false
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
    let row = this.state.row;
    let col = this.state.col;
    let size = this.state.size;
    let grid = this.state.grid;
    if(direction=="U"){
      let destRow = row-3;
      let valid = false;
      if(destRow>=0){
        if(grid[row-1][col]=="blank"&&grid[row-2][col]=="blank"&&grid[row-3][col]=="blank"){
          valid = true;
        }
      }
      if(valid){
        grid[row][col] = "split";
        grid[row-1][col] = "pipe";
        grid[row-2][col] = "pipe";
        grid[row-3][col] = "active";
        row = destRow;
        this.setState({
          grid:grid,
          row:row,
        }) 
      }
         
    }
    else if(direction=="D"){
      let destRow = row+3;
      let valid = false;
      if(destRow<size){
        if(grid[row+1][col]=="blank"&&grid[row+2][col]=="blank"&&grid[row+3][col]=="blank"){
          valid = true;
        }
      }
      if(valid){
        grid[row][col] = "split";
        grid[row+1][col] = "pipe";
        grid[row+2][col] = "pipe";
        grid[row+3][col] = "active";
        row = destRow;
        this.setState({
          grid:grid,
          row:row,
        }) 
      }

    }
    else if(direction=="R"){
      let destCol = col+3;
      let valid = false;
      if(destCol<size){
        if(grid[row][col+1]=="blank"&&grid[row][col+2]=="blank"&&grid[row][col+3]=="blank"){
          valid = true;
        }
      }
      if(valid){
        grid[row][col] = "split";
        grid[row][col+1] = "pipe";
        grid[row][col+2] = "pipe";
        grid[row][col+3] = "active";
        col = destCol;
        this.setState({
          grid:grid,
          col:col,
        }) 
      }
    }
    else{
      let destCol = col-3;
      let valid = false;
      if(destCol>=0){
        if(grid[row][col-1]=="blank"&&grid[row][col-2]=="blank"&&grid[row][col-3]=="blank"){
          valid = true;
        }
      }
      if(valid){
        grid[row][col] = "split";
        grid[row][col-1] = "pipe";
        grid[row][col-2] = "pipe";
        grid[row][col-3] = "active";
        col = destCol;
        this.setState({
          grid:grid,
          col:col,
        }) 
      }

    }
  }

  handleBlockClick(i,j){
    let username = this.state.username
    WebSocketInstance.blockClick(username,i,j)
    /*let grid = this.state.grid;
    let row = this.state.row;
    let col = this.state.col;
    if(grid[i][j]=="split"){
      grid[i][j] = "active";
      grid[row][col] = "split";
      row = i;
      col = j;
      this.setState({
        grid: grid,
        row: row,
        col: col,
      })
    }*/
  }

  handleReset(){
    console.log("reset")
    WebSocketInstance.reset(this.state.username)
    /*let grid = this.state.grid;
    let size = this.state.size;
    let row = size-1;
    let col = 0;
    for(let i=0;i<size;i++){
      for(let j=0;j<size;j++){
        grid[i][j] = "blank";
      }
    }
    grid[row][col] = "active";
    this.setState({
      grid: grid,
      row: row,
      col: col,
    })*/
  }

  handleLogin = (e,username) => {
    e.preventDefault();
    this.setState({
      loggedIn: true,
      username: username
    })
    WebSocketInstance.connect();
    this.waitForSocketConnection(() => { 
      WebSocketInstance.initUser(username);
      WebSocketInstance.addCallbacks(this.gameUpdate.bind(this))
    });
  }

  gameUpdate(parsedData){
    console.log('update')
    const grid = parsedData['grid']
    const row = parsedData['row']
    const col = parsedData['col']
    const size = parsedData['size']
    this.setState({
      grid: grid,
      row: row,
      col: col
    })
    
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
        />
        <Controls
          onClick = {(direction) => this.handleDirectionClick(direction)}
        />
        <Reset
          onClick = {() => this.handleReset()}
        />
      </div>
      :
      <LoginComponent
        handleLogin = {this.handleLogin} />
    )
  }
}

export default App;
