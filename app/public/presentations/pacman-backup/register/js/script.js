/* global io */
/* global QrRemote */
$(function() {
	if (typeof io !== 'undefined') {
		var socket = io.connect(null, {
			'reconnect': false
		});
		
		QrRemote.init(socket);

		$('#btnRegister').bind('touchstart click', function() {
			QrRemote.register($('#phone').val());
		});

		$.each(['Left','Right','Up', 'Down'], function() {
			var actionString = this.toLowerCase();
			$('#btn' + this).bind('mousedown touchstart', function() {
				socket.emit('remote:control', {action: 'keydown', direction: actionString});
			});

			$('#btn' + this).bind('mouseup touchend', function() {
				socket.emit('remote:control', {action: 'keyup', direction: actionString});
			});
		});
	}

	$('.unselectable').bind('copy paste cut',function(e) { 
		e.preventDefault(); //disable cut,copy,paste
	});	
});