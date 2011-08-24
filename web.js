var express = require( "express" ),
    sockets = require( "socket.io" ),
    http = require( "http" ),
    long_stack_traces = require( "long-stack-traces" );

var app = express.createServer();
var io = sockets.listen( app );
long_stack_traces.rethrow = false;

process.on( "uncaughtException", function( error ) {
  console.error( "Uncaught exception: " + error.message );
  console.trace();
});

app.configure( function() {
  app.set( "views", __dirname + "/views/" );
  app.set( "view engine", "jade" );
  app.use( express.logger() );
  app.error( function( error, request, response ) {
    console.error( "Express exception: " + error.message );
    console.trace();
    response.render( "500", { status : 500, error : error } );
  });
});

app.get( "/", function( request, response ) {
  response.render( 'index' );
});

app.get("/*", function( request, response ) {
  response.sendfile( __dirname + '/public/' + request.params[0] );
});

app.listen( process.env.PORT || 3000 );
