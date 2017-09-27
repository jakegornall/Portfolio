var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var passHash = require('password-hash');
const cryptoRandomString = require('crypto-random-string');
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
	hashedPassword: String,
	rooms: [{ roomId: String }],
	sessionToken: String,
	active: Boolean
});

var RoomSchema = new Schema({
	id: ObjectId,
	messages: [{
		id: ObjectId,
		sender: String,
		body: String,
		date: Date
	}]
})

var User = mongoose.model('User', UserSchema);
var Room = mongoose.model('Room', RoomSchema);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/build/index.html');
});

io.on('connection', function(socket) {
	socket.on('client:authenticate', token => {
		User.findOne({ sessionToken: token }, function(err, user) {
			if (!err && user) {
				if (token === user.sessionToken) {
					socket.emit('server:sessionStatus', {
						isLoggedIn: true,
						username: user.username,
						rooms: user.rooms,
						sessionToken: user.sessionToken
					});	
				} else {
					socket.emit('server:sessionStatus', {
						isLoggedIn: false
					});
				}
			} else {
				socket.emit('server:sessionStatus', {
					isLoggedIn: false
				});
			}
		});
	});

	socket.on('client:signup', data => {
		User.find({ username: data.username }, function(err, user) {
			if (user.length < 1) {
				var hashPassword = passHash.generate(data.password, { algorithm: 'sha256' });
				var newUser = new User({
					username: data.username,
					hashedPassword: hashPassword,
					sessionToken: cryptoRandomString(64),
					active: true
				});
				newUser.save(function(err, user) {
					if (err) {
						socket.emit('server:sessionStatus', {
							isLoggedIn: false
						});
					} else {
						socket.emit('server:sessionStatus', {
							isLoggedIn: true,
							username: newUser.username,
							sessionToken: newUser.sessionToken
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
	});

	socket.on('client:signin', data => {
		User.findOne({ username: data.username }, function(err, user) {
			if (!err) {
				if (passHash.verify(data.password, user.hashedPassword)) {
					user.sessionToken = cryptoRandomString(64);
					user.active = true;
					user.save(function(err, savedUser) {
						if (!err) {
							socket.emit('server:sessionStatus', {
								isLoggedIn: true,
								username: savedUser.username,
								sessionToken: savedUser.sessionToken
							});		
						} else {
							socket.emit('server:sessionStatus', {
								isLoggedIn: false
							});
						}
					});
				} else {
					socket.emit('server:sessionStatus', {
						isLoggedIn: false
					});
					socket.emit('server:signinError', {msg: "Password Incorrect"});
				}
			} else {
				socket.emit('server:signinError', {msg: "Username Not Found"});
			}
		});
	});
});

// static files
app.use('/static', express.static(path.join(__dirname, 'build/static')));


http.listen(3001, function(){
	console.log('api listening on *:3001');
});