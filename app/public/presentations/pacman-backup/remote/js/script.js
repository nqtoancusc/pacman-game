/* global io */
/* global QrRemote */
$(function() {
	if (typeof io !== 'undefined') {
		var socket = io.connect(null, {
			'reconnect': false
		});
		QrRemote.init(socket);
	}
});