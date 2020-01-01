var QrRemote = QrRemote || {};

QrRemote.initScreen = function (socket, elems) {

	//socket.emit('screen:ready', {});
	
	socket.on('screen:reload', function (data) {
		window.location.reload();
	});

	socket.on('screen:ready', function (data) {
		if (data.nextplayerid) {
			$('#next_player_id').html('' + data.nextplayerid);
		}
	});

	socket.on('screen:highestscore', function (data) {
		if (data.highest_score) {
			$('#best_score').html('' + data.highest_score);	
		}
	});

	socket.on('screen:nextplayerid', function (data) {
		if (data.nextplayerid) {
			$('#next_player_id').html('' + data.nextplayerid);
		}
	});	
};