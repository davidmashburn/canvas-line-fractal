import { transformPoint } from "./helpers.js";
import { ArrowLine, Point } from "./shapes.js";
import { Generator, generatorFromData } from "./generator.js";

var Fractal = (baseLineData, generatorData, maxDepth=1) => {
    this.maxDepth = maxDepth;
    this.baseStartPoint = new Point(baseLineData.start.x, baseLineData.start.y, "blue");
    this.baseEndPoint = new Point(baseLineData.end.x, baseLineData.end.y, "blue");
    this.baseLine = new ArrowLine(this.baseStartPoint, this.baseEndPoint, false);

    let generatorPoints = generatorData.points.map((point) => {
        return { x: point[0], y: -point[1] };
    });
    
    this.points = generatorPoints.map( point => {
        let point = transformPoint({x:point[0], y:point[1]}, this.baseLine)
        return new Point(point.x, point.y, "red");
    });
    this.lines = generatorData.lines.map(
      (line) => new ArrowLine(points[line[0]], points[line[1]], line[2])
    );
    this.generator = generatorFromData(generatorData);
}
