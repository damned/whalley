

var describe = function(obj) {
  var props = '';
  for (prop in obj) {
    props += ' - ' + prop + '\n';
  }
  return props;
}

var sys = require('sys');
var card_data = '';
var https = require('https');

sys.log('making mql request...(using ' + https + ')');

    https.get({ host: "mingle01.thoughtworks.com", path: "/api/v2/projects/is_websites_development/cards/execute_mql.json?mql=select%20name,%20number%20where%20stage%20%3E%20wishlist%20and%20stage%20%3C%20done"}, function(res) {
      sys.log("Got mql response: " + res.statusCode);
      res.on('data', function(data) {
        sys.log("Got data: " + data);
        card_data = card_data + data;
      });
      res.on('end', function() {
        sys.log("Got all card data: " + card_data);
      });
    }).on('error', function(error) {
      sys.log(error);
    });

var handler = function(request, response) {
  sys.log('url: ' + request.url); 
  if (request.url.indexOf('wall') !== -1) {
  
  
    sys.log('blah'); 
    sys.log('request: ' + describe(request)); 
    sys.log('response: ' + describe(response)); 
    response.writeHeader('Content-Type', 'text/html');
    response.write('<html><head>' 
    + '<script src="lib/fabric.js"></script>'
    + '</head><body>' 
    +   '<div id="message">hello <span class="name">You</span>!</div>'
    +   '<canvas id="wall" width="940" height="500"></canvas>' 
    +   '<script src="lib/whalley-client.js"></script>'
    +   '<script type="text/javascript">'
    +     'var card_data = ' + card_data + ";"
    +     'draw_cards(card_data);'
    +   '</script>'
    + '</body></html>');
    response.end();
  }
  else if (request.url.indexOf('.js') !== -1) {
    var fs = require('fs');
    var filedata = fs.readFileSync('.' + request.url, "utf8");
    response.writeHeader(200, {'Content-Type': 'text/javascript'});
    response.write(filedata);
    response.end();
  }
};

var connect = require('connect');
var http = require('http');

var server = http.createServer(handler);
server.listen(1234);


