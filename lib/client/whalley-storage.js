var whalley = whalley || {};
whalley.cookies = {
    write: function (key, value) {
      $.cookie(key, JSON.stringify(value));
    },
    read: function (key) {
      return JSON.parse($.cookie(key));
    }
};

var whalley_server_wall_id;
whalley.server = {
    fetch_wall: function(wall_id, callback) {
      $.getJSON('/api/0.2/walls/' + wall_id, function(data) {
        callback(data);
      });
    },
    push_wall: function(wall_id, wall_data, after) {
      var json = JSON.stringify(wall_data, undefined, 2);
      whalley.log.debug('about to push: ' + json);
      $.ajax({
        url: '/api/0.2/walls/' + wall_id,
        type: 'PUT',
        data: json,
        success: function() {
          if (after) after();
        }
      });
    },
};

