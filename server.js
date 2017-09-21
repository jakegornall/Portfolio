var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/Portfolio', { useMongoClient: true })
.catch(function(err) {
	console.log(err);
});

var Schema = mongoose.Schema,
		ObjectId = Schema.ObjectId;

var MessageSchema = new Schema({
	id: ObjectId,
	sender: String,
	body: String,
	date: Date
});

var Message = mongoose.model('Message', MessageSchema);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/build/index.html');
});

io.on('connection', function(socket) {
	function refreshAll() {
		Message.find(function(err, messages) { 
			if (!err) { 
				io.emit('server:event', messages);
			}
		});
	}
	console.log('a user connected');
	refreshAll();
	
	socket.on('client:sentMessage', data => {
		var msg = new Message({ sender: data.sender, body: data.body, date: Date.now() });
		msg.save(function(err) {
			if (err) {
				console.log(err);
			} else {
				refreshAll();
			}
		});
	});
	socket.on('client:deleteMessage', message => {
		Message.deleteOne({ _id: message._id }, function(err) {
			if (!err) {
				refreshAll();
			}
		});
	});
});

// static files
app.use('/static', express.static(path.join(__dirname, 'build/static')))

http.listen(3001, function(){
	console.log('api listening on *:3001');
});