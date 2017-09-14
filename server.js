var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/build/index.html');
});

app.get('/api/test', function(req, res) {
	res.send({ "data": "hello world" });
});

// static files
app.use('/static', express.static(path.join(__dirname, 'build/static')))

http.listen(3001, function(){
	console.log('api listening on *:3001');
});