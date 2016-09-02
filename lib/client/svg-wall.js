var whalley = whalley || {};
whalley.SvgCardViewFactory = function() {
  var create_text_card_view = function(wall, logical) {
    return whalley.SvgCardView(wall, logical)
  }
  var create_image_card_view = function(wall, logical) {
    var view = this.create_text_card_view(wall, logical)
    view.image(logical.image_src)
    return view
  }
  return {
    create_card_view: function(wall, logical_card) {
      if (logical_card.type === 'image') {
        create_image_card_view(wall, logical_card)
      }
      else {
        create_text_card_view(wall, logical_card)
      }
    }
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

  var wall_view_api = {
    create_card_view: function(card) {
      return whalley.SvgCardViewFactory().create_card_view(this, card)
    },
    group: function(width, height) {
      return svg.group(width, height)
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

  function CardsApi(logical_cards_api) {
    return {
      add: function (cardlike) {
        var logical_card = logical_cards_api.add(cardlike);
        wall_view_api.create_card_view(logical_card);
        return logical_card;
      },
      clear: logical_cards_api.clear
    }
  }
  var cards_api = CardsApi(logical_wall.cards_api);

  function build(builder) {
    svg.clear();
    cards_api.clear();
    builder(cards_api);
    shelf.reload();
  }

  function missing(name) {
    return function() {
      throw name + ' is missing!';
    }
  }

  var shelf = whalley.SvgShelf(wall_view_api, cards_api, events.card_added);
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
        logical_wall.cards.forEach(function(card) {
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
      return logical_wall.cards.map(function(card) { return card.data() })
    },
    wall_data: function(data) {
      return logical_wall.wall_data(data)
    },

    // modifier api
    move_card: logical_wall.move_card,
    add_card: cards_api.add,

    on_card_add: logical_wall.on_card_add,
    on_card_moving: logical_wall.on_card_moving,
    on_card_changed: logical_wall.on_card_changed
  }
}
