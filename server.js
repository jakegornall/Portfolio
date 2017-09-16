var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var data = {names:["Jake Gornall", "Jessi Spencer"]};

app.get('/', function(req, res){
	res.sendFile(__dirname + '/build/index.html');
});

io.on('connection', function(socket) {
	console.log('a user connected');
	socket.emit('server:event', data);
	socket.on('client:sentMessage', message => {
		data.names.push(message);
		console.log(message);
		console.log(data);
		io.emit('server:event', data);
	});
});

// static files
app.use('/static', express.static(path.join(__dirname, 'build/static')))

http.listen(3001, function(){
	console.log('api listening on *:3001');
});