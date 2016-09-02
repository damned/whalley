'use strict';
var whalley = whalley || {};
var pseudoid = 0; // TODO privatise

whalley.SvgCardView = function(wall, logical) {
  var log = whalley.log;
  var $div, div_id;
  var top_gutter = 2;
  var border_size = 2;
  var both_borders_size = 2 * border_size;
  function inner_width() {
    return logical.width - both_borders_size;
  }
  function inner_height() {
    return logical.height - both_borders_size - top_gutter;
  }

  var group = wall.group(logical.width, logical.height)
  group.size(logical.width, logical.height)
  group.addClass('card')
  if (logical.id.startsWith('blank')) {
    group.addClass('blank')
  }

  var fo = group.foreignObject(logical.width, logical.height)
  whalley.workarounds.fixup_firefox_fo(fo)

  pseudoid += 1;
  div_id = 'card' + pseudoid;
  fo.appendChild('div', {id: div_id})

  $div = $('#' + div_id);
  $div.text(logical.text);
  $div.addClass('card');
  function style_card() {
    $div.css({
      'padding-top': top_gutter + 'px',
      'min-width': '' + inner_width() + 'px',
      'max-width': '' + inner_width() + 'px',
      'min-height': '' + inner_height() + 'px',
      'max-height': '' + inner_height() + 'px'
    });
  }
  style_card();

  var external = {
    update_position: function() {
      group.move(logical.x - logical.half_width, logical.y - logical.half_height);
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
  function update_colour(colour) {
    console.log('updating colour')
    if (colour !== undefined) {
      console.log('updating logical colour')
      logical.set_colour(colour);
    }
    if (logical.colour !== undefined) {
      console.log('updating div colour')
      $div.css({'background-color': logical.colour});
    }
  }
  function update_size(size) {
    console.log('updating size')
    if (size !== undefined) {
      console.log('updating logical size')
      logical.set_size(size);
    }
    console.log('updating card size')
    group.size(logical.width, logical.height);
    fo.size(logical.width, logical.height);
    style_card()
  }
  update_colour();
  group.draggy();

  var menu_button;
  var colour_options = {}
  'lightblue lightgreen lightgray white pink lightyellow'.split(' ').forEach(function(colour) {
    colour_options[colour] = function() {
      update_colour(colour);
    }
  })
  var size_options = {};
  [['width', 0.5], ['height', 0.5], ['width', 2], ['height', 2]].forEach(function(sizechange) {
    var axis = sizechange[0];
    var factor = sizechange[1];
    size_options[axis + 'x' + factor] = function() {
      var size = {
        width: logical.width,
        height: logical.height
      }
      size[axis] = size[axis] * factor;
      alert("updating size to " + size);
      update_size(size);
    }
  })
  function create_menu() {
    const radius = 20
    var dynamic_position_reference = {
      get x() {
        return group.x()
      },
      get y() {
        return group.y()
      }
    }
    menu_button = group.circle(2 * radius).dmove(-radius, -radius).front().fill('url(#menu_gradient)');
    return whalley.SvgMenu(dynamic_position_reference, wall.group, {
      'change colour': function() {
        whalley.SvgMenu(dynamic_position_reference, wall.group, colour_options).open()
      },
      'change size': function() {
        whalley.SvgMenu(dynamic_position_reference, wall.group, size_options).open()
      }
    })
  }

  function clicked(subject, target) {
    if (target === menu_button.node) {
      card_menu.open()
      return
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
  logical.on_select(() => {
    external.display_as('selected')
  })
  logical.on_deselect(() => {
    external.display_as_not('selected')
  })
  logical.on_mark((marker) => {
    external.display_as(marker)
  })
  logical.on_unmark((marker) => {
    external.display_as_not(marker)
  })
  logical.on_position_value_changed(external.update_position)

  var card_menu = create_menu();
  return external;
}
