var downscale = require("./downscale_canvas");
var $ = require("jquery");
var Hammer = require("hammerjs");

var image = document.querySelector("#img");
var overlay = document.querySelector("#overlay");
var cropped = document.querySelector("#cropped");
var volatile_x = 0;
var volatile_y = 0;
var transform = {
    translate: {x: 0, y: 0},
    scale: 1
};
var reqAnimationFrame = (function () {
  return window[Hammer.prefixed(window, 'requestAnimationFrame')] || function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };
})();
var ticking = false;
var mc = new Hammer(overlay);

window.onload = function () {
  $("#uploadBtn").click(showImage);
  $("#crop").click(crop);
  mc.on("pan", repositionOverlay);
  mc.on("panend", updateOverlayValues);
};

function requestElementUpdate() {
  if(!ticking) {
    reqAnimationFrame(updateVals);
    ticking = true;
  }
}

function updateVals () {
    var value = [
        'translate3d(' + transform.translate.x + 'px, ' + transform.translate.y + 'px, 0)'
        // 'scale(' + transform.scale + ', ' + transform.scale + ')'
    ];
    value = value.join(" ");
    overlay.style.webkitTransform = value;
    overlay.style.mozTransform = value;
    overlay.style.transform = value;
    ticking = false;
}

function showImage(evt) {
  evt.preventDefault();
  var input = document.getElementById("inputFile");
  var file = input.files[0];

  fr = new FileReader();
  fr.onload = renderImage;
  fr.readAsDataURL(file);
}

function crop(argument) {
  cropped.classList.remove("hidden");
  image_offset = image.getBoundingClientRect();
  overlay_offset = overlay.getBoundingClientRect();

  var scale_ratio = Math.min(image.naturalWidth, image.naturalHeight) / overlay_offset.width;
  var offset_left = Math.round((overlay_offset.left - image_offset.left) * scale_ratio);
  var offset_top = Math.round((overlay_offset.top - image_offset.top) * scale_ratio);
  var side = Math.round(overlay_offset.width * scale_ratio);

  var sx = offset_left;
  var sy = offset_top;
  var sWidth = side;
  var sHeight = side;

  var dx = 0;
  var dy = 0;
  var dWidth = 360;
  var dHeight = 360;

  cropped.getContext('2d').drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
}

function repositionOverlay (evt) {
  var maxOffset_x = image.getBoundingClientRect().width - overlay.getBoundingClientRect().width;
  var maxOffset_y = image.getBoundingClientRect().height - overlay.getBoundingClientRect().height;
  var upperLimit_x = Math.min(volatile_x + evt.deltaX, maxOffset_x);
  var upperLimit_y = Math.min(volatile_y + evt.deltaY, maxOffset_y);
  var newX = Math.max(0, upperLimit_x);
  var newY = Math.max(0, upperLimit_y);

  transform.translate = {
      x: newX,
      y: newY
  };
  requestElementUpdate();
}

function updateOverlayValues () {
  var offset_x = image.getBoundingClientRect().left;
  var offset_y = image.getBoundingClientRect().top;

  volatile_x = overlay.getBoundingClientRect().left - offset_x;
  volatile_y = overlay.getBoundingClientRect().top - offset_y;
}

function renderImage() {
  var orig_img = new Image();
  orig_img.classList.add("hidden");
  orig_img.src = this.result;

  orig_img.onerror = function () {
    console.log("failed to load a picture!");
  };

  orig_img.onload = function () {
    var landscape = orig_img.naturalWidth > orig_img.naturalHeight;
    var scale_ratio = Math.max(orig_img.naturalWidth, orig_img.naturalHeight) / 480;
    var downscaled = downscale(orig_img, Math.min(0.99 / scale_ratio));
    image.src = downscaled.toDataURL();

    var overlay_side;
    if (landscape) {
      overlay_side = Math.min(orig_img.naturalWidth, orig_img.naturalHeight);
    } else {
      overlay_side = Math.max(orig_img.naturalWidth, orig_img.naturalHeight);
    }

    overlay_side = Math.round(overlay_side / scale_ratio);
    $(overlay)
      .width(overlay_side)
      .height(overlay_side)
      .css({
        "webkitTransform": "translate3d(0px, 0px, 0)",
        "mozTransform": "translate3d(0px, 0px, 0)",
        "transform": "translate3d(0px, 0px, 0)"
      });

    orig_img.remove();
  };

  document.body.appendChild(orig_img);
}
