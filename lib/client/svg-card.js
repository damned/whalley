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
      move: function(left, top) {
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
    external.move(logical.left, logical.top);
    if (colour !== null) {
      $div.css({ 'background-color': colour});
    }
    group.draggable();
    group.on('dragstart', function() {
      this.front();
    });
    $div.mouseenter(function() {
      console.log(JSON.stringify(external.card.data()));
      wall.show_card(logical)
    });
    $div.mouseleave(function() {
      wall.show_card(null);
    });
    return external;
  }

  var line_length = 21;
  var shadow_size = 2;

  var logical = new whalley.LogicalCard(cardlike);
  var colour = cardlike['colour'] || null;
  var id = cardlike['id'];
  if (!id) {
    throw 'Missing id for card';
  }
  self.has_id = function(queried_id) {
    return id == queried_id;
  }

  self.move_to = function(left, top) {
    card_view.move(left, top);
  }

  function all(arr, fn) {
    arr.forEach(function(el) {  fn(el); });
  }

  var IMG_PREFIX = 'img: ';
  var IMG_DATA_PREFIX = 'data:image';
  var card_image = null;
  
  function convertTextCardToImage(image_url) {
    card_view.image(image_url, 100, 60)
  };

  function refreshCard() {
    if (logical.text.substring(0, IMG_PREFIX.length) === IMG_PREFIX) {
      card_image = logical.text.substring(IMG_PREFIX.length);
      convertTextCardToImage('images/' + card_image);
    }
    else if (logical.text.indexOf(IMG_DATA_PREFIX) == 0) {
      convertTextCardToImage(logical.text);
    }
    else {
      if (card_image !== null) {
        card_view.pop()
        card_image = null;
        div.text(logical.text);
      }
    }
  };
  
  this.data = function() {
    return logical.data();
  };

  function accessor(name, new_value) {
    if (new_value === undefined) {
      return self[name];
    }
    self[name] = new_value;
  }

  this.text = function() {
    return logical.text;
  };

  this.matches = function(term) {
    return logical.matches(term)
  }

  var card_view = create_card_view(logical);

  this.display_as = card_view.display_as.bind(card_view)
  this.display_as_not = card_view.display_as_not.bind(card_view)

  refreshCard();
  card_view.card = self;
};
