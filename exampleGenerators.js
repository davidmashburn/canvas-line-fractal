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

const SampleFractal3 = {
  points: [
    [0, 0],
    [0.25, sq3 / 6],
    [0.5, 0],
    [0.75, -sq3 / 6],
    [1, 0],
  ],
  lines: [
    [1, 0, true],
    [1, 2, false],
    [3, 2, false],
    [3, 4, true],
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

const SierpinskiTriangleL = {
  points: [
    [1 / 2, -sq3 / 8],
    [1 / 4, sq3 / 8],
    [3 / 4, sq3 / 8],
  ],
  lines: [
    [0, 1, false],
    [1, 2, false],
    [2, 0, false],
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

var MonkeysTree = {
  points: [
    [0, 0],
    [1 / 6, sq3 / 6],
    [1 / 3, sq3 / 3],
    [2 / 3, sq3 / 3],
    [5 / 6, sq3 / 6],
    [2 / 3, (2 * sq3) / 9],
    [0.5, (5 * sq3) / 18],
    [1 / 3, (2 * sq3) / 9],
    [1 / 3, sq3 / 9],
    [1 / 3, 0],
    [2 / 3, 0],
    [1, 0],
  ],
  lines: [
    [0, 1, true],
    [2, 1, true],
    [2, 3, false],
    [4, 3, true],
    [5, 4, true],
    [5, 6, true],
    [7, 6, false],
    [8, 7, false],
    [8, 9, false],
    [10, 9, false],
    [11, 10, false],
  ],
};

var BinaryTree = {
  points: [
    [0, 0],
    [1, 0],
    [1.5, sq3 / 6],
    [1.5, -sq3 / 6],
  ],
  lines: [
    [0, 1, false],
    [1, 2, false],
    [1, 3, false],
  ],
};

var HexGrid = {
  points: [
    [0, 0],
    [1, 0],
    [1.5, sq3 / 2],
    [1.5, -sq3 / 2],
  ],
  lines: [
    [0, 1, false],
    [1, 2, false],
    [1, 3, false],
  ],
};

export {
  SampleFractal,
  SampleFractal2,
  SampleFractal3,
  Koch,
  Dragon,
  TwinDragonSkin,
  SierpinskiTriangle,
  SierpinskiTriangleL,
  SierpinskiCarpet,
  MonkeysTree,
  BinaryTree,
  HexGrid,
};
