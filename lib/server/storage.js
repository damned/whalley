var wu = require('./whalley-util');
var util = require('util');
var path = require('path');
var fs = require('fs');
var resources = require('./resources');

var write_data = function (data) {
  wu.ensure_dir('./.store');
  fs.writeFileSync('.store/json', data, 'utf8');
}

var read_data = function () {
  var file = './.store/json';  
  return path.existsSync(file) ? fs.readFileSync(file, 'utf8') : '[]';
}

resources.add_on_url_contains('read', function(request, response) {
  var filedata = read_data();
  util.log('file data: ' + filedata);
  resources.render_json_to(filedata, response);
});

resources.add_on_url_contains('write', function(request, response) {
  if (request.method === 'POST') {
    data = '';
    request.on('data', function (some_data) { 
      data += some_data; 
    });
    request.on('end', function () {
      if (read_data() != data) {
        util.log('saving data: ' + data);
        write_data(data);
      }
      resources.render('text/plain', 'Stored', response);
    });
  }
  else {
    response.statusCode = 404;
    resources.render('text/plain', 'Need to write with a post', response);
  }
});

