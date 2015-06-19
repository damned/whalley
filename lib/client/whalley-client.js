var whalley = whalley || {}

whalley.FabricWall = function () {

  var log = whalley.log;

  function event() {
    var listeners = [];
    return {
      fire: function (subject) {
        listeners.forEach(function (listener) {
          listener(subject);
        })
      },
      listen: function (listener) {
        listeners.push(listener);
      }
    }
  }

  var events = {
    card_moving: event(),
    card_moved: event(),
    card_added: event()
  };
  var self = this;

  Object.defineProperty(whalley, 'options', {
    get: function () {
      default_options = {
        jaunty: true,
        autosave: true,
        live_move: true
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

  canvas.observe('object:modified', function (event) { // TODO move into card
    if (event.target) {
      var card = event.target.get('card');
      if (card === undefined) {
        log.debug('ignoring modification of non-card');
        return;
      }
      events.card_moved.fire(card);
      if (card) {
        card.on_modify();
      }
    }
  });
  if (whalley.options.live_move) {
    canvas.observe('object:moving', function (event) {
      if (event.target) {
        var card = event.target.get('card');
        if (card === undefined) {
          log.debug('ignoring movement of non-card');
          return;
        }
        events.card_moving.fire(card);
      }
    });
  }

  function CardsApi(cards) {
    return {
      add: function (cardlike) {
        var card = new Card(cardlike, canvas);
        cards.push(card);
        card.restore(cardlike);
        card.add_to(canvas);

        if (card.status_changed()) {
          console.log(status_change_message(card));
          card.spangle();
        }
      },
      clear: function () {
        cards.length = 0;
        canvas.clear();
      }
    }
  }

  var cards = [];
  var cards_api = CardsApi(cards)

  function move_card(card_data) {
    cards.forEach(function (card) {
      var id = card_data.id;
      if (card.has_id(id)) {
        card.move_to(card_data.left, card_data.top);
        return;
      }
    });
  }

  function build(builder) {
    cards_api.clear();
    builder(cards_api);
    canvas.renderAll();
  }

  var save_cards = function (wall_id) {
    if (cards.length === 0) {
      return false;
    }
    store.begin(wall_id);
    var lowfi_card_ids = [];
    cards.forEach(function (card) {
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

  var restore_cards = function () {
    store.pull(whalley.options.wall_id, function () {
      load_lowfi_cards();
      cards.forEach(function (card) {
        card.restore(store.read_property);
      });
      spangle_updated_cards(cards);
      canvas.renderAll();
    });
  }

  function dedupe(source_array) {
    var keyset = {}, deduped = [];
    source_array.forEach(function (el) {
      keyset[el] = ''
    });
    for (var k in keyset) {
      deduped.push(k)
    }
    return deduped;
  }

  var load_lowfi_cards = function () {
    console.log('trying to load lowfi cards...');
    var card_ids = store.read('lowfi-card-ids');
    console.log("card ids: '" + card_ids + "'");
    var lowfi_card_ids = dedupe(card_ids);
    if (lowfi_card_ids === null || lowfi_card_ids === undefined) {
      return;
    }
    ;
    console.log('lowfi card ids: ' + lowfi_card_ids);
    lowfi_card_ids.forEach(function (id) {
      var card = add_card_to_wall({id: id}, 200);
    });
  }

  var add_new_card = function (text) {
    add_card_to_wall({
      text: text
    }, 20);
  }

  var add_card_to_wall = function (params, left) {
    var card = new Card(params, canvas);
    cards.push(card);
    card.left(left);
    card.add_to(canvas);
    events.card_added.fire(card);
    return card;
  }

  var store = whalley.server;

  whalley.colour_wheel = new ColourWheel(canvas);

  var last_image_data;
  var image_capture = whalley.image_capture();
  image_capture.on_snapshot(function (data) {
    last_image_data = data;
    image_capture.hide();
    add_new_card(data);
  }, alert);


  return {
    start: function () {
      log.log('bingo!');
    },

    // @deprecated
    save_cards: save_cards,

    // builder api
    build: build,
    add_text_card: add_new_card,

    // modifier api
    move_card: move_card,
    on_card_add: events.card_added.listen,
    on_card_moving: events.card_moving.listen,
    on_card_moved: events.card_moved.listen
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

var fetch_mingle_cards = function (username, password, cards_handler) {
  $.getJSON('fetch_cards?password=' + password + '&username=' + username, cards_handler);
};

var load_wall = function (ui) {
  whalley.ui = ui;
  var auth_info = ui;
  var username = auth_info.username;
  var password = auth_info.password;
  if (password === '') {
    save_password('');
    whalley.log.log('password cleared');
  }
  sync_client.load_wall(ui.wall_id, function () {
    save_wall_id(ui.wall_id);
  });
};

var save_interval = setInterval(function () {
  if (whalley.options.autosave) {
    var wall_id = whalley.options.wall_id;

    // save_cards: externalize to sync client
    if (visible_wall.save_cards(wall_id)) {
      save_wall_id(wall_id);
    }
  }
}, 2000);

var add_new_card = function (text) {
  visible_wall.add_text_card(text);
}


whalley.SocketIoSyncClient = function (wall) {
  var socket = io();
  var last_wall_id;

  function upsync_wall() {
    visible_wall.save_cards(last_wall_id);
    socket.emit('wall.change', last_wall_id);
  }

  var external = {
    card_moving: function (card) {
      socket.emit('card.move', card.data());
    },
    card_moved: function (card) {
      upsync_wall();
    },
    card_added: function (card) {
      upsync_wall();
    },
    load_wall: function (wall_id, on_success) {
      whalley.server.fetch_wall(wall_id, function (wall_data) {
        visible_wall.build(function (cards_api) {
          wall_data.meta['lowfi-card-ids'].forEach(function(card_id) {
            cards_api.add(wall_data.cards[card_id])
          });
        });
        last_wall_id = wall_id;
        if (on_success) {
          on_success();
        }
      });
    }
  };
  function reload_wall() {
    external.load_wall(last_wall_id);
  }

  wall.on_card_moving(external.card_moving);
  wall.on_card_moved(external.card_moved);
  wall.on_card_add(external.card_added);

  socket.on('card.move', function (card_data) {
    wall.move_card(card_data);
  });

  socket.on('wall.change', function (wall_id) {
    if (wall_id === last_wall_id) {
      reload_wall();
    }
  });

  return external
}

var visible_wall = whalley.FabricWall();
var sync_client = whalley.SocketIoSyncClient(visible_wall);
visible_wall.start();

