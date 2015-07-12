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
        var card = new SvgCard(cardlike, canvas);
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

  function missing(name) {
    return function() {
      throw name + ' is missing!';
    }
  }

  return {
    start: function () {
      draw = SVG('wall');
      draw.rect(100, 100);
    },

    // builder api
    build: missing('build'),
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
