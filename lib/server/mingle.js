var cards_to_whalley_data = function(mingle_cards) {
  var data = {};  //extract and dedupe, mingle, app
  var cards = {};
  data['meta'] = {};
  data['cards'] = cards;
  mingle_cards.forEach(function(single_card) {
    cards[single_card['Number']] = {
      id: single_card['Number'],
      text: single_card['Name'],
      status: single_card['Status']
    }
  });
  return data;
}

var util = require('util');
var https = require('https');

exports.fetch_cards = function(username, password, on_success, on_error) {
  util.log('making mql request...(using ' + https + ')');

  var response_data = '';

  var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
  var host = 'tw-digital.mingle.thoughtworks.com';
  var header = {'Host': host, 'Authorization': auth};

  var mingle_error = function(error) {
    util.log('baboom');
    util.log(error);
    on_error(error);
  }

  https.get({ host: host, path: "/api/v2/projects/tw_dot_com/cards/execute_mql.json?mql=select%20name,%20number,%20status%20where%20(type%20%3D%20story%20or%20type%20%3D%20%27hygiene%20story%27%20or%20type%20%3D%20defect%20or%20type%20%3D%20content)%20and%20status%20%3C%20%27done%20(deployed%20to%20live)%27%20and%20status%20%3E%3D%20next", headers: header }, function(res) {
    var looks_ok = res.statusCode === 200;
    util.log("Got mql response: " + res.statusCode + ", looks_ok: " + looks_ok);
    res.on('data', function(data) {
      util.log("Got data: " + data);
      response_data = response_data + data;
    });
    res.on('end', function() {
      util.log("Got all card data: " + response_data);
      if (looks_ok) {
        var whalley_card_json = JSON.stringify(cards_to_whalley_data(JSON.parse(response_data)), undefined, 2);
        util.log("Translated: " + whalley_card_json);
        on_success(whalley_card_json);
      }
      else {
        mingle_error(response_data);
      }
    });
  }).on('error', function(error) {
    mingle_error(error);
  });
};

