var resources = [];

exports.list = function() {
  return resources;
};

exports.add = function(resource) {
  resources.push(resource);
};

exports.UrlContainsHandler = function(contained, handler) {
  this.handle = function(request, response) {
    if (request.url.indexOf(contained) !== -1) {
      handler(request, response);
      return true;
    }
    return false;
  }
};

exports.add_on_url_contains = function(contained, handler) {
  exports.add(new exports.UrlContainsHandler(contained,handler));
}
