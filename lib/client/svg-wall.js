var whalley = whalley || {};
whalley.SvgCardViewFactory = {
  create_text_card_view: function(wall, logical) {
    return whalley.SvgCardView(wall, logical)
  },
  create_image_card_view: function(wall, logical) {
    var view = this.create_text_card_view(wall, logical)
    view.image(logical.text)
    return view
  }
}

whalley.SvgWall = function () {
  var $container;
  var svg;
  var log = whalley.log;
  var self = this;

  var logical_wall = new whalley.LogicalWall(self);
  var events = logical_wall.events;

  var shelf;
  var blanks;

  function create_blank_cards() {
    var blanks = []
    blanks.push(new whalley.LogicalCard({ id: 'blank:x', width: 50, height: 60, color: 'white', text: wall_to_card_api.DEFAULT_TEXT }, wall_to_card_api))
    return blanks
  }
  function init_shelf(blanks) {
    shelf = svg.group(400, 100).move(20, -80)
    var rect = shelf.rect(400, 100);
    rect.move(0,0);
    shelf.draggable({
      minY: -80
        , minX: 20
        , maxY: 80
        , maxX: 420
    })
    shelf.attr({id: 'shelf'})
    shelf.text('shelf').fill({color: 'black'}).font({anchor: 'start'}).move(5, 80)
    rect.fill({color:'gray', opacity: 0.3})
    function move_blanks() {
      var right = 400
      const spacing = 20;
      blanks.forEach(function(blank) {
        blank.move_to(shelf.x() + right - spacing - blank.half_width, shelf.y() + blank.half_height + spacing)
        right -= (blank.width + spacing)
      })
    }
    move_blanks();
    shelf.back()
    shelf.on('dragmove', function() {
      move_blanks()
    })
    blanks.forEach(function(blank) {
      blank.on_moved(function() {
        var template = JSON.parse(JSON.stringify(blank.data()));
        template.id = new Date().getMilliseconds().toString()
        template.left = blank.x
        template.top = blank.y
        events.card_added.fire(cards_api.add(template));
        move_blanks()
      })
    })
  }

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
        card.move_to(card_data.left, card_data.top);
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
  }

  function missing(name) {
    return function() {
      throw name + ' is missing!';
    }
  }

  return {
    start: function () {
      $container = $('#wall');
      svg = SVG('wall');
      load_wall(cardwall_ui, function() {
        blanks = create_blank_cards()
        init_shelf(blanks)
      });
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
    on_card_add: events.card_added.listen,
    on_card_moving: events.card_moving.listen,
    on_card_changed: events.card_changed.listen
  }
}
