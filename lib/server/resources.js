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

exports.UrlMatchHandler = function(expected_url, handler) {
  this.handle = function(request, response) {
    if (request.url === expected_url) {
      handler(request, response);
      return true;
    }
    return false;
  }
};

exports.MethodUrlStartsWithHandler = function(method, prefix, handler) {
  function is_match(request) {
    return request.url.indexOf(prefix) === 0  && request.method == method;
  }

  this.handle = function(request, response) {
    if (is_match(request)) {
      handler(request, response);
      return true;
    }
    return false;
  }
}

exports.add_on_url_contains = function(contained, handler) {
  exports.add(new exports.UrlContainsHandler(contained, handler));
}
exports.add_on_get_starts_with = function(prefix, handler) {
  exports.add(new exports.MethodUrlStartsWithHandler('GET', prefix, handler));
}
exports.add_on_url = function(expected, handler) {
  exports.add(new exports.UrlMatchHandler(expected, handler));
}
exports.add_on_put_starts_with = function(prefix, handler) {
  exports.add(new exports.MethodUrlStartsWithHandler('PUT', prefix, handler));
}

exports.render = function(type, content, response) {
  response.setHeader('Content-Type', type);
  response.write(content);
  response.end();
};

exports.render_json_to = function(json, response) {
  exports.render('application/json', json, response);
};


