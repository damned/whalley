var whalley = whalley || {};
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

  function refresh() {
    canvas.renderAll();
  }
  Object.defineProperty(whalley, 'options', {
    get: function () {
      default_options = {
        jaunty: true,
        live_move: true
      };
      return whalley.ui === undefined ? default_options : whalley.ui;
    }
  });

  var canvas = new fabric.Canvas('wall');
  console.log("canvas size: " + canvas.width + 'x' + canvas.height)
  var background_image;
  function set_background_image(image_src) {
    background_image = image_src;
    canvas.setBackgroundImage(image_src, refresh, {
      backgroundImageStretch: true,
      backgroundImageOpacity: 0.7
    });
  }
  set_background_image('images/paper.jpg');

  canvas.observe('object:selected', function (event) {
    if (event.target !== undefined) {
      event.target.bringToFront();
      var card = event.target.get('card');
      if (card) {
        card.reangle();
        if (card.notification() !== null) {
          alert(notification_message(card));
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
        card.on_moved();
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
        if (card) {
          card.on_moving();
        }
      }
    });
  }

  var spangle_is_animating = false;
  function init_spangling() {
    if (spangle_is_animating) return;
    spangle_is_animating = true;

    interval = 200;
    setInterval(function animate() {
      var cycle_time = 2000;
      var count_in_cycle = (Date.now() % cycle_time);
      var radians = Math.PI * 2 * count_in_cycle / cycle_time;
      var sine = Math.sin(radians);
      var any_spangling = false;
      cards.forEach(function(card) {
        if (card.spangling()) {
          card.set_shadow((sine + 1) * 2);
          any_spangling = true;
        }
        else {
          card.set_shadow(0);
        }
      });
      if (any_spangling) {
        log.debug("there is spangling");
        canvas.renderAll();
      }
    }, interval);
  }

  function CardsApi(cards) {
    return {
      add: function (cardlike) {
        var card = new FabricCard(cardlike, canvas);
        cards.push(card);
        card.restore(cardlike);
        card.add_to(canvas);

        if (card.notification()) {
          log.debug(notification_message(card));
          card.spangle();
          init_spangling();
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
    whalley.colour_wheel = new ColourWheel(canvas);
    builder(cards_api);
    canvas.renderAll();
  }

  var get_card_data = function() {
    return cards.map(function(card) {
      console.log(card.data())
      return card.data();
    });
  }

  function notification_message(card) {
    return "'" + card.text() + "' has notification: '" + card.notification() + "'";
  }

  var add_new_card = function (text) {
    add_card_to_wall({
      text: text
    }, 20);
  }

  var add_card_to_wall = function (params, left) {
    var card = new FabricCard(params, canvas);
    cards.push(card);
    card.left(left);
    card.add_to(canvas);
    events.card_added.fire(card);
    return card;
  }

  var store = whalley.server;

  var last_image_data;
  var image_capture = whalley.image_capture();

  image_capture.on_snapshot(function (target, data) {
    last_image_data = data;
    image_capture.hide();
    if (target == 'card') {
      add_new_card(data);
    }
    else if (target == 'wall') {
      set_background_image(data);
    }
    else {
      console.error('dunno what target that image is for: ' + target)
    }
  }, alert);


  return {
    start: function () {
      log.log('bingo!');
    },

    // builder api
    build: build,
    add_text_card: add_new_card,

    // query api
    cards: get_card_data,
    wall_data: function(data) {
      if (data) {
        if (data.background_image) {
          set_background_image(data.background_image);
        }
        if (data.width && data.height) {

        }
      }
      else {
        return {
          background_image: background_image,
          width: canvas.width,
          height: canvas.height
        }
      }
    },

    // modifier api
    move_card: move_card,
    on_card_add: events.card_added.listen,
    on_card_moving: events.card_moving.listen,
    on_card_moved: events.card_moved.listen
  }
}
