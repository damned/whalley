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
  var logical_wall = new whalley.LogicalWall()
  visible_wall = wall_class(logical_wall);
  sync_client = whalley.SocketIoSyncClient(visible_wall); // NB tied to visible wall at mo because visible wall needs to create view
                                                          // when it forwards card add to logical wall
                                                          // could tie directly to logical wall if made wall view create card view
                                                          // in response to "card created" event
  visible_wall.start();
});

