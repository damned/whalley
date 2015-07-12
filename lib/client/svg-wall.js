var whalley = whalley || {};
whalley.SvgWall = function () {

  var draw;
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
        live_move: true
      };
      return whalley.ui === undefined ? default_options : whalley.ui;
    }
  });

  debug_event = function (event) {
    whalley.log.log(event.e.type);
  };

  function CardsApi(cards) {
    return {
      add: function (cardlike) {
        var card = new SvgCard(cardlike);
        cards.push(card);
        card.restore(cardlike);

        if (card.notification()) {
          log.debug(notification_message(card));
          card.spangle();
        }
      },
      clear: function () {
        cards.length = 0;
      }
    }
  }

  function move_card(card_data) {
    cards.forEach(function (card) {
      var id = card_data.id;
      if (card.has_id(id)) {
        card.move_to(card_data.left, card_data.top);
        return;
      }
    });
  }


  var cards = [];
  var cards_api = CardsApi(cards);

  function build(builder) {
    cards_api.clear();
    builder(cards_api);
  }

  function missing(name) {
    return function() {
      throw name + ' is missing!';
    }
  }

  var pseudoid = 0;

  function pseudocard(x, y) {
    var group = draw.group();
    group.size(100, 100);
    var fo = group.foreignObject();
    pseudoid += 1;
    var div_id = 'card' + pseudoid;
    fo.appendChild('div', {id: div_id, innerText: 'hello, what is the name of this'})
    $('#' + div_id).css({
      border: '2px solid gray',
      background: 'rgba(200, 200, 200, 0.8)'
    });
    group.move(x, y);
    group.draggable();
    group.on('dragstart', function() {
      this.front();
    });
  }

  return {
    start: function () {
      draw = SVG('wall');
      for (var x = 0; x < 500; x+=50) {
        for (var y = 0; y < 500; y+=60) {
          pseudocard(x, y);
        }
      }

    },

    // builder api
    build: build,
    add_text_card: missing('add_new_card'),

    // query api
    cards: missing('get_card_data'),

    // modifier api
    move_card: missing('move_card'),
    on_card_add: events.card_added.listen,
    on_card_moving: events.card_moving.listen,
    on_card_moved: events.card_moved.listen
  }
}
