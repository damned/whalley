var whalley = whalley || {};
whalley.SvgWall = function () {

  var $container;
  var svg;
  var log = whalley.log;
  var logical_wall = new whalley.LogicalWall();

  var events = logical_wall.events;
  var self = this;

  function set_background_image(image) {
    svg.style({
      'background-image': 'url(' + image + ')',
      'background-repeat': 'no-repeat',
      'background-size': 'cover'
    })
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

  debug_event = function (event) {
    whalley.log.log(event.e.type);
  };

  function CardsApi(cards) {
    return {
      add: function (cardlike) {
        var card = new SvgCard(cardlike, svg);
        cards.push(card);

        if (card.notification()) {
          log.debug(card.notification_message());
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
      svg = SVG('wall').size($container.width(), $container.height());
      load_wall(cardwall_ui);
    },

    // builder api
    build: build,
    add_text_card: missing('add_new_card'),

    // query api
    cards: missing('get_card_data'),
    wall_data: function(new_wall_data) {
      if (new_wall_data && new_wall_data.background_image) {
        set_background_image(new_wall_data.background_image);
      }
      return {}
    },

    svg: function() {
      return svg;
    },

    // modifier api
    move_card: move_card,
    on_card_add: events.card_added.listen,
    on_card_moving: events.card_moving.listen,
    on_card_moved: events.card_moved.listen
  }
}
