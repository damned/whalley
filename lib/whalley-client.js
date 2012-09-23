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

function Card(number, name) {
  var self = this;
  var card = new fabric.Rect({ width: 100, height: 60, fill: 'rgb(200, 200, 100)' });
  card.hasControls = false;
  var text = new fabric.Text('#' + number + '\n' + name.substring(0, 14).trim() + '\n' + name.substring(14, 28).trim(), { width: 50, height: 20, textAlign: "left", fontSize: 14 });
  text.hasControls = false;
  text.useNative = true;
  var group = new fabric.Group([ card, text ], {top: 150, left: 150});
  group.hasControls = false;
  
  this.left = function(new_value) {
    if (new_value === undefined) {
      return group.getLeft();
    }
    group.setLeft(new_value);
  };
  
  this.top = function(new_value) {
    if (new_value === undefined) {
      return group.getTop();
    }
    group.setTop(new_value);
  };
  
  this.add_to = function(canvas) {
    canvas.add(group);
  };
  
  this.save = function() {
    $.cookie('' + number + '-left', self.left());
    $.cookie('' + number + '-top', self.top());
  };

  this.load = function() {
    var left = $.cookie('' + number + '-left');
    var top = $.cookie('' + number + '-top');
    if (left != null) {
      self.left(left);
    }
    if (top != null) {
      self.top(top);
    }
  };
};

var cards = [];

function draw_cards(card_data) {
  cards = [];
  card_data.forEach(function(single_card_data) {
    cards.push(new Card(single_card_data['Number'], single_card_data['Name']));
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

setInterval(save_cards, 2000);
console.log('setted the interval');

