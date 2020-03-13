//Brandon Sin, 30012020, SENG 513
//Reference https://stackoverflow.com/questions/5058186/random-font-color
//https://itnext.io/build-a-group-chat-app-in-30-lines-using-node-js-15bfe7a2417b

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);



var userList = [];
var chatHistory = [];
var userListAsString = "none";
var randColor;


//function for time
function currentTime(){
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return time;
}

//function for randomizing a color https://stackoverflow.com/questions/5058186/random-font-color
function randomColor(){
    randColor = '#' + ('000000' + (Math.random() * 16777216 << 0).toString(16)).substr(-6);
    return randColor;
}

function applyColor(newColor){
    return '#' + newColor;
}

//function to check if new username is unique
function isNewUsernameUnique(username){
    if(userList.includes(username)){
        return false;
    }
    else{
        return true;
    }
}

//function to check if given username is unique
function isNameUnique(username){
    while(true)
    {
        if(userList.includes(username))
        {
            username = assignName();
        }
        else {
            return username;
        }
    }
}

//removes username off userlist
function removeName(username){
    const index = userList.indexOf(username);
    if(index > -1){
        userList.splice(index, 1);
    }
    else{
        console.log("user is not found: " + username);
    }
    return userList
}

//Assigns a name when user joins
function assignName(){
    var names = ["Apple", "Pear", "Orange", "Strawberry", "Pineapple", "Blueberry", "Peach", "Banana"]
    var randomNames = Math.floor(Math.random() * names.length);
    var usernameArray = names[randomNames];
    return usernameArray
}

app.get('/', function(req, res) {
    res.render('index.ejs');
});

//A connection Successful
io.sockets.on('connection', function(socket) {
    console.log("user logged in");
    let username = "none";
    let userColor = "none";

    username = assignName(); 
    console.log('assigned initial name: ' + username);

    username = isNameUnique(username);
    console.log('Got username: ' + username)
    userList.push(username);
    userListAsString = userList.join(', ');
    console.log("userList: " + userListAsString);

    userColor = username;    

    username = userColor.fontcolor(randomColor());
   
    
    var color1 = randColor;
    console.log(color1);
    
    io.emit('active', userListAsString);
    socket.emit('the_user', username);
    io.emit('is_online', '🔵 <i>' + username + ' join the chat..</i>');
    

    for(chatMessage of chatHistory)
    {
        socket.emit('chat_message', chatMessage.time + ' '  + chatMessage.usernameLog + ' ' + chatMessage.message);
    }
        
    //when user disconnects
    socket.on('disconnect', () => {
        io.emit('is_online', '🔴 <i>' + username + ' left the chat..</i>');
        console.log("username disconnect: " + username);
        console.log("userList before removal: ");
        userList = removeName(username)
        userListAsString = userList.join(', ');
        console.log("userList after removal: " + userListAsString);
        io.emit('active', userListAsString);
    })

    //chat message
    socket.on('chat_message', function(message, currentName) {
        
        //dictionary
        chatHistory.push({
            usernameLog: username,
            time: currentTime(),
            message: message
        });

        if(username === currentName){
            
            socket.emit('chat_message','<strong>' + currentTime() + '</strong>  ' + '<strong>' + username + '</strong>: ' + '<strong>' + message + '</strong>');
            socket.broadcast.emit('chat_message', currentTime() + ' ' + username + ': '+ message);
  
        }
        else{
            io.emit('chat_message',currentTime() + ' ' + username + ' ' + message);
        }
        
    });
    //change username
    socket.on('name_change', function(newUsername){
        if(isNewUsernameUnique(newUsername)){
            username = newUsername.fontcolor(color1);
            userColor = username;
            socket.emit('the_user', username);
        }
        else{
            socket.emit('chat_message', 'Chosen Name is Invalid, try another name </i>');
        }
    })

    socket.on('color_change', function(newColor){
        console.log(newColor);
        username = userColor.fontcolor(applyColor(newColor));
        console.log(applyColor(newColor));
        socket.emit('the_user', username);
    })

    //incase user fails to connect
    socket.on('connect_failed', function(){
        document.write("There seem to be an issue with the connection");
    })

});

const server = http.listen(8080, function() {
    console.log('listening on *:8080');
});