

var describe = function(obj) {
  var props = '';
  for (prop in obj) {
    props += ' - ' + prop + '\n';
  }
  return props;
}

var sys = require('sys');
var handler = function(request, response) {
  sys.log('blah'); 
  sys.log('request: ' + describe(request)); 
  sys.log('response: ' + describe(response)); 
  response.writeHeader('Content-Type', 'text/html');
  response.write('<html><body><div id="message">hello <span class="name">You</span>!</div></body></html>');
  response.end();
};

var http = require('http');
var server = http.createServer(handler);
server.listen(1234);
