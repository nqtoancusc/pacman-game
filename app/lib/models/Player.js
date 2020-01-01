var Sequelize = require('sequelize')
	, database = require('../database')
	;

var Player = database.sequelize.define(
	'Player',
	{
		id: { type: Sequelize.INTEGER, primaryKey: true},
		phone	 : Sequelize.STRING,
		status	 : Sequelize.STRING,
		socketid : Sequelize.STRING,
		score    : Sequelize.INTEGER,
		updatedat: Sequelize.DATE,
	}, {
    	timestamps: false
	}
);

module.exports = Player;
