var resources = [];

exports.list = function() {
  return resources;
};

exports.add = function(resource) {
  resources.push(resource);
};

var handler_delegator = function(handler, discriminator) {
  return function(request, response) {
    if (discriminator(request)) {
      try {
        handler(request, response);
      }
      catch (e) {
        console.error("Had a problem (" + e + ") handling request: " + request);
      }
      return true;
    }
    return false;
  }
}

exports.UrlContainsHandler = function(contained, handler) {
  this.handle = handler_delegator(handler, function (request) {
    return request.url.indexOf(contained) !== -1;
  });
};

exports.UrlMatchHandler = function(expected_url, handler) {
  this.handle = handler_delegator(handler, function (request) {
    return request.url === expected_url;
  });
};

exports.MethodUrlStartsWithHandler = function(method, prefix, handler) {
  this.handle = handler_delegator(handler, function (request) {
    return request.url.indexOf(prefix) === 0  && request.method == method;
  });
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


