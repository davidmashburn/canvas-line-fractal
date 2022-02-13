import { zoomTransformLine, clonePoint, cloneLine } from "./helpers.js";

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

var isDrawingLoop = true;

function init() {
  var this_canvas = document.getElementById("mainCanvas");
  var this_offScreenCanvas = document.getElementById("offScreenCanvas");
  var this_ctx = this_canvas.getContext("2d");
  var this_ctx_off = this_offScreenCanvas.getContext("2d");
  var startPoint = { x: 0, y: 0 };
  var baseLineData = {
    start: { x: 250, y: 250 },
    end: { x: 600, y: 250 },
  };
  var this_drawingOptions = {
    maxDepth: false,
    drawAllLines: false,
  };
  var this_fractalControls = [
    new FractalControl(baseLineData, exampleGenerators.Koch),
  ];
  var this_canvasIsPanning = false;
  var this_origTwoFingerLine;
  var this_drawFractalIterator;

  function setupLeftPane() {
    var presetsDropdown = document.getElementById("ChoosePreset");
    presetsDropdown.options.length = 0;
    const presetNames = Object.keys(exampleGenerators);
    for (const name of presetNames) {
      presetsDropdown.options.add(new Option(name, name));
    }
    presetsDropdown.selectedIndex = presetNames.indexOf("Koch");

    presetsDropdown.onchange = () => {
      const baseLineData = cloneLine(this_fractalControls[0].baseLine);
      this_fractalControls = [
        new FractalControl(
          baseLineData,
          exampleGenerators[presetsDropdown.value]
        ),
      ];
      refreshDrawFractalIter(true);
    };
    document.getElementById("StartStop").onclick = () => {
      if (!isDrawingLoop) {
        isDrawingLoop = true;
        loop();
      } else {
        isDrawingLoop = false;
      }
    };

    document.getElementById("ResetZoom").onclick = () => {
      for (const fractalControl of this_fractalControls) {
        fractalControl.setBaseLine(baseLineData);
      }
      refreshDrawFractalIter(true);
    };
    document.getElementById("LogGenerator").onclick = () => {
      for (const fractalControl of this_fractalControls) {
        const linePointIndexes = fractalControl.lines.map((line) => {
          return {
            start: line.externalStartPointIndex,
            end: line.externalEndPointIndex,
          };
        });
        const pointData = getPointsFromGenerator(fractalControl.generator, linePointIndexes).map((p) => [p.x, -p.y]);
        const lineData = fractalControl.lines.map((line) => [
          line.externalStartPointIndex,
          line.externalEndPointIndex,
          line.mirrored,
        ]);
        console.log({points:pointData, lines:lineData});
      }
    };
  }

  function refreshDrawFractalIter(clear_ctx_off = false) {
    if (clear_ctx_off) {
      this_ctx_off.clearRect(0, 0, this_ctx_off.canvas.width, this_ctx_off.canvas.height);
    }
    this_drawFractalIterator = getDrawFractalIterator(
      this_ctx_off,
      this_fractalControls[0].generator,
      this_fractalControls[0].baseLine,
      this_drawingOptions.maxDepth,
      this_drawingOptions.drawAllLines
    );
  }

  function pointerCallback(
    evtType,
    evtPoint,
    evtPoint2 = undefined,
    evtDelta = undefined,
    modifiers = undefined
  ) {
    switch (evtType) {
      case "down":
        startPoint = clonePoint(evtPoint);
        this_canvasIsPanning = true;

        for (const fractalControl of this_fractalControls) {
          if (fractalControl.onDown(this_ctx, evtPoint)) {
            this_canvasIsPanning = false;
            break;
          }
        }
        break;

      case "up":
        for (const fractalControl of this_fractalControls) {
          fractalControl.onUp();
        }
        this_canvasIsPanning = false;
        this_origTwoFingerLine = undefined;
        break;

      case "move":
        const delta = {
          x: evtPoint.x - startPoint.x,
          y: evtPoint.y - startPoint.y,
        };
        startPoint = clonePoint(evtPoint);

        for (const fractalControl of this_fractalControls) {
          fractalControl.onMove(evtPoint, delta);
        }
        if (this_canvasIsPanning) {
          for (const fractalControl of this_fractalControls) {
            fractalControl.translateAll(delta);
          }
        }
        refreshDrawFractalIter(true);
        break;
      case "two-finger":
        if (this_canvasIsPanning) {
          this_canvasIsPanning = false;
          this_origTwoFingerLine = { start: evtPoint, end: evtPoint2 };
          for (const fractalControl of this_fractalControls) {
            fractalControl.origBaseLine = cloneLine(fractalControl.baseLine);
          }
        } else if (this_origTwoFingerLine) {
          let newTwoFingerLine = { start: evtPoint, end: evtPoint2 };
          let zoomedLine;
          for (const fractalControl of this_fractalControls) {
            zoomedLine = zoomTransformLine(
              fractalControl.origBaseLine,
              this_origTwoFingerLine,
              newTwoFingerLine
            );
            fractalControl.setBaseLine(zoomedLine);
          }
          refreshDrawFractalIter(true);
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
        for (const fractalControl of this_fractalControls) {
          zoomedLine = zoomTransformLine(
            fractalControl.baseLine,
            oldLine,
            newLine
          );
          fractalControl.setBaseLine(zoomedLine);
        }
        refreshDrawFractalIter(true);
        break;

      case "resize":
        setTimeout(() => {
          resetCanvasSize(this_canvas, this_offScreenCanvas);
          refreshDrawFractalIter(true);
        }, 10); // delay is important!!
        break;
    }

    raw_draw(this_ctx, this_offScreenCanvas, this_fractalControls, this_drawingOptions);
  };

  function draw(maxDepth, drawAllLines, hideControls, largeControls) {
    this_drawingOptions.hideControls = hideControls;
    this_drawingOptions.largeControls = largeControls;
    if (
      this_drawingOptions.maxDepth != maxDepth ||
      this_drawingOptions.drawAllLines != drawAllLines
    ) {
      this_drawingOptions.maxDepth = maxDepth;
      this_drawingOptions.drawAllLines = drawAllLines;
      refreshDrawFractalIter(true);
    }
    for (let i = 0; i < 100; i++) {
      if (this_drawFractalIterator.next().done) {
        refreshDrawFractalIter();
      }
    }

    raw_draw(this_ctx, this_offScreenCanvas, this_fractalControls, this_drawingOptions);
  }

  setupLeftPane();
  resetCanvasSize(this_canvas, this_offScreenCanvas);
  refreshDrawFractalIter();
  registerPointerEvents(window, this_canvas, pointerCallback);
  raw_draw(this_ctx, this_offScreenCanvas, this_fractalControls, this_drawingOptions);

  return draw;
}

var draw = init();

var MAX_REFRESH = 10000;

function loop() {
  let refreshRate = document.getElementById("RefreshRate").value;
  let maxDepth = document.getElementById("Depth").value;
  let drawAllLines = document.getElementById("DrawAllLines").checked;
  let hideControls = document.getElementById("HideControls").checked;
  let largeControls = document.getElementById("LargeControls").checked;

  if (!refreshRate) {
    refreshRate = 1;
  } else if (MAX_REFRESH < refreshRate) {
    refreshRate = MAX_REFRESH;
  } else if (refreshRate < 1) {
    refreshRate = 1;
  }
  document.getElementById("RefreshRate").value = Math.floor(refreshRate);
  for (let i = 0; i < refreshRate; i++) {
    if (!isDrawingLoop) {
      break;
    }
    draw(maxDepth, drawAllLines, hideControls, largeControls);
  }
  if (isDrawingLoop) {
    requestAnimFrame(loop);
  }
}

loop();
