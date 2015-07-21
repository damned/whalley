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
  var displayToggle = $('<button id="toggle-capture">image...</button>').appendTo(capture_bar);
  var display = $('<div style="display: none"/>').appendTo(capture_bar);
  display.append('<video id="video"></video>')
  display.append('<button id="snap_card">A card!</button>')
  display.append('<button id="snap_wall">The wall!</button>')
  display.append('<canvas id="video-canvas" style="display: none"></canvas>')
  display.append('<img id="photo"/>')
  displayToggle.click(function () {
    display.slideToggle('slow', function() { display.attr('display', 'none')});
  })

  var streaming = false,
      video        = $('#video').get(0),
      canvas       = $('#video-canvas').get(0),
      photo        = $('#photo').get(0),
      snap_card  = $('#snap_card').get(0),
      snap_wall  = $('#snap_wall').get(0);

  var size = function(element) {
    var size = {
      width: 320,
      height: 240
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

  function takepicture(target) {
    canvas.getContext('2d').drawImage(video, 0, 0, size(canvas).width, size(canvas).height);
    var data = canvas.toDataURL('image/png');
    console.log("got image data: " + data);
    photo.setAttribute('src', data);
    after_snapshot(target, data)
  }

  snap_card.addEventListener('click', function(ev){
    takepicture('card');
    ev.preventDefault();
  }, false);
  snap_wall.addEventListener('click', function(ev){
    takepicture('wall');
    ev.preventDefault();
  }, false);

  var snapshot_handler;
  var snapshot_error_handler;

  function after_snapshot(target, data) {
    if (snapshot_handler && data.indexOf('data:image') == 0) {
      snapshot_handler(target, data);
    }
    else {
      snapshot_error_handler('Ooops not got no valid image data');
    };
  }

  function on_snapshot(success, error) {
    snapshot_handler = success;
    snapshot_error_handler = error;
  }

  function hide() {
    if ($(display).is(':visible')) {
      displayToggle.click();
    }
  }

  return {
    on_snapshot: on_snapshot,
    hide: hide
  }
}

whalley.image_capture = function(image_capture_view) {
  var view = image_capture_view || whalley.image_capture_view();

  function set_snapshot_handler(success, error) {
    return view.on_snapshot(success, error);
  }

  function hide() {
    view.hide();
  }
  return {
    on_snapshot: set_snapshot_handler,
    hide: hide
  }
}
