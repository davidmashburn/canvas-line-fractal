import { cloneLine, mirrorLine } from "./helpers.js";

class Generator {
  constructor(
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
  }
  resetMirror() {
    this.mirror.lines = this.lines.map(mirrorLine);
    this.mirror.isMirror = !this.isMirror;
    this.mirror.generators = this.generators.map((g) => g.mirror);
  }
  setGenerators(generators) {
    this.generators = generators;
    this.mirror.generators = this.generators.map((g) => g.mirror);
  }
}

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

function getPointsFromGenerator(generator, linePointIndexes) {
  const maxIndex = Math.max(
    ...linePointIndexes.map((i) => Math.max(i.start, i.end))
  );
  const newPointArrays = [...Array(maxIndex + 1).keys()].map((x) => []); // make array of empty arrays
  for (const [i, line] of generator.lines.entries()) {
    const pointIndexes = linePointIndexes[i];
    newPointArrays[pointIndexes.start].push(line.start);
    newPointArrays[pointIndexes.end].push(line.end);
  }
  const newPoints = newPointArrays.map((pointArray) => pointArray[0]);
  return newPoints;
}

export { Generator, generatorFromData, getPointsFromGenerator };
