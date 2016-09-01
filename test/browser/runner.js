var child = require('child_process')
var app = child.spawn('nodejs', ['whalley-node-app.js', '--noauth'])
app.on('error', (err) => {
  console.log('Error running app process while testing: ' + err);
});
process.on('exit', function() {
  echo('Exiting, attempting to kill app, pid: ' + app.pid)
  app.stdin.end()
  app.kill();
  echo('Done')
});
