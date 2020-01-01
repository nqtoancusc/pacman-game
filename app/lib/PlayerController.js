var _ = require('underscore')
	,winston = require('winston')
	, playerModel = require('./models/Player')
	, database = require('./database')	
	;

var REQUESTS = {};
var CURRENT_PLAYER_SOCKET_ID;

function PlayerController() {
}

PlayerController.prototype.addNew = function(phone, req, app, rooms, screenSocketId) {
	database.sequelize.query("SELECT * FROM Player WHERE phone = '" + phone + "' AND status <> 'gameover'").success(function(foundPlayer) {
		if (foundPlayer && foundPlayer.length < 1) {
			database.sequelize.query("SELECT * FROM Player WHERE status = 'waiting' OR  status = 'playing'").success(function(players) {
				var newPlayer = null;
				var statusString = '';
				if (players && players.length > 0) {
					statusString = 'waiting';
					newPlayer = {phone: phone, status: 'waiting', socketid: req.io.socket.id};
				} else {
					statusString = 'playing';
					newPlayer = {phone: phone, status: 'playing', socketid: req.io.socket.id};
				}
				if (newPlayer) {
					playerModel.create(newPlayer);
					REQUESTS[req.io.socket.id] = req;
					winston.info('Player with phone number ' + phone + ' has just been inserted.');
					if (statusString == 'waiting') {
						REQUESTS[req.io.socket.id] = req;
						database.sequelize.query("SELECT count(*) as position FROM Player WHERE status = 'waiting'").success(function(foundRecords) {
							req.io.join(rooms.inqueue);
							app.io.sockets.socket(req.io.socket.id).emit('screen:register', {remoteStatus: 'queue', errorMsg:'', position: foundRecords[0].position});
						});
					} else {
						winston.info('New player joins room ' + rooms.inplay);
						req.io.join(rooms.inplay);
						CURRENT_PLAYER_SOCKET_ID = req.io.socket.id;
						app.io.sockets.socket(screenSocketId).emit('screen:reload', {});
						app.io.sockets.socket(CURRENT_PLAYER_SOCKET_ID).emit('screen:register', {remoteStatus: 'play', errorMsg:''});
					}
				}
			});
		} else {
			winston.info('Player with phone number ' + phone + ' is in the queue aleady.');
			app.io.sockets.socket(req.io.socket.id).emit('screen:register', {remoteStatus: 'queue', errorMsg:'You are already in queue.'});
		}
	});
}

PlayerController.prototype.gameOver = function(app, rooms, screenSocketId, score) {
	database.sequelize.query("UPDATE Player SET status = 'gameover', score = '" + score + "' WHERE socketid = '" + CURRENT_PLAYER_SOCKET_ID + "'").success(function() {
		app.io.sockets.socket(CURRENT_PLAYER_SOCKET_ID).emit('screen:register', {remoteStatus: 'gameover', errorMsg:''});
		database.sequelize.query("SELECT * FROM Player WHERE status = 'waiting' ORDER BY id ASC LIMIT 1").success(function(player) {
			if (player && player.length > 0) {
				database.sequelize.query("UPDATE Player SET status = 'playing' WHERE id = " + player[0].id).success(function() {			
					REQUESTS[CURRENT_PLAYER_SOCKET_ID].io.leave(rooms.inplay);
					app.io.sockets.socket(screenSocketId).emit('screen:reload', {});
					REQUESTS[CURRENT_PLAYER_SOCKET_ID] = null;
					CURRENT_PLAYER_SOCKET_ID = player[0].socketid;
					if (REQUESTS && REQUESTS[CURRENT_PLAYER_SOCKET_ID]) {
						REQUESTS[CURRENT_PLAYER_SOCKET_ID].io.leave(rooms.inqueue);
						REQUESTS[CURRENT_PLAYER_SOCKET_ID].io.join(rooms.inplay);
						app.io.sockets.socket(CURRENT_PLAYER_SOCKET_ID).emit('screen:register', {remoteStatus: 'play', errorMsg:''});
					}
					winston.info('CURRENT SOCKET ID:' + CURRENT_PLAYER_SOCKET_ID);
				});					
			}
		});
	});
}

module.exports = new PlayerController();
