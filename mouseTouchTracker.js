/* Passes cleaned events down to the actual callback function
including the type of the event and all relevant coordinates
in "canvas" local coordinates.

Manages one piece of state internally "isDragging" which controls
whether up or move events are passed to the callback or ignored.
*/

function getEventCoordinates(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  var offsetTop = rect.top;
  var offsetLeft = rect.left;

  if (evt.touches) {
    return Object.values(evt.touches).map((t) => {
      return {
        x: t.clientX - offsetLeft,
        y: t.clientY - offsetTop,
      };
    });
  } else {
    return [
      {
        x: evt.clientX - offsetLeft,
        y: evt.clientY - offsetTop,
      },
    ];
  }
}

var MouseTouchTracker = function (window, canvas, callback) {
  var isDragging = false;

  function onDown(evt) {
    isDragging = true;
    evt.preventDefault();
    callback("down", getEventCoordinates(canvas, evt)[0]);
  }

  function onUp(evt) {
    if (isDragging) {
      evt.preventDefault();
      callback("up");
      isDragging = false;
    }
  }

  function onMove(evt) {
    if (isDragging) {
      evt.preventDefault();
      const evtCoordinates = getEventCoordinates(canvas, evt);
      if (evtCoordinates[1]) {
        callback("two-finger", evtCoordinates[0], evtCoordinates[1]);
      } else {
        callback("move", evtCoordinates[0]);
      }
    }
  }

  function onWheel(evt) {
    const evtPoint = getEventCoordinates(canvas, evt)[0];
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

export { MouseTouchTracker };
