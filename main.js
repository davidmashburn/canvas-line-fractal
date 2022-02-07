import { zoomTransformLine, clonePoint, cloneLine } from "./helpers.js";

import { getDrawFractalIterator } from "./drawFractal.js";

import { FractalControl } from "./fractalControl.js";

import * as exampleGenerators from "./exampleGenerators.js";

var MouseTouchTracker = function (window, canvas, callback) {
  var canvasIsDragging = false;

  function processEvent(evt) {
    var rect = canvas.getBoundingClientRect();
    var offsetTop = rect.top;
    var offsetLeft = rect.left;

    if (evt.touches) {
      return {
        x: evt.touches[0].clientX - offsetLeft,
        y: evt.touches[0].clientY - offsetTop,
      };
    } else {
      return {
        x: evt.clientX - offsetLeft,
        y: evt.clientY - offsetTop,
      };
    }
  }

  function onDown(evt) {
    canvasIsDragging = true;
    evt.preventDefault();
    var coords = processEvent(evt);
    callback("down", coords);
  }

  function onUp(evt) {
    if (canvasIsDragging) {
      evt.preventDefault();
      callback("up");
      canvasIsDragging = false;
    }
  }

  function onMove(evt) {
    if (canvasIsDragging) {
      evt.preventDefault();
      let evtPoint = processEvent(evt);
      if (evt.touches && evt.touches[1]) {
        let evtPoint2 = {
          x: evtPoint.x + evt.touches[1].clientX - evt.touches[0].clientX,
          y: evtPoint.y + evt.touches[1].clientY - evt.touches[0].clientY,
        };
        callback("two-finger", evtPoint, evtPoint2);
      } else {
        callback("move", evtPoint);
      }
    }
  }

  function onWheel(evt) {
    const evtPoint = processEvent(evt);
    const evtPoint2 = undefined;
    const evtDelta = { x: evt.deltaX, y: evt.deltaY };
    const modifiers = {
      alt: evt.altKey,
      ctrl: evt.ctrlKey,
      meta: evt.metaKey,
      shift: evt.shiftKey,
    };
    callback("wheel", evtPoint, evtPoint2, evtDelta, modifiers);
  }

  function onResize(evt) {
    callback("resize", window.innerWidth, window.innerHeight);
  }

  window.onresize = onResize;

  window.ontouchmove = onMove;
  window.onmousemove = onMove;

  canvas.ontouchstart = onDown;
  canvas.onmousedown = onDown;

  window.ontouchend = onUp;
  window.onmouseup = onUp;

  window.onwheel = onWheel;
};

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
  var canvas = document.getElementById("mainCanvas");
  var offScreenCanvas = document.getElementById("offScreenCanvas");
  var ctx = canvas.getContext("2d");
  var ctx_off = offScreenCanvas.getContext("2d");
  var startPoint = { x: 0, y: 0 };

  let baseLineData = {
    start: { x: 250, y: 250 },
    end: { x: 600, y: 250 },
  };
  var drawingOptions = {
    maxDepth: false,
    drawAllLines: false,
  };
  var fractalControls = [
    new FractalControl(baseLineData, exampleGenerators.Koch),
  ];
  var canvasIsPanning = false;
  var origTwoFingerLine;

  var presetsDropdown = document.getElementById("ChoosePreset");
  presetsDropdown.options.length = 0;
  const presetNames = Object.keys(exampleGenerators)
  for (const name of presetNames) {
    presetsDropdown.options.add(new Option(name, name));
  }
  presetsDropdown.selectedIndex = presetNames.indexOf("Koch");

  presetsDropdown.onchange = () => {
    const baseLineData = cloneLine(fractalControls[0].baseLine);
    fractalControls = [
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
    for (const fractalControl of fractalControls) {
      fractalControl.setBaseLine(baseLineData);
    }
    refreshDrawFractalIter(true);
  };

  canvas.width = window.innerWidth;// * 0.75 - 10;
  canvas.height = window.innerHeight * 0.95;// - 10;
  offScreenCanvas.width = canvas.width;
  offScreenCanvas.height = canvas.height;

  var drawFractalIterator;

  function refreshDrawFractalIter(clear_ctx_off = false) {
    if (clear_ctx_off) {
      ctx_off.clearRect(0, 0, ctx_off.canvas.width, ctx_off.canvas.height);
    }
    drawFractalIterator = getDrawFractalIterator(
      ctx_off,
      fractalControls[0].generator,
      fractalControls[0].baseLine,
      drawingOptions.maxDepth,
      drawingOptions.drawAllLines
    );
  }
  refreshDrawFractalIter();

  var mtt = new MouseTouchTracker(window, canvas, function (
    evtType,
    evtPoint,
    evtPoint2 = undefined,
    evtDelta = undefined,
    modifiers = undefined
  ) {
    switch (evtType) {
      case "down":
        startPoint = clonePoint(evtPoint);
        canvasIsPanning = true;

        for (const fractalControl of fractalControls) {
          if (fractalControl.onDown(ctx, evtPoint)) {
            canvasIsPanning = false;
            break;
          }
        }
        break;

      case "up":
        for (const fractalControl of fractalControls) {
          fractalControl.onUp();
        }
        canvasIsPanning = false;
        origTwoFingerLine = undefined;
        break;

      case "move":
        const delta = {
          x: evtPoint.x - startPoint.x,
          y: evtPoint.y - startPoint.y,
        };
        startPoint = clonePoint(evtPoint);

        for (const fractalControl of fractalControls) {
          fractalControl.onMove(evtPoint, delta);
        }
        if (canvasIsPanning) {
          for (const fractalControl of fractalControls) {
            fractalControl.translateAll(delta);
          }
        }
        refreshDrawFractalIter(true);
        break;
      case "two-finger":
        if (canvasIsPanning) {
          canvasIsPanning = false;
          origTwoFingerLine = { start: evtPoint, end: evtPoint2 };
          for (const fractalControl of fractalControls) {
            fractalControl.origBaseLine = cloneLine(fractalControl.baseLine);
          }
        } else if (origTwoFingerLine) {
          let newTwoFingerLine = { start: evtPoint, end: evtPoint2 };
          let zoomedLine;
          for (const fractalControl of fractalControls) {
            zoomedLine = zoomTransformLine(
              fractalControl.origBaseLine,
              origTwoFingerLine,
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
        for (const fractalControl of fractalControls) {
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
        setTimeout(function () {
          console.log(window.innerHeight);
          canvas.width = window.innerWidth;// * 0.75 - 10;
          canvas.height = window.innerHeight * 0.95;// - 10;
          offScreenCanvas.width = canvas.width;
          offScreenCanvas.height = canvas.height;
          refreshDrawFractalIter(true);
        }, 10); // delay is important!!
        break;
    }

    raw_draw(ctx, offScreenCanvas, fractalControls, drawingOptions);
  });

  var count = 0;
  function draw(maxDepth, drawAllLines, hideControls, largeControls) {
    drawingOptions.hideControls = hideControls;
    drawingOptions.largeControls = largeControls;
    if (
      drawingOptions.maxDepth != maxDepth ||
      drawingOptions.drawAllLines != drawAllLines
    ) {
      drawingOptions.maxDepth = maxDepth;
      drawingOptions.drawAllLines = drawAllLines;
      refreshDrawFractalIter(true);
    }
    for (let i = 0; i < 100; i++) {
      if (drawFractalIterator.next().done) {
        refreshDrawFractalIter();
      }
    }

    count++;
    raw_draw(ctx, offScreenCanvas, fractalControls, drawingOptions);
  }

  raw_draw(ctx, offScreenCanvas, fractalControls, drawingOptions);

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
