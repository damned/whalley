require('shelljs/global')
var sys = require('util')

echo('Building...')

var child = require('child_process')

var to_stdout = function(error, out, err) {
  sys.puts(out)
  if (err) sys.puts(err)
  if (error) sys.puts("error: " + error)
}

child.exec('mocha test/server', to_stdout)
child.exec('mocha test/browser', to_stdout)

echo('Done.')
