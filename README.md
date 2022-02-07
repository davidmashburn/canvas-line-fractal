# Line Fractal Generator

Lets you interactively make line fractals

HTML canvas port of my now defunct Apple Carbon C++ line fractal program (ca. 2003)

HTML/CSS/JavaScript implementation started from:
https://codeboxsystems.com/tutorials/en/how-to-drag-and-drop-objects-javascript-canvas/
and
http://jsfiddle.net/WolfeSVK/s2tNr/
among other sources.

## Keys ideas:

A "Fractal Generator" defines the points, connecting lines, orientation, and sub-generators for each line in the fractal. By default, the "sub-generator" is the generator itself, creating the recursion traditionally accociated with fractals.

Given two points, lines can be oriented in one of four ways, as shown by an arrow: the line can start on either point and it can be upright or "mirrored". This is shown in the tool as an arrow drawn at the endpoint and flipped to one side of the other.

In addition to the "Fractal Generator", to other needed input is the "base line" to draw the fractal on. In this tool, the base line has its own line and arrows as well as blue control points. In contrast, the red control points that typically cover these are the Generator control points.

The fractal itself is drawn to a maximum depth set in the "Depth" field using various colored lines. 1000 lines are drawn at a time, and the screen is refreshed many times per second as set on the left (default 40) but it's definitely possible to see the fractal fill in.

## Interactions:

Drag the control points, lines, and arrow tips to change the fractal generator. The drawing will update automatically.

Drag anywhere except the controls to pan. Use mouse wheel to zoom in and out. Hold Ctrl and use mouse wheel to rotate. On touch devices, use two-finger pinch to zoom and rotate.