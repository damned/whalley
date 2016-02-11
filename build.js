require('shelljs/global')
var sys = require('util')

echo('Building...')

var child = require('child_process')

var to_stdout = function(after) {
  return function(error, out, err) {
    sys.puts(out)
    if (err) sys.puts(err)
    if (error) sys.puts("error: " + error)
    after()
  }
}

var app = child.spawn('nodejs', ['whalley-node-app.js'])
app.on('error', (err) => {
  console.log('Error running app process while testing: ' + err);
});

child.exec('mocha test/server', to_stdout(function() {
  child.exec('mocha test/browser', to_stdout(function() {
    echo('Tests complete')
    process.exit(0)
  }))
}))

process.on('exit', function() {
  echo('Exiting, attempting to kill app, pid: ' + app.pid)
  app.stdin.end()
  app.kill();
  echo('Done')
});