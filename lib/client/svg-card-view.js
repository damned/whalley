var whalley = whalley || {};
var pseudoid = 0; // TODO privatise
whalley.SvgCardView = function (wall, logical) {
  var log = whalley.log;
  var $div, div_id;
  var top_gutter = 2;
  var border_size = 2;
  var both_borders_size = 2 * border_size;
  var inner_width = logical.width - both_borders_size;
  var inner_height = logical.height - both_borders_size - top_gutter;
  var group = wall.group(logical.width, logical.height);
  group.size(logical.width, logical.height);
  var fo = group.foreignObject(logical.width, logical.height);
  pseudoid += 1;
  div_id = 'card' + pseudoid;
  fo.appendChild('div', {id: div_id})

  $div = $('#' + div_id);
  $div.text(logical.text);
  $div.addClass('card');
  $div.css({
    'padding-top': top_gutter + 'px',
    'min-width': '' + inner_width + 'px',
    'max-width': '' + inner_width + 'px',
    'min-height': '' + inner_height + 'px',
    'max-height': '' + inner_height + 'px'
  });


  var external = {
    update_position: function() {
      group.move(logical.left - logical.half_width, logical.top - logical.half_height);
    },
    image: function(image_src) {
      group.image(image_src).size(logical.width, logical.height)
      group.removeElement(fo)
    },
    display_as: function(display_type) {
      $div.addClass(display_type)
    },
    display_as_not: function(display_type) {
      $div.removeClass(display_type)
    }
  };
  external.update_position();
  if (logical.colour !== undefined) {
    $div.css({ 'background-color': logical.colour});
  }
  group.draggy();
  function clicked() {
    console.log('editing...')
    if ($div.text() == wall.DEFAULT_TEXT) {
      $div.text('')
    }
    $div.attr('contenteditable', 'true')
    $div.on('blur.editdone', function() {
      $div.removeAttr('contenteditable')
      $div.off('blur.editdone')
      logical.edit_done($div.text())
    })
    $div.focus()
  }
  // group.click not working chrome with draggable() so using dragstart+end
  var startp, lastp;
  function dragging_xy(e, context) {
    var event = e.detail.event;
    if (event.touches !== undefined && event.touches.length > 0) {
      console.log(context + ': using touch[0]')
      event = event.touches[0]
    }
    else if (event.pageX !== undefined && (event.pageX !== 0 || event.pageY !== 0)) {
      console.log(context + ': using top level event')
    }
    else {
      console.log(context + ': using lastp')
      return lastp;
    }
    return {x: event.pageX, y: event.pageY};
  }
  group.on('dragstart', function(e) {
    startp = dragging_xy(e, 'dragstart')
    this.front()
    logical.move_started()
  });

  group.on('dragend', function(e) {
    var nowp = dragging_xy(e, 'dragend')
    console.log('start: ' + JSON.stringify(startp) + ', end: ' + JSON.stringify(nowp))
    var distance_moved = Math.max(Math.abs(startp.x - nowp.x), Math.abs(startp.y - nowp.y))
    if (distance_moved < 4) {
      clicked()
    }
    logical.move_completed()
  });
  group.on('dragmove', function(e) {
    lastp = dragging_xy(e, 'dragmove')
    console.log('lastp: ' + JSON.stringify(lastp))
    logical.move_happening(this.x() + logical.half_width, this.y() + logical.half_height)
  });
  $div.mouseenter(function() {
    log.log(JSON.stringify(logical.data()));
    wall.show_card(logical)
  });
  $div.mouseleave(function() {
    wall.show_card(null);
  });

  //menu prototype
  //group.circle(30).dmove(-10, -10).fill({color:'#ff0066', opacity: 0.2}).click(function() {alert('click')}).back()

  return external;
}
