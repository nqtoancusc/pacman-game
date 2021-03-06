/* global io */
/* global QrRemote */
$(function() {
	if (typeof io !== 'undefined') {
		var socket = io.connect(null, {
			'reconnect': false
		});
		
		QrRemote.init(socket);

		$('#btnHighestScore').bind('touchstart click', function() {
			if ($('#highestScore').val().length < 1) {
				$('#invalidHighestScoreMsg').html('Virheellinen luku');
			} else {
				QrRemote.checkHighestScore($('#highestScore').val());
			}
		});

/*
		$('#btnRegister').bind('touchstart click', function() {
			$('#invalidMsg').html('');
			$('#invalidHighestScoreMsg').html('');
			if ((!$('#phone')) || 
				(!$('#phone').val().match(/^[+0][0-9]+[-]?[0-9]+$/)) ||
				($('#phone').val().length < 5) ||
				($('#phone').val().length > 14)) {
				$('#invalidMsg').html('Tarkista puhelinnumerosi');
			} else {
				if (!$('#highestScoreField').is(":visible")) {
					QrRemote.register($('#phone').val());
				} else {
					if ($('#highestScore').val().length < 1) {
						$('#invalidHighestScoreMsg').html('Virheellinen luku');
					} else {
						QrRemote.checkHighestScore($('#highestScore').val());
					}
				}
			}
		});
*/
		$('#btnRegister').bind('touchstart click', function() {
			$('#invalidMsg').html('');
			$('#invalidHighestScoreMsg').html('');
			if ((!$('#phone')) || 
				(!$('#phone').val().match(/^[+0][0-9]+[-]?[0-9]+$/)) ||
				($('#phone').val().length < 5) ||
				($('#phone').val().length > 14)) {
				$('#invalidMsg').html('Tarkista puhelinnumerosi');
			} else {
				QrRemote.register($('#phone').val());
			}
		});

		$.each(['Left','Right','Up', 'Down'], function() {
			var actionString = this.toLowerCase();
				$('#btn' + this).bind('mousedown touchstart', function(ev) {
					var actions = ['Left','Right','Up', 'Down'];
					var k = 0;
					for (k = 0; k < actions.length; k++) {
						if (actions[k] != this) {
							$('#btn' + actions[k]).trigger('mouseup');
						}
					}

					ev.preventDefault();
					socket.emit('remote:control', {action: 'keydown', direction: actionString});	
				});

				$('#btn' + this).bind('mouseup touchend', function(ev) {
					ev.preventDefault();
					socket.emit('remote:control', {action: 'keyup', direction: actionString});
				});
		});
	}

	$('.unselectable').bind('copy paste cut',function(e) { 
		e.preventDefault(); //disable cut,copy,paste
	});

	function checkDistance(loc) {

		var kamppiLat = 60.169157;
		var kamppiLon = 24.933228;
		var distance = getDistanceFromLatLonInKm(loc.coords.latitude, loc.coords.longitude, kamppiLat, kamppiLon);
		hideHighestScoreTextBox();

		if (distance < 1) {
			$('#phone-block').show();
			$('#invalidMsg').html('');
		} else {
			$('#phone-block').hide();
			$('#invalidMsg').html('Peli on pelattavissa ainoastaan Kampissa!');
		}

		function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
			var R = 6371; // Radius of the earth in km
			var dLat = deg2rad(lat2-lat1);  // deg2rad below
			var dLon = deg2rad(lon2-lon1); 
			var a = 
				Math.sin(dLat/2) * Math.sin(dLat/2) +
				Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
				Math.sin(dLon/2) * Math.sin(dLon/2)
			; 
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
			var d = R * c; // Distance in km
			return d;
		}

		function deg2rad(deg) {
			return deg * (Math.PI/180);
		}
	};

	function showHighestScoreTextBox() {
		//$('#highestScoreField').show();
		//$('#lbHighestScore').show();

		$('#score-block').show();
		$('#phone-block').hide();
	};

	function hideHighestScoreTextBox() {
		//$('#highestScoreField').hide();
		//$('#lbHighestScore').hide();

		$('#phone-block').show();
		$('#score-block').hide();	
	};

	function lookupLocation() {
		hideHighestScoreTextBox();
		geoPosition.getCurrentPosition(checkDistance, showHighestScoreTextBox,{enableHighAccuracy:true});
	};

	$('#score-block').hide();
	$('#phone-block').show();

	if (geoPosition.init()) {
		lookupLocation();
	} else {
		showHighestScoreTextBox();
	}
});