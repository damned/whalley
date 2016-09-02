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

whalley.SvgWall = function (logical_wall) {
  var $container;
  var svg;
  var log = whalley.log;
  var self = this;

  var events = logical_wall.events
  var shelf

  logical_wall.on_change(function() {
    set_background_image(logical_wall.background_image)
    set_size(logical_wall.width, logical_wall.height)
  })

  var set_background_image = function(image) {
    svg.style({
      'background-image': 'url(' + image + ')',
      'background-repeat': 'no-repeat',
      'background-size': 'cover'
    })
  }

  var set_size = function(w, h) {
    if (w && h) {
      svg.size(w, h)
    }
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
    cards.forEach(function(card) { // could move to logical wall #unmark_all
      card.unmark('search-hit')
    })
  }
  cardwall_ui.search.on_change(function(search_term) {
    reset_search_hits()
    if (search_term.length > 0) {
      cards.forEach(function(card) {
        if (card.matches(search_term)) {
          card.mark('search-hit')
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
  function CardsApi(cards) {
    return {
      add: function (cardlike) {
        var card = new whalley.LogicalCard(cardlike, wall_to_card_api);
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
  var image_capture = whalley.image_capture();

  image_capture.on_snapshot(function (target, data) {
    last_image_data = data;
    image_capture.hide();
    if (target == 'card') {
      cards_api.add({
        x: 100,
        y: 100,
        type: 'image',
        id: Date.now().toString(),
        image_src: data
      });
    }
    else if (target == 'wall') {
      logical_wall.set_background_image(data);
    }
    else {
      console.error('dunno what target that image is for: ' + target)
    }
  }, alert);

  var outline;

  function Outline(svg) {
    var start
    var rect
    var self = this
    var create_listeners = []
    function on_wall(e) {
      return e.target === svg.node
    }
    function clear() {
      if (rect) {
        rect.remove()
        rect = undefined
        $container.css({cursor: 'crosshair'})
      }
    }
    this.on_create = function(listener) {
      create_listeners.push(listener)
    }
    this.begin = function(e) {
      console.log('begin: ' + e)
      clear()
      if (on_wall(e)) {
        start = {x: e.x, y: e.y}
        rect = svg.rect(2, 2).fill('none').stroke({width:2})
        self.update(e)
        $container.css({cursor: 'crosshair'})
        return true
      }
      return false
    }
    this.update = function(e) {
      console.log('update rect: ' + rect +', e: ' + e)
      if (rect) {
        var w = Math.abs(start.x - e.x)
        var h = Math.abs(start.y - e.y)
        var l = Math.min(start.x, e.x)
        var t = Math.min(start.y, e.y) - $container.offset().top
        console.log(w, h, l , t)
        rect.size(w, h).move(l, t)
        return true;
      }
      return false;
    }
    this.end = function(e) {
      console.log('end rect: ' + rect +', e: ' + e)
      if (rect) {
        create_listeners.forEach(function(l) {
          l(rect)
        })
        clear()
        return true
      }
      return false
    }
    function mouse_info(mouse_event) {
      return {
        x: mouse_event.clientX,
        y: mouse_event.clientY,
        target: mouse_event.target
      }
    }
    this.wire_up = function() {
      svg.on('mousedown', function (e) {
        if (self.begin(mouse_info(e))) {
          e.preventDefault()
        }
      })
      svg.on('mouseup', function (e) {
        if (self.end(mouse_info(e))) {
          e.preventDefault()
        }
      })
      svg.on('mousemove', function(e) {
        if (self.update(mouse_info(e))) {
          e.preventDefault()
        }
      })
    }
    this.wire_up()
  }

  return {
    start: function (after) {
      $container = $('#wall');
      svg = SVG('wall');

      outline = new Outline(svg)
      outline.on_create(function (rect) {
        cards.forEach(function(card) {
          card.select(card.overlap(rect))
        })
      })

      load_wall(cardwall_ui, function() {
        $('.wall_status').addClass('ready').text('ok')
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
    add_card: cards_api.add,
    on_card_add: events.card_added.listen,
    on_card_moving: events.card_moving.listen,
    on_card_changed: events.card_changed.listen
  }
}
