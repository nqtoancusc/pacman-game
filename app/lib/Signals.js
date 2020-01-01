var winston = require('winston')
	, player = require('./models/Player')
	, playerCtrl = require('./PlayerController')
	;

var ROOMS = {inplay: 'INPLAY', inqueue: 'INQUEUE'};
var SCREEN_SOCKET_ID;

function Signals() {

	this.setup = function(app) {

		app.io.route('screen', {
			ready: function(req) {
				req.io.socket.get('clientData', function(err, clientData) {
					SCREEN_SOCKET_ID = req.io.socket.id;
					req.io.join(ROOMS.inplay);
					req.io.socket.set('clientData', clientData, function() {
						req.io.respond('connected');
					});
					winston.info('Screen:ready (Socket ID: ' + req.io.socket.id + ')');
				});
			},

			gameover: function(req) {
				req.io.socket.get('clientData', function(err, clientData) {
					winston.info('Screen:gameover (Socket ID: ' + req.io.socket.id + ')');
					playerCtrl.gameOver(app, ROOMS, SCREEN_SOCKET_ID, req.data.score);
				});
			}
		});
		
		app.io.route('remote', {
			ready: function(req) {
				req.io.socket.get('clientData', function(err, clientData) {
					app.io.sockets.socket(req.io.socket.id).emit('screen:ready', {'remoteStatus': 'register', 'errorMsg':''});
					winston.info('remote:ready (Socket ID: ' + req.io.socket.id + ')');
				});
			},

			register: function(req) {
				req.io.socket.get('clientData', function(err, clientData) {
					winston.info('remote:register ' + JSON.stringify(req.data));
					if (req.data && req.data.phone) {
						playerCtrl.addNew(req.data.phone, req, app, ROOMS, SCREEN_SOCKET_ID);
					}
				});
			},

			control: function(req) {
				req.io.socket.get('clientData', function(err, clientData) {
					req.io.room(ROOMS.inplay).broadcast('control:action', req.data);
					winston.info('control:action ' + JSON.stringify(req.data));
				});
			}
		});
	};
}

module.exports = new Signals();