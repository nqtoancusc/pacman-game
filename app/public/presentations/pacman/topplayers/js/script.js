/* global io */
/* global QrRemote */
$(function() {
	if (typeof io !== 'undefined') {
		var socket = io.connect(null, {
			'reconnect': false
		});

		socket.emit('topplayers:display', {});
		
		socket.on('topplayers:display', function (data) {
			console.log('topplayers:display');
			console.log(JSON.stringify(data));

			var list = $('#top-players-list');
			list.empty();
			if (data && data.topplayers && (data.topplayers.length > 0)) {
				var no = 1;
				var i = 0;
				for (i = 0; i < data.topplayers.length; i++) {
					if (data.topplayers[i].score) {
						var row = '<div class="row" style="border-top-width: thin; border-style: solid; border-color: #3b429c; font-weight: bold">' + 
									'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2"><h4>' + no++ + '</h4></div>' + 
									'<div class="col-xs-5 col-sm-5 col-md-5 col-lg-5"><h4>' + data.topplayers[i].phone + '</h4></div>' +
									'<div class="col-xs-5 col-sm-5 col-md-5 col-lg-5"><h4>' + data.topplayers[i].score + '</h4></div>' +
								  '</div>';

						list.append(row);
					}
				}
			}
		});
	}
});