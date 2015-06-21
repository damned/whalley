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

exports.GetUrlStartsWithHandler = function(prefix, handler) {
  this.handle = function(request, response) {
    return false;
  }
}

exports.add_on_url_contains = function(contained, handler) {
  exports.add(new exports.UrlContainsHandler(contained, handler));
}
exports.add_on_get_starts_with = function(prefix, handler) {
  exports.add(new exports.GetUrlStartsWithHandler(prefix, handler));
}

exports.render = function(type, content, response) {
  response.setHeader('Content-Type', type);
  response.write(content);
  response.end();
};

exports.render_json_to = function(json, response) {
  exports.render('application/json', json, response);
};


