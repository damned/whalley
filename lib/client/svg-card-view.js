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

  var fo = group.foreignObject(logical.width, logical.height)
  whalley.workarounds.fixup_firefox_fo(fo)

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
  function clicked(subject, target) {
    if (target === menu.node) {
      alert('wowsers - menu!!')
    }
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
  whalley.workarounds.DraggableClickGenerator(group).onclick(clicked)
  group.on('dragstart', function(e) {
    this.front()
    logical.move_started()
  });
  group.on('dragend', function(e) {
    logical.move_completed()
  });
  group.on('dragmove', function(e) {
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
  var menu_r = 20
  var menu = group.circle(2 * menu_r).dmove(-menu_r, -menu_r).front().fill('url(#menu_gradient)') //.fill({color:'#ff0066', opacity: 0.2})

  return external;
}
