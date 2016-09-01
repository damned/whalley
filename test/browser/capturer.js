function capturer() {
  var captured = {
    capture: function(name) {
      if (name === 'capture') throw('cannot capture "capture" - conflicts with capture method')
      return (value) => {
        captured[name] = value
        return value
      }
    }
  }
  return captured
}

module.exports = capturer