var whalley = whalley || {}
whalley.log = {
  level: 'info',
  debug: function() {
    if (whalley.log.level == 'debug') {
      console.log.apply(console, arguments)
    }
  },
  info: function() {
    console.log.apply(console, arguments)
  },
  log: function() {
    console.log.apply(console, arguments)
  }
};