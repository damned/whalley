

var describe = function(obj) {
  var props = '';
  for (prop in obj) {
    props += ' - ' + prop + '\n';
  }
  return props;
}

var sys = require('sys');
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


