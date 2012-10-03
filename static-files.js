var resources = require('./resources');
var fs = require('fs');

var respond_with_file = function(url, content_type, response) {
  if (url.indexOf('..') != -1) {
    response.statusCode = 403;
    response.end;
    return;
  }
  var filedata = fs.readFileSync('.' + url);
  resources.render(content_type, filedata, response);
}

resources.add_on_url_contains('.jpg', function(request, response) {
  respond_with_file(request.url, 'image/jpeg', response)
});
resources.add_on_url_contains('.js', function(request, response) {
  respond_with_file(request.url, 'text/javascript', response);
});

