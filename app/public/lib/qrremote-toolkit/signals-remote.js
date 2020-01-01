/* global Hammer */
/* jshint -W064 */
var QrRemote = QrRemote || {};

QrRemote = {
	
	socket: null,
	
	init: function(socket) {
		
		var that = this;

		this.socket = socket;

		this.socket.emit('remote:ready', {});

		socket.on('screen:ready', function (data) {
			console.log('Signal - screen:register');
			$.each(['register','queue','play','gameover'], function() {
				if (data.remoteStatus == this) {
					$('#' + this).show();	
				} else {
					$('#' + this).hide();
				}
			});
			console.log(JSON.stringify(data));
		});

		socket.on('screen:register', function (data) {
			console.log('Signal - screen:register');
			$.each(['register','queue','play','gameover'], function() {
				if (data.remoteStatus == this) {
					$('#' + this).show();
					if (data.position) {
						if (data.position == 1) {
							$('#queueMsg').text('You are the next player.');
						} else {
							$('#queueMsg').text('Your position is ' + data.position + '.');	
						}
					}
				} else {
					$('#' + this).hide();
				}
			});
			console.log(JSON.stringify(data));
		});		
	},

	register: function(phone) {
		this.socket.emit('remote:register', {'phone': phone});
	},
};
