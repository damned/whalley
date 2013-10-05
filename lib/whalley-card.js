function Card(params) {
  var colour = whalley.colour_wheel.colour();
  var self = this;
  
  this.new_lowfi_id = function() {
    return - Math.floor(Math.random() * 1000000) - 1;
  }
  this.is_lowfi = function() {
    return id < 0;
  }
  var line_length = 14;
  var shadow_size = 2;
  
  var text = params['text'] || '';
  var id = params['id'] || self.new_lowfi_id();
  
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
  var card_image = null;
  function convertTextCardToImage(image_url) {
    fabric.Image.fromURL(image_url, function (image) {
      rectangle = new fabric.Rect({ width: image.getWidth(), height: image.getHeight(), fill: colour });
      shadow = new fabric.Rect({ width: image.getWidth(), height: image.getHeight(), fill: 'rgb(100, 100, 50)', top: shadow_size, left: shadow_size });
      card_group.forEachObject(function(o) { card_group.remove(o); });
      card_group.add(shadow);
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
    else {
      if (card_image !== null) {
        card_group.pop()
        card_image = null;
      }
      textbox.setText((self.is_lowfi() ? '' : '#' + id + '\n') 
        + text.substring(0, line_length).trim() + '\n' 
        + text.substring(line_length, line_length * 2).trim());
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
      fontSize: 14 
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
    };
    store(id, data);
  };

  this.restore = function(load) {
    var left = load(id, 'left');
    var top = load(id, 'top');
    var text = load(id, 'text');
    var colour = load(id, 'colour');

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
    self.reangle();
  };
};
