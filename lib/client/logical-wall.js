var whalley = whalley || {};
whalley.LogicalWall = function () {
  var self = this;
  var event = whalley.event;
  var background_image, width, height;

  var events = {
    card_moving: event(),
    card_changed: event(),
    card_added: event(),
    change: event()
  };

  function set_background_image(image) {
    background_image = image
    events.change.fire();
  }

  function set_size(w, h) {
    if (w && h) {
      width = w
      height = h
      events.change.fire()
    }
  }

  function wall_data(data) {
    if (data) {
      if (data.background_image) {
        set_background_image(data.background_image)
      }
      if (data.width && data.height) {
        set_size(data.width, data.height);
      }
    }
    else {
      return {
        background_image: background_image,
        width: width,
        height: height
      }
    }
  }

  function move_to_front(card) {
    var id = card.id
    cards.some(function (a_card, a_card_index) {
      if (a_card.has_id(id)) {
        cards.splice(a_card_index, 1)
        cards.push(a_card)
        return true;
      }
    });
  }

  function other_selected(card) {
    var others = []
    if (card.selected) {
      cards.forEach(function(c) {
        if (c !== card && c.selected) {
          others.push(c)
        }
      })
    }
    return others
  }

  function LogicalCardsApi(cards) {
    return {
      add: function (cardlike) {
        var card = new whalley.LogicalCard(cardlike, external);
        cards.push(card);
        card.on_moved(function(offset) {
          other_selected(card).forEach(function(slave) {
            slave.move_to(slave.x + offset.dx, slave.y + offset.dy)
            events.card_changed.fire(slave)
          })
          events.card_changed.fire(card)
        })
        card.on_changed(function() {
          events.card_changed.fire(card)
        })
        card.on_moving(function() {
          events.card_moving.fire(card)
        })
        return card;
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
        card.move_to(card_data.x, card_data.y);
        return;
      }
    });
  }

  var cards = [];
  var cards_api = LogicalCardsApi(cards)

  function build(builder) {
    throw('not being used as yet - to be used in headless wall on server?')
    cards_api.clear();
    builder(cards_api);
  }

  var external = {
    build: build,
    cards_api: cards_api,
    add_card: cards_api.add,
    move_card: move_card,

    events: events,

    move_to_front: move_to_front,
    set_background_image: set_background_image,
    set_size: set_size,

    wall_data: wall_data,
    get background_image() {
      return background_image;
    },
    get width() {
      return width;
    },
    get height() {
      return height;
    },
    get cards() {
      return cards;
    },

    on_change: events.change.listen,
    on_card_add: events.card_added.listen,
    on_card_moving: events.card_moving.listen,
    on_card_changed: events.card_changed.listen
  }
  return external;
}