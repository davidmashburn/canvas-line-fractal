const sq3 = Math.sqrt(3);

const SampleFractal = {
  points: [
    [0, 0],
    [0.5, 0.5],
    [1, 0],
  ],
  lines: [
    [0, 1, false],
    [1, 2, false],
  ],
};

const SampleFractal2 = {
    points: [
      [0, 0],
      [0.5, 0.5],
      [1, 0],
    ],
    lines: [
      [0, 1, false],
      [1, 2, true],
    ],
  };

const Koch = {
  points: [
    [0, 0],
    [1 / 3, 0],
    [1 / 2, sq3 / 6],
    [2 / 3, 0],
    [1, 0],
  ],
  lines: [
    [0, 1, false],
    [1, 2, false],
    [2, 3, false],
    [3, 4, false],
  ],
};

const Dragon = {
  points: [
    [0, 0],
    [1 / 2, 1 / 2],
    [1, 0],
  ],
  lines: [
    [1, 0, false],
    [1, 2, false],
  ],
};

const TwinDragonSkin = {
  points: [
    [0, 0],
    [1 / 4, 1 / 4],
    [3 / 4, -1 / 4],
    [1, 0],
  ],
  lines: [
    [0, 1, false],
    [1, 2, false],
    [2, 3, false],
  ],
};

const SierpinskiTriangle = {
  points: [
    [0, 0],
    [1 / 2, 0],
    [1 / 4, sq3 / 4],
  ],
  lines: [
    [0, 1, false],
    [1, 2, false],
    [2, 0, false],
  ],
};

const SierpinskiCarpet = {
  points: [
    [0, 0],
    [0, 1 / 3],
    [1 / 3, 0],
    [1 / 3, 1 / 3],
    [2 / 3, 0],
    [2 / 3, 1 / 3],
  ],
  lines: [
    [0, 2, false],
    [2, 3, false],
    [3, 1, false],
    [1, 0, false],
    [2, 4, false],
    [4, 5, false],
    [5, 3, false],
    [3, 2, false],
  ],
};

export {
  SampleFractal,
  SampleFractal2,
  Koch,
  Dragon,
  TwinDragonSkin,
  SierpinskiTriangle,
  SierpinskiCarpet,
};
