var express = require( "express" ),
    app = express.createServer(),
    io = require( "socket.io" ).listen( app ),
    long_stack_traces = require( "long-stack-traces" );

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
  response.render( 'index', { request : request } );
});

app.get("/*", function( request, response ) {
  response.sendfile( __dirname + '/public/' + request.params[0] );
});

io.sockets.on( 'connection', function( socket ) {
});

io.sockets.on( 'update', function( data ) {
  io.sockets.emit( 'update', data );
});

app.listen( process.env.PORT || 3000 );
