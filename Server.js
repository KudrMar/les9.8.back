const http = require('http');
const express = require( 'express');
const WebSocket = require( 'ws');

const app = express();
const server = http.createServer(app);

const webSocketServer = new WebSocket.Server({ server });

server.listen(7070, () => console.log("server is worked at 7070"));
const users = [];

webSocketServer.on('connection', (ws) => {
  ws.key = '';
  ws.on('message', message => {
    const data = JSON.parse(message);
    switch(data.event) {
      case 'login':
        ws.key = data.name;
        ws.send(JSON.stringify(login(data)));
        break;
      case 'newUser':
        multipleSending(data);
        break;
      case 'sendMessage':
        multipleSending(sendMessage(data));
        break;
    }    
  });

  ws.on('close', () => {
      multipleSending(userOffline(ws.key));
  });

  ws.on("error", error => ws.send(error));
});

function userOffline(key) {
  if (key != '') {
    users.splice(users.indexOf(users.find(item => item.name === key)), 1);
    return {
      event: 'userOffline',
      users: users
    }
  }
}

function login(data) {
  const isName = users.find((item) => {
    return item.name === data.name;
  });
  if(!isName) {
    users.push({name: data.name});
    return {
      event: 'login',
      status: true,
      name: data.name,
      users: users,
    }  
  }    
  return {
    event: 'login',
    status: false,
    message: 'Имя ' + data.name + ' занято'
  }    
}

function multipleSending(data) {
  webSocketServer.clients.forEach((client) => {
    client.send(JSON.stringify(data));
  })
}

function   sendMessage(data) {
  const newDate = new Date();
  const dateText = newDate.getHours() + ':' + newDate.getMinutes() + ' ' + newDate.getDate() + '.' + (newDate.getMonth() + 1) + '.' + newDate.getFullYear();

  return {
    ...data,
    date: dateText,
  }
}



 

