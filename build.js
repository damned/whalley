require('shelljs/global')
var sys = require('util')

echo('Building...')

var child = require('child_process')

var to_stdout = function(after) {
  return function(error, out, err) {
    sys.puts(out)
    if (err) sys.puts(err)
    if (error) {
      sys.puts("error: " + error)
      process.exit(1)
    }
    after()
  }
}

child.exec('mocha test/server', to_stdout(function() {
  child.exec('mocha test/browser', to_stdout(function() {
    echo('Tests complete')
    process.exit(0)
  }))
}))
