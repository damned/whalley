var whalley = whalley || {};

function save_wall_id(wall_id) {
  return whalley.cookies.write('wall-id', wall_id);
}

function load_wall_id() {
  return whalley.cookies.read('wall-id');
}

var load_wall = function (ui, after) {
  whalley.ui = ui;
  sync_client.load_wall(ui.wall_id, function () {
    save_wall_id(ui.wall_id);
    if (after !== undefined) after()
  });
};

var add_new_card = function (text) {
  visible_wall.add_text_card(text);
}

var visible_wall;
var sync_client;

$(function() {
  visible_wall = wall_class();
  sync_client = whalley.SocketIoSyncClient(visible_wall);
  visible_wall.start();
});

