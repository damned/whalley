// params - object with properties:
//   from: object to forward methods from
//   to: object to forward methods to
//   methods: space-separated string of method names
function forward(params) {
  params.methods.split(' ').forEach(function(method) {
    params.from[method] = params.to[method].bind(params.to)
  })
}
