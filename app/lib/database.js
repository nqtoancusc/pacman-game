var _ = require('underscore')
	, winston = require('winston')
	, Sequelize = require('sequelize')
	, serverConfig = require('../serverConfig')
	;

var models = [
	'Player',
];
	
var loadModels = function() {
	_.each(models, function(model) {
		require('./models/' + model);
	});
};

var database = {
		
	sequelize: null,
	
	init: function(callback) {
		var sequelizeOpts = {
			define: {
				freezeTableName: true,
				charset: 'utf8',
				collate: 'utf8_general_ci'
			}
		};
		
		if (!process.env.DEBUG_DB_QUERIES) {
			sequelizeOpts.logging = false;
		}
		
		this.sequelize = new Sequelize(serverConfig.dbUrl, sequelizeOpts);
		loadModels();
		
		this.sequelize
			.sync()
			.success(function() {
				callback();
			});
	},

	reset: function() {
		this.sequelize.query("UPDATE Player SET status = 'gameover' WHERE status <> 'gameover'").success(function() {
			winston.info('Database is now reset');
		});
	}
};

module.exports = database;
