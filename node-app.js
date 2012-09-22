

var describe = function(obj) {
  var props = '';
  for (prop in obj) {
    props += ' - ' + prop + '\n';
  }
  return props;
}

var sys = require('sys');
var https = require('https');

var username = 'dmoore';

var fetch_cards = function(password, on_success, on_error) {
  sys.log('making mql request...(using ' + https + ')');

  var cards = '';

  var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
  var header = {'Host': 'mingle01.thoughtworks.com', 'Authorization': auth};

  https.get({ host: "mingle01.thoughtworks.com", path: "/api/v2/projects/is_websites_development/cards/execute_mql.json?mql=select%20name,%20number%20where%20stage%20%3E%20wishlist%20and%20stage%20%3C%20done", headers: header }, function(res) {
    sys.log("Got mql response: " + res.statusCode);
    res.on('data', function(data) {
      sys.log("Got data: " + data);
      cards = cards + data;
    });
    res.on('end', function() {
      sys.log("Got all card data: " + cards);
      on_success(cards);
    });
  }).on('error', function(error) {
    sys.log(error);
    on_error(error);
  });
};


var card_data = '';
var url_parser = require('url');


var handler = function(request, response) {
  sys.log('url: ' + request.url); 
  if (request.url.indexOf('wall') !== -1) {
    render_wall_to(response);  
  }
  else if (request.url.indexOf('.js') !== -1) {
    var fs = require('fs');
    var filedata = fs.readFileSync('.' + request.url, "utf8");
    response.writeHeader(200, {'Content-Type': 'text/javascript'});
    response.write(filedata);
    response.end();
  }
  else if (request.url.indexOf('fetch_cards') !== -1) {
    var parsed = url_parser.parse(request.url, true);
    sys.log('parsed: ' + describe(parsed));
    var password = parsed['query']['password'];
    fetch_cards(password, function(cards) {
      render_json_to(cards, response);
    },
    function(error) {
      render_json_to('[ { Name: "' + error + '", Number: "999"} ]', response);
    });
  }
};

function render(type, content, response) {
    response.writeHeader('Content-Type', type);
    response.write(content);
    response.end();
};

function render_json_to(json, response) {
    render('application/json', json, response);
};

function render_wall_to(response) {
    render('text/html', 
      '<html><head>' 
      + '<script src="lib/fabric.js"></script>'
      + '<script src="lib/jquery-1.8.2.js"></script>'
      + '<script type="text/javascript">'
      + "  var fetch_cards = function() { var card_data = $.getJSON('fetch_cards?password=' + $('#password').val(), function(card_data) {"
      + '      draw_cards(card_data);'
      + '    });'
      + '  };'
      + '</script>'
      + '</head><body>' 
      +   '<div id="message">hello <span class="name">' + username + '</span>! Please enter password and hit go <input type="password" id="password"/><input type="button" value="Go" onclick="fetch_cards();"/></div>'
      +   '<canvas id="wall" width="940" height="500"></canvas>' 
      + '  <script src="lib/whalley-client.js"></script>'
      + '</body></html>',
      response);
};

var http = require('http');

var server = http.createServer(handler);
server.listen(1234);


