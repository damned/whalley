function Card(params) {
  var colour = whalley.colour_wheel.colour();
  var log = whalley.log;
  var self = this;
  
  this.new_lowfi_id = function() {
    return - Math.floor(Math.random() * 1000000) - 1;
  }
  this.is_lowfi = function() {
    return id < 0;
  }
  var line_length = 21;
  var shadow_size = 2;

  var type = params['type'] || 'text';
  var text = params['text'] || '';
  var status = params['status'] || '';
  var id = params['id'] || self.new_lowfi_id();
  var last_modification_status = params['last_modification_status'] || status;

  self.has_id = function(queried_id) {
    return id == queried_id;
  }

  self.move_to = function(left, top) {
    self.left(left);
    self.top(top);
    card_group.setCoords();
    canvas.renderAll();
  }

  function all(arr, fn) {
    arr.forEach(function(el) {  fn(el); });
  }

  var lockdown = function(fabric_object) {
    fabric_object.hasControls = false;
    fabric_object.lockScalingX = fabric_object.lockScalingY = true;
  }
  
  function getText() {
    return text;
  }

  var IMG_PREFIX = 'img: ';
  var IMG_DATA_PREFIX = 'data:image';
  var card_image = null;
  function convertTextCardToImage(image_url) {
    fabric.Image.fromURL(image_url, function (image) {
      rectangle = new fabric.Rect({ width: image.getWidth(), height: image.getHeight(), fill: colour });
      set_shadow = new fabric.Rect({ width: image.getWidth(), height: image.getHeight(), fill: 'rgb(100, 100, 50)', top: shadow_size, left: shadow_size });
      card_group.forEachObject(function(o) { card_group.remove(o); });
      card_group.add(set_shadow);
      card_group.add(rectangle);
      card_group.add(image)
      canvas.renderAll();
    });
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
      }
      var oneline = text.replace(/\n/g, '');
      textbox.setText((self.is_lowfi() ? '' : '#' + id + '\n')
        + oneline.substring(0, line_length).trim() + '\n'
        + oneline.substring(line_length, line_length * 2).trim());
    }
  };
  
  this.setColour = function(new_colour) {
    colour = new_colour;
    rectangle.setFill(colour);
  }

  var rectangle = new fabric.Rect({ width: 100, height: 60, fill: 'rgb(200, 200, 100)' });
  var shadow = new fabric.Rect({ width: 100, height: 60, fill: 'rgb(100, 100, 50)', top: shadow_size, left: shadow_size });
  
  self.rectangle = rectangle;
  
  var textbox = new fabric.Text('', 
    { 
      width: 50, 
      height: 20, 
      textAlign: "left", 
      fontSize: 12,
      fontFamily: 'ubuntu condensed'
    });
  
  self.reangle = function () {
    if (whalley.options.jaunty) {
      self.angle((Math.random() * 4) - 2);
    }
  };
  
  var card_objects = [ shadow, rectangle, textbox ];
  
  textbox.useNative = true;
  var card_group = new fabric.Group(card_objects, {top: 150, left: 150});

  refreshCard();

  all(card_objects, lockdown)
  lockdown(card_group)
  
  card_group.set('card', self);
  
  this.id = function() {
    return id;
  };
  
  function accessor(name, new_value) {
    if (new_value === undefined) {
      if (canvas.getActiveGroup() && canvas.getActiveGroup().contains(card_group)) {
        return canvas.getActiveGroup().get(name) + card_group.get(name);
      }
      return card_group.get(name);
    }
    card_group.set(name, new_value);
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

  this.text = function(new_value) {
    if (new_value === undefined) {
      return text;
    }
    text = new_value;
    refreshCard();
  };

  this.add_to = function(canvas) {
    canvas.add(card_group);
  };

  this.save = function(store) {
    var data = {
      id: id,
      left: self.left(),
      top: self.top(),
      colour: colour
    }
    if (self.is_lowfi()) {
      data.text = self.text();
    }
    else {
      data.last_modification_status = self.last_modification_status();
    }
    store(id, data);
  };

  this.restore = function(load) {
    var left = load(id, 'left');
    var top = load(id, 'top');
    var text = load(id, 'text');
    var colour = load(id, 'colour');
    var last_modification_status = load(id, 'last_modification_status');

    if (left != null) {
      self.left(left);
    }
    if (top != null) {
      self.top(top);
    }
    if (self.is_lowfi()  && text != null) {
      self.text(text);
    };
    if (colour != null) {
      self.setColour(colour);
    }
    if (last_modification_status != null) {
      self.last_modification_status(last_modification_status);
    }
    self.reangle();
  };

  var set_shadow = function(size) {
    shadow.left = shadow.top = size;
    log.debug('set shadow to: ' + size);
  }

  var spangling;
  this.spangle = function() {
    spangling = true;
    interval = 200;
    setTimeout(function animate() {
      var cycle_time = 2000;
      var count_in_cycle = (Date.now() % cycle_time);
      var radians = Math.PI * 2 * count_in_cycle / cycle_time;
      var sine = Math.sin(radians);
      set_shadow((sine + 1) * shadow_size * 2);
      canvas.renderAll();
      if (spangling) {
        setTimeout(animate, interval);
      }
    }, interval);
  }
  this.unspangle = function() {
    spangling = false;
  }
  this.on_modify = function() {
    if (!self.is_lowfi()) { // from external source
      self.last_modification_status(status)
      self.unspangle();
    }
  }
  this.status_changed = function() {
    return !self.is_lowfi() && (self.status() != self.last_modification_status());
  }
};
