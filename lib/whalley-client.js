var whalley = {};
whalley.cookies = {
    write_property: function (id, key, value) {
      $.cookie('' + id + '-' + key, value);
    },
    read_property: function (id, key) {
      return $.cookie('' + id + '-' + key);
    },
    write: function (key, value) {
      $.cookie(key, value);
    },
    read: function (key) {
      return $.cookie(key);
    }
};
whalley.options = {
  jaunty: true
};


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
  store.write('password', password);
}

function load_password() {
  return store.read('password');
}

function Card(params) {
  var self = this;
  
  this.new_local_id = function() {
    return - Math.floor(Math.random() * 1000000) - 1;
  }
  this.is_local = function() {
    return id < 0;
  }
  var line_length = 14;
  var shadow_size = 2;
  
  var text = params['text'] || '';
  var id = params['id'] || self.new_local_id();
  
  var fabricRect = new fabric.Rect({ width: 100, height: 60, fill: 'rgb(200, 200, 100)' });
  fabricRect.hasControls = false;
  var fabricShadow = new fabric.Rect({ width: 100, height: 60, fill: 'rgb(100, 100, 50)', top: shadow_size, left: shadow_size });
  fabricShadow.hasControls = false;
  
  var fabricText = new fabric.Text(
    (self.is_local() ? '' : '#' + id + '\n') 
      + text.substring(0, line_length).trim() + '\n' 
      + text.substring(line_length, line_length * 2).trim(), 
    { 
      width: 50, 
      height: 20, 
      textAlign: "left", 
      fontSize: 14 
    });
  
  
  fabricText.hasControls = false;
  fabricText.useNative = true;
  var fabricGroup = new fabric.Group([ fabricShadow, fabricRect, fabricText ], {top: 150, left: 150});
  fabricGroup.hasControls = false;
  
  this.id = function() {
    return id;
  };
  
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

  this.angle = function(new_value) {
    if (new_value === undefined) {
      return fabricGroup.getAngle();
    }
    fabricGroup.setAngle(new_value);
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
  
  this.save = function(store) {
    store(id, 'left', self.left());
    store(id, 'top', self.top());
    if (self.is_local()) {
      store(id, 'text', self.text());
    };
  };

  this.restore = function(store) {
    var left = store(id, 'left');
    var top = store(id, 'top');
    var text = store(id, 'text');

    if (left != null) {
      self.left(left);
    }
    if (top != null) {
      self.top(top);
    }
    if (self.is_local()) {
      self.text(text);
    };

    if (whalley.options.jaunty) {
      var angle = (Math.random() * 4) - 2;
      self.angle(angle);
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
  load_local_cards();
  restore_cards();
};

var save_cards = function() {
  var local_card_ids = [];
  cards.forEach(function(card) {
    card.save(store.write_property);
    if (card.is_local()) {
      local_card_ids.push(card.id());
    }
  });
  if (local_card_ids.length > 0) {
    console.log('saving local_card_ids: .' + local_card_ids + '.');
    store.write('local-card-ids', local_card_ids);
  }
}

var restore_cards = function() {
  cards.forEach(function(card) {
    card.restore(store.read_property);
  });
  canvas.renderAll();
}

var load_local_cards = function() {
  console.log('trying to load local cards...');
  var local_card_ids = store.read('local-card-ids');
  if (local_card_ids === null || local_card_ids === '') {
    return;
  };
  console.log('local card ids: .' + local_card_ids + '.');
  local_card_ids.split(',').forEach(function(id) {
    var card = add_card_to_wall({ id: id}, 200);
  });
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
  return card;
}

var store = whalley.cookies;
setInterval(save_cards, 2000);


