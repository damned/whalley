var expect = chai.expect;

describe('whalley image capture', function() {
  it('should be an object', function() {
    var view = {};
    expect(whalley.image_capture(view)).to.exist;
  })
})
