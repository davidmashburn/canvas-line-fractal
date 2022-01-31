import { transformPoint, transformPointReverse } from "./helpers.js";
import {
  ArrowLine,
  generatePointsAndArrowLinesFromGeneratorData,
  Point,
} from "./shapes.js";
import { Generator, generatorFromData } from "./generator.js";

var FractalControl = function (baseLineData, generatorData, maxDepth = 1) {
  this.maxDepth = maxDepth;
  this.baseStartPoint = new Point(
    baseLineData.start.x,
    baseLineData.start.y,
    "blue"
  );
  this.baseEndPoint = new Point(baseLineData.end.x, baseLineData.end.y, "blue");
  this.baseLine = new ArrowLine(
    this.baseStartPoint,
    this.baseEndPoint,
    0,
    1,
    false
  );

  [this.points, this.lines] = generatePointsAndArrowLinesFromGeneratorData(
    generatorData,
    this.baseLine
  );
  this.generator = generatorFromData(generatorData);
  this.render = (ctx) => {
    this.baseLine.render(ctx);
    for (const line of this.lines.concat([this.baseLine])) {
      line.render(ctx);
    }
    for (const point of [this.baseStartPoint, this.baseEndPoint].concat(
      this.points
    )) {
      point.render(ctx);
    }
  };
  this.translateAll = (dx, dy) => {
    for (const point of this.points.concat([
      this.baseEndPoint,
      this.baseStartPoint,
    ])) {
      point.x += dx;
      point.y += dy;
    }
  };
  this.updateGeneratorValuesFromPoints = () => {
    const linePointIndexes = this.lines.map((line) => {
      return {
        start: line.externalStartPointIndex,
        end: line.externalEndPointIndex,
      };
    });
    const genPoints = this.points.map((point) =>
      transformPointReverse(point, this.baseLine)
    );
    for (const [i, line] of this.generator.lines.entries()) {
      const pointIndexes = linePointIndexes[i];
      line.start = genPoints[pointIndexes.start];
      line.end = genPoints[pointIndexes.end];
    }
    this.generator.resetMirror();
  };
  this.updatePointValuesFromGenerator = (generator) => {
    const linePointIndexes = this.lines.map((line) => {
      return {
        start: line.externalStartPointIndex,
        end: line.externalEndPointIndex,
      };
    });
    const newPointArrays = Array(this.points.length).fill([]);
    for (const [i, line] of this.generator.lines.entries()) {
      const pointIndexes = linePointIndexes[i];
      newPointArrays[pointIndexes.start].push(line.start);
      newPointArrays[pointIndexes.end].push(line.end);
    }
    const newPoints = newPointArrays.map((pointArray) => pointArray[0]);

    for (const [i, point] of this.points.entries()) {
      const newPoint = transformPoint(newPoints[i], this.baseLine);
      [point.x, point.y] = [newPoint.x, newPoint.y];
    }
  };

  this.onDown = (ctx, eventPoint) => {
    for (const point of this.points.concat([
      this.baseEndPoint,
      this.baseStartPoint,
    ])) {
      point.isDragging = point.isHit(eventPoint);
      if (point.isDragging) {
        return true;
      }
    }
    for (const line of this.lines.concat([this.baseLine])) {
      if (line.isTriangleHit(ctx, eventPoint)) {
        line.isTriangleDragging = true;
        return true;
      } else if (line.isLineHit(ctx, eventPoint)) {
        line.start.isDragging = true;
        line.end.isDragging = true;
        return true;
      }
    }
    return false;
  };
  this.onUp = () => {
    for (const point of this.points.concat([
      this.baseEndPoint,
      this.baseStartPoint,
    ])) {
      point.isDragging = false;
    }
    for (const line of this.lines.concat([this.baseLine])) {
      line.isTriangleDragging = false;
    }
  };
  this.onMove = (eventPoint, dx, dy) => {
    let updateGenerator = false;
    let updatePoints = false;
    for (const point of [this.baseStartPoint, this.baseEndPoint]) {
      if (point.isDragging) {
        point.x += dx;
        point.y += dy;
        updatePoints = true;
      }
    }
    for (const point of this.points) {
      if (point.isDragging) {
        point.x += dx;
        point.y += dy;
        updateGenerator = true;
      }
    }
    if (this.baseLine.isTriangleDragging) {
      const actions = this.baseLine.quadrantActions(eventPoint);
      const line = this.baseLine;
      if (actions.swap) {
        [line.start, line.end] = [line.end, line.start];
      }
      line.mirrored = actions.mirrored;
      updatePoints = true;
    }
    for (const [lineIndex, line] of this.lines.entries()) {
      if (line.isTriangleDragging) {
        const genLine = this.generator.lines[lineIndex];
        const mirrorLine = this.generator.mirror.lines[lineIndex];
        const actions = this.baseLine.quadrantActions(eventPoint);
        if (actions.swap) {
          line.swapPoints();
          [genLine.start, genLine.end] = [genLine.end, genLine.start][
            (mirrorLine.start, mirrorLine.end)
          ] = [mirrorLine.end, mirrorLine.start];
        }
        // this smells wrong:
        line.mirrored = actions.mirrored;
        genLine.isMirror = actions.mirrored;
        mirrorLine.isMirror = !actions.mirrored;
      }
    }
    if (updatePoints && updateGenerator) {
      throw Error(
        "Something went wrong, can't update both points and generator simultaneiously"
      );
    }
    if (updatePoints) {
      this.updatePointValuesFromGenerator();
    }
    if (updateGenerator) {
      this.updateGeneratorValuesFromPoints();
    }
  };
};
export { FractalControl };
