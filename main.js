import { INITIAL_BASE_LINE_DATA } from "./constants.js";

import { uuid, zoomTransformLine, clonePoint, cloneLine } from "./helpers.js";

import { getPointsFromGenerator } from "./generator.js";

import { getDrawFractalIterator } from "./drawFractal.js";

import { FractalControl } from "./fractalControl.js";

import { registerPointerEvents } from "./pointerEventHandler.js";

import * as exampleGenerators from "./exampleGenerators.js";

function resetCanvasSize(canvas, offScreenCanvas) {
  const titleHeight = document.getElementsByClassName("header")[0].offsetHeight;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - titleHeight;
  offScreenCanvas.width = canvas.width;
  offScreenCanvas.height = canvas.height;
}

// Compatibility animation loop
window.requestAnimFrame = (function (callback) {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 0);
    }
  );
})();

function raw_draw(ctx, offScreenCanvas, fractalControls, drawingOptions) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(offScreenCanvas, 0, 0);
  for (const fractalControl of fractalControls) {
    fractalControl.setScale(drawingOptions.largeControls ? 2 : 1);
  }

  if (!drawingOptions.hideControls) {
    for (const fractalControl of fractalControls) {
      fractalControl.render(ctx);
    }
  }
}

class MainController {
  constructor() {
    this.isDrawingLoop = true; // global drawing controller
    this.canvas = document.getElementById("mainCanvas");
    this.offScreenCanvas = document.getElementById("offScreenCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.ctx_off = this.offScreenCanvas.getContext("2d");
    this.startPoint = { x: 0, y: 0 }; // for use while moving points
    this.drawingOptions = {
      // global drawing options
      maxDepth: false,
      drawAllLines: false,
    };
    this.dropDownGeneratorDataOptions = Object.fromEntries(
      Object.keys(exampleGenerators).map((key) => [key, exampleGenerators[key]])
    );
    this.fractalControls = [
      new FractalControl(INITIAL_BASE_LINE_DATA, this.dropDownGeneratorDataOptions.Koch),
    ];
    this.canvasIsPanning = false;
    this.origTwoFingerLine;
    this.drawFractalIterator;

    this.setupLeftPane();
    resetCanvasSize(this.canvas, this.offScreenCanvas);
    this.refreshDrawFractalIter();
    registerPointerEvents(window, this.canvas, this.pointerCallback.bind(this));
    raw_draw(
      this.ctx,
      this.offScreenCanvas,
      this.fractalControls,
      this.drawingOptions
    );
  }
  setupLeftPane() {
    var presetsDropdown = document.getElementById("ChoosePreset");
    presetsDropdown.options.length = 0;
    const presetNames = Object.keys(this.dropDownGeneratorDataOptions);
    for (const name of presetNames) {
      presetsDropdown.options.add(new Option(name, name));
    }
    presetsDropdown.selectedIndex = presetNames.indexOf("Koch");

    presetsDropdown.onchange = () => {
      const baseLineData = cloneLine(this.fractalControls[0].baseLine);
      this.fractalControls = [
        new FractalControl(
          baseLineData,
          this.dropDownGeneratorDataOptions[presetsDropdown.value]
        ),
      ];
      this.refreshDrawFractalIter(true);
    };
    document.getElementById("StartStop").onclick = () => {
      if (!this.isDrawingLoop) {
        this.isDrawingLoop = true;
        loop();
      } else {
        this.isDrawingLoop = false;
      }
    };

    document.getElementById("ResetZoom").onclick = () => {
      for (const fractalControl of this.fractalControls) {
        fractalControl.setBaseLine(INITIAL_BASE_LINE_DATA);
      }
      this.refreshDrawFractalIter(true);
    };
    document.getElementById("LogGenerator").onclick = () => {
      for (const fractalControl of this.fractalControls) {
        const linePointIndexes = fractalControl.lines.map((line) => {
          return {
            start: line.externalStartPointIndex,
            end: line.externalEndPointIndex,
          };
        });
        const pointData = getPointsFromGenerator(
          fractalControl.generator,
          linePointIndexes
        ).map((p) => [p.x, -p.y]);
        const lineData = fractalControl.lines.map((line) => [
          line.externalStartPointIndex,
          line.externalEndPointIndex,
          line.mirrored,
        ]);
        console.log({ points: pointData, lines: lineData });
      }
    };
  }
  refreshDrawFractalIter(clear_ctx_off = false) {
    if (clear_ctx_off) {
      this.ctx_off.clearRect(
        0,
        0,
        this.ctx_off.canvas.width,
        this.ctx_off.canvas.height
      );
    }
    this.drawFractalIterator = getDrawFractalIterator(
      this.ctx_off,
      this.fractalControls[0].generator,
      this.fractalControls[0].baseLine,
      this.drawingOptions.maxDepth,
      this.drawingOptions.drawAllLines
    );
  }
  pointerCallback(
    evtType,
    evtPoint,
    evtPoint2 = undefined,
    evtDelta = undefined,
    modifiers = undefined
  ) {
    switch (evtType) {
      case "down":
        this.startPoint = clonePoint(evtPoint);
        this.canvasIsPanning = true;

        for (const fractalControl of this.fractalControls) {
          if (fractalControl.onDown(this.ctx, evtPoint)) {
            this.canvasIsPanning = false;
            break;
          }
        }
        break;

      case "up":
        for (const fractalControl of this.fractalControls) {
          fractalControl.onUp();
        }
        this.canvasIsPanning = false;
        this.origTwoFingerLine = undefined;
        break;

      case "move":
        const delta = {
          x: evtPoint.x - this.startPoint.x,
          y: evtPoint.y - this.startPoint.y,
        };
        this.startPoint = clonePoint(evtPoint);

        for (const fractalControl of this.fractalControls) {
          fractalControl.onMove(evtPoint, delta);
        }
        if (this.canvasIsPanning) {
          for (const fractalControl of this.fractalControls) {
            fractalControl.translateAll(delta);
          }
        }
        this.refreshDrawFractalIter(true);
        break;
      case "two-finger":
        if (this.canvasIsPanning) {
          this.canvasIsPanning = false;
          this.origTwoFingerLine = { start: evtPoint, end: evtPoint2 };
          for (const fractalControl of this.fractalControls) {
            fractalControl.origBaseLine = cloneLine(fractalControl.baseLine);
          }
        } else if (this.origTwoFingerLine) {
          let newTwoFingerLine = { start: evtPoint, end: evtPoint2 };
          let zoomedLine;
          for (const fractalControl of this.fractalControls) {
            zoomedLine = zoomTransformLine(
              fractalControl.origBaseLine,
              this.origTwoFingerLine,
              newTwoFingerLine
            );
            fractalControl.setBaseLine(zoomedLine);
          }
          this.refreshDrawFractalIter(true);
        }
        break;
      case "wheel":
        let oldLine = {
          start: { x: evtPoint.x, y: evtPoint.y },
          end: { x: evtPoint.x + 1, y: evtPoint.y },
        };
        let newLine = cloneLine(oldLine);
        if (modifiers && modifiers.ctrl) {
          newLine.end.x += -1 + Math.cos(evtDelta.y / 1000);
          newLine.end.y += Math.sin(evtDelta.y / 1000);
        } else {
          newLine.end.x += evtDelta.y / 1000;
        }
        let zoomedLine;
        for (const fractalControl of this.fractalControls) {
          zoomedLine = zoomTransformLine(
            fractalControl.baseLine,
            oldLine,
            newLine
          );
          fractalControl.setBaseLine(zoomedLine);
        }
        this.refreshDrawFractalIter(true);
        break;

      case "resize":
        setTimeout(() => {
          resetCanvasSize(this.canvas, this.offScreenCanvas);
          this.refreshDrawFractalIter(true);
        }, 10); // delay is important!!
        break;
    }

    raw_draw(
      this.ctx,
      this.offScreenCanvas,
      this.fractalControls,
      this.drawingOptions
    );
  }
  draw(maxDepth, drawAllLines, hideControls, largeControls) {
    this.drawingOptions.hideControls = hideControls;
    this.drawingOptions.largeControls = largeControls;
    if (
      this.drawingOptions.maxDepth != maxDepth ||
      this.drawingOptions.drawAllLines != drawAllLines
    ) {
      this.drawingOptions.maxDepth = maxDepth;
      this.drawingOptions.drawAllLines = drawAllLines;
      this.refreshDrawFractalIter(true);
    }
    for (let i = 0; i < 100; i++) {
      if (this.drawFractalIterator.next().done) {
        this.refreshDrawFractalIter();
      }
    }

    raw_draw(
      this.ctx,
      this.offScreenCanvas,
      this.fractalControls,
      this.drawingOptions
    );
  }
}

// Globals:
var mainController = new MainController();

function loop() {
  const maxRefreshRate = 10000;
  let refreshRate = document.getElementById("RefreshRate").value;
  let maxDepth = document.getElementById("Depth").value;
  let drawAllLines = document.getElementById("DrawAllLines").checked;
  let hideControls = document.getElementById("HideControls").checked;
  let largeControls = document.getElementById("LargeControls").checked;

  if (!refreshRate) {
    refreshRate = 1;
  } else if (maxRefreshRate < refreshRate) {
    refreshRate = maxRefreshRate;
  } else if (refreshRate < 1) {
    refreshRate = 1;
  }
  document.getElementById("RefreshRate").value = Math.floor(refreshRate);
  for (let i = 0; i < refreshRate; i++) {
    if (!mainController.isDrawingLoop) {
      break;
    }
    mainController.draw(maxDepth, drawAllLines, hideControls, largeControls);
  }
  if (mainController.isDrawingLoop) {
    requestAnimFrame(loop);
  }
}

loop();
