import {circle, line} from "./drawing.js"

var canvas;
var ctx;
var mouse = [];

function recompute(x0, x1, x2, x3, y1, y2, y3, y4) {
    return (
        ((x3 - x2) * (y1 - y3) - (y4 - y3) * (x0 - x2))
         / ((y4 - y3) * (x1 - x0) - (x3 - x2) * (y2 - y1))
    )
}

function mouseDraggedOut(x0, y1, x1, y2, lineStyle, lineWeight) {
    // x0,y1 = mouseDown;  x1,y2 = mouseUp

    var v, x2, y3, x3, y4, thisX, thisY;

    if (x1 < 0) {// left edge
        x2 = 0;
        y3 = 0;
        x3 = 0;
        y4 = canvas.height;
        v = recompute(x0, x1, x2, x3, y1, y2, y3, y4);
        thisX = Math.round(x0 + v * (x1 - x0));
        thisY = Math.round(y1 + v * (y2 - y1));

        // I must do this for other checks, else corners (when two conditions are true) couldn't be handled
        // So I'll handle it one after another
        x1 = thisX;
        y2 = thisY;

    }

    if (x1 > canvas.width) {// right edge
        x2 = canvas.width;
        y3 = 0;
        x3 = canvas.width;
        y4 = canvas.height;
        v = recompute([x0, x1, x2, x3], [y1, y2, y3, y4]);
        thisX = Math.round(x0 + v * (x1 - x0));
        thisY = Math.round(y1 + v * (y2 - y1));
        x1 = thisX;
        y2 = thisY;
    }

    if (y2 < 0) {// top edge
        x2 = 0;
        y3 = 0;
        x3 = canvas.width;
        y4 = 0;
        v = recompute([x0, x1, x2, x3], [y1, y2, y3, y4]);
        thisX = Math.round(x0 + v * (x1 - x0));
        thisY = Math.round(y1 + v * (y2 - y1));
        x1 = thisX;
        y2 = thisY;
    }

    if (y2 > canvas.height) {// bottom edge
        x2 = 0;
        y3 = canvas.height;
        x3 = canvas.width;
        y4 = canvas.height;
        v = recompute([x0, x1, x2, x3], [y1, y2, y3, y4]);
        thisX = Math.round(x0 + v * (x1 - x0));
        thisY = Math.round(y1 + v * (y2 - y1));
    }

    if ((lineStyle != undefined) || (lineWeight != undefined)) {
        ctx.save();
        if (lineStyle != undefined) {
            ctx.strokeStyle = lineStyle;
        }
        if (lineWeight != undefined) {
            ctx.lineWidth = lineWeight;
        }
        line(ctx, x2, y3, x3, y4);
        ctx.restore();

    } else {
        line(ctx, x2, y3, x3, y4);
    }

    return {
        'x' : thisX,
        'y' : thisY
    };

}

/////////////////////////////////////////
// Mouse events

function onMouseMove(e) {
    mouse.x = e.clientX - canvas.getBoundingClientRect().left;
    mouse.y = e.clientY - canvas.getBoundingClientRect().top;
}

function onMouseDown(e) {
    mouse.xDown = e.clientX - canvas.getBoundingClientRect().left;
    mouse.yDown = e.clientY - canvas.getBoundingClientRect().top;
    mouse.isMouseDragged = true;
}

function onMouseUp(e) {
    if (mouse.isMouseDragged) {
        mouse.xUp = e.clientX - canvas.getBoundingClientRect().left;
        mouse.yUp = e.clientY - canvas.getBoundingClientRect().top;

        // FIRST OPTION
        if (!mouse.isMouseOver) {
            var edgeIntersect = mouseDraggedOut(mouse.xDown, mouse.yDown, mouse.xUp, mouse.yUp, "rgba(255,0,0,1)", 10);
            mouse.xUp = edgeIntersect.x;
            mouse.yUp = edgeIntersect.y;
        }
        
        mouse.isMouseDragged = false;
    }
}

function onMouseOut(e) {
    mouse.xOut = e.clientX - canvas.getBoundingClientRect().left;
    mouse.yOut = e.clientY - canvas.getBoundingClientRect().top;
    mouse.isMouseOver = false;

    // fix after swift move with mouse, when position is beyond canvas (put it on edge of canvas)
    if (mouse.xOut < 0)
        mouse.xOut = 0;
    if (mouse.xOut > canvas.width)
        mouse.xOut = canvas.width;
    if (mouse.yOut < 0)
        mouse.yOut = 0;
    if (mouse.yOut > canvas.height)
        mouse.yOut = canvas.height;
}

function onMouseOver(e) {
    mouse.xOver = e.clientX - canvas.getBoundingClientRect().left;
    mouse.yOver = e.clientY - canvas.getBoundingClientRect().top;
    mouse.isMouseOver = true;
}

//////////////////////////

///////+++      M  A  I  N      F   U   N   C   T   I  O   N   S

/////////////////////////////////////////////////////////////////
// Compatibility animation loop
window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 0);
    };
})();
/////////////////////////////////////////////////////////////////

//+++ L O O P ///////////////////////////////////////////////////////////////
function loop() {
    draw();
    requestAnimFrame(loop);
}

//+++ L O O P ///////////////////////////////////////////////////////////////

//+++ I N I T ///////////////////////////////////////////////////////////////
function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.addEventListener('contextmenu', function(e) {
        //Don't show context menu by pressing right mouse button
        if (e.button == 2) {
            //!!!needs to fix number, that varies by browser!!!
            e.preventDefault();
            return false;
        }
    }, false);

    window.addEventListener("mousemove", onMouseMove, false);

    canvas.addEventListener("mousedown", onMouseDown, false);
    window.addEventListener("mouseup", onMouseUp, false);

    canvas.addEventListener("mouseover", onMouseOver, false);
    canvas.addEventListener("mouseout", onMouseOut, false);

    loop();

    document.onselectstart = function() {
        if (mouse.isMouseDragged) {
            // do not select text outside if animation in canvas is active
            return false;
        }
    };
}

//--- I N I T ///////////////////////////////////////////////////////////////


//+++ D R A W ///////////////////////////////////////////////////////////////
function draw() {
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;

    //ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(0,255,255,0.8)";
    ctx.fillRect(mouse.xOut - 20, mouse.yOut - 20, 40, 40);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(mouse.xOut - 2, mouse.yOut - 2, 4, 4);

    ctx.fillStyle = "rgba(255,255,0,0.8)";
    ctx.fillRect(mouse.xOver - 20, mouse.yOver - 20, 40, 40);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(mouse.xOver - 2, mouse.yOver - 2, 4, 4);

    ctx.fillStyle = "rgb(255,0,0)";
    ctx.fillRect(mouse.xDown - 15, mouse.yDown - 15, 30, 30);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(mouse.xDown - 2, mouse.yDown - 2, 4, 4);

    ctx.fillStyle = "rgba(0,0,255,0.8)";
    ctx.fillRect(mouse.xUp - 15, mouse.yUp - 15, 30, 30);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(mouse.xUp - 2, mouse.yUp - 2, 4, 4);

    /// actual cursor
    // ctx.fillStyle = "rgb(100,100,255)";
    // ctx.strokeStyle = "rgb(0,0,100)";
    // circle(ctx, mouse.x, mouse.y, 10);
    // ctx.stroke();

    // ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
    // ctx.lineWidth = 1;

    if (mouse.isMouseDragged) {
        ctx.save();
        ctx.strokeStyle = "rgba(100,100,100,0.07)";
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = 15;
        ctx.lineCap = "round";

        var edgeIntersect = mouseDraggedOut(mouse.xDown, mouse.yDown, mouse.x, mouse.y, "rgba(0, 0, 255, 1)", 2);
        if (edgeIntersect.x === undefined || edgeIntersect.y === undefined) {
            edgeIntersect.x = mouse.x;
            edgeIntersect.y = mouse.y;
        }
        line(ctx, mouse.xDown, mouse.yDown, edgeIntersect.x, edgeIntersect.y);
        ctx.strokeStyle = "rgba(0,0,0,0.07)";
        circle(ctx, mouse.xDown, mouse.yDown, 20);
        circle(ctx, edgeIntersect.x, edgeIntersect.y, 20);
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    } else {
        ctx.save();
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.lineWidth = 1;
        line(ctx, mouse.xDown, mouse.yDown, mouse.xUp, mouse.yUp);
        ctx.restore();
    }
}

//--- D R A W ///////////////////////////////////////////////////////////////

///////---      M  A  I  N      F   U   N   C   T   I  O   N   S

init();
