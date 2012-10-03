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
    begin: function () { 
      whalley_server_temp = {};
      whalley_server_temp['meta'] = {};
      whalley_server_temp['cards'] = {};
    },
    commit: function () { 
      var json = JSON.stringify(whalley_server_temp, undefined, 2);
      $.ajax({
        'url': '/write',
        'type': 'POST',
        'data': json
      });
    },
    pull: function (callback) {
      $.getJSON('/read', function(data) {
        whalley_server_temp = data;
        callback();
      });
    }
};
whalley.server.begin();

