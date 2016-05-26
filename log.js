'use strict';

const bunyan = require( 'bunyan' );
const bunyanSerializers = require( 'cti-bunyan-serializers' );

module.exports = bunyan.createLogger( {
    name: 'esp8266-simple-ota-server',
    level: process.env.LOG_LEVEL || 'debug',
    serializers: bunyanSerializers
} );
