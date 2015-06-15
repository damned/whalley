var whalley = whalley || {}

whalley.FabricWall = function() {

  var log = whalley.log;
  var card_change_listeners = [];
  var self = this;

  Object.defineProperty(whalley, 'options', {
    get: function() {
      default_options = {
        jaunty: true,
        autosave: true
      };
      return whalley.ui === undefined ? default_options : whalley.ui;
    }
  });

  var canvas = new fabric.Canvas('wall');
  canvas.setBackgroundImage('images/paper.jpg', null, {
    backgroundImageStretch: true,
    backgroundImageOpacity: 0.7
  });

  canvas.observe('object:selected', function (event) {
    if (event.target !== undefined) {
      event.target.bringToFront();
      var card = event.target.get('card');
      if (card) {
        card.reangle();
        if (card.status_changed()) {
          alert(status_change_message(card));
        }
      }
    }
  });
  debug_event = function (event) {
    whalley.log.log(event.e.type);
  };
  canvas.observe('mouse:down', debug_event);
  canvas.observe('mouse:up', debug_event);
  canvas.observe('mouse:out', debug_event);
  canvas.observe('mouse:over', debug_event);
  canvas.observe('mouse:move', debug_event);

  canvas.observe('selection:created', function (event) {
    event.target.hasControls = false;
  });

  this.card_changed = function(card) {
    card_change_listeners.forEach(function(listener) {
      listener(card);
    })
  }

  canvas.observe('object:modified', function (event) { // TODO move into card
    if (event.target) {
      var card = event.target.get('card');
      if (card === undefined) {
        log.debug('ignoring modification of non-card');
        return;
      }
      self.card_changed(card);
      if (card) {
        card.on_modify();
      }
    }
  });

  var cards = [];

  function update_card(card_data) {
    cards.forEach(function(card) {
      var id = card_data.id;
      if (card.has_id(id)) {
        card.move_to(card_data.left, card_data.top);
      }
    });
  }

  function draw_cards(data) {
    cards = [];
    for (var card_id in data.cards) {
      var single_card_data = data.cards[card_id];
      cards.push(new Card({
        id: single_card_data.id,
        text: single_card_data.text,
        status: single_card_data.status
      }, canvas));
    };
    cards.forEach(function(card, i) {
      card.left(card.left() + i * 50);
      card.add_to(canvas);
    });
    restore_cards();
  };

  var save_cards = function(wall_id) {
    if (cards.length === 0) {
      return false;
    }
    store.begin(wall_id);
    var lowfi_card_ids = [];
    cards.forEach(function(card) {
      card.save(store.write_properties);
      if (card.is_lowfi()) {
        lowfi_card_ids.push(card.id());
      }
    });
    store.write('lowfi-card-ids', lowfi_card_ids);
    store.commit();
  }

  function status_change_message(card) {
    return 'Card #' + card.id() + " is now '" + card.status() + "' but was '" + card.last_modification_status() + "'";
  }
  function spangle_updated_cards(cards) {
    cards.forEach(function (card) {
      if (card.status_changed()) {
        console.log(status_change_message(card));
        card.spangle();
      }
    });
  }
  var restore_cards = function() {
    store.pull(whalley.options.wall_id, function() {
      load_lowfi_cards();
      cards.forEach(function(card) {
        card.restore(store.read_property);
      });
      spangle_updated_cards(cards);
      canvas.renderAll();
    });
  }

  function dedupe(source_array) {
    var keyset = {}, deduped = [];
    source_array.forEach(function(el) { keyset[el] = '' });
    for (var k in keyset) { deduped.push(k) }
    return deduped;
  }

  var load_lowfi_cards = function() {
    console.log('trying to load lowfi cards...');
    var card_ids = store.read('lowfi-card-ids');
    console.log("card ids: '" + card_ids + "'");
    var lowfi_card_ids = dedupe(card_ids);
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
    var card = new Card(params, canvas);
    cards.push(card);
    card.left(left);
    card.add_to(canvas);
    return card;
  }

  var store = whalley.server;

  whalley.colour_wheel = new ColourWheel(canvas);

  var last_image_data;
  var image_capture = whalley.image_capture();
  image_capture.on_snapshot(function(data) {
    last_image_data = data;
    image_capture.hide();
    add_new_card(data);
  }, alert);


  return {
    start: function() {
      log.log('bingo!');
    },
    draw_cards: draw_cards,
    save_cards: save_cards,
    update_card: update_card,
    on_card_change: function(listener) {
      card_change_listeners.push(listener);
    }
  }
}

function save_password(password) {
  whalley.cookies.write('password', password);
}

function load_password() {
  return whalley.cookies.read('password');
}

function save_wall_id(wall_id) {
  return whalley.cookies.write('wall-id', wall_id);
}

function load_wall_id() {
  return whalley.cookies.read('wall-id');
}

var save_interval = setInterval(function() {
  if (whalley.options.autosave) {
    var wall_id = whalley.options.wall_id;
    if (visible_wall.save_cards(wall_id)) {
      save_wall_id(wall_id);
    }
  }
}, 2000);

var fetch_cards = function(username, password, cards_handler) {
  $.getJSON('fetch_cards?password=' + password + '&username=' + username, cards_handler);
};

var load_wall = function(ui) {
  whalley.ui = ui;
  var auth_info = ui;
  var username = auth_info.username;
  var password = auth_info.password;
  if (password === '') {
    save_password('');
    whalley.log.log('password cleared');
  }
  fetch_cards(username, password, function(card_data) {
    visible_wall.draw_cards(card_data);
    save_password(password);
  });
  save_wall_id(ui.wall_id);
};

whalley.SocketIoSyncClient = function(wall) {
  var socket = io();
  var external = {
    card_changed: function (card) {
      socket.emit('card.update', card.data());
    }
  };

  wall.on_card_change(external.card_changed)

  socket.on('card.update', function(card_data) {
    wall.update_card(card_data);
  });

  return external
}

var visible_wall = whalley.FabricWall();
var sync_client = whalley.SocketIoSyncClient(visible_wall);
visible_wall.start();

