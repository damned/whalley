require 'shelljs/global'
sys = require 'sys'

echo 'Building...'

child = require 'child_process'

puts = (error, out, err) -> sys.puts out; sys.puts err; sys.puts error

child.exec './node_modules/.bin/mocha --reporter list', puts


echo 'Done.'
