var pseudoid = 0;

function SvgCard(params, svg) {
  var log = whalley.log;
  var self = this;
  var div, div_id;

  function pseudocard(x, y) {
    var group = svg.group();
    var width = 80;
    var height = 40;
    group.size(width, height);
    var fo = group.foreignObject();
    pseudoid += 1;
    div_id = 'card' + pseudoid;
    fo.appendChild('div', {id: div_id})

    div = $('#' + div_id);
    div.text(text);
    div.addClass('card');
    div.css({
      border: '2px solid gray',
      'min-width': '' + width + 'px',
      'max-width': '' + width + 'px',
      'min-height': '' + height + 'px',
      'max-height': '' + height + 'px',
      'font-family': 'Trebuchet MS, Trebuchet, Arial',
      'font-size': 10
    });
    group.move(x, y);
    if (colour !== null) {
      div.css({ 'background-color': colour});
    }
    group.draggable();
    group.on('dragstart', function() {
      this.front();
    });
    div.mouseenter(function() {
      console.log(JSON.stringify(group.card.data()));
    });
    return group;
  }

  var line_length = 21;
  var shadow_size = 2;

  var type = params['type'] || 'text';
  var text = params['text'] || '';
  var status = params['status'] || null;
  var source = params['source'] || null;
  var left = params['left'] || null;
  var colour = params['colour'] || null;
  var top = params['top'] || null;
  var notification = params['notification'] || null;
  var id = params['id'];
  if (!id) {
    throw 'Missing id for card';
  }
  var last_modification_status = params['last_modification_status'] || null;

  self.has_id = function(queried_id) {
    return id == queried_id;
  }

  self.move_to = function(left, top) {
    card_group.move(left, top);
  }

  function all(arr, fn) {
    arr.forEach(function(el) {  fn(el); });
  }

  function getText() {
    return text;
  }

  var IMG_PREFIX = 'img: ';
  var IMG_DATA_PREFIX = 'data:image';
  var card_image = null;
  function convertTextCardToImage(image_url) {

  };

  function refreshCard() {
    if (text.substring(0, IMG_PREFIX.length) === IMG_PREFIX) {
      card_image = text.substring(IMG_PREFIX.length);
      convertTextCardToImage('images/' + card_image);
    }
    else if (text.indexOf(IMG_DATA_PREFIX) == 0) {
      convertTextCardToImage(text);
    }
    else {
      if (card_image !== null) {
        card_group.pop()
        card_image = null;
        div.text(text);
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
      left: left,
      top: top,
      colour: colour,
      text: self.text()
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

  this.left = function(new_value) { return accessor('left', new_value) };
  this.top = function(new_value) { return accessor('top', new_value) };
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

  this.notification = function() {
    return notification;
  }

  this.text = function(new_value) {
    if (new_value === undefined) {
      return text;
    }
    text = new_value;
    refreshCard();
  };


  var card_group = pseudocard(left, top);



  refreshCard();

  card_group['card'] = self;
  
  this.id = function() {
    return id;
  };

  this.save = function(store) {
    store(id, self.data());
  };

  this.restore = function(cardlike) {
    var left = cardlike.left;
    var top = cardlike.top;
    var text = cardlike.text;
    var colour = cardlike.colour;
    var last_modification_status = cardlike.last_modification_status;

    if (left != null) {
      self.left(left);
    }
    if (top != null) {
      self.top(top);
    }
    if (text != null) {
      self.text(text);
    };
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

  this.on_moving = function() {
    self.last_modification_status(status)
    notification = null;
    self.unspangle();
    //self.set_shadow(2);
  };

  this.on_moved = function() {
    //self.set_shadow(0);
  };

};
