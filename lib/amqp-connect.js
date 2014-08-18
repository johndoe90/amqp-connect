'use strict';

var util = require('util'),
		amqp = require('amqplib'),
		initializer = require('application-initializer'); 

/**
 * Contains the connection, a default channel, and the ready state (Promise)
*/
var connectionDetails = {
	/*ready: {},
	connection: {},
	defaultChannel: {}*/
};

function buildAmqpUrl(options) {
	return util.format('amqp://%s:%s@%s:%d%s', options.username, options.password, 
																						 options.host, options.port, 
																						 options.virtualHost);
}

function closeConnection() {
	connectionDetails.defaultChannel.close().finally(function() {
		connectionDetails.connection.close();
	})
}

function setupConnection(options) {
	if ( !connectionDetails.ready ) {
		connectionDetails.ready = amqp.connect(buildAmqpUrl(options)).then(function(connection) {
			connectionDetails.connection = connection;
			return connection.createChannel();
		}).then(function(channel) {
			connectionDetails.defaultChannel = channel;
			process.once('SIGINT', closeConnection);
		});

		/** Add dependency to "global" initializer object */
		initializer.addDependency('AMQP Connection', connectionDetails.ready);
	}

	return connectionDetails;
}

module.exports = setupConnection;


