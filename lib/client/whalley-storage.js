var whalley = whalley || {};
whalley.cookies = {
    write_properties: function (id, data) {
      for (var key in data) {
        $.cookie('' + id + '-' + key, value);
      }
    },
    read_property: function (id, key) {
      return $.cookie('' + id + '-' + key);
    },
    write: function (key, value) {
      $.cookie(key, JSON.stringify(value));
    },
    read: function (key) {
      return JSON.parse($.cookie(key));
    },
    pull: function() {}, // already pulled
    begin: function () {},
    commit: function () {} // committed on write
};

var whalley_server_temp;
var whalley_server_wall_id;
whalley.server = {
    write_properties: function (id, data) {
      whalley_server_temp['cards'][id] = data;
    },
    read_property: function (id, key) {
      if (whalley_server_temp['cards'][id] === undefined) {
        return null;
      }
      return whalley_server_temp['cards'][id][key];
    },
    write: function (key, value) {
      if (whalley_server_temp['meta'] === undefined) {
        whalley_server_temp['meta'] = {};
      }
      whalley_server_temp['meta'][key] = value
    },
    read: function (key) {
      return whalley_server_temp['meta'][key];
    },
    begin: function (id) {
      whalley_server_wall_id = id;
      whalley_server_temp = {};
      whalley_server_temp['meta'] = {};
      whalley_server_temp['cards'] = {};
    },
    commit: function() {
      console.log('actually writing to server...')
      var json = JSON.stringify(whalley_server_temp, undefined, 2);
      $.ajax({
        'url': '/write/' + whalley_server_wall_id,
        'type': 'POST',
        'data': json
      });
    },
    pull: function(wall_id, callback) {
      $.getJSON('/read/' + wall_id, function(data) {
        whalley_server_temp = data;
        callback();
      });
    },
    fetch_wall: function(wall_id, callback) {
      $.getJSON('/api/0.1/walls/' + wall_id, function(data) {
        callback(data);
      });
    },
    push_wall: function(wall_id, wall_data) {
      $.ajax({
        url: '/ap1/0.1/walls/' + wall_id,
        'type': 'POST',
        'data': wall_data
      });
    },
};
whalley.server.begin('');

