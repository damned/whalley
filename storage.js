var wu = require('./whalley-util');
var path = require('path');
var fs = require('fs');

exports.write_data = function (data) {
  wu.ensure_dir('./.store');
  fs.writeFileSync('.store/json', data, 'utf8');
}

exports.read_data = function () {
  var file = './.store/json';  
  return path.existsSync(file) ? fs.readFileSync(file, 'utf8') : '[]';
}


