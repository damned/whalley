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
var https = require('https');

var server = http.createServer(handler);
var io = require('socket.io')(server);
var socketio_handler = function(socket){
  socket.on('card.move', function(card_data) {
    socket.broadcast.emit('card.move', card_data)
  });
  socket.on('wall.change', function(wall_id) {
    socket.broadcast.emit('wall.change', wall_id)
  });
}
io.on('connection', socketio_handler);

var insecure_port = process.argv[2] || 1234;
var secure_port = process.argv[3] || 4321;

var secure_server;
console.log('whalley on insecure_port ' + insecure_port)

server.listen(insecure_port);
function read_secure_options() {
  return {
    key: fs.readFileSync('./whalley.key'),
    cert: fs.readFileSync('./whalley.crt')
  };
}


var secure_options = read_secure_options();
if (secure_options) {
  secure_server = https.createServer(secure_options, handler);
  var ios = require('socket.io')(secure_server);
  ios.on('connection', socketio_handler);
  console.log('whalley on secure_port ' + secure_port)
  secure_server.listen(secure_port);
}


