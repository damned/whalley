// params - object with properties:
//   from: object to forward methods from
//   to: object to forward methods to
//   methods: space-separated string of method names
function forward(params) {
  if (params.methods !== undefined) {
    params.methods.split(' ').forEach(function(method) {
      params.from[method] = params.to[method].bind(params.to)
    })
  }
  if (params.properties !== undefined) {
    params.properties.split(' ').forEach(function(prop) {
      params.from.__defineGetter__(prop, function() { return params.to[prop] })
    })
  }
}
