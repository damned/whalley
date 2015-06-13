var whalley = whalley || {}

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

canvas.observe('object:modified', function (event) { // TODO move into card
   if (event.target) {
     var card = event.target.get('card');
     if (card) {
       card.on_modify();
     }
   }
});

var fetch_cards = function(username, password, cards_handler) {
  $.getJSON('fetch_cards?password=' + password + '&username=' + username, cards_handler);
};

var load_wall = function(ui) {
  whalley.ui = ui;
  var auth_info = ui;
  var username = auth_info.username;
  var password = auth_info.password;
  if (password === '') {
    save_password(password);
    alert('password cleared');
  }
  fetch_cards(username, password, function(card_data) {
    draw_cards(card_data);
    save_password(password);
  });
  save_wall_id(ui.wall_id);
};

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


var cards = [];

function draw_cards(data) {
  cards = [];
  for (var card_id in data.cards) {
    var single_card_data = data.cards[card_id];
    cards.push(new Card({
      id: single_card_data.id, 
      text: single_card_data.text,
      status: single_card_data.status
    }));
  };
  cards.forEach(function(card, i) {
    card.left(card.left() + i * 50);
    card.add_to(canvas);
  });
  restore_cards();
};

var save_cards = function(wall_id) {
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
  var card = new Card(params);
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


var save_interval = setInterval(function() {
  if (whalley.options.autosave && cards.length > 0) {
    var wall_id = whalley.options.wall_id;
    save_cards(wall_id);
    save_wall_id(wall_id);
  }
}, 2000);
