Webcam.attach("webcam");
Webcam.set({
  width: 320,
  height: 240,
  dest_width: 480,
  dest_height: 360,
  image_format: 'jpeg',
  jpeg_quality: 90,
  force_flash: false,
  flip_horiz: true,
  fps: 25
});

cam.style.width = Webcam.params.dest_width + "px";
cam.style.height = Webcam.params.dest_height + "px";

var videoWindow = cam.getElementsByTagName('video')[0];
videoWindow.style.width = cam.style.width;
videoWindow.style.height = cam.style.height;
