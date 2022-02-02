function cloneLine(line) {
  return {
    start: { x: line.start.x, y: line.start.y },
    end: { x: line.end.x, y: line.end.y },
  };
}

function mirrorLine(line) {
  return {
    start: { x: line.start.x, y: -line.start.y },
    end: { x: line.end.x, y: -line.end.y },
  };
}

var Generator = function (
  lines,
  isMirror = false,
  generators = undefined,
  mirror = undefined
) {
  this.lines = lines.map(cloneLine);
  this.isMirror = isMirror;
  this.generators = generators;
  if (!generators) {
    this.generators = Array(lines.length).fill(this);
  }
  if (mirror) {
    this.mirror = mirror;
  } else {
    let mirroredLines = this.lines.map(mirrorLine);
    let mirroredGenerators = this.generators.map((g) => g.mirror);
    this.mirror = new Generator(
      mirroredLines,
      !isMirror,
      mirroredGenerators,
      this
    );
  }

  this.resetMirror = function () {
    this.mirror.lines = this.lines.map(mirrorLine);
    this.mirror.isMirror = !this.isMirror;
    this.mirror.generators = this.generators.map((g) => g.mirror);
  };

  this.setGenerators = function (generators) {
    this.generators = generators;
    this.mirror.generators = this.generators.map((g) => g.mirror);
  };
};

function generatorFromData(data) {
  const points = data.points.map((point) => {
    return { x: point[0], y: -point[1] };
  });
  const lines = data.lines.map((line) => {
    return { start: points[line[0]], end: points[line[1]] };
  });
  const generator = new Generator(lines);
  generator.setGenerators(
    data.lines.map((line) => (line[2] ? generator.mirror : generator))
  );

  return generator;
}

export { Generator, generatorFromData };
