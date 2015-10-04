var whalley = whalley || {};
whalley.SvgCardViewFactory = {
  create_text_card_view: function(wall, logical) {
    return whalley.SvgCardView(wall, logical)
  },
  create_image_card_view: function(wall, logical) {
    var view = this.create_text_card_view(wall, logical)
    view.image(logical.image_src)
    return view
  }
}

whalley.SvgWall = function () {
  var $container;
  var svg;
  var log = whalley.log;
  var self = this;

  var logical_wall = new whalley.LogicalWall(self)
  var events = logical_wall.events
  var shelf

  self.set_background_image = function(image) {
    svg.style({
      'background-image': 'url(' + image + ')',
      'background-repeat': 'no-repeat',
      'background-size': 'cover'
    })
  }
  self.set_size = function(w, h) {
    svg.size(w, h)
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
  function reset_search_hits() {
    cards.forEach(function(card) {
      card.display_as_not('search-hit')
    })
  }
  cardwall_ui.search.on_change(function(search_term) {
    reset_search_hits()
    if (search_term.length > 0) {
      cards.forEach(function(card) {
        if (card.matches(search_term)) {
          card.display_as('search-hit')
        }
      })
    }
  })
  Mousetrap.bind(['s', '/'], function() {
    cardwall_ui.search.focus()
    return false
  })
  Mousetrap.bind('esc', function() {
    reset_search_hits()
  })
  debug_event = function (event) {
    whalley.log.log(event.e.type);
  };
  var $card_viewer = $('#card_viewer');
  var card_debug = false;

  var wall_to_card_api = {
    create_text_card_view: function(card) {
      return whalley.SvgCardViewFactory.create_text_card_view(this, card)
    },
    create_image_card_view: function(card) {
      return whalley.SvgCardViewFactory.create_image_card_view(this, card)
    },
    group: function(width, height) {
      return svg.group(width, height)
    },
    bring_to_front: function(card) {
      cards = logical_wall.move_to_front(card.id, cards)
    },
    show_card: function(card) {
      if (card == null) {
        $card_viewer.hide();
      }
      else {
        $card_viewer.html(card_debug ? card.data_summary() : card.text);
        $card_viewer.show();
      }
    },
    DEFAULT_TEXT: '- click to edit -'
  }
  function CardsApi(cards) {
    return {
      add: function (cardlike) {
        var card = new whalley.LogicalCard(cardlike, wall_to_card_api);
        cards.push(card);
        card.on_moved(function() {
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
  var cards_api = CardsApi(cards);
  function build(builder) {
    cards_api.clear();
    svg.clear();
    builder(cards_api);
    shelf.reload();
  }

  function missing(name) {
    return function() {
      throw name + ' is missing!';
    }
  }

  var shelf = whalley.SvgShelf(wall_to_card_api, cards_api, events.card_added);

  return {
    start: function () {
      $container = $('#wall');
      svg = SVG('wall');
      load_wall(cardwall_ui);
    },

    // builder api
    build: build,
    add_text_card: missing('add_new_card'),

    // query api
    cards: function() {
      return cards.map(function(card) { return card.data() })
    },
    wall_data: function(data) {
      return logical_wall.wall_data(data)
    },

    // modifier api
    move_card: move_card,
    add_card: cards_api.add,
    on_card_add: events.card_added.listen,
    on_card_moving: events.card_moving.listen,
    on_card_changed: events.card_changed.listen
  }
}
