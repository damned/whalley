var wu = require('./whalley-util');
var util = require('util');
var path = require('path');
var fs = require('fs');
var resources = require('./resources');
var data_converter = require('./wall-data-converter');
var wall_data_checker = require('./wall-data-checker');

var store_filename = function(path) {
  return './.store/' + path;
};

var write_data = function(resource_path, data) {
  var full_path = store_filename(resource_path);
  wu.ensure_dir(path.dirname(full_path));
  fs.writeFileSync(full_path, data, 'utf8');
};

var read_data = function(resource_path) {
  var file = store_filename(resource_path);
  return path.existsSync(file) ? fs.readFileSync(file, 'utf8') : '[]';
};

function get_wall_data(request, response, options) {
  var resource_path = wall_id_from(request, response, options.prefix);
  var file_content = read_data(resource_path);
  util.log('file data: ' + file_content.substring(0, 20) + '(...)');
  resources.render_json_to(convert_wall_json(file_content, options.version), response);
};

var wall_id_from = function (request, response, prefix) {
  var wall_id = request.url.substring(prefix.length);
  if (wall_id == '' || request.url.indexOf('..') !== -1) {
    return 'json';
  }
  return wall_id;
};

resources.add_on_url_contains('read', function(request, response) {
  get_wall_data(request, response, { prefix: '/read/', version: null });
});

resources.add_on_get_starts_with('/api/0.1/walls', function(request, response) {
  get_wall_data(request, response, { prefix: '/api/0.1/walls/', version: '0.1' });
});
resources.add_on_put_starts_with('/api/0.1/walls', function(request, response) {
  write_wall_data(request, response, { method: 'PUT', prefix: '/api/0.1/walls/', version: '0.1' });
});
resources.add_on_url_contains('write', function(request, response) {
  write_wall_data(request, response, { method: 'POST', prefix: '/api/0.1/walls/', version: null });
});

function convert_wall_json(data, version) {
  var wall_data = JSON.parse(data);
  var current_version_wall = data_converter.convert(wall_data, version);
  wall_data_checker.check_wall(current_version_wall);
  return JSON.stringify(current_version_wall);
}

function put_wall_at_version(wall_id, wall_json, options) {
  console.log("received wall data, bytes: " + wall_json.length);
  var converted = convert_wall_json(wall_json, options.target_structure_version);
  if (read_data(wall_id) != converted) {
    util.log('saving data: ' + converted.substring(0, 20) + '...');
    write_data(wall_id, converted);
  }
}
function write_wall_data(request, response, options) {
  if (!request.connection.encrypted) {
    response.statusCode = 403;
    resources.render('text/plain', 'Use https', response);
    return;
  }
  var wall_id = wall_id_from(request, response, options.prefix);
  console.log("wall_id: " + wall_id);
  if (request.method === options.method) {
    var data = '';
    request.on('data', function(some_data) {
      console.log("receiving data: " + some_data.length);
      data += some_data;
    });
    request.on('end', function() {
      var target_structure_version = options.version;
      put_wall_at_version(wall_id, data, { target_structure_version: options.version });
      resources.render('text/plain', 'Stored', response);
    });
  }
  else {
    response.statusCode = 404;
    resources.render('text/plain', 'Need to write with a ' + options.method, response);
  }
}

exports.put_wall = function(wall_id, wall_json) {
  put_wall_at_version(wall_id, data, { target_structure_version: '0.1' });
}