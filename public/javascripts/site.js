try {
  Typekit.load();
} catch(e) {}

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
      content: $.trim($('.content', $note).text()),
      rotation: $note.data('rotation')
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

    var $note = $('#' + data.guid);

    return {

      'create': function() {
        if ($note.length > 0) {
          return $note;
        }
        var rotation = data.rotation || Math.round(Math.random() * 10 - 5);
        var offset = data.offset ? data.offset : { top: 0, left: 0 };
        $note = $('#proto_note').children().clone();
        $note
          .draggable({
            stack: '.note',
            stop: function(event, ui) {
              send_event("update", note_data($note));
            }
          })
          .css('position', 'absolute')
          .css('top', offset.top)
          .css('left', offset.left)
          .css('-moz-transform', 'rotate(' + rotation + 'deg)')
          .css('-webkit-transform', 'rotate(' + rotation + 'deg)')
          .data('rotation', rotation)
          .click(function(e) {
            var $form = $('form', this).toggle();
            var $content = $('.content', this).toggle();
            var $textarea = $('textarea', $form);
            if ($form.is(':hidden')) {
              $content.html($textarea.val());
              send_event("update", note_data(this));
            } else {
              $textarea.focus();
            }
          })
          .attr('id', data.guid);

        $('a.delete', $note).click(function(e) {
          e.preventDefault();
          delete_note($note);
        });

        if (data.content) {
          $('.content', $note).html(data.content);
          $('textarea', $note).val(data.content);
        }

        $('textarea', $note).keyup(function(event) {
          if (event.keyCode == '13') {
            var note = $(this).parents('.note');
            var $form = $('form', $note).toggle();
            var $content = $('.content', $note).toggle();
            var $textarea = $(this);
            if ($form.is(':hidden')) {
              $content.html($textarea.val());
              send_event("update", note_data($note));
            } else {
              $textarea.focus();
            }
          }
        });
        $('#board').append($note);
        return $note;
      },

      'update': function() {
        $note
          .css('left', data.offset.left)
          .css('top', data.offset.top)
          .css('-moz-transform', 'rotate(' + data.rotation + 'deg)')
          .css('-webkit-transform', 'rotate(' + data.rotation + 'deg)')
        $('.content', $note).html(data.content);
        $('textarea', $note).val(data.content);
      },

      'delete': function() {
        $('#' + data.guid).remove();
      }
    }[event_name](data);
  }

  function delete_note(elem) {
    var $note = $(elem);
    send_event("delete", note_data($note));
    handle_event('delete', note_data($note));
  }

  $('#board').dblclick(function() {
    var $note = handle_event('create', { guid: S4() });
    send_event("create", note_data($note));
  });

});
