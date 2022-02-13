function rand(bottom, top) {
  return bottom + Math.floor(Math.random() * (top - bottom));
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function roundPoint(point) {
  return { x: Math.round(point.x), y: Math.round(point.y) };
}

function sqrtSumSqr(x, y) {
  return Math.sqrt(x * x + y * y);
}

function pointDist(start, end) {
  return sqrtSumSqr(end.x - start.x, end.y - start.y);
}

function approximateLength(line) {
  return (
    Math.abs(line.end.x - line.start.x) + Math.abs(line.end.y - line.start.y)
  );
}

function convertToLocal(point, rect) {
  return {
    x: point.x - rect.left,
    y: point.v - rect.top,
  };
}

function rectCenter(rect) {
  return {
    x: (rect.top + rect.bottom) / 2,
    y: (rect.left + rect.right) / 2,
  };
}

function isPointInRect(rect, point) {
  return (
    rect.left <= point.x &&
    point.x <= rect.right &&
    rect.top <= point.y &&
    point.y <= r1.bottom
  );
}

function isPointInOval(rect, point) {
  center = rectCenter(rect);

  xrad = center.x - rect.left;
  yrad = center.y - rect.top;

  adjRad = sqrtSumSqr((point.x - center.x) / xrad, (point.y - center.y) / yrad);

  return adjRad <= 1;
}

//rotate&scale followed by translate
// rotation matrix for reference:
// ct, -st
// st, ct
// returns f(point)
// where f(0,0)=start and f(1,0))=end
function transformPoint(pointSrc, lineRef) {
  const start = lineRef.start;
  const end = lineRef.end;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  let pointDes = {
    x: start.x + pointSrc.x * dx - pointSrc.y * dy,
    y: start.y + pointSrc.y * dx + pointSrc.x * dy,
  };
  return pointDes;
}

function transformLine(lineSrc, lineRef) {
  let lineDes = {
    start: transformPoint(lineSrc.start, lineRef),
    end: transformPoint(lineSrc.end, lineRef),
  };
  return lineDes;
}

/*
The parameters have the same geometric meaning, not the same information flow meaning
in other words, in transformPoint, pointSrc is the input, and pointDes is the output
but in transformPointReverse, pointDes is the input, and pointSrc is the output
*/
// translate followed by rotate&scale
// reverse rotation matrix for reference:
// ct, st
// -st, ct
// returns f(point)
// where f(start)=(0,0) and f(end)=(1,0)
function transformPointReverse(pointDes, lineRef) {
  const start = lineRef.start;
  const end = lineRef.end;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const refLengthSq = dx * dx + dy * dy;
  let pointSrc = {
    x:
      ((pointDes.x - start.x) * dx + (pointDes.y - start.y) * dy) / refLengthSq,
    y:
      ((pointDes.y - start.y) * dx - (pointDes.x - start.x) * dy) / refLengthSq,
  };
  return pointSrc;
}

function transformLineReverse(lineDes, lineRef) {
  let lineSrc = {
    start: transformPointReverse(lineDes.start, lineRef),
    end: transformPointReverse(lineDes.end, lineRef),
  };
  return lineSrc;
}

// given two lines (old and new)
// return f(point)
// where f(old.start)=new.start and f(old.end)=new.end
// uses old -> 0010 -> new
function zoomTransformPoint(point, oldLine, newLine) {
  const transPoint = transformPointReverse(point, oldLine);
  return transformPoint(transPoint, newLine);
}

function zoomTransformLine(line, oldLine, newLine) {
  return {
    start:zoomTransformPoint(line.start, oldLine, newLine),
    end:zoomTransformPoint(line.end, oldLine, newLine),
  };
}

function addPolygonToPath(path, points) {
  let point = points[0];
  path.moveTo(point.x, point.y);
  for (let i = 1; i < points.length; i++) {
    point = points[i];
    path.lineTo(point.x, point.y);
  }
  path.closePath();
}

function clonePoint(point) {
  return { x: point.x, y: point.y };
}

function cloneLine(line) {
  return {
    start: clonePoint(line.start),
    end: clonePoint(line.end),
  };
}

function mirrorLine(line) {
  return {
    start: { x: line.start.x, y: -line.start.y },
    end: { x: line.end.x, y: -line.end.y },
  };
}

export {
  rand,
  uuid,
  roundPoint,
  sqrtSumSqr,
  pointDist,
  approximateLength,
  convertToLocal,
  rectCenter,
  isPointInRect,
  isPointInOval,
  transformPoint,
  transformLine,
  transformPointReverse,
  transformLineReverse,
  zoomTransformPoint,
  zoomTransformLine,
  addPolygonToPath,
  clonePoint,
  cloneLine,
  mirrorLine,
};
