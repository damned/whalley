var pseudoid = 0;

function SvgCard(cardlike, wall) {
  var log = whalley.log;
  var self = this;
  var $div, div_id;

  function create_card_view(logical) {
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
      image: function(image_src, width, height) {
        group.image(image_src).size(width, height)
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

  function forward_each(methods, target) {
    methods.split(' ').forEach(function(method) {
      self[method] = target[method].bind(target)
    })
  }

  function convertTextCardToImage(image_url) {
    card_view.image(image_url, 100, 60)
  };

  const IMG_DATA_PREFIX = 'data:image';

  function init_card() {
    if (logical.text.indexOf(IMG_DATA_PREFIX) == 0) {
      convertTextCardToImage(logical.text);
    }
  }

  var logical = new whalley.LogicalCard(cardlike);
  var card_view = create_card_view(logical);

  this.text = function() {
    return logical.text;
  };

  forward_each('has_id data matches', logical)
  forward_each('display_as display_as_not move_to', card_view)

  init_card();
};
