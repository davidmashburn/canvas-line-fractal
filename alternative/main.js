var Rectangle = function (x, y, width, height, color="#2793ef") {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.color=color;
  this.isDragging = false;

  this.render = function (ctx) {
    ctx.save();

    ctx.beginPath();
    ctx.rect(
      this.x - this.width * 0.5,
      this.y - this.height * 0.5,
      this.width,
      this.height
    );
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.restore();
  };

  this.isHit = function (x, y) {
    if (
      x > this.x - this.width * 0.5 &&
      y > this.y - this.height * 0.5 &&
      x < this.x + this.width - this.width * 0.5 &&
      y < this.y + this.height - this.height * 0.5
    ) {
      return true;
    }
    return false;
  };
};

var Arc = function (x, y, radius, radians = Math.PI * 2, color="#2793ef") {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.radians = radians;
  this.color=color;
  this.isDragging = false;

  this.render = function (ctx) {
    ctx.save();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, this.radians, false);
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.restore();
  };

  this.isHit = function (x, y) {
    var dx = this.x - x;
    var dy = this.y - y;
    if (dx * dx + dy * dy < this.radius * this.radius) {
      return true;
    }
    return false;
  };
};

var MouseTouchTracker = function (window, canvas, callback) {
  function processEvent(evt) {
    var rect = canvas.getBoundingClientRect();
    var offsetTop = rect.top;
    var offsetLeft = rect.left;

    if (evt.touches) {
      return {
        x: evt.touches[0].clientX - offsetLeft,
        y: evt.touches[0].clientY - offsetTop,
      };
    } else {
      return {
        x: evt.clientX - offsetLeft,
        y: evt.clientY - offsetTop,
      };
    }
  }

  function onDown(evt) {
    evt.preventDefault();
    var coords = processEvent(evt);
    callback("down", coords.x, coords.y);
  }

  function onUp(evt) {
    evt.preventDefault();
    callback("up");
  }

  function onMove(evt) {
    evt.preventDefault();
    var coords = processEvent(evt);
    callback("move", coords.x, coords.y);
  }

  function onResize(evt) {
    callback("resize", window.innerWidth, window.innerHeight);
  }

  window.onresize = onResize;
  
  window.ontouchmove = onMove;
  window.onmousemove = onMove;

  canvas.ontouchstart = onDown;
  canvas.onmousedown = onDown;
  window.ontouchend = onUp;
  window.onmouseup = onUp;
};

function init() {
  var canvas = document.getElementById("canvas");
  var offScreenCanvas = document.createElement('canvas');
  var ctx = canvas.getContext("2d");
  var ctx_off = offScreenCanvas.getContext("2d");
  var startX = 0;
  var startY = 0;

  canvas.width = window.innerWidth * 0.75 - 10;
  canvas.height = window.innerHeight * 0.95 - 10;
  offScreenCanvas.width = canvas.width;
  offScreenCanvas.height = canvas.height;

  var rectangle_off = new Rectangle(150, 150, 100, 100, "red");
  rectangle_off.render(ctx_off);
  
  var rectangle = new Rectangle(50, 50, 100, 100);
  rectangle.render(ctx);

  var circle = new Arc(200, 140, 50);
  circle.render(ctx);
  
  var canvasIsDragging = false;

  var mtt = new MouseTouchTracker(window, canvas, function (evtType, x, y) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offScreenCanvas, 0, 0);

    switch (evtType) {
      case "down":
        startX = x;
        startY = y;
        [rectangle, circle].some(function (shape) {
          shape.isDragging = shape.isHit(x, y);
          return shape.isDragging;
        });
        canvasIsDragging = true;
        break;

      case "up":
        rectangle.isDragging = false;
        circle.isDragging = false;
        canvasIsDragging = false;
        break;

      case "move":
        var dx = x - startX;
        var dy = y - startY;
        startX = x;
        startY = y;

        if (rectangle.isDragging) {
          rectangle.x += dx;
          rectangle.y += dy;
        }
        else if (circle.isDragging) {
          circle.x += dx;
          circle.y += dy;
        }
        else if (canvasIsDragging) {
          rectangle.x += dx;
          rectangle.y += dy;
          circle.x += dx;
          circle.y += dy;
        }
        break;

      case "resize":
        canvas.width = window.innerWidth * 0.75 - 10;
        canvas.height = window.innerHeight * 0.95 - 10;
        offScreenCanvas.width = canvas.width;
        offScreenCanvas.height = canvas.height;
        break;
    }

    circle.render(ctx);
    rectangle.render(ctx);
  });
}

init();
