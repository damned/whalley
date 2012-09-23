var canvas = new fabric.Canvas('wall');
canvas.backgroundColor = 'rgb(200, 200, 200)';

var fetch_cards = function(username, password) {
  if (password === '') {
    save_password(password);
    alert('password cleared');
  }
  var card_data = $.getJSON('fetch_cards?password=' + password + '&username=' + username, function(card_data) {
    draw_cards(card_data);
    save_password(password);
  });
};

function save_password(password) {
  $.cookie('password', password);
}

function load_password() {
  return $.cookie('password');
}

function Card(params) {
  var self = this;
  
  this.new_local_id = function() {
    return - Math.floor(Math.random() * 1000000) - 1;
  }
  this.is_local = function() {
    return id < 0;
  }
  
  var text = params['text'];
  var id = params['id'] || self.new_local_id();
  
  var fabricRect = new fabric.Rect({ width: 100, height: 60, fill: 'rgb(200, 200, 100)' });
  fabricRect.hasControls = false;
  
  var fabricText = new fabric.Text(
    (self.is_local() ? '' : '#' + id + '\n') 
      + text.substring(0, 14).trim() + '\n' 
      + text.substring(14, 28).trim(), 
    { 
      width: 50, 
      height: 20, 
      textAlign: "left", 
      fontSize: 14 
    });
  
  
  fabricText.hasControls = false;
  fabricText.useNative = true;
  var fabricGroup = new fabric.Group([ fabricRect, fabricText ], {top: 150, left: 150});
  fabricGroup.hasControls = false;
  
  this.left = function(new_value) {
    if (new_value === undefined) {
      return fabricGroup.getLeft();
    }
    fabricGroup.setLeft(new_value);
  };
  
  this.top = function(new_value) {
    if (new_value === undefined) {
      return fabricGroup.getTop();
    }
    fabricGroup.setTop(new_value);
  };

  this.text = function(new_value) {
    if (new_value === undefined) {
      return fabricText.getText();
    }
    fabricText.setText(new_value);
  };
  
  this.add_to = function(canvas) {
    canvas.add(fabricGroup);
  };
  
  this.save = function() {
    $.cookie('' + id + '-left', self.left());
    $.cookie('' + id + '-top', self.top());
    if (self.is_local()) {
      $.cookie('' + id + '-text', self.text());
    };
  };

  this.load = function() {
    var left = $.cookie('' + id + '-left');
    var top = $.cookie('' + id + '-top');
    var text = $.cookie('' + id + '-text');
    if (left != null) {
      self.left(left);
    }
    if (top != null) {
      self.top(top);
    }
    if (self.is_local()) {
      self.text(text);
    };
  };
};

var cards = [];

function draw_cards(card_data) {
  cards = [];
  card_data.forEach(function(single_card_data) {
    cards.push(new Card({
      id: single_card_data['Number'], 
      text: single_card_data['Name']
    }));
  });
  cards.forEach(function(card, i) {
    card.left(card.left() + i * 50);
    card.add_to(canvas);
  });
  restore_cards();
};

var save_cards = function() {
  cards.forEach(function(card) {
    card.save();
  });
}

var restore_cards = function() {
  cards.forEach(function(card) {
    card.load();
  });
  canvas.renderAll();
}


var add_new_card = function(text) {
  add_card_to_wall({
    text: text
  }, 20);
}

var add_card_to_wall = function(params, left) {
  var card = new Card(params);
  cards.push(card);
  card.left(left);
  card.add_to(canvas);
}

setInterval(save_cards, 2000);
console.log('setted the interval');

