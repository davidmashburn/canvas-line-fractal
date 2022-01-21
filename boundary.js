import { line } from "./drawing.js"

function recompute(x0, x1, x2, x3, y1, y2, y3, y4) {
    return (
        ((x3 - x2) * (y1 - y3) - (y4 - y3) * (x0 - x2))
         / ((y4 - y3) * (x1 - x0) - (x3 - x2) * (y2 - y1))
    )
}

function mouseDraggedOut(canvas, ctx, x0, y1, x1, y2, lineStyle, lineWeight) {
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

export { mouseDraggedOut };