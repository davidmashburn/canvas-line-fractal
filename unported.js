
// class Generator:
// def __init__(self,gen1=None,length=1,myLines=[[0.,0.,0.,1.]],gens=None,mirrorGen=None,mirrorQ=False):
//     self.length=length
//     self.myLines=myLines #full data storage
//     self.myGens=gens #pointer storage only (duh)
//     self.mirrorGen=mirrorGen #pointer to mirror Generator
//     self.mirrorQ=mirrorQ #determines whether this is the independent or dependent (Mirror) Generator
// def __del__(self):
//     pass
// def ChangeLengthNoDual(self,newLength):
//     if newLength<0:
//         newLength=0
//     myLines=myLines[:min(len(myLines),newLength)]+[[0.,0.,0.,1.]]*newLength
//     myGens=myGens[:min(len(myGens),newLength)]+[None]*newLength
//     self.length=newLength
// def ChangeLength(self,newLength):
//     self.ChangeLengthNoDual(newLength)
//     self.myMirrorGen.ChangeLengthNoDual(newLength)
// def __getitem__(self,index):
//     return self.myLines[index] #do not use to set!
// def GetMyLines(self,index):
//     return self.myLines[i] #do not use to set!
// def SetMyLines(self,index,line): # or (self,line)
//     index=n.clip(index,0,length-1)
//     self.myLines[index]=line
//     self.myMirrorGen.myLines[index]=[line[0],-line[1],line[2],-line[3]]
// def GetMyGens(self,index):
//     return self.myGens[i]
// def SetMyGens(self,index, generator):
//     index=n.clip(index,0,length-1)
//     self.myGens[index]=generator
//     self.myMirrorGen.myGens[index]=generator.myMirrorGen
// def CreateMirrorLines(self,mirrorGenerator):
//     mirrorGenerator.ChangeLength(self.length)
    
//     for i in range(self.length):
//         mirrorGenerator.SetMyLines(i,self.myLines[i][0],-self.myLines[i][1],
//                                      self.myLines[i][2],-self.myLines[i][3])
// def Reset(self,gen1):
//     self.myLines=gen1.myLines
    
//     self.myGens=gen1.myGens
//     self.myMirrorGen.myGens=gen1.myMirrorGen.myGens
    
//     #Correct for self-references...
//     for i in range(len(gen1.myGens)):
//         if gen1.myGens[i] == gen1:
//             self.myGens[i] = self
//             self.myMirrorGen.myGens[i] = self.myMirrorGen
//         elif gen1.myGens[i] == gen1.myMirrorGen:
//             self.myGens[i] = self.myMirrorGen
//             self.myMirrorGen.myGens[i] = self
//         else:
//             pass # bulk data copied above...
// def MirrorAllLines(self):
//     for i in range(len(self.lines)):
//         self.myLines[i][1]*=-1
//         self.myLines[i][3]*=-1
// def Length(self):
//     return self.length

// MIN_FLOAT=1e-7

// function floatEquals(a, b, tol=1e-7) {
// return Math.abs(a - b) < MIN_FLOAT;
// }

// POINT_1_X=POINT_DNM_RADIUS
// POINT_1_Y=3*POINT_DNM_RADIUS
// POINT_2_X=3*POINT_DNM_RADIUS
// POINT_2_Y=3*POINT_DNM_RADIUS


// class FractalObject:
// def __init__(self,initGen=None,line=[0.,0.,0.,1.],mirror_value=False):
//     self.linesInBuffer=0 # Probably unnecessary...
//     self.done=False
//     self.maxDepth=1
//     self.length_points=0
//     self.length_lines=0

//     self.basePointDNM1=PointDNM(line[:2])
//     self.basePointDNM2=PointDNM(line[2:])
//     self.baseLineDNM=ArrowLineDNM(basePointDNM1,basePointDNM2,mirror_value) #init &basePointDNM1 , &basePointDNM2
//     self.masterLine=[0.,0.,0.,1.]
    
//     self.points=[] #PointDNM                 #init 5
//     self.lines=[]  #LineDNM                  #init 4
//     self.generator=initGen                   #init 4
    
//     self.DRAW_ALL_LINES=True
//     self.COLORED=True
    
//     self.fractalQ=False
    
//     CreatePointsAndLinesFromGenerator()
// def __del__(self):
//     for i in lines:
//         i.~ArrowLineDNM()

//     for i in points:
//         i.~PointDNM()

// ##def ChangeNumPoints(int newLength)        *** #hard to implement and not that useful--better to use make or select or something
// ##def ChangeNumLines(int newLength)         *** 
// def ChangeNumPointsNoCopy(self,newLength):
//     if newLength<0:
//         newLength=0
    
//     del(self.points)
    
//     self.points=[]
    
//     for i in range(newLength):
//         self.points.append(PointDNM())
    
//     self.length_points=newLength;
// def ChangeNumLinesNoCopy(self,newLength):
//     if newLength<0:
//         newLength=0
    
//     del(self.lines)
    
//     self.lines=[]
    
//     for i in range(newLength):
//         self.lines.append(ArrowLineDNM())
    
//     self.length_lines=newLength;
// def ChangeNumPointsMessy(self,newLength): #no generator adjustments
//     if newLength==self.length_points:
//         return
    
//     self.ChangeNumPointsNoCopy(newLength)
// def ChangeNumLinesMessy(self,newLength):
//     if newLength==self.length_lines:
//         return
//     self.ChangeNumLinesNoCopy(newLength)
// def UpdateMasterLine(self):
//     s, e = baseLineDNM.start.position, baseLineDNM.end.position
//     masterLine = [s[0],-s[1],e[0],-e[1]]
// #GraphicsPort or a Region or something
// def CreatePointsAndLinesFromGenerator(self):
//     self.UpdateMasterLine();
    
//     self.ChangeNumLinesMessy(generator.Length())
    
//     pts=[[0.,0.]]*2*length_lines
    
//     start=[-1]*length_lines
//     end=[-1]*length_lines
    
//     tempLenPts=0
    
//     temp=[0.,0.]
    
//     gen=None
    
//     if baseLineDNM.mirrored==False:
//         gen = self.generator
//     else:
//         gen = self.generator.myMirrorGen;
    
//     for i in range(length_lines):
//         for j in range(tempLenPts)
//             if FLOAT_EQUALS( gen[i][0], pts[j][0] ) and FLOAT_EQUALS( gen[i][1], pts[j][1] ):
//                 start[i]=j
//             if FLOAT_EQUALS( gen[i][2], pts[j][0] ) and FLOAT_EQUALS( gen[i][3], pts[j][1] ):
//                 end[i]=j
            
//             if start[i]>=0 or end[i]>=0:
//                 break
        
//         if start[i]==-1:
//             pts[tempLenPts] = gen[i][:2]
//             start[i]=tempLenPts
//             tempLenPts+=1
        
//         if end[i]==-1:
//             pts[tempLenPts] = gen[i][2:]
//             end[i]=tempLenPts
//             tempLenPts+=1
    
//     self.ChangeNumPointsMessy(tempLenPts)
    
//     for j in range(length_points):
//         TransformPoint( pts[j],masterLine,temp );
//         self.points[j].MovePoint( [(int) temp[0] , -((int) temp[1])] ) #Convert from Cartesian to Window coordinates
    
//     for i in range(length_lines):
//         self.lines[i].start = self.points[start[i]];
//         self.lines[i].end = self.points[end[i]];
        
//         if gen.GetMyGens(i).mirrorQ == True:
//             self.lines[i].mirrored=True
//         else:
//             self.lines[i].mirrored=False
// def CreateGeneratorFromLines(self):
//     self.UpdateMasterLine()
    
//     tempL=[0.]*4
//     tempG=[0.]*4
    
//     self.generator.ChangeLength(self.length_lines)
    
//     for i in range(length_lines):
//         tempL[0] = self.lines[i].start.position[0]
//         tempL[1] = -self.lines[i].start.position[1]
//         tempL[2] = self.lines[i].end.position[0]
//         tempL[3] = -self.lines[i].end.position[1]
        
//         TransformLineReverse(tempG,masterLine,tempL)
        
//         if baseLineDNM.mirrored==False:
//             self.generator.SetMyLines(i,tempG)
//         else
//             self.generator.myMirrorGen.SetMyLines(i,tempG)
        
//         if self.lines[i].mirrored == self.baseLineDNM.mirrored:
//             self.generator.SetMyGens(i,self.generator);
//         else:
//             self.generator.SetMyGens(i,self.generator.myMirrorGen);
// def CheckMouse(self,where):
//     if self.basePointDNM1.CheckMouse(where)!=0:
//         return 1
    
//     if self.basePointDNM2.CheckMouse(where)!=0:
//         return 2
    
//     for i in range(self.length_points):
//         if self.points[i].CheckMouse(where)!=0:
//             return 5
    
//     if self.baseLineDNM.CheckMouse(where)==1: #arrow hit
//         return 3
//     elif self.baseLineDNM.CheckMouse(where)==2: #line hit
//         return 4
    
//     for i in range(self.length_lines):
//         if self.lines[i].CheckMouse(where)!=0:
//             return 6
//     return 0
// def DoMouse(self,where):
//     if self.basePointDNM1.CheckMouse(where)!=0:
//         self.TrackBasePoint1(where)
//         return 1
    
//     if self.basePointDNM2.CheckMouse(where)!=0:
//         self.TrackBasePoint2(where)
//         return 2
    
//     for i in range(length_points):
//         if self.points[i].DoMouse(where)!=0:
//             self.CreateGeneratorFromLines();
//             return 5
    
//     if self.baseLineDNM.CheckMouse(where)==1: #arrow hit
//         self.TrackBaseLineArrow(where);
//         return 3
//     elif self.baseLineDNM.CheckMouse(where)==2: #line hit
//         self.TrackBaseLineMotion(where)
//         return 4
    
//     for i in range(length_lines):
//         if self.lines[i].DoMouse(where)!=0:
//             self.CreateGeneratorFromLines();
//             return 6
//     return 0
// def TrackSelectedPoints(self,oldCursor):
//     num_selected=0
    
//     for i in range(self.length_points): #add line check here as well
//         if self.points[i].selected==True:
//             num_selected+=1
    
//     if num_selected==0: #error occurred--function called improperly or OS error
//         return
    
//     oldPosition=[[0.,0.]]*num_selected
    
//     #EventRecord event[1];
//     #RgnHandle tempRgnHnd=NewRgn();
    
//     current=0
    
//     for i in range(length_points):
//         if self.points[i].selected==True:
//             oldPosition[current]=points[i].position;
//             current+=1
    
//     while True:
//         WaitNextEvent(everyEvent, event,0, tempRgnHnd)
        
//         if event.what == mouseUp:
//             DrawEverything()
//             break
        
//         eventPt=event.where
//         GlobalToLocal(eventPt)
        
//         if eventPt[0]!=cursor[0] or eventPt[1]!=cursor[1]:
//             cursor = eventPt
//             current=0
            
//             for i in range(self.length_points):
//                 if self.points[i].selected==True:
//                     self.points[i].position = [ oldPosition[current][0] + (cursor[0] - oldCursor[0]),
//                                                 oldPosition[current][1] + (cursor[1] - oldCursor[1]) ]
//                     current+=1
            
//             DrawEverything()
        
//         DrawEverything()
    
//     self.CreateGeneratorFromLines()
// def TrackBasePoint1(self,oldCursor):
//     oldPosition=self.basePointDNM1.position
    
//     #EventRecord event[1];
//     #RgnHandle tempRgnHnd=NewRgn();
            
//     while True:
//         WaitNextEvent(everyEvent, event,0, tempRgnHnd)
        
//         if event.what == mouseUp:
//             DrawEverything()
//             break
        
//         eventPt=event.where
//         GlobalToLocal(eventPt)
        
//         if eventPt[0]!=cursor[0] or eventPt[1]!=cursor[1]:
//             cursor = eventPt
//             self.basePointDNM1.position = [ oldPosition[0] + (cursor[0] - oldCursor[0]),
//                                             oldPosition[1] + (cursor[1] - oldCursor[1]) ]
//             self.CreatePointsAndLinesFromGenerator()
//             DrawEverything()
        
//         DrawEverything()
// def TrackBasePoint2(self,oldCursor):
//     oldPosition=self.basePointDNM2.position
    
//     #EventRecord event[1];
//     #RgnHandle tempRgnHnd=NewRgn();
            
//     while True:
//         WaitNextEvent(everyEvent, event,0, tempRgnHnd)
        
//         if event.what == mouseUp:
//             DrawEverything()
//             break
        
//         eventPt=event.where
//         GlobalToLocal(eventPt)
        
//         if eventPt[0]!=cursor[0] or eventPt[1]!=cursor[1]:
//             cursor = eventPt
//             self.basePointDNM2.position = [ oldPosition[0] + (cursor[0] - oldCursor[0]),
//                                             oldPosition[1] + (cursor[1] - oldCursor[1]) ]
//             self.CreatePointsAndLinesFromGenerator()
//             DrawEverything()
        
//         DrawEverything()
// def TrackBaseLineArrow(self,oldCursor):
//     currentQuadrant=0 #quadrant can be anywhere from 1 to 4.  0 is NULL, senseless

//     if self.baseLineDNM.mirrored==False:
//         currentQuadrant = 1
//     else: #mirrored==true
//         currentQuadrant = 4
    
//     #EventRecord event[1];
//     #RgnHandle tempRgnHnd=NewRgn();
            
//     while True:
//         WaitNextEvent(everyEvent, event,0, tempRgnHnd)
        
//         if event.what == mouseUp:
//             break
        
//         eventPt=event.where
//         GlobalToLocal(eventPt)
        
//         if eventPt[0]!=cursor[0] or eventPt[1]!=cursor[1]:
//             #last point the cursor was at
//             cursor = eventPt
//             currentQuadrant = self.baseLineDNM.GetQuadrantAboutMidpoint(cursor)
            
//             #make mirror correct
//             if currentQuadrant in [1,3]:
//                 self.baseLineDNM.mirrored=False;
//             else:
//                 self.baseLineDNM.mirrored=True;
            
//             #make the order of the points correct
//             if currentQuadrant in [2,3]:
//                 self.baseLineDNM.start,self.baseLineDNM.end = self.baseLineDNM.end,self.baseLineDNM.start
//             self.CreatePointsAndLinesFromGenerator()
//             DrawEverything()
// def TrackBaseLineMotion(self,oldCursor):
//     oldPosition1=self.basePointDNM1.position
//     oldPosition2=self.basePointDNM2.position
    
//     #EventRecord event[1];
//     #RgnHandle tempRgnHnd=NewRgn();
            
//     while True:
//         WaitNextEvent(everyEvent, event,0, tempRgnHnd)
        
//         if event.what == mouseUp:
//             DrawEverything()
//             break
        
//         eventPt=event.where
//         GlobalToLocal(eventPt)
        
//         if eventPt[0]!=cursor[0] or eventPt[1]!=cursor[1]:
//             cursor = eventPt
//             self.basePointDNM1.position = [ oldPosition1[0] + (cursor[0] - oldCursor[0]),
//                                             oldPosition1[1] + (cursor[1] - oldCursor[1]) ]
//             self.basePointDNM2.position = [ oldPosition2[0] + (cursor[0] - oldCursor[0]),
//                                             oldPosition2[1] + (cursor[1] - oldCursor[1]) ]
//             self.CreatePointsAndLinesFromGenerator()
//             DrawEverything()
        
//         DrawEverything()
// def MakeNewPoint(self,p1=None):
//     self.points.append(PointDNM(p1))
//     self.length_points+=1
// def DeletePoint(self,index):
//     index=n.clip(index,0,self.length_points-1)
    
//     for i in self.points:
//         if i in [self.lines[i].start,self.lines[i].end]:
//             self.DeleteLine(i)
    
//     del(self.points[index])
//     self.length_points-=1
    
// def MakeNewLine(self,p_index1=None,p_index2=None,p1=None,p2=None):
//     self.UpdateMasterLine()
    
//     if p_index1==None:
//         self.points.append(PointDNM(p1))
//         p_index1=len(points)-1
//     if p_index2==None:
//         self.points.append(PointDNM(p2))
//         p_index2=len(points)-1
    
//     self.lines.append(ArrowLineDNM(self.points[p_index1],self.points[p_index2],mirrored=False))
    
//     self.length_lines=len(self.lines)
//     self.length_points=len(self.points)
    
//     self.generator.ChangeLength(self.length_lines)
    
//     tempL=[self.lines[length_lines-1].start.position[0],
//            -self.lines[length_lines-1].start.position[1],
//            self.lines[length_lines-1].end.position[0],
//            -self.lines[length_lines-1].end.position[1]]
    
//     TransformPointReverse(tempG,self.masterLine,tempL)
    
//     generator.SetMyLines(self.length_lines-1, tempG)
// def DeleteLine(self,index):
//     # TODO : Does this work?
//     index=n.clip(index,0,self.length_points-1)
    
//     del(self.lines[index])
//     del(self.generator.myLines[index]) # eh... whatever... private / scmivate!
//     del(self.generator.myMirrorGen.myLines[index])
    
//     self.length_lines-=1
// def FullReset(self):
//     self.Reset()
    
//     self.DRAW_ALL_LINES=True
//     self.COLORED=True
//     self.fractalQ=False
//     self.done=False
    
//     self.basePointDNM1.MovePoint( [POINT_1_X , POINT_1_Y] )
//     self.basePointDNM2.MovePoint( [POINT_2_X , POINT_2_Y] )
    
//     self.baseLineDNM.start = self.basePointDNM1
//     self.baseLineDNM.end = self.basePointDNM2
// def Reset(self,initGen=None,base_line=None,points=None,lines=None,maxDepth=None,DRAW_ALL_LINES=None,COLORED=None,masterLine=None,mirrored=None):
    
//     if base_line!=None:
//         self.basePointDNM1.MovePoint( base_line[:2] )
//         self.basePointDNM2.MovePoint( base_line[2:] )
        
//         self.baseLineDNM.start = self.basePointDNM1
//         self.baseLineDNM.end = self.basePointDNM2
    
//     if points!=None and lines!=None:
//         self.points=points
//         self.lines=lines
        
//         if mirrored!=None: self.baseLineDNM.mirrored = mirrored
//         # TODO : Is this different from base_line?
//         if masterLine!=None: self.masterLine = masterLine
        
//         self.generator.Reset(initGen)
//     else:
//         self.generator.Reset(initGen)
//         self.CreatePointsAndLinesFromGenerator()
    
//     if maxDepth!=None: self.maxDepth = maxDepth
//     if DRAW_ALL_LINES!=None: self.DRAW_ALL_LINES = DRAW_ALL_LINES
//     if COLORED!=None: self.COLORED = COLORED
    
//     # Wow this got easier!
//     # self.ChangeNumPointsMessy(fo1.length_points)
//     # self.ChangeNumLinesMessy(fo1.length_lines)
    
//     #if(length_points>0)
//     #    memcpy( (void*) points , (void*) fo1.points , length_points * sizeof(PointDNM) )
//     #
//     #if(length_lines>0)
//     #    memcpy( (void*) lines , (void*) fo1.lines , length_lines * sizeof(ArrowLineDNM) )
//     #    
//     #    for(i=0;i<length_lines;i++)
//     #        if(  ( (lines[i].start - fo1.points) >= 0 ) && ( (lines[i].start - fo1.points) < length_points * sizeof(PointDNM) )  )
//     #            lines[i].start = points + (lines[i].start - fo1.points)
//     #        
//     #        if(  ( (lines[i].end - fo1.points) >= 0 ) && ( (lines[i].end - fo1.points) < length_points * sizeof(PointDNM) )  )
//     #            lines[i].end = points + (lines[i].end - fo1.points)
// def DrawLine(self,line):
//     MoveTo( (short)(self[0]) , (short)(line[1]) )
//     Line( short(line[2]-line[0]) , short(line[3]-line[1]) )
// def DrawLineIgnoreColor(self,line):
//     MoveTo( (short)(line[0]) , (short)(line[1]) )
//     Line( short(line[2]-line[0]) , short(line[3]-line[1]) )
// def DrawCartesianLine(self,line):#this one uses colors and includes the event checking procedure
//     # TODO : Finish up!!
//     if COLORED:
//         color=map(int,[n.random.rand()*256,n.random.rand()*256,n.random.rand()*256])
//     else:
//         color="black"
    
//     MoveTo( (short)(line[0]) , -(short)(line[1]) )
//     Line( short(line[2]-line[0]) , -short(line[3]-line[1]) )
    
//     //added 1.31.2003
    
//     if(linesInBuffer>=1000): #w/100000000 it was 91s w/1 it was between 2560s and 2936s  there is an ~30x difference in speed
//         QDFlushPortBuffer(GetQDGlobalsThePort(),NULL)
//         DrawingEventCheck()
//         linesInBuffer=0
//     else:
//         linesInBuffer++;
// def RecursiveFractal(self,gen1,lineRef,depth):
//     if fractalQ==False or done==True:
//         return
    
//     if (depth > maxDepth) or (cheap_length_line(lineRef) <= MIN_LENGTH):
//         DrawCartesianLine(lineRef) #if you're done recursing, draw the reference line
//     else:
//         for i in range(gen1.Length()): #recurse, branching as many times as the generator demands
//             if DRAW_ALL_LINES==True:
//                 DrawCartesianLine(lineRef)
            
//             TransformLine(gen1[i],lineRef,temp)
//             self.RecursiveFractal( gen1.GetMyGens(i),temp,depth+1)
// #depth editing
// def GetMaxDepth(self):
//     return self.maxDepth
// def SetMaxDepth(self,newMax):
//     self.maxDepth=maxDepth
// def ResetMaxDepth(self):
//     self.maxDepth=0
// def IncrementMaxDepth(self):
//     self.maxDepth+=1
// def DecrementMaxDepth(self):
//     self.maxDepth-=1
// #drawing functions
// def MakeFractalImage(self):  #ClearScreen call #includes event loop for abort and such
//     self.linesInBuffer=0
//     UpdateMasterLine()
//     fractalQ=True
    
//     if maxDepth>0:
//         ClearScreen()
//         CreateGeneratorFromLines()
        
//         # TODO: Flag
//         color='black'
//         DrawLineIgnoreColor(self.masterLine)
        
//         #draw the fractal
//         if self.baseLineDNM.mirrored==False:
//             self.RecursiveFractal(generator, masterLine, 0)
//         else:
//             self.RecursiveFractal(generator.myMirrorGen, masterLine, 0)
// def DrawNoUnDraw(self):
//     for i in range(self.length_lines):
//         self.lines[i].Draw()
    
//     self.baseLineDNM.Draw()
    
//     for i in range(self.length_points):
//         self.points[i].Draw()
    
//     self.basePointDNM1.Draw()
//     self.basePointDNM2.Draw()
// def UnDraw(self):
//     for i in range(self.length_lines):
//         self.lines[i].UnDraw()
    
//     self.baseLineDNM.UnDraw()
    
//     for i in range(self.length_points):
//         self.points[i].UnDraw()
    
//     self.basePointDNM1.UnDraw()
//     self.basePointDNM2.UnDraw()
// def Draw(self):
//     self.UnDraw()
//     self.DrawNoUnDraw()
// #selection functions
// def SelectPoint(self,index):
//     self.points[index].selected=True
// def UnselectPoint(self,index):
//     self.points[index].selected=False
// def SelectLine(self,index):
//     self.lines[index].selected=True
// def UnselectLine(self,index):
//     self.lines[index].selected=False
// def SelectAllNoBase(self):
//     for i in self.lines + self.points:
//         i.selected==True
// def SelectBasePoint1(self):
//     self.basePointDNM1.selected=True
// def SelectBasePoint2(self):
//     self.basePointDNM2.selected=True
// def SelectBaseLine(self)
//     self.baseLineDNM.selected=True
// def UnselectBasePoint1(self):
//     self.basePointDNM1.selected=False
// def UnselectBasePoint2(self):
//     self.basePointDNM2.selected=False
// def UnselectBaseLine(self):
//     self.baseLineDNM.selected=False
// def SelectAll(self):
//     for i in self.lines + self.points + [self.baseLineDNM,self.basePointDNM1,self.basePointDNM2]:
//         i.selected==True
// def UnselectAll(self):
//     for i in self.lines + self.points + [self.baseLineDNM,self.basePointDNM1,self.basePointDNM2]:
//         i.selected==False
// #def DeleteBrokenLines(self):
// #    pass
// #def DeleteBrokenOrSelectedLines(self):
// #    pass
// def DeleteSelected(self):
//     for i,ln in enumerate(self.lines):
//         if ln.selected==True:
//             self.DeleteLine(i)
//     for i,pt in enumerate(self.points):
//         if pt.selected==True:
//             self.DeletePoint(i)

