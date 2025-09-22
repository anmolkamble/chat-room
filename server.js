var http = require('http');
var server = http.createServer(function(req, res) {});
var io = require('socket.io')(server);
io.on('connection', function(socket) {
 console.log('a user connected');
 socket.on('disconnect', function() {
   console.log('user disconnected');
 });
 socket.on('chat message', function(msg) {
   console.log('message: ' + msg);
   io.emit('chat message', msg);
 });
});
server.listen(process.env.PORT || 3000, function() {
 console.log('server up and running');
});