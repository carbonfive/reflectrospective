$(function() {

  function init_note(elem) {
    $(elem).draggable({
      stop: function(event, ui) {
        console.log("stopped: %o", event);
      }
    });
  }

  $('.note').each(function() {
    init_note(this);
  })
  
});