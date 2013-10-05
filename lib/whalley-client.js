var whalley = whalley || {}
whalley.options = {
  jaunty: true,
  autosave: true
};

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
    }
  }
});

canvas.observe('selection:created', function (event) {
   event.target.hasControls = false;
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

var cards = [];

function draw_cards(data) {
  cards = [];
  for (var card_id in data.cards) {
    var single_card_data = data.cards[card_id];
    cards.push(new Card({
      id: single_card_data.id, 
      text: single_card_data.text
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

var store = whalley.server;

whalley.colour_wheel = new ColourWheel(canvas);

var save_interval = setInterval(function() { 
  if (whalley.options.autosave && cards.length > 0) {
    save_cards(); 
  }
}, 2000);


