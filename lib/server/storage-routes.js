var resources = require('./resources');
var wall_stores = require('./wall-stores');

var store = wall_stores.Store('./.store/');

function get_wall_data(request, response, options) {
  var resource_path = wall_id_from(request, response, options.prefix);
  resources.render_json_to(store.read_wall(resource_path, options.version), response);
};

var wall_id_from = function (request, response, prefix) {
  var wall_id = request.url.substring(prefix.length);
  if (wall_id == '' || request.url.indexOf('..') !== -1) {
    return 'json';
  }
  return wall_id;
};

resources.add_on_get_starts_with('/api/0.2/walls', function(request, response) {
  get_wall_data(request, response, { prefix: '/api/0.2/walls/', version: '0.2' });
});
resources.add_on_put_starts_with('/api/0.2/walls', function(request, response) {
  write_wall_data(request, response, { method: 'PUT', prefix: '/api/0.2/walls/', version: '0.2' });
});

function write_wall_data(request, response, options) {
  if (!request.connection.encrypted) {
    response.statusCode = 403;
    resources.render('text/plain', 'Use https', response);
    return;
  }

  var wall_id = wall_id_from(request, response, options.prefix);

  console.log("wall_id: " + wall_id);
  if (request.method === options.method) {
    var wall_json = '';
    request.on('data', function(some_data) {
      console.log("receiving data: " + some_data.length);
      wall_json += some_data;
    });
    request.on('end', function() {
      var target_structure_version = options.version;
      store.write_wall(wall_id, wall_json, options.version);
      resources.render('text/plain', 'Stored', response);
    });
  }
  else {
    response.statusCode = 404;
    resources.render('text/plain', 'Need to write with a ' + options.method, response);
  }
}
