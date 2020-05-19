import config from './config';

class WebSocketService{
	static instance = null;
	callbacks = {};

	static getInstance(){
        if (!WebSocketService.instance){
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    constructor(){
        this.socketRef = null;
    }

    connect(){
        const path = config.API_PATH;
        this.socketRef = new WebSocket(path);
        
        this.socketRef.onmessage = e => {
        	console.log('Received')
            this.socketNewMessage(e.data);
          };

        this.socketRef.onopen = () => {
            console.log("WebSocket open");
        };
        
        this.socketRef.onerror = e => {
            console.log(e.message);
        };

        this.socketRef.onclose = () => {
            console.log("WebSocket closed, restarting..");
            this.connect();
        };   
    }

    socketNewMessage(data){
        const parsedData = JSON.parse(data);
        const command = parsedData.command;
        if(Object.keys(this.callbacks).length === 0){
            return;
        }
        if(command === 'game'){
        	console.log('game received')
            this.callbacks[command](parsedData);
        }
        if(command === 'new_message'){
            console.log("okay so this was called")
            this.callbacks[command](parsedData.message);
        }
    }

    initUser(game_id){
    	this.sendMessage({command : 'init', game_id : game_id})
    }

    reset(game_id){
    	this.sendMessage({command: 'reset', game_id: game_id})
    }

    blockClick(game_id,i,j){
    	this.sendMessage({command: 'block_click', game_id: game_id, i:i, j:j})
    }

    directionClick(game_id,direction,pipe_size){
    	this.sendMessage({command: 'direction_click', game_id: game_id, direction:direction, pipe_size: pipe_size })
    }
    addCallbacks(gameCallback){
        this.callbacks['game'] = gameCallback;
    }

    sendMessage(data){
        try{
        	console.log('tried');
            console.log({...data})
            this.socketRef.send(JSON.stringify({...data}))
        }
        catch(err){
            console.log(err.message);
        }
    }
     state(){
        return this.socketRef.readyState;
    }


    waitForSocketConnection(callback){
        const socket = this.socketRef;
        const recursion = this.waitForSocketConnection;
        setTimeout(
            function(){
                if(socket.readyState === 1){
                    console.log("Connection is made");
                    if(callback != null){
                        callback();
                    }
                    return;
                }
                else{
                    console.log("Wait for connection..");
                    recursion(callback);
                }
            }, 1);
    }

}

let WebSocketInstance = WebSocketService.getInstance();

export default WebSocketInstance;