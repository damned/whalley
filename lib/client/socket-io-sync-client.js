var whalley = whalley || {};

whalley.SocketIoSyncClient = function (wall) {
  var socket = io();
  var last_wall_id;

  function upsync_wall() {
    visible_wall.save_cards(last_wall_id);
    socket.emit('wall.change', last_wall_id);
  }

  var external = {
    card_moving: function (card) {
      socket.emit('card.move', card.data());
    },
    card_moved: function (card) {
      upsync_wall();
    },
    card_added: function (card) {
      upsync_wall();
    },
    load_wall: function (wall_id, on_success) {
      whalley.server.fetch_wall(wall_id, function (wall_data) {
        visible_wall.build(function (cards_api) {
          wall_data.meta['lowfi-card-ids'].forEach(function(card_id) {
            cards_api.add(wall_data.cards[card_id])
          });
        });
        last_wall_id = wall_id;
        if (on_success) {
          on_success();
        }
      });
    }
  };
  function reload_wall() {
    external.load_wall(last_wall_id);
  }

  wall.on_card_moving(external.card_moving);
  wall.on_card_moved(external.card_moved);
  wall.on_card_add(external.card_added);

  socket.on('card.move', function (card_data) {
    wall.move_card(card_data);
  });

  socket.on('wall.change', function (wall_id) {
    if (wall_id === last_wall_id) {
      reload_wall();
    }
  });

  return external;
}
