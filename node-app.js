require('./static-files')

var mingle = require('./mingle');
var storage = require('./storage');
var resources = require('./resources');
var fs = require('fs');

var util = require('util');
var url_parser = require('url');
var path = require('path');

var card_data = '';

resources.add_on_url_contains('fetch_cards', function(request, response) {
  var params = url_parser.parse(request.url, true)['query'];
  mingle.fetch_cards(params['username'], params['password'], function(cards) {
    resources.render_json_to(cards, response);
  },
  function(error) {
    resources.render_json_to('[ { text: "' + error + '", id: "999"} ]', response);
  });
});
resources.add_on_url_contains('wall', function(request, response) {
  render_wall_to(response)
});


var handler = function(request, response) {
  util.log('url: ' + request.url);
  var handled = false;
  resources.list().forEach(function(resource) {
    if (!handled && resource.handle(request, response)) {
      handled = true;
    }
  });
};

function render_wall_to(response) {
  resources.render('text/html', fs.readFileSync('./wall.html', "utf8"), response);
};

var http = require('http');

var server = http.createServer(handler);
server.listen(1234);


