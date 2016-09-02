var whalley = whalley || {};

whalley.SocketIoSyncClient = function (wall) {
  var socket = io();
  var last_wall_id;
  var log = whalley.log;

  function upsync_wall() {
    external.save_wall(function() {
      socket.emit('wall.change', last_wall_id);
      log.info('wall change =>')
    });
  }

  var external = {
    card_moving: function(card) {
      socket.emit('card.move', card.data());
      log.info('card move =>')
    },
    card_changed: function(card) {
      upsync_wall();
    },
    card_added: function(card) {
      socket.emit('card.add', card.data());
      log.info('card add =>')
    },
    load_wall: function(wall_id, on_success) {
      whalley.server.fetch_wall(wall_id, function (wall_data) {
        wall.build(function (cards_api) {
          wall_data.cards.forEach(function(card) {
            cards_api.add(card);
          });
        });
        wall.wall_data(wall_data.wall)
        last_wall_id = wall_id;
        if (on_success) {
          on_success();
        }
      });
    },
    save_wall: function(after) {
      var data = {
        structure_version: '0.2',
        cards: wall.cards(),
        wall: wall.wall_data()
      };
      log.info('pushing wall data =>')
      log.debug(data)
      whalley.server.push_wall(last_wall_id, data, after)
    }
  };
  function reload_wall() {
    external.load_wall(last_wall_id);
  }

  wall.on_card_moving(external.card_moving);
  wall.on_card_changed(external.card_changed);
  wall.on_card_add(external.card_added);

  socket.on('card.move', function (card_data) {
    log.info('=> card move')
    wall.move_card(card_data);
  });

  socket.on('card.add', function (card_data) {
    log.info('=> card add')
    wall.add_card(card_data);
  });

  socket.on('wall.change', function (wall_id) {
    log.info('=> wall change')
    if (wall_id === last_wall_id) {
      reload_wall();
    }
  });

  return external;
}
