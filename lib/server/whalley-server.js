require('./static-files')

var storage = require('./storage-routes');
var resources = require('./resources');
var fs = require('fs');

var util = require('util');
var url_parser = require('url');
var path = require('path');
var cheerio = require('cheerio');
var whalley_args = require('minimist')(process.argv.slice(2), {
  boolean: 'noauth',
  default: {
    noauth: false,
    http_port: 1234,
    https_port: 4321
  }
});

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
var create_socketio_handler = function(name, slave_socket) {
  function emit_card_move(emitter, card_data) {
    emitter.emit('card.move', card_data)
  }
  function emit_wall_change(emitter, wall_id) {
    emitter.emit('wall.change', wall_id)
  }
  return function(socket) {
    socket.on('card.move', function(card_data) {
      emit_card_move(socket.broadcast, card_data);
      if (slave_socket) {
        emit_card_move(slave_socket, card_data);
      }
    })
    socket.on('wall.change', function(wall_id) {
      emit_wall_change(socket.broadcast, wall_id);
      if (slave_socket) {
        emit_wall_change(slave_socket, wall_id);
      }
    })
  }
}
var socketio_handler = create_socketio_handler('insecure');
io.on('connection', socketio_handler);
var secure_socketio_handler = create_socketio_handler('secure', io);

var secure_server;
console.log('whalley on http_port: ' + whalley_args.http_port)

server.listen(whalley_args.http_port);
function read_https_key_options() {
  return {
    key: fs.readFileSync('./whalley.key'),
    cert: fs.readFileSync('./whalley.crt')
  };
}


var https_key_options = read_https_key_options();

function build_auth_options(auth) {
  var basic
  try {
    basic = auth.basic({realm: 'whalley', file: './whalley.htpasswd'})
  }
  catch (e) {
    console.log('Problem loading password file - secure access disabled.  Use:\n' +
      '  htpasswd -bc whalley.htpasswd <username> <password>\n' +
      'to create password file')
  }
  return basic
}

function start_secure_server() {
  var auth = require('http-auth')
  var server_options = [ https_key_options ]
  if (!whalley_args.noauth) {
    var auth_options = build_auth_options(auth);
    if (auth_options === undefined) return;
    console.log("https auth options: " + JSON.stringify(auth_options))
    server_options.unshift(auth_options);
  }
  server_options.push(handler)

  secure_server = https.createServer.apply(https, server_options);
  var ios = require('socket.io')(secure_server);
  ios.on('connection', secure_socketio_handler);
  console.log('whalley on https_port: ' + whalley_args.https_port)
  secure_server.listen(whalley_args.https_port);
}

if (https_key_options) {
  start_secure_server();
}

