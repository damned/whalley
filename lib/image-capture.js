var whalley = whalley || {};
whalley.image_capture_view = function() {

  $('#image-capture').append('<video id="video"></video>')
  $('#image-capture').append('<button id="snap">Snap!</button>')
  $('#image-capture').append('<canvas id="video-canvas"></canvas>')
  $('#image-capture').append('<img id="photo"/>')


  var streaming = false,
      video        = $('#video').get(0),
      canvas       = $('#video-canvas').get(0),
      photo        = $('#photo').get(0),
      startbutton  = $('#snap').get(0),
      width = 160,
      height = 0;

  navigator.getMedia = ( navigator.getUserMedia ||
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
        console.log("An error occurred! " + err);
      }
  );

  function video_size() {
    var height = video.videoHeight;
    var width = video.videoWidth;
    console.log("video height, width: " + height + ", " + width)
    return {
      height: 480,
      width: 640
    }
  }

  video.onloadedmetadata = function() {
    if (!streaming) {
      var size = video_size();
      height = size.height / (size.width / width);
      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      streaming = true;
    }
  };

  function takepicture() {
    video_size();
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(video, 0, 0, width, height);
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
