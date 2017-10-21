const dgram = require('dgram');
const server = dgram.createSocket('udp4');

var ltime = 0;
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get('/jquery.js', function(req, res){
	res.sendFile(__dirname + '/node_modules/jquery/dist/jquery.js');
});

app.get('/socket.io.js', function(req, res){
	res.sendFile(__dirname + '/node_modules/socket.io-client/dist/socket.io.js');
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});


io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

server.on('error', function(err) {
	console.log(err);
	server.close();
});

server.on('message', function(msg, rinfo) {

	// throttle this down to about 20fps, browser has a hard time with more
	var ctime = Date.now();
	if (ctime - ltime > 25) {
		ltime = ctime;
		io.emit('pixels', msg);
	}

//	console.log(msg);
//	console.log(rinfo);
});

server.on('listening', function() {
	var address = server.address();
	console.log('listening on ' + address.address + ':' + address.port);
});

server.bind(10420);
