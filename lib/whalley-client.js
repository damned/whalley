var whalley = {};
whalley.cookies = {
    write_properties: function (id, data) {
      for (var key in data) {
        $.cookie('' + id + '-' + key, value);
      }
    },
    read_property: function (id, key) {
      return $.cookie('' + id + '-' + key);
    },
    write: function (key, value) {
      $.cookie(key, JSON.stringify(value));
    },
    read: function (key) {
      return JSON.parse($.cookie(key));
    },
    pull: function() {}, // already pulled
    begin: function () {},
    commit: function () {} // committed on write
};

var whalley_server_temp;
whalley.server = {
    write_properties: function (id, data) {
      whalley_server_temp['cards'][id] = data;
    },
    read_property: function (id, key) {
      if (whalley_server_temp['cards'][id] === undefined) {
        return null;
      }
      return whalley_server_temp['cards'][id][key];
    },
    write: function (key, value) {
      if (whalley_server_temp['meta'] === undefined) {
        whalley_server_temp['meta'] = {};
      }
      whalley_server_temp['meta'][key] = value
    },
    read: function (key) {
      return whalley_server_temp['meta'][key];
    },
    begin: function () { 
      whalley_server_temp = {};
      whalley_server_temp['meta'] = {};
      whalley_server_temp['cards'] = {};
    },
    commit: function () { 
      var json = JSON.stringify(whalley_server_temp, undefined, 2);
      $.ajax({
        'url': '/write',
        'type': 'POST',
        'data': json
      });
    },
    pull: function (callback) {
      $.getJSON('/read', function(data) {
        whalley_server_temp = data;
        callback();
      });
    }
};
whalley.server.begin();

whalley.options = {
  jaunty: true
};


var canvas = new fabric.Canvas('wall');
canvas.backgroundColor = 'rgb(200, 200, 200)';

canvas.observe('object:selected', function (event) {
  var fabric_object = event.target;
  fabric_object.bringToFront();
  fabric_object.get('card').reangle();
});

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
  whalley.cookies.write('password', password);
}

function load_password() {
  return whalley.cookies.read('password');
}

function Card(params) {
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
  
  var fabricRect = new fabric.Rect({ width: 100, height: 60, fill: 'rgb(200, 200, 100)' });
  fabricRect.hasControls = false;
  var fabricShadow = new fabric.Rect({ width: 100, height: 60, fill: 'rgb(100, 100, 50)', top: shadow_size, left: shadow_size });
  fabricShadow.hasControls = false;
  
  var fabricText = new fabric.Text(
    (self.is_lowfi() ? '' : '#' + id + '\n') 
      + text.substring(0, line_length).trim() + '\n' 
      + text.substring(line_length, line_length * 2).trim(), 
    { 
      width: 50, 
      height: 20, 
      textAlign: "left", 
      fontSize: 14 
    });
  
  self.reangle = function () {
    self.angle((Math.random() * 4) - 2);
  };
  
  fabricText.hasControls = false;
  fabricText.useNative = true;
  var fabricGroup = new fabric.Group([ fabricShadow, fabricRect, fabricText ], {top: 150, left: 150});
  fabricGroup.hasControls = false;
  
  fabricGroup.set('card', self);
  
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
    var data = {
      id: id,
      left: self.left(),
      top: self.top(),
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

    if (left != null) {
      self.left(left);
    }
    if (top != null) {
      self.top(top);
    }
    if (self.is_lowfi()  && text != null) {
      self.text(text);
    };

    if (whalley.options.jaunty) {
      self.reangle();
    };
  };
};

var cards = [];

function draw_cards(data) {
  cards = [];
  for (var card_id in data['cards']) {
    var single_card_data = data['cards'][card_id];
    cards.push(new Card({
      id: single_card_data['id'], 
      text: single_card_data['text']
    }));
  };
  cards.forEach(function(card, i) {
    card.left(card.left() + i * 50);
    card.add_to(canvas);
  });
  restore_cards();
};

var save_cards = function() {
  store.begin();
  var lowfi_card_ids = [];
  cards.forEach(function(card) {
    card.save(store.write_properties);
    if (card.is_lowfi()) {
      lowfi_card_ids.push(card.id());
    }
  });
  if (lowfi_card_ids.length > 0) {
    console.log('saving lowfi_card_ids: .' + lowfi_card_ids + '.');
    store.write('lowfi-card-ids', lowfi_card_ids);
  }
  store.commit();
}

var restore_cards = function() {
  store.pull(function() {
    load_lowfi_cards();
    cards.forEach(function(card) {
      card.restore(store.read_property);
    });
    canvas.renderAll();
  });
}

var load_lowfi_cards = function() {
  console.log('trying to load lowfi cards...');
  var lowfi_card_ids = store.read('lowfi-card-ids');
  if (lowfi_card_ids === null || lowfi_card_ids === undefined) {
    return;
  };
  console.log('lowfi card ids: ' + lowfi_card_ids);
  lowfi_card_ids.forEach(function(id) {
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

//var store = whalley.cookies;
var store = whalley.server;

var save_interval = setInterval(function() { if (cards.length > 0) save_cards(); }, 5000);


