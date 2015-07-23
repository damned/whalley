var pseudoid = 0;

function SvgCard(cardlike, svg) {
  var log = whalley.log;
  var self = this;
  var div, div_id;

  function pseudocard(logical) {
    var width = 100;
    var height = 60;
    var top_gutter = 2;
    var border_size = 2;
    var both_borders_size = 2 * border_size;
    var inner_width = width - both_borders_size;
    var inner_height = height - both_borders_size - top_gutter;
    var half_width = width / 2;
    var half_height = height / 2;
    var group = svg.group(width, height);
    group.size(width, height);
    var fo = group.foreignObject(width, height);
    pseudoid += 1;
    div_id = 'card' + pseudoid;
    fo.appendChild('div', {id: div_id})

    div = $('#' + div_id);
    div.text(logical.text());
    div.addClass('card');
    div.css({
      'padding-top': top_gutter + 'px',
      border: '' + border_size + 'px solid gray',
      'min-width': '' + inner_width + 'px',
      'max-width': '' + inner_width + 'px',
      'min-height': '' + inner_height + 'px',
      'max-height': '' + inner_height + 'px'
    });
    group.move(logical.left() - half_width, logical.top() - half_height);
    if (colour !== null) {
      div.css({ 'background-color': colour});
    }
    group.draggable();
    group.on('dragstart', function() {
      this.front();
    });
    var external = {
      move: group.move.bind(group),
      image: function(image_src) {
        group.image(image_src)
        group.removeElement(fo)
      }
    };
    div.mouseenter(function() {
      console.log(JSON.stringify(external.card.data()));
    });
    return external;
  }

  var line_length = 21;
  var shadow_size = 2;

  var logical = new whalley.LogicalCard(cardlike);
  var type = cardlike['type'] || 'text';
  var status = cardlike['status'] || null;
  var source = cardlike['source'] || null;
  var colour = cardlike['colour'] || null;
  var id = cardlike['id'];
  if (!id) {
    throw 'Missing id for card';
  }
  var last_modification_status = cardlike['last_modification_status'] || null;

  self.has_id = function(queried_id) {
    return id == queried_id;
  }

  self.move_to = function(left, top) {
    logical.move_to(left, top);
    card_group.move(left, top);
  }

  function all(arr, fn) {
    arr.forEach(function(el) {  fn(el); });
  }

  var IMG_PREFIX = 'img: ';
  var IMG_DATA_PREFIX = 'data:image';
  var card_image = null;
  function convertTextCardToImage(image_url) {
    card_group.image(image_url)
  };

  function refreshCard() {
    if (logical.text().substring(0, IMG_PREFIX.length) === IMG_PREFIX) {
      card_image = logical.text().substring(IMG_PREFIX.length);
      convertTextCardToImage('images/' + card_image);
    }
    else if (logical.text().indexOf(IMG_DATA_PREFIX) == 0) {
      convertTextCardToImage(logical.text());
    }
    else {
      if (card_image !== null) {
        card_group.pop()
        card_image = null;
        div.text(logical.text());
      }
    }
  };
  
  this.setColour = function(new_colour) {
    colour = new_colour;

  }

  var textbox =
    { 
      width: 50, 
      height: 20, 
      textAlign: "left", 
      fontSize: 12,
      fontFamily: 'ubuntu condensed'
    };
  
  self.reangle = function () {
    if (whalley.options.jaunty) {
 //     self.angle((Math.random() * 4) - 2);
    }
  };
  this.data = function() {
    function add_if_exists(data, property) {
      var value = self[property].apply();
      if (value !== null && value !== undefined && value !== '') {
        data[property] = value;
      }
    }

    var data = {
      id: id,
      left: logical.left(),
      top: logical.top(),
      colour: colour,
      text: logical.text()
    }

    add_if_exists(data, 'last_modification_status');
    add_if_exists(data, 'source');
    add_if_exists(data, 'notification');

    return data;
  };

  function accessor(name, new_value) {
    if (new_value === undefined) {
      return self[name];
    }
    self[name] = new_value;
  }

  this.angle = function(new_value) { return accessor('angle', new_value) };
  this.last_modification_status = function(new_value) {
    if (new_value) {
      last_modification_status = new_value
    }
    else {
      return last_modification_status;
    }
  };

  this.status = function() {
    return status;
  }

  this.source = function() {
    return source;
  }

  this.notification = logical.notification;

  this.text = function(new_value) {
    if (new_value === undefined) {
      return logical.text();
    }
    logical.text(new_value);
    refreshCard();
  };


  var card_group = pseudocard(logical);



  refreshCard();

  card_group.card = self;
  
  this.id = function() {
    return id;
  };

  this.save = function(store) {
    store(id, self.data());
  };

  this.restore = function(cardlike) {
    var colour = cardlike.colour;
    var last_modification_status = cardlike.last_modification_status;

    if (colour != null) {
      self.setColour(colour);
    }
    if (last_modification_status !== null && last_modification_status !== undefined) {
      self.last_modification_status(last_modification_status);
    }
    self.reangle();
  };

  this.set_shadow = function(raw_size) {
    var size = raw_size * shadow_size;
    shadow.left = shadow.top = size;
    log.debug('set shadow to: ' + size);
  }

  var spangling = false;
  this.spangle = function() {
    spangling = true;
  };

  this.unspangle = function() {
    spangling = false;
  };

  this.spangling = function() {
    return spangling;
  };

  self.notification_message = logical.notification_message;

  this.on_moving = function() {
    self.last_modification_status(status)
    logical.notification_made();
    self.unspangle();
    //self.set_shadow(2);
  };

  this.on_moved = function() {
    //self.set_shadow(0);
  };

};
