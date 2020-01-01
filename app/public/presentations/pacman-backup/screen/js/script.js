/* global io */
/* global QrRemote */
/* global Pong */
/* jshint -W064 */
$(function() {
	var pong = Pong();
	var elems = {};
	elems.qr = $('#qr-remote').qrCode();
	elems.pong = $('#pongCanvas').qrPong({ pong: pong });
	var socket = io.connect(null, {
		'max reconnection attempts': 300,
		'reconnection limit': 3000
	});
	QrRemote.initScreen(socket, elems);
	pong.getGameController().sensitivity = 0.03;
	pong.init();
});