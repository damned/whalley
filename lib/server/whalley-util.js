var path = require('path');

exports.ensure_dir = function (dirname) {
  if (! (path.existsSync(dirname))) {
    fs.mkdirSync(dirname);
  }
}

exports.describe = function(obj) {
  var props = '';
  for (prop in obj) {
    props += ' - ' + prop + '\n';
  }
  return props;
}



