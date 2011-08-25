var express = require( "express" ),
    app = express.createServer(),
    io = require( "socket.io" ).listen( app ),
    mongodb = require( "mongodb" ),
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
  io.sockets.emit( 'user connected' );
  mongodb.connect( 'mongodb://localhost/test', function( error, db ) {
    if( error ) throw error;
    db.collection( 'notes', function( error, collection ) {
      collection.find( {}, function( error, cursor ) {
        if( error ) throw error;
        cursor.each( function( error, item ) {
          if( item ) {
            console.log( "Sending create event for " + JSON.stringify( item ) );
            socket.emit( 'update', { event : 'create', data : item } );
          }
        });
      });

      socket.on( 'update', function( data ) {
        console.log( data );
        if( data.event == 'create' ) {
          collection.insert( data.data, function( error ) {
            if( error ) throw error;
            console.log( "Created " + JSON.stringify( data.data ) );
          });
        }
        else if( data.event == 'update' ) {
          collection.update( { guid : data.guid }, data.data, function( error ) {
            if( error ) throw error;
            console.log( "Updated " + JSON.stringify( data.data ) );
          });
        } else if( data.event == 'delete' ) {
          collection.remove( { guid : data.guid }, function( error ) {
            if( error ) throw error;
            console.log( "Deleted " + JSON.stringify( data ) );
          });
        }
        io.sockets.emit( 'update', data );
      });
    });
  });

  socket.on('disconnect', function () {
    io.sockets.emit( 'user disconnected' );
  });
});

app.listen( process.env.PORT || 3000 );
