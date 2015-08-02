var pseudoid = 0;

function SvgCard(cardlike, wall) {
  function create_card_view(logical) {
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
      move_to: function(left, top) {
        logical.move_to(left, top);
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
    external.move_to(logical.left, logical.top);
    if (logical.colour !== undefined) {
      $div.css({ 'background-color': logical.colour});
    }
    group.draggable();
    group.on('dragstart', function() {
      this.front();
    });
    $div.mouseenter(function() {
      log.log(JSON.stringify(logical.data()));
      wall.show_card(logical)
    });
    $div.mouseleave(function() {
      wall.show_card(null);
    });
    return external;
  }

  var logical = new whalley.LogicalCard(cardlike);
  var card_view = create_card_view(logical);

  this.text = function() {
    return logical.text;
  };

  forward({ from: this, methods: 'has_id data matches', to: logical})
  forward({ from: this, methods: 'display_as display_as_not move_to', to: card_view})

  // move to logical when move card view into logical
  function init_card() {
    const IMG_DATA_PREFIX = 'data:image';
    if (logical.text.indexOf(IMG_DATA_PREFIX) == 0) {
      card_view.image(logical.text)
    }
  }
  init_card();
};
