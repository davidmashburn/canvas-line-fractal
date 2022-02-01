import {
  LINE_WIDTH,
  POINT_RADIUS,
  ARROW_LENGTH,
  roundPoint,
  pointDist,
  transformPoint,
  transformPointReverse,
  addPolygonToPath,
} from "./helpers.js";

var Rectangle = function (x, y, width, height, color = "#2793ef") {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.color = color;
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

var Arc = function (
  x,
  y,
  radius,
  radians = Math.PI * 2,
  color = "#2793ef",
  strokeColor = undefined
) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.radians = radians;
  this.color = color;
  this.strokeColor = strokeColor;
  this.isDragging = false;

  this.render = function (ctx) {
    ctx.save();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, this.radians, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    if (this.strokeColor) {
      ctx.strokeStyle = this.strokeColor;
      ctx.lineWidth = LINE_WIDTH;
      ctx.stroke();
    }

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

var Point = function (x, y, color = "red") {
  this.x = x;
  this.y = y;
  this.radius = POINT_RADIUS;
  this.radians = Math.PI * 2;
  this.color = color;
  this.strokeColor = "black";
  this.isDragging = false;

  this.render = function (ctx) {
    ctx.save();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, this.radians, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    if (this.strokeColor) {
      ctx.strokeStyle = this.strokeColor;
      ctx.lineWidth = LINE_WIDTH;
      ctx.stroke();
    }

    ctx.restore();
  };

  this.isHit = function (eventPoint) {
    var dx = this.x - eventPoint.x;
    var dy = this.y - eventPoint.y;
    return dx * dx + dy * dy < this.radius * this.radius;
  };
};

var ArrowLine = function (
  start,
  end,
  externalStartPointIndex,
  externalEndPointIndex,
  mirrored = false
) {
  this.start = start;
  this.end = end;
  this.externalStartPointIndex = externalStartPointIndex;
  this.externalEndPointIndex = externalEndPointIndex;
  this.mirrored = mirrored;

  this.trianglePath = undefined;
  this.lineAreaPath = undefined;
  this.arrowEnabled = true;
  this.isSelected = false;
  this.color = "black";
  this.selectedColor = "blue";
  this.isTriangleDragging = false;

  this.render = function (ctx) {
    ctx.save();

    this.trianglePath = new Path2D();
    this.lineAreaPath = new Path2D();

    let lineLength = pointDist(this.start, this.end);
    if (this.arrowEnabled) {
      //check the line to see if it's long enough to have an arrow
      //exit the function early if it's too short
      if (ARROW_LENGTH <= lineLength - 1 - 2 * POINT_RADIUS) {
        //if line is long enough to fit the arrow

        //set up arrow on the unit line
        let xTip = (lineLength - POINT_RADIUS) / lineLength;
        let xBack = (lineLength - POINT_RADIUS - ARROW_LENGTH) / lineLength;
        let yExtend = ((this.mirrored ? 1 : -1) * ARROW_LENGTH) / lineLength;

        let trianglePoints = [
          { x: xTip, y: 0 },
          { x: xBack, y: 0 },
          { x: xBack, y: yExtend },
        ].map((point) => roundPoint(transformPoint(point, this)));

        //update trianglePath and draw triangle
        addPolygonToPath(this.trianglePath, trianglePoints);
        this.trianglePath.fillStyle = this.color;
        ctx.fill(this.trianglePath);
      }
    }
    //update the lineAreaPath used in isLineHit
    if (start.x != end.x || start.y != end.y) {
      let radius = POINT_RADIUS / lineLength;
      let lineAreaPoints = [
        { x: 0, y: radius },
        { x: 0, y: -radius },
        { x: 1, y: -radius },
        { x: 1, y: radius },
      ].map((point) => roundPoint(transformPoint(point, this)));

      addPolygonToPath(this.lineAreaPath, lineAreaPoints);

      if (this.isSelected) {
        this.lineAreaPath.fillStyle = this.selectedColor;
        ctx.fill(this.lineAreaPath);
      }
    }

    //draw line
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = LINE_WIDTH;
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.restore();
  };
  this.isTriangleHit = function (ctx, point) {
    return ctx.isPointInPath(this.trianglePath, point.x, point.y);
  };
  this.isLineHit = function (ctx, point) {
    return ctx.isPointInPath(this.lineAreaPath, point.x, point.y);
  };
  this.getPointQuadrant = function (point) {
    let transformedPoint = transformPointReverse(point, this);
    return {
      x: transformedPoint.x >= 0.5 ? 1 : -1,
      y: transformedPoint.y >= 0 ? 1 : -1,
    };
  };
  this.quadrantActions = (eventPoint) => {
    const point = transformPointReverse(eventPoint, this);
    return {
      swap: point.x < 0.5,
      mirrored: point.y >= 0,
    };
  };
  this.swapPoints = () => {
    [this.start, this.end] = [this.end, this.start];
    [this.externalStartPointIndex, this.externalEndPointIndex] = [
      this.externalEndPointIndex,
      this.externalStartPointIndex,
    ];
  };
};

function generatePointsAndArrowLinesFromGeneratorData(generatorData, baseLine) {
  const generatorPoints = generatorData.points.map((point) => {
    return { x: point[0], y: -point[1] };
  });
  const points = generatorPoints.map((point) => {
    const newPoint = transformPoint({ x: point.x, y: point.y }, baseLine);
    return new Point(newPoint.x, newPoint.y, "red");
  });
  const lines = generatorData.lines.map(
    (line) =>
      new ArrowLine(points[line[0]], points[line[1]], line[0], line[1], line[2])
  );
  return [points, lines];
}

export {
  Point,
  Rectangle,
  Arc,
  ArrowLine,
  generatePointsAndArrowLinesFromGeneratorData,
};
