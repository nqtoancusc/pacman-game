/* global io */
/* global QrRemote */
/* global Pong */
/* jshint -W064 */
socket = null;

$(function() {
	var elems = {};
	socket = io.connect(null, {
		'max reconnection attempts': 300,
		'reconnection limit': 3000
	});
	QrRemote.initScreen(socket, elems);

});

function GameOver(score) {
	if (socket) {
		socket.emit('screen:gameover', {'score': score});
		console.log('Game Over:' + score);
	}
}

