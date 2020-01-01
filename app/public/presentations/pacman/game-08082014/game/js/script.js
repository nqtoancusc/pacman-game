/* global io */
/* global QrRemote */
/* global Pong */
/* jshint -W064 */
socket = null;

$(function() {
	var elems = {};
	socket = io.connect(null, {
		'max reconnection attempts': 3000,
		'reconnection limit': 3000,
	});
	
	QrRemote.initIFrame(socket, elems);

	socket.on('connect', function () {
		console.log('Connect');
		socket.emit('iframe:connect', {});
	});

	socket.on('reconnecting', function () {
		console.log('Reconnecting...');
	});

	socket.on('reconnect', function () {
		console.log('Reconnect');
	});

	socket.on('disconnect', function () {
		console.log('Disconnect');
		socket.emit('iframe:disconnect', {});
	});
});
