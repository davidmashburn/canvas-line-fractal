import { SampleFractal, SampleFractal2 } from "./exampleGenerators.js";
import { generatorFromData } from "./generator.js";

const it = (desc, fn) => {
  try {
    fn();
    console.log("\x1b[32m%s\x1b[0m", `\u2714 ${desc}`);
  } catch (error) {
    console.log("\n");
    console.log("\x1b[31m%s\x1b[0m", `\u2718 ${desc}`);
    console.error(error);
  }
};

function assert(isTrue) {
  if (!isTrue) {
    throw new Error();
  }
}

it("should have the lines", () => {
  let g = generatorFromData(SampleFractal);
  console.log(g.lines[0].start);
  assert(g.lines[0].start.x == 0);
  assert(g.lines[0].start.y == 0);
  assert(g.lines[0].end.x == 0.5);
  assert(g.lines[1].start.x == g.lines[0].end.x);
  assert(g.lines[1].start.y == g.lines[0].end.y);
  assert(g.lines[1].end.x == 1);
  assert(g.lines[1].end.y == 0);
});

it("should be the mirror of its mirror", () => {
  let g = generatorFromData(SampleFractal);
  assert(g.mirror.mirror === g);
});

it("should preserve mirroring", () => {
  let g = generatorFromData(SampleFractal2);
  assert(g.generators[0] === g);
  assert(g.generators[1] === g.mirror);
  assert(g.mirror.generators[0] === g.mirror);
  assert(g.mirror.generators[1] === g);
});
