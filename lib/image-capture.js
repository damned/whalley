var whalley = whalley || {};

whalley.webcam = function() {
  var snapshot = function() {

  };
  var capture_to = function(video) {

  }
  return {
    stream_to: capture_to,
    snapshot: snapshot
  }
}

whalley.image_capture_view = function() {

  var capture_bar = $('#image-capture');
  var display = $('<div/>').appendTo(capture_bar);
  display.append('<video id="video"></video>')
  display.append('<button id="snap">Snap!</button>')
  display.append('<canvas id="video-canvas" style="display: none"></canvas>')
  display.append('<img id="photo"/>')
  var displayToggle = $('<button id="toggle-capture">image...</button>').appendTo(capture_bar);
  displayToggle.click(function () {
    display.slideToggle('slow');
  })

  var streaming = false,
      video        = $('#video').get(0),
      canvas       = $('#video-canvas').get(0),
      photo        = $('#photo').get(0),
      snap  = $('#snap').get(0);

  var size = function(element) {
    var scale = (element.tagName == 'VIDEO') ? 1 : 0.3;
    var size = {
      width: 320 * scale,
      height: 240 * scale
    };
    if (element) {
      element.width = size.width;
      element.height = size.height;
    }
    return size;
  }

  size(video);
  size(canvas);

  navigator.getMedia = (navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia);

  var error_handler = function (err) {
    console.log("An error occurred! " + err + " - " + err.message);
  };
  navigator.getMedia(
      {
        video: true,
        audio: false
      },
      function(stream) {
        if (navigator.mozGetUserMedia) {
          video.mozSrcObject = stream;
        } else {
          var vendorURL = window.URL || window.webkitURL;
          video.src = vendorURL.createObjectURL(stream);
        }
        video.play();
      },
      error_handler
  );

  video.onloadedmetadata = function() {
    if (!streaming) {
      streaming = true;
    }
  };

  function takepicture() {
    canvas.getContext('2d').drawImage(video, 0, 0, size(canvas).width, size(canvas).height);
    var data = canvas.toDataURL('image/png');
    console.log("got image data: " + data);
    photo.setAttribute('src', data);
    after_snapshot(data)
  }

  snap.addEventListener('click', function(ev){
    takepicture();
    ev.preventDefault();
  }, false);

  var snapshot_handler;
  var snapshot_error_handler;

  function after_snapshot(data) {
    if (snapshot_handler && data.indexOf('data:image') == 0) {
      snapshot_handler(data);
    }
    else {
      snapshot_error_handler('Ooops not got no valid image data');
    };
  }

  function on_snapshot(success, error) {
    snapshot_handler = success;
    snapshot_error_handler = error;
  }

  return {
    on_snapshot: on_snapshot
  }
}

whalley.image_capture = function(image_capture_view) {
  var view = image_capture_view || whalley.image_capture_view();

  function set_snapshot_handler(success, error) {
    return view.on_snapshot(success, error);
  }

  return {
    on_snapshot: set_snapshot_handler
  }
}
