var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var passHash = require('password-hash');
const cryptoRandomString = require('crypto-random-string');
var session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
  });
var sharedsession = require("express-socket.io-session");
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
	rooms: [{ room: String, user: String }],
	sessionToken: String,
	active: { type: Boolean, default: false},
	socketId: String
});

var RoomSchema = new Schema({
	id: ObjectId,
	users: [String],
	messages: [{
		sender: String,
		body: String,
		date: Date
	}]
})

var User = mongoose.model('User', UserSchema);
var Room = mongoose.model('Room', RoomSchema);

app.use(session);
app.get('/', function(req, res){
	res.sendFile(__dirname + '/build/index.html');
});


io.use(sharedsession(session));
io.on('connection', function(socket) {
	socket.on('client:authenticate', token => {
		User.findOne({ sessionToken: token }, function(err, user) {
			if (user) {
				if (token === user.sessionToken) {
					user.socketId = socket.id;
					user.save(function(err, savedUser) {
						socket.handshake.session.user = user;
						socket.handshake.session.save();
						socket.emit('server:sessionStatus', {
							isLoggedIn: true,
							username: user.username,
							rooms: user.rooms,
							sessionToken: user.sessionToken
						});
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
					active: true,
					socketId: socket.id
				});
				newUser.save(function(err, user) {
					if (err) {
						socket.emit('server:sessionStatus', {
							isLoggedIn: false
						});
					} else {
						socket.handshake.session.user = user;
						socket.handshake.session.save();
						socket.emit('server:sessionStatus', {
							isLoggedIn: true,
							username: newUser.username,
							sessionToken: newUser.sessionToken,
							rooms: newUser.rooms
						});
					}
				});
			}
		});
	});

	socket.on('client:checkExistingUsername', username => {
		User.findOne({ username: username }, function(err, user) {
			if (!user) {
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
					user.socketId = socket.id;
					user.save(function(err, savedUser) {
						if (!err) {
							socket.handshake.session.user = savedUser;
							socket.handshake.session.save();
							socket.emit('server:sessionStatus', {
								isLoggedIn: true,
								username: savedUser.username,
								sessionToken: savedUser.sessionToken,
								rooms: savedUser.rooms
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

	socket.on('client:requestChat', recipient => {
		User.findOne({ username: recipient }, function(err, rec) {
			if (rec) {
				if (rec.active) {
					var room = new Room({
						users: [rec.username, socket.handshake.session.user.username]
					});
					room.save(function(err, newRoom) {
						if (newRoom) {
							socket.join(newRoom._id);
							socket.handshake.session.user.rooms.push({ room: newRoom._id, user: rec.username });
							socket.handshake.session.save();
							socket.handshake.session.user.save(function(err, savedUser) {
								console.log(err);
								io.to(rec.socketId).emit('newchatrequest', {
									user: socket.handshake.session.user.username,
									room: newRoom._id
								});
								socket.emit("server:joinedroom", {
									room: newRoom._id,
									user: rec.username
								});
							});
						}
					});
				}
			}
		})
	});

	socket.on('client:acceptchatrequest', req => {
		if (socket.handshake.session.user) {
			if (socket.handshake.session.user.active) {
				Room.findOne({ id: req.room }, function(err, room) {
					if (room) {
						socket.join(room._id);
						room.messages.append({
							sender: socket.handshake.session.user.username,
							body: socket.handshake.session.user.username + " just joined!",
							date: Date.now()
						});
						room.save(function(err, savedRoom) {
							if (!err) {
								io.in(savedRoom._id).emit('messagesUpdate', newRoom.messages);
								socket.handshake.session.user.rooms.push({ room: newRoom._id, user: req.username });
								socket.handshake.session.user.save(function(err, savedUser) {
									if (!err) {
										socket.handshake.session.save();
										socket.emit("server:joinedroom", {
											room: savedRoom._id,
											user: req.username
										});
									}
								});
							}
						});
						
					}
				});
			}
		}
	});
});

// static files
app.use('/static', express.static(path.join(__dirname, 'build/static')));


http.listen(3001, function(){
	console.log('api listening on *:3001');
});