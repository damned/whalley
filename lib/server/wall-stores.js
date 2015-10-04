var wu = require('./whalley-util');
var util = require('util');
var data_converter = require('./wall-data-converter');
var path = require('path');
var fs = require('fs');

const default_version = '0.1';

function resolve_version(version) {
  return (version === undefined) ? default_version : version;
}

exports.Store = function(root_path) {
  var store_filename = function(path) {
    return root_path + path;
  };

  var convert_wall_json = function(data, version) {
    var wall_data = JSON.parse(data);
    var current_version_wall = data_converter.convert(wall_data, version);
    return JSON.stringify(current_version_wall);
  }

  var write_data = function(resource_path, data) {
    var full_path = store_filename(resource_path);
    wu.ensure_dir(path.dirname(full_path));
    fs.writeFileSync(full_path, data, 'utf8');
  }

  var read_data = function(resource_path) {
    var file = store_filename(resource_path);
    return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '[]';
  }

  var read_wall = function(wall_id, version) {
    var file_content = read_data(wall_id);
    util.log('file data: ' + file_content.substring(0, 20) + '(...)');
    return convert_wall_json(file_content, resolve_version(version));
  }

  var write_wall = function(wall_id, wall_json, version) {
    write_wall_at_version(wall_id, wall_json, resolve_version(version));
  }

  var write_wall_at_version = function(wall_id, wall_json, version) {
    console.log("received wall data, bytes: " + wall_json.length);
    var converted = convert_wall_json(wall_json, version);
    if (read_data(wall_id) != converted) {
      util.log('saving data: ' + converted.substring(0, 20) + '...');
      write_data(wall_id, converted);
    }
  }

  return {
    write_wall: write_wall,
    read_wall: read_wall
  }
};
