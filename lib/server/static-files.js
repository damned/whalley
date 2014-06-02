var resources = require('./resources');
var fs = require('fs');

var respond_with_file = function(url, content_type, response) {
  if (url.indexOf('..') != -1) {
    response.statusCode = 403;
    response.end;
    return;
  }
  try {
    var filedata = fs.readFileSync('.' + url);
    resources.render(content_type, filedata, response);
  }
  catch(e) {
    response.statusCode = 404;
    response.end;
  }
}

resources.add_on_url_contains('.jpg', function(request, response) {
  respond_with_file(request.url, 'image/jpeg', response)
});
resources.add_on_url_contains('.png', function(request, response) {
  respond_with_file(request.url, 'image/png', response)
});
resources.add_on_url_contains('.js', function(request, response) {
  respond_with_file(request.url, 'text/javascript', response);
});

