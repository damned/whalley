var expect = chai.expect;

describe('whalley.event', function() {
  var event, heard, also_heard;
  beforeEach(function(){
    event = whalley.event();
  })

  describe('event()', function() {
    it('creates an event', function() {
      expect(typeof event).to.eq('object')
      expect(typeof event.listen).to.eq('function')
      expect(typeof event.fire).to.eq('function')
    })
  })

  describe('event.listen()', function() {
    beforeEach(function() {
      heard = false;
      also_heard = false;
    })
    it('adds a listener', function() {
      event.listen(function() { heard = true })
      event.fire()
      expect(heard).to.eq(true)
    })
    it('adds multiple listeners', function() {
      event.listen(function() { heard = true })
      event.listen(function() { also_heard = true })
      event.fire()
      expect(heard).to.eq(true)
      expect(also_heard).to.eq(true)
    })
  })
})
