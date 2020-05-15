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

    initUser(username){
    	this.sendMessage({command : 'init', username : username})
    }

    reset(username){
    	this.sendMessage({command: 'reset', username: username})
    }

    blockClick(username,i,j){
    	this.sendMessage({command: 'block_click', username: username, i:i, j:j})
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