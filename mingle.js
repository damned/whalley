var cards_to_whalley_data = function(mingle_cards) {
  var data = {};  //extract and dedupe, mingle, app
  var cards = {};
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

var util = require('util');
var https = require('https');

exports.fetch_cards = function(username, password, on_success, on_error) {
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
      var whalley_card_json = JSON.stringify(cards_to_whalley_data(JSON.parse(mingle_cards)), undefined, 2);
      util.log("Translated: " + whalley_card_json);
      on_success(whalley_card_json);
    });
  }).on('error', function(error) {
    util.log('baboom');
    util.log(error);
    on_error(error);
  });
};

