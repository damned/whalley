require('./static-files')

var storage = require('./storage');
var resources = require('./resources');
var fs = require('fs');

var util = require('util');
var url_parser = require('url');
var path = require('path');

var card_data = '';

resources.add_on_get_starts_with('/wall', function(request, response) {
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


