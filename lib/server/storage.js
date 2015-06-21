var wu = require('./whalley-util');
var util = require('util');
var path = require('path');
var fs = require('fs');
var resources = require('./resources');
var data_converter = require('./wall_data_converter')

var store_filename = function(path) {
  return './.store/' + path;
}

var write_data = function(resource_path, data) {
  var full_path = store_filename(resource_path);
  wu.ensure_dir(path.dirname(full_path));
  fs.writeFileSync(full_path, data, 'utf8');
}

var read_data = function(resource_path) {
  var file = store_filename(resource_path);
  return path.existsSync(file) ? fs.readFileSync(file, 'utf8') : '[]';
}

function get_resource_prefixed(request, response, prefix) {
  var resource_path = resource_path_for(request, response, prefix);
  var filedata = read_data(resource_path);
  util.log('file data: ' + filedata.substring(0, 20) + '(...)');
  resources.render_json_to(filedata, response);
}

var resource_path_for = function (request, response, prefix) {
  var resource_path = request.url.substring(prefix.length);
  if (resource_path == '' || request.url.indexOf('..') !== -1) {
    return 'json';
  }
  return resource_path;
}

resources.add_on_url_contains('read', function(request, response) {
  get_resource_prefixed(request, response, '/read/');
});

resources.add_on_get_starts_with('/api/v1/wall/', function(request, response) {
  get_resource_prefixed(request, response, '/api/v1/wall/');
});

resources.add_on_url_contains('write', function(request, response) {
  var resource_path = resource_path_for(request, response, '/write/');
  if (request.method === 'POST') {
    data = '';
    request.on('data', function (some_data) { 
      data += some_data; 
    });
    request.on('end', function () {
      if (read_data(resource_path) != data) {
        util.log('saving data: ' + data.substring(0, 20) + '(...)');
        write_data(resource_path, data);
      }
      resources.render('text/plain', 'Stored', response);
    });
  }
  else {
    response.statusCode = 404;
    resources.render('text/plain', 'Need to write with a post', response);
  }
});

