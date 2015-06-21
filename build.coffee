require 'shelljs/global'
sys = require 'util'

echo 'Building...'

child = require 'child_process'

to_stdout = (error, out, err) ->
  sys.puts out;
  sys.puts err if err
  sys.puts "error: #{error}" if error

child.exec './node_modules/.bin/mocha
             --reporter dot
             --compilers coffee:coffee-script
             test/server', to_stdout

echo 'Done.'
