$(function() {

  var port = window.location.port || '80'
  var socket = io.connect( "http://" + window.location.hostname + ":" + port );

  function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  }

  function note_data(elem) {
    var $note = $(elem);
    return {
      guid: $note.attr('id'),
      offset: $note.offset(),
      content: $.trim($('.content', $note).text())
    };
  }

  function send_event(event_name, data) {
    console.log( event_name, data );
    socket.emit( "update", { event : event_name, data : data } );
  }

  socket.on( "update", function( data ) {
    console.log( JSON.stringify( data ) );
    handle_event( data.event, data.data );
  });

  function handle_event(event_name, data) {
    if (event_name === 'create') {
      var $note = $('#proto_note').children().clone();
      $note.css('top', 0)
        .css('left', 0)
        .draggable({
          stop: function(event, ui) {
            send_event("update", note_data($note));
          }
        })
        .click(function(e) {
          var $form = $('form', this).toggle();
          var $content = $('.content', this).toggle();
          var $textarea = $('textarea', $form);
          if ($form.is(':hidden')) {
            $content.html($textarea.val());
            send_event("changed", note_data(this));
          } else {
            $textarea.focus();
          }
        })
        .attr('id', S4());

      $('a.delete', $note).click(function(e) {
        e.preventDefault();
        delete_note($note);
      });
      $('#board').append($note);
      return $note;
    }
  }

  function delete_note(elem) {
    var $note = $(elem);
    send_event("delete", note_data($note));
    $note.remove();
  }

  $('#board').dblclick(function() {
    var $note = handle_event('create');
    send_event("create", note_data($note));
  });

});
