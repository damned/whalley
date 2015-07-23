var expect = chai.expect;

describe('whalley image capture', function() {
  beforeEach(function() {
    $('#sandbox').empty();
  })

  it('is an object', function() {
    var view = {};
    expect(whalley.image_capture(view)).to.exist;
  })
})

describe('whalley image capture view', function() {
  it('places a video and canvas in image capture div', function() {
    $('#sandbox').append('<div id="image-capture"/>');

    var capture_html = $('#image-capture');

    whalley.image_capture_view()

    expect(capture_html.find('video').length).to.equal(1);
    expect(capture_html.find('canvas').length).to.equal(1);
  })

  it('does not throw if webcam not supported', function() {
    var navigator_without_getUserMedia = {}

    whalley.image_capture_view(navigator_without_getUserMedia)
  })
})
