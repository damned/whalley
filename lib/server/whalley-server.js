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
  mingle.fetch_cards(
    params['username'], 
    params['password'], 
    function(data) {
      util.log('got data back from mingle: ' + data)
      resources.render_json_to(data, response);
    },
    function(error) {
      util.log('yep, got an error: ' + error)
      var data = {};  //extract and dedupe, mingle, app
      var cards = [];
      data['meta'] = {};
      data['cards'] = cards;
      cards.push({
        text: 'fetch from mingle failed (' + error + ')',
        id: 999
      });
      resources.render_json_to(JSON.stringify(data), response);
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
var io = require('socket.io')(server);

io.on('connection', function(socket){
  util.log('a user connected');
  socket.on('card.move', function(card_data) {
    util.log('card.move: ' + card_data)
    socket.broadcast.emit('card.move', card_data)
  });
});

var port = 1234;
console.log('whalley on port ' + port)
server.listen(port);


