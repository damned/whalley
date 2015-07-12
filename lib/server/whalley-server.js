require('./static-files')

var storage = require('./storage');
var resources = require('./resources');
var fs = require('fs');

var util = require('util');
var url_parser = require('url');
var path = require('path');
var cheerio = require('cheerio');
var card_data = '';

resources.add_on_url('/wall', function(request, response) {
  render_html_to('./fabric_wall.html', response)
});

resources.add_on_url('/walls', function(request, response) {
  render_html_to('./walls.html', response)
});

resources.add_on_get_starts_with('/walls/', function(request, response) {
  var path_labels = url_parser.parse(request.url).pathname.split('/');
  console.log("request.url.path split: " + path_labels);
  render_html_to_response_after_transform('./svg_wall.html', response, function(html) {
    $ = cheerio.load(html);
    $('#wall-id').attr('value', path_labels[path_labels.length - 1]);
    return $.html();
  });
});


function no_resource_found(response) {
  response.writeHead(404);
  response.end();
}

var handler = function(request, response) {
  util.log('url: ' + request.url);
  var handled = false;
  resources.list().forEach(function(resource) {
    if (!handled && resource.handle(request, response)) {
      handled = true;
    }
  });
  if (!handled) {
    no_resource_found(response);
  }
};

function render_html_to(html_filename, response) {
  resources.render('text/html', fs.readFileSync(html_filename, "utf8"), response);
};

function render_html_to_response_after_transform(html_filename, response, transform) {
  var html = fs.readFileSync(html_filename, "utf8");
  resources.render('text/html', transform(html), response);
};

var http = require('http');

var server = http.createServer(handler);
var io = require('socket.io')(server);

io.on('connection', function(socket){
  socket.on('card.move', function(card_data) {
    socket.broadcast.emit('card.move', card_data)
  });
  socket.on('wall.change', function(wall_id) {
    socket.broadcast.emit('wall.change', wall_id)
  });
});

var port = 1234;
console.log('whalley on port ' + port)
server.listen(port);


