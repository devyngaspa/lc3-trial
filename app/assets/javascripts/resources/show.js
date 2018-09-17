$(function () {

  // Vars

  var highlight_applier;
  //var highlighter_applier;

  var html = "<div class='btn-group' role='group'><button type='button' class='btn btn-lc highlight-btn'><span class='glyphicon glyphicon-pencil' aria-hidden='true'></span></button><button type='button' class='btn btn-secondary btn-lc note-btn'><span class='glyphicon glyphicon-comment' aria-hidden='true'></span></button></div>";

  var on_element_create = function (element) {
    var $element = $(element);
    $element.tooltip({trigger: 'manual'});
    setTimeout( function () { $element.tooltip('show'); }, 500 );
  }

  var options = {
    elementAttributes: { 'data-toggle': 'tooltip', 'data-placement': 'top', 'data-html': true, 'title': html },
    onElementCreate: on_element_create
  };

  // Events

  window.onload = function() {
    rangy.init();
    highlight_applier   = rangy.createClassApplier("highlight", options);
    //highlighter_applier = rangy.createClassApplier("highlighted");
  }

  $(document).on('click', '.highlight-btn', function (event) {
    event.stopPropagation();
    highlight_applier.toggleSelection();
    var range            = get_first_range()
    var serialized_range = rangy.serializeRange(range);
    var content          = get_selection_text();
    submit_highlight({ range: serialized_range, content: content})
    //highlighter_applier.toggleSelection();
  })

  $("body").mouseup(function(event) {
    var $target = $(event.target);
    if ($target.hasClass('highlight-btn')) { return; }
    var selection = window.getSelection();
    if (!selection.toString()) { return; }
    highlight_applier.toggleSelection();
  });

  // Helpers

  function get_first_range() {
    return rangy.getSelection().getRangeAt(0)
  }

  function get_selection_text() {
    return rangy.getSelection().focusNode.data;
  }

  function submit_highlight(data) {
    return $.ajax({
      url:  'http://devyn.developer.dev:3000/highlights',
      verb: 'POST',
      data: data
    });
  }



});
