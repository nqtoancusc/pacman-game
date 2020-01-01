var QrRemote = QrRemote || {};

QrRemote.initIFrame = function (socket, elems) {

	socket.emit('iframe:ready', {});
	
	socket.on('iframe:reload', function (data) {
		window.location.reload();
	});

	socket.on('control:action', function (data) {
		console.log(JSON.stringify(data));
		if (data) {
			var keyUpEvent   = jQuery.Event("keyup");
			if (data.action == 'keydown') {
				var keyDownEvent = jQuery.Event("keydown");
				switch (data.direction) {
					case 'left' : keyDownEvent.which = 37; $(document).trigger(keyDownEvent); break;
					case 'right': keyDownEvent.which = 39; $(document).trigger(keyDownEvent); break;
					case 'up'   : keyDownEvent.which = 38; $(document).trigger(keyDownEvent); break;
					case 'down' : keyDownEvent.which = 40; $(document).trigger(keyDownEvent); break;
				}
			} if (data.action == 'keyup') {
				var keyUpEvent = jQuery.Event("keyup");
				switch (data.direction) {
					case 'left' : keyUpEvent.which = 37; $(document).trigger(keyUpEvent); break;
					case 'right': keyUpEvent.which = 39; $(document).trigger(keyUpEvent); break;
					case 'up'   : keyUpEvent.which = 38; $(document).trigger(keyUpEvent); break;
					case 'down' : keyUpEvent.which = 40; $(document).trigger(keyUpEvent); break;
				}
			}
		}
	});
};


