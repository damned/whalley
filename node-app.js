var describe = function(obj) {
  var props = '';
  for (prop in obj) {
    props += ' - ' + prop + '\n';
  }
  return props;
}

var util = require('util');
var https = require('https');

var mingle_cards_to_whalley_data = function(mingle_cards) {
  var data = {};
  cards = {};
  data['meta'] = {};
  data['cards'] = cards;
  mingle_cards.forEach(function(single_card) {
    cards[single_card['Number']] = {
      id: single_card['Number'],
      text: single_card['Name']
    }
  });
  return data;
}

var fetch_mingle_cards = function(username, password, on_success, on_error) {
  util.log('making mql request...(using ' + https + ')');

  var mingle_cards = '';

  var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
  var header = {'Host': 'mingle01.thoughtworks.com', 'Authorization': auth};

  https.get({ host: "mingle01.thoughtworks.com", path: "/api/v2/projects/is_websites_development/cards/execute_mql.json?mql=select%20name,%20number%20where%20stage%20%3E%20wishlist%20and%20stage%20%3C%20done", headers: header }, function(res) {
    util.log("Got mql response: " + res.statusCode);
    res.on('data', function(data) {
      util.log("Got data: " + data);
      mingle_cards = mingle_cards + data;
    });
    res.on('end', function() {
      util.log("Got all card data: " + mingle_cards);
      var whalley_card_json = JSON.stringify(mingle_cards_to_whalley_data(JSON.parse(mingle_cards)), undefined, 2);
      util.log("Translated: " + whalley_card_json);
      on_success(whalley_card_json);
    });
  }).on('error', function(error) {
    util.log(error);
    on_error(error);
  });
};

var card_data = '';
var url_parser = require('url');
var fs = require('fs');
var path = require('path');

var ensure_dir = function (dirname) {
  if (! (path.existsSync(dirname))) {
    fs.mkdirSync(dirname);
  }
}

var write_data = function (data) {
  ensure_dir('./.store');
  fs.writeFileSync('.store/json', data, 'utf8');
}

var read_data = function () {
  var file = './.store/json';  
  return path.existsSync(file) ? fs.readFileSync(file, 'utf8') : '[]';
}

var resources = [
  (new function() {
    this.handle = function(request, response) {
      if (request.url.indexOf('.jpg') !== -1) {
        respond_with_file(request.url, 'image/jpeg', response);
        return true;
      }
      return false;
    }
  })
];

var respond_with_file = function(url, content_type, response) {
  // TODO securify
  var filedata = fs.readFileSync('.' + url);
  render(content_type, filedata, response);
}

var handler = function(request, response) {
  util.log('url: ' + request.url);
  var handled = false;
  resources.forEach(function(resource) {
    if (!handled && resource.handle(request, response)) {
      handled = true;
    }
  });
  
  if (handled) {
    // already handled by new funky resources
  }
  else if (request.url.indexOf('wall') !== -1) {
    render_wall_to(response);  
  }
  else if (request.url.indexOf('.js') !== -1) {
    respond_with_file(request.url, 'text/javascript', response);
  }
  else if (request.url.indexOf('read') !== -1) {
    var filedata = read_data();
    util.log('file data: ' + filedata);
    render_json_to(filedata, response);
  }
  else if (request.url.indexOf('write') !== -1) {
    if (request.method === 'POST') {
      data = '';
      request.on('data', function (some_data) { 
        data += some_data; 
      });
      request.on('end', function () {
        write_data(data); 
        render('text/plain', 'Stored', response);
      });
    }
    else {
      response.statusCode = 404;
      render('text/plain', 'Need to write with a post', response);
    }
  }
  else if (request.url.indexOf('fetch_cards') !== -1) {
    var params = url_parser.parse(request.url, true)['query'];
    fetch_mingle_cards(params['username'], params['password'], function(cards) {
      render_json_to(cards, response);
    },
    function(error) {
      render_json_to('[ { Name: "' + error + '", Number: "999"} ]', response);
    });
  }
};

function render(type, content, response) {
  response.setHeader('Content-Type', type);
  response.write(content);
  response.end();
};

function render_json_to(json, response) {
  render('application/json', json, response);
};

function render_wall_to(response) {
  render('text/html', fs.readFileSync('./wall.html', "utf8"), response);
};

var http = require('http');

var server = http.createServer(handler);
server.listen(1234);


