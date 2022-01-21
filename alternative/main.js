var Rectangle = function (x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
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
    ctx.fillStyle = "#2793ef";
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

var Arc = function (x, y, radius, radians = Math.PI * 2) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.radians = radians;
  this.isDragging = false;

  this.render = function (ctx) {
    ctx.save();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, this.radians, false);
    ctx.fillStyle = "#2793ef";
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

var MouseTouchTracker = function (canvas, callback) {
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

  canvas.ontouchmove = onMove;
  canvas.onmousemove = onMove;

  canvas.ontouchstart = onDown;
  canvas.onmousedown = onDown;
  canvas.ontouchend = onUp;
  canvas.onmouseup = onUp;
};

function init() {
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var startX = 0;
  var startY = 0;

  var rectangle = new Rectangle(50, 50, 100, 100);
  rectangle.render(ctx);

  var circle = new Arc(200, 140, 50);
  circle.render(ctx);

  var mtt = new MouseTouchTracker(canvas, function (evtType, x, y) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (evtType) {
      case "down":
        startX = x;
        startY = y;
        [rectangle, circle].some(function (shape) {
          shape.isDragging = shape.isHit(x, y);
          return shape.isDragging;
        });
        break;

      case "up":
        rectangle.isDragging = false;
        circle.isDragging = false;
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

        if (circle.isDragging) {
          circle.x += dx;
          circle.y += dy;
        }
        break;
    }

    circle.render(ctx);
    rectangle.render(ctx);
  });

  var canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx = canvas.getContext("2d");
  var startX = 0;
  var startY = 0;

  var rectangle = new Rectangle(50, 50, 100, 100);
  rectangle.render(ctx);

  var circle = new Arc(200, 140, 50);
  circle.render(ctx);

  var mtt = new MouseTouchTracker(canvas, function (evtType, x, y) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (evtType) {
      case "down":
        startX = x;
        startY = y;
        [rectangle, circle].some(function (shape) {
          shape.isDragging = shape.isHit(x, y);
          return shape.isDragging;
        });
        break;

      case "up":
        rectangle.isDragging = false;
        circle.isDragging = false;
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

        if (circle.isDragging) {
          circle.x += dx;
          circle.y += dy;
        }
        break;
    }

    circle.render(ctx);
    rectangle.render(ctx);
  });
}

init();
