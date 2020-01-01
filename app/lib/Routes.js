var winston = require('winston')
	, path = require('path')
	, express = require('express.io')
	, serverConfig = require('../serverConfig')
	, randomtoken = require('./util/RandomToken')
	, swig = require('swig')
	;

function Routes() {

	var app = null;

	// Middleware component 
	function manageUuidCookie(req, res, next) {
		if ((req && req.cookies && !!req.cookies.uuid) === false &&
			(res && !res.uuidWritten)) {
			// Cookie 'uuid' must NOT be found
			// And res.uuidWritten flag must NOT be set

			var uuid = randomtoken.get(32);
			res.cookie('uuid', uuid, { maxAge: 365 * 24 * 60 * 60 * 1000 });
			res.uuidWritten = true;
			req.cookies = req.cookies || {};
			req.cookies.uuid = uuid;
			winston.info('Cookie written, UUID: ' + uuid);
		}
		next();
	}

	function dropForwardSlash(req, res, next) {
		req.url = req.url.replace(/\/*$/, '');
		next();
	}
	
	this.setup = function(appIn) {
		app = appIn;

		if (serverConfig.isDev) {
			swig.setDefaults({ cache: false });
		}

		app.engine('html', swig.renderFile);
		
		app.set('view cache', !serverConfig.isDev);
		app.set('view engine', 'html');
		app.set('views', serverConfig.requestBasePath);

		app.use(dropForwardSlash);
		app.use(manageUuidCookie);

		return this;
	};
	
	this.setupRoutesActive = function() {
		
		var renderComponent = function(req, res, scheme, component) {

			if (!component.getScheme()) {
				component.setScheme(scheme);
			}

			component.render.call(component, req, res);
			winston.info('New component (' + component.componentName + ')');
		};
		
		app.get('/favicon.ico', function(req, res) {
			res.send(404, '');
		});

		app.get('/game', function(req, res) {
			res.sendfile(serverConfig.requestBasePath + '/presentations/pacman/game/index.html');
		});

		app.get('/register', function(req, res) {
			res.sendfile(serverConfig.requestBasePath + '/presentations/pacman/register/register.html');
		});
		
		return this;
	};

	this.setupRoutesStatic = function() {
		var paths = [];

		// Document root
		paths.push(serverConfig.requestBasePath);
		
		paths.forEach(function(path) {
			app.use(express.static(path));
		});
		return this;
	};
}

module.exports = new Routes();