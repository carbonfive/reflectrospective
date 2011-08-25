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

var notes = {};

io.sockets.on( 'connection', function( socket ) {
  io.sockets.emit( 'user connected' );
  for( var guid in notes ) {
    console.log( "Sending " + guid + " to client" );
    socket.emit( 'update', { event : 'create', data : notes[guid] } );
  }

  socket.on( 'update', function( data ) {
    console.log( data );
    if( data.event == 'create' || data.event == 'update' ) {
      notes[ data.data.guid ] = data.data;
    } else if( data.event == 'delete' ) {
      delete notes[ data.data.guid ];
    }
    io.sockets.emit( 'update', data );
  });

  socket.on('disconnect', function () {
    io.sockets.emit( 'user disconnected' );
  });
});

app.listen( process.env.PORT || 3000 );
