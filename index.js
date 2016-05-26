'use strict';

const fs = require( 'fs' );
const restify = require( 'restify' );

const log = require( './log.js' );

process.on( 'uncaughtException', function( err ) {
    log.fatal( err );
    process.exit( 100 ); // eslint-disable-line no-process-exit
} );

process.on( 'unhandledRejection', function( reason, p ) {
    log.fatal( { reason: reason, p: p }, 'Unhandled rejection' );
    process.exit( 101 ); // eslint-disable-line no-process-exit
} );

const server = restify.createServer();

server.on( 'after', function( req, res, route, err ) {
    log.debug( 'Request handling completed' );
} );

server.on( 'uncaughtException', function( req, res, route, err ) {
    log.fatal( err, 'Uncaught Restify exception' );
    process.exit( 102 ); // eslint-disable-line no-process-exit
} );

server.on( 'clientError', function( err, socket ) {
    log.error( {
        strErr: JSON.stringify( err ),
        stack: err.stack
    }, 'Client error' );
} );

server.pre( restify.pre.sanitizePath() );
server.use( restify.bodyParser() );
server.use( restify.queryParser() );

server.get( /.*/, function( req, res, next ) {

    log.info( { req }, 'Firmware request received' );
    fs.readFile( `firmware/${ req.url }`, function( err, data ) {

        if( err ) {

            if( err.code === 'ENOENT' ) {
                return next( new restify.NotFoundError( 'firmware file not found' ) );
            }

            log.error( { err }, 'Failed to read firmware file' );
            return next( new restify.InternalServerError() );
        }

        res.setHeader( 'Content-Type', 'application/octet-stream' );
        res.setHeader( 'Content-Disposition', 'attachment; filename=update.bin' );
        res.setHeader( 'Content-Length', data.length );
        res.writeHead( 200 );
        res.end( data );
        next();
    } );
} );

log.debug( 'opening http server' );
server.listen( 8080, function() {
    log.info( 'http server listening' );
} );
