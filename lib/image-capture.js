var whalley = whalley || {};

whalley.webcam = function() {
  var snapToDataUrl = function() {

  };
  return {
    snapToDataUrl: snapToDataUrl
  }
}

whalley.image_capture_view = function() {

  $('#image-capture').append('<video id="video"></video>')
  $('#image-capture').append('<button id="snap">Snap!</button>')
  $('#image-capture').append('<canvas id="video-canvas"></canvas>')
  $('#image-capture').append('<img id="photo"/>')


  var streaming = false,
      video        = $('#video').get(0),
      canvas       = $('#video-canvas').get(0),
      photo        = $('#photo').get(0),
      startbutton  = $('#snap').get(0);

  var image_size = function() {
    return {
      width: 320,
      height: 200
    }
  }

  function video_size() {
    return {
      height: 480,
      width: 640
    }
  }

  navigator.getMedia = (navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia);

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
      function(err) {
        console.log("An error occurred! " + err + " - " + err.message);
      }
  );


  video.onloadedmetadata = function() {
    if (!streaming) {
      var size = image_size();
      video.setAttribute('width', size.width);
      video.setAttribute('height', size.height);
      canvas.setAttribute('width', size.width);
      canvas.setAttribute('height', size.height);
      streaming = true;
    }
  };

  function takepicture() {
    var size = image_size();
    canvas.width = size.width;
    canvas.height = size.height;
    canvas.getContext('2d').drawImage(video, 0, 0, size.width, size.height);
    var data = canvas.toDataURL('image/png');
    console.log("got image data: " + data);
    photo.setAttribute('src', data);
  }

  startbutton.addEventListener('click', function(ev){
    takepicture();
    ev.preventDefault();
  }, false);

  return {

  }
}

whalley.image_capture = function(image_capture_view) {
  var view = image_capture_view || whalley.image_capture_view();

  return {

  }
}
