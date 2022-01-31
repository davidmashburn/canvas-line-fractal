import {
  POINT_RADIUS,
  ARROW_LENGTH,
  roundPoint,
  pointDist,
  transformPoint,
  transformLine,
  transformPointReverse,
  transformLineReverse,
  addPolygonToPath,
} from "./helpers.js";

var Rectangle = function (x, y, width, height, color = "#2793ef") {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.color = color;
  this.isDragging = false;

  this.render = function (ctx) {
    ctx.save();

    ctx.beginPath();
    ctx.rect(
      this.x - this.width * 0.5,
      this.y - this.height * 0.5,
      this.width,
      this.height
    );
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.restore();
  };

  this.isHit = function (x, y) {
    if (
      x > this.x - this.width * 0.5 &&
      y > this.y - this.height * 0.5 &&
      x < this.x + this.width - this.width * 0.5 &&
      y < this.y + this.height - this.height * 0.5
    ) {
      return true;
    }
    return false;
  };
};

var Arc = function (
  x,
  y,
  radius,
  radians = Math.PI * 2,
  color = "#2793ef",
  strokeColor = undefined
) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.radians = radians;
  this.color = color;
  this.strokeColor = strokeColor;
  this.isDragging = false;

  this.render = function (ctx) {
    ctx.save();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, this.radians, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    if (this.strokeColor) {
      ctx.strokeStyle = this.strokeColor;
      ctx.stroke();
    }

    ctx.restore();
  };

  this.isHit = function (x, y) {
    var dx = this.x - x;
    var dy = this.y - y;
    if (dx * dx + dy * dy < this.radius * this.radius) {
      return true;
    }
    return false;
  };
};

var Point = function (x, y, color = "red") {
  this.x = x;
  this.y = y;
  this.radius = 4;
  this.radians = Math.PI * 2;
  this.color = color;
  this.strokeColor = "black";
  this.isDragging = false;

  this.render = function (ctx) {
    ctx.save();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, this.radians, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    if (this.strokeColor) {
      ctx.strokeStyle = this.strokeColor;
      ctx.stroke();
    }

    ctx.restore();
  };

  this.isHit = function (x, y) {
    var dx = this.x - x;
    var dy = this.y - y;
    if (dx * dx + dy * dy < this.radius * this.radius) {
      return true;
    }
    return false;
  };
};

var ArrowLine = function(start, end, mirrored = false) {
  this.start = start;
  this.end = end;
  this.mirrored = mirrored;

  this.trianglePath = undefined;
  this.lineAreaPath = undefined;
  this.arrowEnabled = true;
  this.isSelected = false;
  this.color = "black";
  this.selectedColor = "blue";

  this.render = function (ctx) {
    ctx.save();

    this.trianglePath = new Path2D();
    this.lineAreaPath = new Path2D();

    let lineLength = pointDist(this.start, this.end);
    console.log(end.x - start.x, end.y - start.y);
    console.log(lineLength);
    if (this.arrowEnabled) {
      //check the line to see if it's long enough to have an arrow
      //exit the function early if it's too short
      console.log(ARROW_LENGTH, lineLength, lineLength - 1 - 2 * POINT_RADIUS)
      if (ARROW_LENGTH <= lineLength - 1 - 2 * POINT_RADIUS) {
        //if line is long enough to fit the arrow

        //set up arrow on the unit line
        let xTip = (lineLength - POINT_RADIUS) / lineLength;
        let xBack = (lineLength - POINT_RADIUS - ARROW_LENGTH) / lineLength;
        let yExtend = ((self.mirrored ? 1 : -1) * ARROW_LENGTH) / lineLength;

        let trianglePoints = [
          { x: xTip, y: 0 },
          { x: xBack, y: 0 },
          { x: xBack, y: yExtend },
        ].map((point) => roundPoint(transformPoint(point, this)));

        //update trianglePath and draw triangle
        addPolygonToPath(this.trianglePath, trianglePoints);
        this.trianglePath.fillStyle = this.color;
        ctx.fill(this.trianglePath);
        console.log("draw triangle")
      }
    }
    //update the lineAreaPath used in isLineHit
    if (start.x != end.x || start.y != end.y) {
      let radius = POINT_RADIUS / lineLength;
      let lineAreaPoints = [
        { x: 0, y: radius },
        { x: 0, y: -radius },
        { x: 1, y: -radius },
        { x: 1, y: radius },
      ].map((point) => roundPoint(transformPoint(point, this)));

      addPolygonToPath(this.lineAreaPath, lineAreaPoints);

      if (this.isSelected) {
        this.lineAreaPath.fillStyle = this.selectedColor;
        ctx.fill(this.lineAreaPath);
      }
    }

    //draw line
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    console.log("draw line")

    ctx.restore();
  };
  this.isArrowHit = function (x, y) {
    return ctx.isPointInPath(this.trianglePath, x, y);
  };
  this.isLineHit = function (x, y) {
    return ctx.isPointInPath(this.lineAreaPath, x, y);
  };
}

// CONTINUE PORT HERE
// MORE ARROWLINE:
//     def CheckMouse(self,where):
//         Update() #just in case the points have moved

//         #Set up a float line to represent the normal line (screen coordinates)
//         line1=GetFloatLine()

//         #get the length of the line
//         lengthLine = GetFloatLineLength()

//         #Set up a rotated, translated version of the line (same in both coordinates)
//         line1Rotated=[0.,0.,lengthLine,0.]

//         whereFloat = where
//         whereRotatedFloat=[None,None]

//         TransformPointReverse(whereRotatedFloat,line1,whereFloat) #flow is <-- (sorry, I know that makes no sense)

//         #set up a point that will be in the frame of the rotated line (cartesian coordinates)
//         whereRotated = [ int(whereRotatedFloat[0] * lengthLine),
//                         -int(whereRotatedFloat[1] * lengthLine) ]

//         #begin checking
//         if lengthLine > ARROW_LENGTH  and  arrowEnabled == true :
//             tipX = int(int(lengthLine) - POINT_RADIUS - 1)
//             backX = int(tipX - ARROW_LENGTH)

//             if mirrored==false:
//                 if whereRotated[1] >= 0 and whereRotated[0] >= backX  and
//                    whereRotated[1] <= -whereRotated[0] + tipX:
//                     return 1 #arrow hit
//             else: #mirrored==true
//                 if whereRotated[1] <= 0 and whereRotated[0] >= backX  and
//                    whereRotated[1] >= whereRotated[1] - tipX:
//                     return 1 #arrow hit

//         if lengthLine > 0:
//             if whereRotated[0] <= lengthLine and whereRotated[0] >= 0 and
//                whereRotated[1] <= POINT_RADIUS  and whereRotated[1] >= -POINT_RADIUS:
//                 return 2 #line hit

//         return 0 #continue checking
//     def DoMouse(self,where):
//         Update() #just in case the points have moved

//         #Set up a float line to represent the normal line (screen coordinates)
//         line1=GetFloatLine()

//         #get the length of the line
//         lengthLine = GetFloatLineLength()

//         #Set up a rotated, translated version of the line (same in both coordinates)
//         line1Rotated=[0.,0.,lengthLine,0.]

//         whereFloat = where
//         whereRotatedFloat=[None,None]

//         TransformPointReverse(whereRotatedFloat,line1,whereFloat) #flow is <-- (sorry, I know that makes no sense)

//         #set up a point that will be in the frame of the rotated line (cartesian coordinates)
//         whereRotated = [ int(whereRotatedFloat[0] * lengthLine),
//                         -int(whereRotatedFloat[1] * lengthLine) ]

//         #begin checking
//         if lengthLine > ARROW_LENGTH  and  arrowEnabled == true :
//             tipX = int(int(lengthLine) - POINT_RADIUS - 1)
//             backX = int(tipX - ARROW_LENGTH)

//             if mirrored==false:
//                 if whereRotated[1] >= 0 and whereRotated[0] >= backX  and
//                    whereRotated[1] <= -whereRotated[0] + tipX:
//                     TrackArrow(where)
//                     return 1 #Tracking function executed.  Don't check any other ArrowLineDNM's
//             else: #mirrored==true
//                 if whereRotated[1] <= 0 and whereRotated[0] >= backX  and
//                    whereRotated[1] >= whereRotated[1] - tipX:
//                     TrackArrow(where);
//                     return 1 #Tracking function executed.  Don't check any other ArrowLineDNM's

//         if lengthLine > 0:
//             if whereRotated[0] <= lengthLine and whereRotated[0] >= 0 and
//                whereRotated[1] <= POINT_RADIUS  and whereRotated[1] >= -POINT_RADIUS:
//                 TrackMotion(where)
//                 return 2 #Tell FractalObject to execute tracking function.  Don't check any other ArrowLineDNM's

//         return 0 #continue checking
//     def TrackArrow(self,oldCursor):
//         currentQuadrant=0 #quadrant can be anywhere from 1 to 4.  0 is NULL, senseless

//         if mirrored==false:
//             currentQuadrant = 1
//         else: #mirrored==true
//             currentQuadrant = 4

//         #EventRecord event[1];
//         #RgnHandle tempRgnHnd=NewRgn();

//         while True:
//             WaitNextEvent(everyEvent, event,0, tempRgnHnd)

//             if event.what == mouseUp:
//                 break

//             eventPt=event.where
//             GlobalToLocal(eventPt)

//             if eventPt[0]!=cursor[0] or eventPt[1]!=cursor[1]:
//                 cursor = eventPt #last point the cursor was at

//                 currentQuadrant = self.GetQuadrantAboutMidpoint(cursor)

//                 #make mirror correct
//                 if currentQuadrant==1 or currentQuadrant==3:
//                     mirrored=False
//                 else:
//                     mirrored=True;

//                 #make the order of the points correct
//                 if currentQuadrant==2 or currentQuadrant==3:
//                     temp = start
//                     start = end
//                     end = temp
//                 DrawEverything()
//     def TrackMotion(self,oldCursor):
//         oldP1=self.start.position
//         oldP2=self.end.position

//         #EventRecord event[1]
//         #RgnHandle tempRgnHnd=NewRgn()

//         while True:
//             WaitNextEvent(everyEvent, event,0, tempRgnHnd)

//             if event.what == mouseUp:
//                 DrawEverything()
//                 break

//             eventPt=event.where
//             GlobalToLocal(eventPt)

//             if eventPt.h!=cursor.h or eventPt.v!=cursor.v:
//             {
//                 cursor = eventPt

//                 self.start.position = [oldP1[0] + ( cursor[0] - oldCursor[0] ),
//                                        oldP1[1] + ( cursor[1] - oldCursor[1] )]

//                 self.end.position = [oldP2[0] + ( cursor[0] - oldCursor[0] ),
//                                      oldP2[1] + ( cursor[1] - oldCursor[1] )]
//                 DrawEverything()
//             DrawEverything()
//     def GetQuadrantAboutMidpoint(self,point1):
//         self.Update() #just in case the points have moved

//         #(cartesian coordinates)
//         test = [ testPoint[0] , -testPoint[1] ]

//         #(cartesian coordinates)
//         midpoint=[ float( point1[0] + point2[0] ) / 2.0 ,
//                               -float( point1[1] + point2[1] ) / 2.0 ]

//         #Set up a float line to represent the normal line (cartesian coordinates)
//         line1 = [ midpoint[0], midpoint[1], point2[0], -point2[1]]

//         #set up a point that will be in the frame of the rotated line (cartesian coordinates)
//         testRotated=[None,None]

//         TransformPointReverse(testRotated,line1,test) #flow is <-- (sorry, I know that makes no sense)

//         if testRotated[0]>=0: #x
//             if testRotated[1]>=0: #y
//                 return 1
//             else:
//                 return 4
//         else:
//             if testRotated[1]>=0: #y
//                 return 2
//             else:
//                 return 3

//         return 0 #invalid value
//     def GetFloatLine(self,line1):
//         return point1+point2 # wow, it really might be that easy!
//     def GetFloatLineLength(self):
//         return length_line([point1[0], point1[1], point2[0], point2[1]])

export { Point, Rectangle, Arc, ArrowLine };
