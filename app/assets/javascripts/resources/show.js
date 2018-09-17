var ajax_success = function (data) { return data; };
var ajax_failure = function (data) { return false; };
function get_resource_id() { return window.location.pathname.split('/').pop() }
function get_resource_content_element () { return $('#resource-content')[0]; }

class Highlight {

  // Class Methods

  static create (params) {
    var highlight         = new Highlight();
    highlight.id          = params.id;
    highlight.offset      = params.offset;
    highlight.content     = params.content;
    highlight.resource_id = params.resource_id;
    return highlight;
  }

  static fetch () {

    return $.ajax({
      url:     '/highlights/fetch',
      type:    'GET',
      dataType: 'json',
      data: { resource_id: get_resource_id() },
      success: ajax_success,
      error:   ajax_failure
    });
  }

  static serialize (offset) {
    var start  = offset.start;
    var end    = offset.end;
    return start.toString() + "-" + end.toString();
  }

  // Instance methods

  to_params () {
    return {
      offset:      this.offset,
      content:     this.content,
      resource_id: this.resource_id
    }
  }

  submit () {
    return $.ajax({
      url:     '/highlights',
      type:    'POST',
      data:    { highlight: this.to_params() },
      success: ajax_success,
      error:   ajax_failure
    });
  }

  save (data) {
    this.id = data.id;
  }

  destroy () {
    return $.ajax({
      url:     '/highlights/' + this.id.toString(),
      type:    'DELETE',
      data: { id: this.id },
      success: ajax_success,
      error:   ajax_failure
    });
  }

  deserialize () {
    var offset = this.offset.split('-');
    return {
      start: offset[0],
      end:   offset[1]
    };
  }

  get_highlight_applier () {
    if (this.applier) { return this.applier }

    var html = `<div highlight-id=${this.id}><div class='btn-group' role='group'><button type='button' class='btn btn-lc dehighlight-btn'><span class='glyphicon glyphicon-pencil' aria-hidden='true'></span></button><button type='button' class='btn btn-secondary btn-lc note-btn'><span class='glyphicon glyphicon-comment' aria-hidden='true'></span></button></div></div>`;

    var on_element_create = function (element) {
      var $element   = $(element);
      $element.tooltip({trigger: 'click'});
    }

    var options = {
      elementAttributes: { 'data-toggle': 'tooltip', 'data-placement': 'top', 'data-html': true, 'title': html },
      onElementCreate:   ( (element) => { this.container = element; on_element_create(element) } )
    };

    var class_name = 'highlighted';
    var applier    = rangy.createClassApplier(class_name, options);
    this.applier   = applier;
    return applier;
  }

  get_range () {
    if (this.range) { return this.range }
    var index = this.deserialize();
    var range = rangy.createRange();
    range.selectCharacters(get_resource_content_element(), index.start, index.end);
    this.range = range;
    return range;
  }

}


// Ready
$(function () {

  // Vars

  var highlights = new Array;

  var highlight_applier;
  var selected_container;

  var html = "<div class='btn-group' role='group'><button type='button' class='btn btn-lc highlight-btn'><span class='glyphicon glyphicon-pencil' aria-hidden='true'></span></button><button type='button' class='btn btn-secondary btn-lc note-btn'><span class='glyphicon glyphicon-comment' aria-hidden='true'></span></button></div>";

  var on_element_create = function (element) {
    selected_container = element;
    var $element = $(element);
    $element.tooltip({trigger: 'manual'});
    setTimeout( function () { $element.tooltip('show'); }, 500 ); // why? maybe tooltip is in a CSS transition thus 'show' is ignored
  }

  var options = {
    elementAttributes: { 'data-toggle': 'tooltip', 'data-placement': 'top', 'data-html': true, 'title': html },
    onElementCreate: on_element_create
  };

  // Events

  window.onload = function() {
    rangy.init();
    highlight_applier = rangy.createClassApplier("highlight", options);

    Highlight.fetch().then( (data) => {

      for(let i = 0; i < data.length; i++) {
        var highlight = Highlight.create(data[i]);
        highlights.push(highlight);
        var index   = highlight.deserialize()
        var range   = highlight.get_range();
        var applier = highlight.get_highlight_applier();

        applier.applyToRange(range)
      }
    })
  }

  $(document).on('click', '.highlight-btn', function (event) {
    event.stopPropagation();

    var range       = get_first_range();
    var offset      = Highlight.serialize(range.toCharacterRange(get_resource_content_element()));
    var content     = get_selection_text();
    var resource_id = get_resource_id();

    var highlight = Highlight.create({
      offset:      offset,
      content:     content,
      resource_id: resource_id
    })

    highlight.submit().then( (data) => {
      highlights.push(highlight);
      highlight.save(data);
      highlight_did_save(highlight);
    });

  });

  $(document).on('click', '.dehighlight-btn', function (event) {
    event.stopPropagation();

    var id        = $(event.target).closest('[highlight-id]').attr('highlight-id');
    var highlight = find_highlight(id);

    highlight.destroy().then( (data) => {
      var applier = highlight.get_highlight_applier();
      var range   = highlight.get_range();
      $(highlight.container).tooltip('hide');
      applier.undoToRange(range);
    })

  });

  $("body").mouseup(function(event) {
    var $target = $(event.target);
    if ($target.hasClass('highlight-btn') || $target.hasClass('dehighlight-btn') || $target.parent().hasClass('highlight-btn') || $target.parent().hasClass('dehighlight-btn')) { return; }
    var selection = window.getSelection();
    if (!selection.toString()) { return; }
    highlight_applier.toggleSelection();
  });

  $(document).on('click', function (event) {
    var $target = $(event.target);
    if ($target.hasClass('highlighted')) { return; }
    console.log("on clickeddd");
    hide_all_tooltips();
    highlight_applier.toggleSelection();
  });

  // Helpers

  function hide_all_tooltips () {
    $('.tooltip').tooltip('hide');
  }

  function find_highlight (id) {
    return highlights.find( (highlight) => { return highlight.id == parseInt(id) })
  }

  function get_first_range() {
    return rangy.getSelection().getRangeAt(0);
  }

  function get_selection_text() {
    return rangy.getSelection().focusNode.data;
  }

  function highlight_did_save(highlight) {
    highlight.container = selected_container;
    $(selected_container).tooltip('hide');
    highlight_applier.toggleSelection();
    var applier = highlight.get_highlight_applier();
    applier.toggleSelection();
  }


});
