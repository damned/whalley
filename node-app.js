var mingle = require('./mingle');
var storage = require('./storage');
var resources = require('./resources');

var util = require('util');
var url_parser = require('url');
var fs = require('fs');
var path = require('path');

var card_data = '';

resources.add_on_url_contains('.jpg', function(request, response) {
  respond_with_file(request.url, 'image/jpeg', response)
});
resources.add_on_url_contains('.js', function(request, response) {
  respond_with_file(request.url, 'text/javascript', response);
});
resources.add_on_url_contains('read', function(request, response) {
  var filedata = storage.read_data();
  util.log('file data: ' + filedata);
  render_json_to(filedata, response);
});
resources.add_on_url_contains('write', function(request, response) {
  if (request.method === 'POST') {
    data = '';
    request.on('data', function (some_data) { 
      data += some_data; 
    });
    request.on('end', function () {
      storage.write_data(data); 
      render('text/plain', 'Stored', response);
    });
  }
  else {
    response.statusCode = 404;
    render('text/plain', 'Need to write with a post', response);
  }
});
resources.add_on_url_contains('fetch_cards', function(request, response) {
  var params = url_parser.parse(request.url, true)['query'];
  mingle.fetch_cards(params['username'], params['password'], function(cards) {
    render_json_to(cards, response);
  },
  function(error) {
    render_json_to('[ { text: "' + error + '", id: "999"} ]', response);
  });
});
resources.add_on_url_contains('wall', function(request, response) {
  render_wall_to(response)
});


var respond_with_file = function(url, content_type, response) {
  // TODO securify
  var filedata = fs.readFileSync('.' + url);
  render(content_type, filedata, response);
}

var handler = function(request, response) {
  util.log('url: ' + request.url);
  var handled = false;
  resources.list().forEach(function(resource) {
    if (!handled && resource.handle(request, response)) {
      handled = true;
    }
  });
};

function render(type, content, response) {
  response.setHeader('Content-Type', type);
  response.write(content);
  response.end();
};

function render_json_to(json, response) {
  render('application/json', json, response);
};

function render_wall_to(response) {
  render('text/html', fs.readFileSync('./wall.html', "utf8"), response);
};

var http = require('http');

var server = http.createServer(handler);
server.listen(1234);


