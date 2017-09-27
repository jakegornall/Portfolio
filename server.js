var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var passHash = require('password-hash');
var session = require('express-session');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/Portfolio', { useMongoClient: true })
.catch(function(err) {
	console.log(err);
});

var Schema = mongoose.Schema,
		ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
	id: ObjectId,
	username: String,
	hashedPassword: String
});

var ConvoSchema = new Schema({
	id: ObjectId
});

var MessageSchema = new Schema({
	id: ObjectId,
	convo: String,
	sender: String,
	senderId: String,
	body: String,
	date: Date
});

var User = mongoose.model('User', UserSchema);
var Convo = mongoose.model('Convo', ConvoSchema);
var Message = mongoose.model('Message', MessageSchema);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/build/index.html');
});

io.on('connection', function(socket) {
	if (session.userId) {
		User.find({ _id: session.userId }, function(err, user) {
			if (!err) {
				socket.emit('server:sessionStatus', {
					isLoggedIn: true,
					username: user.username
				})
			}
		});
	} else {
		socket.emit('server:sessionStatus', {
			isLoggedIn: false,
			username: null
		});

		socket.on('client:signup', data => {
			User.find({ username: data.username }, function(err, user) {
				if (user.length < 1) {
					console.log("made it");
					var hashPassword = passHash.generate(data.password, { algorithm: 'sha256' });
					var newUser = new User({ username: data.username, hashedPassword: hashPassword });
					newUser.save(function(err, user) {
						if (err) {
							socket.emit('server:sessionStatus', {
								isLoggedIn: false,
								username: null
							});
						} else {
							socket.emit('server:sessionStatus', {
								isLoggedIn: true,
								username: newUser.username
							});
						}
					});
				}
			});
		});

		socket.on('client:checkExistingUsername', username => {
			User.find({ username: username }, function(err, users) {
				if (users.length === 0) {
					socket.emit('server:checkExistingUsername', { available: true });
				} else {
					socket.emit('server:checkExistingUsername', { available: false });
				}
			})
		})

		socket.on('client:signin', data => {
			User.find({ username: data.username }, function(err, user) {
				if (user.length > 0) {
					if (passHash.verify(data.password, user[0].hashedPassword)) {
						socket.emit('server:sessionStatus', {
							isLoggedIn: true,
							username: user[0].username
						});
					} else {
						socket.emit('server:sessionStatus', {
							isLoggedIn: false,
							username: null
						});
						socket.emit('server:signinError', {msg: "Password Incorrect"});
					}
				} else {
					socket.emit('server:signinError', {msg: "Username Not Found"});
				}
			});
		});
	}
});

// static files
app.use('/static', express.static(path.join(__dirname, 'build/static')));


http.listen(3001, function(){
	console.log('api listening on *:3001');
});