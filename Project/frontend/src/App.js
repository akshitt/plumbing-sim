import React from 'react';
import logo from './logo.svg';
import './App.css';
import Colors from './colors';
import WebSocketInstance from './WebSocket';

class LoginComponent extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      game_id : '',
      budget : '',
      grid_size: 'mid',
    }

  }

  gameIdChangeHandler = (event) => {
    //console.log(window.location.origin.replace(/^http/,'ws')+'/ws/sim')
    this.setState({
      game_id: event.target.value
    });
  }

  budgetChangeHandler = (event) => {
    this.setState({
      budget: event.target.value
    });
    //console.log(this.state.budget)
  }

  sizeChangeHandler = (event) => {
    this.setState({
      grid_size: event.target.value
    });
  }

  render() {
    return(
      <div className="login">
        <div className="login-title">
          <p>PlumbingSim</p>
        </div>
        <div className="login-form">
        <form onSubmit={(e) => this.props.handleLogin(e, this.state.game_id, this.state.budget, this.state.grid_size)}>
          <div className="login-comp">         
          Simulation ID<br /> <input 
            type="text"
            onChange = {this.gameIdChangeHandler}
            value = {this.state.game_id}
            placeholder = "Simulation Id"
            required 
            className="login-input"
          />
          </div>
          <div className="login-comp">
          Budget <br /><input
            type="number"
            onChange = {this.budgetChangeHandler}
            value = {this.state.budget}
            min = "0"
            step = "1"
            placeholder = "Budget"
            required
            className="login-input"
          />
          </div>
          <div className="login-comp">
          Grid Size<br /> 
          <div className="size-options">
         
          <input type="radio" checked = {this.state.grid_size=="large"} value = "large" onChange = {this.sizeChangeHandler} />
          Large
          </div>
          <div className="size-options">
          
          <input type="radio" checked = {this.state.grid_size=="mid"} value = "mid" onChange = {this.sizeChangeHandler} />
          Medium
          </div>
          <div className="size-options">
          
          <input type="radio" checked = {this.state.grid_size=="small"} value = "small" onChange = {this.sizeChangeHandler} />
          Small
          </div>
          </div>
          <div className="login-submit">
          <button className="submit" type="submit" className="login-submit-button">
          Start
          </button>
          </div>
        </form>
        </div>
      </div>
    );
  }


}


class Block extends React.Component{
  render(){
  return (
    <div className="square" style={{background:this.props.color, height:this.props.dimen, width:this.props.dimen, fontSize: this.props.fontsize}} onClick={this.props.onClick}>
    {this.props.pressure}
    </div>
  )
  }
}

class Grid extends React.Component{

  renderBlock(i,j){
  	//console.log(this.props.grid[i][j])
    let color = Colors[this.props.grid[i][j]]
    let pressure = this.props.pressure[i][j];
    return <Block
      x={i}
      y={j}
      color={color}
      onClick={(e) => this.props.onClick(e,i,j)}
      onContextMenu={(e) => this.handleContextMenu(e,i,j)}
      pressure = {pressure}
      dimen = {this.props.dimen}
      fontsize = {this.props.fontsize}
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
      grid.push(this.renderRow(i,n));
    }
    return grid;
  }

  render(){
    const n = this.props.size;
    return(
      <div className="gridx">
        {this.renderGrid(n)}
      </div>
    )
  }
}

function Direction(props){
  return(
    <button className="direction" onClick={props.onClick}>
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
      <div className="controls">
        <div className="controls-lhs"><p>Pipe Direction</p></div>
        <div className="controls-rhs">
        <div className="gridc">
          {this.renderBlank()}
          {this.renderDirection("Up")}
          {this.renderBlank()}
          {this.renderDirection("Left")}
          {this.renderBlank()}
          {this.renderDirection("Right")}
          {this.renderBlank()}
          {this.renderDirection("Down")}
          {this.renderBlank()}
         </div>
         </div>
      </div>
    )
  }
}

function Reset(props){
  return(
    <div className="resetdiv">
    <div className="resetdiv-lhs">
    	Reset
    </div>
    <div className="resetdiv-rhs">
	    <button className="reset" onClick={props.onClick}>
	      Reset
	    </button>
    </div>
    </div>
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
    <div className="size">
    	<div className="size-lhs">
    		Pipe Size
    	</div>
    	<div className="size-rhs">
		<form>    		
      		<label for="small">
			<input id="small" type="radio" value="small" checked = {this.state.selectedOption=="small"} onChange = {this.handleChange} />
      			0.5 inch
			</label>
			<label for = "medium">   
			<input id="medium" type="radio" value="medium" checked = {this.state.selectedOption=="medium"} onChange = {this.handleChange} />
     			0.75 inch
		 	</label>
      		<label for="large">
			<input id="large" type="radio" value="large" checked = {this.state.selectedOption=="large"} onChange = {this.handleChange} />
      			1 inch
      		</label>
		</form>
		</div>
    </div>
		)
	}
}

class ChangeInitialPressure extends React.Component{
  
  constructor(props) {
    super(props)
    this.state = {
      initial_pressure: ''
    }
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(e) {
    this.setState({
      initial_pressure: e.target.value
    });
  }

  render() {
    return(
    	<div className="init-pressure">
	      <div className="init-pressure-lhs">
	      	Change Initial Pressure
	      </div>
	      <div className="init-pressure-rhs">	
	      <form onSubmit={(e) => this.props.handlePressureChange(e,this.state.initial_pressure)}>
	        <input type="text" onChange = {this.handleChange} className="pressure-input" />       
	        <button className="submit" type="submit">
	        Apply
	        </button>
	      </form>
	      </div>
	    </div>
    )
  }
}

class App extends React.Component{

   constructor(props) {
    super(props);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleSizeChange = this.handleSizeChange.bind(this);
    this.handleDeletePipe = this.handleDeletePipe.bind(this);
    this.handlePressureChange = this.handlePressureChange.bind(this);
    this.handleBlockClick = this.handleBlockClick.bind(this);
    this.setVisibility = this.setVisibility.bind(this);
    let size = 22
    let grid = []
    let row = size-1
    let col = 0
    let pressure = []
    let frac = 100/size
    let dimen = frac.toString() + "%";
    console.log(dimen)
    for(let i=0;i<size;i++){
      let row = Array(size).fill("blank")
      let prow = Array(size).fill("")
      pressure.push(prow)
      grid.push(row)
    }
    pressure[row][col] = "60"
    grid[row][col] = "active"
    this.state = {
      size:size,
      grid: grid,
      row: row,
      col: col,
      game_id: '',
      loggedIn: false,
      pipe_size: 'large',
      menuX: "100px",
      menuY: "100px",
      visible: false,
      currBlockX: 0,
      currBlockY: 0,
      pressure: pressure,
      initial_pressure: '60',
      cost: 0,
      budget: 0,
      dimen: dimen,
      fontsize: 0,
    };
   
  }
  componentDidMount(){
    var self = this
    /*document.addEventListener('click', function(event){
      self.setState({visible: false});
    });*/
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
    //console.log(this.state.grid[5][4]);
    WebSocketInstance.directionClick(game_id,direction,pipe_size)
  }

  handleBlockClick(e,i,j){
    let game_id = this.state.game_id
    const grid = this.state.grid;
    if(grid[i][j]=="split"){
   		WebSocketInstance.blockClick(game_id,i,j)
   	}
   	else if(grid[i][j].split("_")[0]=="pipe"){
   		this.handleContextMenu(e,i,j)
   	}
  }

  handleReset(){
    console.log("reset")
    WebSocketInstance.reset(this.state.game_id)
  }

  handleLogin = (e,game_id,budget,grid_size) => {
    e.preventDefault();
    this.setState({
      //loggedIn: true,
      game_id: game_id,
      budget: budget
    })
    console.log(budget)
    WebSocketInstance.connect();
    this.waitForSocketConnection(() => { 
      WebSocketInstance.initUser(game_id,budget,grid_size);
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
    const pressure = parsedData['pressure']
    const initial_pressure = parsedData['initial_pressure']
    const cost = parsedData['cost']
    const budget = parsedData['budget']
    let frac = 100/size;
    let dimen = frac.toString() + "%"
    let fontsz = 0
    if(size==13){
      fontsz = 3
    }
    else if(size==22){
      fontsz = 2
    }
    else{
      fontsz = 1.4
    }
    let fontsize = fontsz.toString() + "vw";
    this.setState({
    	loggedIn: true,
      grid: grid,
      row: row,
      col: col,
      pressure: pressure,
      initial_pressure: initial_pressure,
      cost: cost,
      budget: budget,
      size: size,
      dimen: dimen,
      fontsize: fontsize,
    })
    
  }

  handleContextMenu(e,i,j){
    const grid = this.state.grid;
    if(grid[i][j].split("_")[0]=="pipe"){
      
      e.preventDefault()
      console.log(e.clientX,e.clientY)
      console.log(i,j)
      this.setState({
        menuX: e.clientX,
        menuY: e.clientY,
        visible: true,
        currBlockX: i,
        currBlockY: j,
      })
      var self =this
      document.addEventListener('click', this.setVisibility);
    }
  }

  setVisibility = () =>{
  	this.setState({visible:false})
  	document.removeEventListener('click', this.setVisibility);
  }

  handleDeletePipe(e) {
    let game_id = this.state.game_id
    let i = this.state.currBlockX
    let j = this.state.currBlockY
    WebSocketInstance.deletePipe(game_id,i,j)
  }

  handleSizeChange(event) {
    let size = event.target.value
    let game_id = this.state.game_id
    let i = this.state.currBlockX
    let j = this.state.currBlockY
    WebSocketInstance.changeSize(game_id,i,j,size);
  }

  handlePressureChange(event,val){
    event.preventDefault()
    let game_id = this.state.game_id
    let initial_pressure = +val
    if(Number.isInteger(initial_pressure)&&initial_pressure>0){
      WebSocketInstance.changePressure(game_id,initial_pressure)
    }
    else{
      alert('Enter a positive integer')
    }
  }

  render() {
    const size = this.state.size
    const grid = this.state.grid
    const loggedIn = this.state.loggedIn
    const pressure = this.state.pressure
    const cost = this.state.cost
    const budget = this.state.budget
    const color = budget>=cost ? "green" : "red"
    const dimen = this.state.dimen
    const fontsize = this.state.fontsize
    return(
       loggedIn ?
      <div className = 'rowC '>

        
          <Grid 
            size={size}
            grid={grid}
            onClick = {(e,i,j) => this.handleBlockClick(e,i,j)}
            handleContextMenu = {this.handleContextMenu}
            pressure = {pressure}
            dimen = {dimen}
            fontsize = {fontsize}
          />
        
        <div className='lhs'>       
          	<div className='title1'>
            Add a Pipe
            </div>
            <Controls
              onClick = {(direction) => this.handleDirectionClick(direction)}
            />
            <SelectPipe
            	handleOptionChange = {this.handleOptionChange}
            	selectedOption = {this.state.pipe_size}
            />          
            <ChangeInitialPressure 
              handlePressureChange = {this.handlePressureChange} />
            <Reset
              onClick = {() => this.handleReset()}
            />
            <div className="budget">
            	<div className="budget-lhs">
            		Budget
            	</div>
            	<div className="budget-rhs">	
            		{budget}
            	</div>
            </div>
            <div className="money-spent">
            	<div className="money-spent-lhs">
            		Money Spent
            	</div>
            	<div className="money-spent-rhs" style={{color:color}}>
            		{cost}
            	</div>
            </div>
            <div className="money-rem">
            	<div className="money-rem-lhs">
            		Money Remaining
            	</div>
            	<div className="money-rem-rhs" style={{color:color}}>
            		{budget-cost}
            	</div>
            </div>          
        </div>

        {this.state.visible &&
          <div style={{position:"absolute", top:this.state.menuY, left:this.state.menuX}} className="menu">
          	<div>
            <button onClick={this.handleDeletePipe} value="del" className="menu-buttons">
            Delete pipe
            </button>
            </div>
            <div>
            <button onClick={this.handleSizeChange} value="large" className="menu-buttons">
            Change to 1 inch
            </button>
            </div>
            <div>
            <button onClick={this.handleSizeChange} value="medium" className="menu-buttons">
            Change to 0.75 inch
            </button>
            </div>
            <div>
            <button onClick={this.handleSizeChange} value="small" className="menu-buttons">
            Change to 0.5 inch
            </button>
            </div>
            </div>
        }


      </div>
            :
      <LoginComponent
        handleLogin = {this.handleLogin} />
    )
  }
}

export default App;
