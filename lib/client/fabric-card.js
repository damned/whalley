function FabricCard(params, canvas) {
  var colour = whalley.colour_wheel.colour();
  var log = whalley.log;
  var self = this;
  
  this.new_lowfi_id = function() {
    return - Math.floor(Math.random() * 1000000) - 1;
  }
  this.is_lowfi = function() {
    return id < 0;
  }
  var line_length = 17;
  var shadow_size = 2;

  var type = params['type'] || 'text';
  var image_src = params['image_src'] || null;
  var text = params['text'] || '';
  var width = params['width'] || 100;
  var height = params['height'] || 60;
  var status = params['status'] || null;
  var source = params['source'] || null;
  var notification = params['notification'] || null;
  var id = params['id'] || self.new_lowfi_id();
  var last_modification_status = params['last_modification_status'] || null;

  self.has_id = function(queried_id) {
    return id == queried_id;
  }

  self.move_to = function(x, y) {
    self.x(x);
    self.y(y);
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

  var IMG_PREFIX = 'img: ';
  var IMG_DATA_PREFIX = 'data:image';
  function convertTextCardToImage(image_url) {
    fabric.Image.fromURL(image_url, function (image) {
      var outer_width = 100 
      var outer_height = 60
      var containment_scale = Math.min(outer_width / image.getWidth(), outer_height / image.getHeight())
      image.setScaleX(containment_scale)
      image.setScaleY(containment_scale)
      var width = outer_width * containment_scale
      var height = outer_height * containment_scale
      rectangle = new fabric.Rect({ width: width, height: height, fill: colour });
      set_shadow = new fabric.Rect({ width: width, height: height, fill: 'rgb(100, 100, 50)', top: shadow_size, left: shadow_size });
      card_group.forEachObject(function(o) { card_group.remove(o); });
      card_group.setWidth(outer_width)
      card_group.setHeight(outer_height)
      card_group.add(set_shadow);
      card_group.add(rectangle);
      card_group.add(image)
      canvas.renderAll();
    });
  };

  function refreshCard() {
    if (type == 'image') {
      convertTextCardToImage(image_src);
    }
    else { // text
      var oneline = text.replace(/\n/g, ' ');
      textbox.setText(oneline.substring(0, line_length).trim() + '\n'
                      + oneline.substring(line_length, line_length * 2).trim());
    }
  };
  
  this.setColour = function(new_colour) {
    colour = new_colour;
    rectangle.setFill(colour);
  }

  var rectangle = new fabric.Rect({ width: width, height: 60, fill: 'rgb(200, 200, 100)' });
  var shadow = new fabric.Rect({ width: width, height: 60, fill: 'rgb(100, 100, 50)', top: shadow_size, left: shadow_size });
  
  self.rectangle = rectangle;
  
  var textbox = new fabric.Text('', 
    { 
      width: 50, 
      height: 20, 
      textAlign: "left", 
      fontSize: 12,
      fontFamily: 'trebuchet ms'
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


  this.x = function(new_value) { return accessor('left', new_value) };
  this.y = function(new_value) { return accessor('top', new_value) };
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

  this.add_to = function(canvas) {
    canvas.add(card_group);
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
      x: self.x(),
      y: self.y(),
      colour: colour,
      text: self.text(),
      width: width,
      height: height
    }

    add_if_exists(data, 'last_modification_status');
    add_if_exists(data, 'source');
    add_if_exists(data, 'notification');

    return data;
  };

  this.restore = function(cardlike) {
    var x = cardlike.x;
    var y = cardlike.y;
    var text = cardlike.text;
    var colour = cardlike.colour;
    var last_modification_status = cardlike.last_modification_status;

    if (x != null) {
      self.x(x);
    }
    if (y != null) {
      self.y(y);
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
    self.set_shadow(2);
  };

  this.on_moved = function() {
    self.set_shadow(0);
  };
};
