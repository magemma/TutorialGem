// Notation: since "const" is supported only by quite updated browsers the
// variables defined without the symbol "var" are considered constants - never
// modified

backgroundFrame = 5;
intervalOfTimer = 5;
numberOfIterations = 300;

var maxMulFactor = 2;
// frameAroundNode = 2 * toolTipWidth;
// distanceFromTop = 2.5 * toolTipHeight;
var contItem, contToolTip;
var tutTable, callback, curr, id, currZoomedItem = null;
// shadeDiv inside shadePage
// clickDiv inside animatedZomm (only in the tooltip)
// svg in drawArrow (not necessary deleting path, since it's svg's child)
// backgroundDiv in focusItem (not necessary deleting copyEl, see above) ONLY IF
// curr!=0
// currHoleBackground in focusItem (not necessary deleting newCurrHole, see
// above)
// holeBackground in focusItem (not necessary deleting newHole, see
// above)
// toolTipDiv in createToolTip (not necessary deleting closeTip, see
// above)
var ids = [
  "shadeDiv", "clickDiv", "svg", "backgroundDiv", "currHoleBackground",
  "trapezoids", "holeBackground", "toolTipDiv"
];
/**
 * Returns dimensions of the tool tip
 *
 * @author: Gemma Martini
 *
 * @return {array} array of two elements: width and height of the toolTip
 */
function toolTipDimensions() {
  var ratio = 1 / 5;
  var myWidth = window.innerWidth * ratio;
  if (myWidth > 300)
    myWidth = 300;
  if (myWidth < 100)
    myWidth = 100;

  var myHeight = window.innerHeight * ratio;
  if (myHeight > 300)
    myHeight = 300;
  if (myHeight < 100)
    myWidth = 100;
  // Both of them are in a range between 100 and 300
  if (myWidth > myHeight)
    myHeight = myWidth;
  else
    myWidth = myHeight;
  return [ myWidth, myHeight ];
}

/**
 * Extracts width from the array obtained calling toolTipDemnsions
 *
 * @author: Gemma Martini
 *
 * @return {number} the width of the toolTip
 */
function toolTipWidth() { return toolTipDimensions()[0]; }

/**
 * Extracts height from the array obtained calling toolTipDimensions
 *
 * @author: Gemma Martini
 *
 * @return {number} the height of the toolTip
 */
function toolTipHeight() { return toolTipDimensions()[1]; }

var itemFrameRatio = 1 / 20;
var constAngle = 1 / 50 * Math.PI;
/**
 * Creates an object with that fields
 *
 * @author: Gemma Martini
 *
 * @param {HTMLelement} myNode node of the tutorial
 * @param {string} fromWhere position the arrow will be placed
 * @param {string} myBackgroundColor the color of the background of myNode
 * @param {string} myBackgroundColor2 the color of the background of the tooltip
 * @param {string} myDescription the description to be written inside toolTip
 * @param {string} myArrowColor color of the arrow that leads to it
 */
function genericNode(myNode, fromWhere, myBackgroundColor, myBackgroundColor2,
                     myDescription, myArrowColor) {
  this.myNode = myNode;
  this.fromWhere = fromWhere;
  this.myBackgroundColor = myBackgroundColor;
  this.myBackgroundColor2 = myBackgroundColor2;
  this.myDescription = myDescription;
  this.myArrowColor = myArrowColor;
}

/**
 * Takes an element, scales it and translates it
 *
 * @author: Gemma Martini
 * @param {HTMLelement} node the element to transform
 * @param {number} mulFactor the number element should be scaled of
 * @param {number} transX the number element should be translated orizontally
 * @param {number} transY the number element should be translated vertically
 */
function scaleAndTranslate(node, mulFactor, transX, transY) {
  var moveX = transX + 'px';
  var moveY = transY + 'px';
  node.style.transform = "translate(" + moveX + ", " + moveY + ") scale(" +
                         mulFactor + "," + mulFactor + ")";
}

/**
 * Creates a div with the specified fields and returns it
 *
 * @author: Gemma Martini
 * @param {number} left div distance from left border
 * @param {number} top div distance from top border
 * @param {number} width div width
 * @param {number} height div height
 * @param {string} backgroundColor color of the background
 * @param {number} borderRadius the radius of rounded corners
 * @return {HTMLelement} currDiv the desired div
 */
function createDiv(left, top, width, height, backgroundColor, borderRadius) {
  var currDiv = document.createElement("div");
  currDiv.style.backgroundColor = backgroundColor;
  currDiv.className = "highLayer";
  currDiv.style.position = "absolute";
  currDiv.style.top = top + "px";
  currDiv.style.left = left + "px";
  currDiv.style.width = width + "px";
  currDiv.style.height = height + "px";
  currDiv.style.borderRadius = borderRadius + "px";
  document.body.appendChild(currDiv);
  return currDiv;
}

/**
 * Creates a matt background for the element and returns it
 *
 * @author: Gemma Martini
 * @param {number} elLeft element distance from left border
 * @param {number} elTop element distance from top border
 * @param {number} elWidth width of the element
 * @param {number} elHeight height of the element
 * @param {string} backgroundColor color of the background
 * @param {number} borderRadius the radius of rounded corners
 * @param {boolean} withFrame helps to understand if the div should be created
 * leaving a frame around or not
 * @return {HTMLelement} underEl backgroundDiv
 */
function createBackground(elLeft, elTop, elWidth, elHeight, backgroundColor,
                          borderRadius, withFrame) {
  var underEl;
  if (withFrame)
    underEl = createDiv(elLeft + borderRadius / 2, elTop + borderRadius / 2,
                        elWidth + borderRadius, elHeight + borderRadius,
                        backgroundColor, borderRadius);
  else
    underEl = createDiv(elLeft, elTop, elWidth, elHeight, backgroundColor,
                        borderRadius);
  return underEl;
}

/**
 * Creates a div that makes the whole page shaded
 *
 * @author: Gemma Martini
 */
function shadePage() {
  var shadeDiv = document.getElementById("shadeDiv");
  if (shadeDiv == null) {
    shadeDiv = document.createElement("div");
    shadeDiv.id = "shadeDiv";
    var currWidth, currHeight;
    currWidth = document.body.getBoundingClientRect().width;
    currHeight = document.body.getBoundingClientRect().height;
    if (currWidth < window.innerWidth)
      currWidth = window.innerWidth;
    if (currHeight < window.innerHeight)
      currHeight = window.innerHeight;
    shadeDiv.style.width = currWidth + "px";
    shadeDiv.style.height = currHeight + "px";
    document.body.appendChild(shadeDiv);
  }
  shadeDiv.className = "shade superBottomLayer";
}

/**
 * Draws an arrow from startEl to finishEl
 *
 * @author: Gemma Martini
 *
 * @param {HTMLelement} startEl the element the arrow should start from
 * @param {HTMLelement} finishEl the element the arrow should finish in
 * @param {string} whereToPoint is the position of the arrow to finishEl
 */
function drawArrow(startEl, finishEl, whereToPoint) {
  // The application point changes its position due to the destination
  // position relatively to the origin Using getBoundingClientRect to be sure
  // to have the right position and dimension
  rect = startEl.getBoundingClientRect();
  var topO = rect.top + window.pageYOffset;
  var leftO = rect.left + window.pageXOffset;
  var widthO = rect.width;
  var heightO = rect.height;
  var rect = finishEl.getBoundingClientRect();
  var leftD = rect.left + window.pageXOffset;
  var topD = rect.top + window.pageYOffset;
  var widthD = rect.width;
  var heightD = rect.height;
  var originX = leftO + widthO / 2;
  var originY = topO + heightO / 2;
  var destinationX, destinationY;
  var CE = heightD / 2;
  if (CE > 1 / 5 * window.innerHeight)
    CE = 1 / 5 * window.innerHeight;
  if (CE < 1 / 20 * window.innerHeight)
    CE = 1 / 20 * window.innerHeight;
  var xB, yB, xC, yC, xE, yE, xF, yF, xCPF, yCPF, xCPB, yCPB, xCPA, yCPA, xCPG,
      yCPG;
  // There are 8 possibilities in order to draw a nice arrow
  // According to the picture in the documentation:
  // D=(destinationX, destinationY)
  // B=(destinationX +3/2 widthD/2, destinationY-CE/6)
  // F=(xB, destinationY + CE/6)
  // C=(xB, destinationY - CE/2)
  // E=(xB, destinationY + CE/2)
  // G=(originX, originY)
  // A=(originX, originY)
  // For the control points there is an heuristic which takes into consideration
  // the position of the arrow, its orientation and the position of the origin
  var xA = originX;
  var yA = originY;
  var xG = originX;
  var yG = originY;
  var xMiddleCE, yMiddleCE; // the mid point of CE
  if (whereToPoint == null) {
    if (topD + heightD / 2 < (topO + (heightO / 2)))
      whereToPoint = "bottom";
    if (topD + heightD / 2 >= (topO + (heightO / 2)) &&
        (leftD + widthD / 2 < (leftO + (widthO / 2))))
      whereToPoint = "right";
    if (topD + heightD / 2 >= (topO + (heightO / 2)) &&
        (leftD + widthD / 2 >= (leftO + (widthO / 2))))
      whereToPoint = "left";
  }
  var CPBDistance = 3 * CE;
  var mulAngle = 3;
  if (whereToPoint === "bottom") {
    destinationX = leftD + widthD / 2;
    destinationY = topD + heightD;
    yB = destinationY + CE;
    xB = destinationX - CE / 6;
    yC = yB;
    xC = destinationX - CE / 2;
    yE = yB;
    xE = destinationX + 1 / 2 * CE;
    yF = yB;
    xF = destinationX + 1 / 6 * CE;
    xCPB = xB;
    yCPB = yB + CPBDistance;
    xCPF = xF;
    yCPF = yF + CPBDistance;
  } else if (whereToPoint === "top") {
    destinationX = leftD + widthD / 2;
    destinationY = topD;
    yB = destinationY - CE;
    xB = destinationX + CE / 6;
    yC = yB;
    xC = destinationX + CE / 2;
    yE = yB;
    xE = destinationX - 1 / 2 * CE;
    yF = yB;
    xF = destinationX - 1 / 6 * CE;
    xCPB = xB;
    yCPB = yB - CPBDistance;
    xCPF = xF;
    yCPF = yF - CPBDistance;
  } else if (whereToPoint === "right") {
    destinationX = leftD + widthD;
    destinationY = topD + heightD / 2;
    xB = destinationX + CE;
    yB = destinationY + CE / 6;
    xC = xB;
    yC = destinationY + CE / 2;
    xE = xB;
    yE = destinationY - 1 / 2 * CE;
    xF = xB;
    yF = destinationY - 1 / 6 * CE;
    xCPB = xB + CPBDistance;
    yCPB = yB;
    xCPF = xF + CPBDistance;
    yCPF = yF;
  } else if (whereToPoint === "left") {
    destinationX = leftD;
    destinationY = topD + heightD / 2;
    xB = destinationX - CE;
    yB = destinationY - CE / 6;
    xC = xB;
    yC = destinationY - CE / 2;
    xE = xB;
    yE = destinationY + 1 / 2 * CE;
    xF = xB;
    yF = destinationY + 1 / 6 * CE;
    xCPB = xB - CPBDistance;
    yCPB = yB;
    xCPF = xF - CPBDistance;
    yCPF = yF;
  }

  xMiddleCE = (xC + xE) / 2;
  yMiddleCE = (yC + yE) / 2;
  // Changing the orientation of y axis
  var angle = Math.atan2(yA - yMiddleCE, xMiddleCE - xA);
  var controlAngle;
  // Quadrant 1
  if ((0 <= angle) && (angle <= Math.PI / 2)) {
    if ((whereToPoint === "left") || (whereToPoint === "top")) {
      controlAngle = mulAngle * angle;
      if (controlAngle > Math.PI / 2)
        controlAngle = Math.PI / 2;
    }
    if ((whereToPoint === "right") || (whereToPoint === "bottom")) {
      controlAngle = (Math.PI - angle) * mulAngle;
      if (controlAngle > Math.PI / 2)
        controlAngle = Math.PI / 2;
      controlAngle = Math.PI / 2 - controlAngle;
    }
  }
  // Quadrant 2
  if (angle > Math.PI / 2) {
    if ((whereToPoint === "left") || (whereToPoint === "bottom")) {
      controlAngle = mulAngle * (angle - Math.PI / 2);
      if (controlAngle > Math.PI / 2)
        controlAngle = Math.PI / 2;
      controlAngle = Math.PI / 2 + controlAngle;
    }

    if ((whereToPoint === "right") || (whereToPoint === "top")) {
      controlAngle = (Math.PI - angle) * mulAngle;
      if (controlAngle > Math.PI / 2)
        controlAngle = Math.PI / 2;
      controlAngle = Math.PI - controlAngle;
    }
  }
  // Quadrant 3
  if (angle <= -Math.PI / 2) {
    if ((whereToPoint === "left") || (whereToPoint === "top")) {
      controlAngle = (angle + Math.PI / 2) * mulAngle;
      if (controlAngle < -Math.PI / 2)
        controlAngle = -Math.PI / 2;
      controlAngle = controlAngle - Math.PI / 2;
    }
    if ((whereToPoint === "right") || (whereToPoint === "bottom")) {
      controlAngle = (Math.PI + angle) * mulAngle;
      if (controlAngle > Math.PI / 2)
        controlAngle = Math.PI / 2;
      controlAngle = controlAngle - Math.PI;
    }
  }
  // Quadrant 4
  if ((angle > -Math.PI / 2) && (angle < 0)) {
    if ((whereToPoint === "left") || (whereToPoint === "bottom")) {
      controlAngle = angle * mulAngle;
      if (controlAngle < -Math.PI / 2)
        controlAngle = -Math.PI / 2;
    }
    if ((whereToPoint === "right") || (whereToPoint === "top")) {
      controlAngle = (Math.PI / 2 + angle) * mulAngle;
      if (controlAngle > Math.PI / 2)
        controlAngle = Math.PI / 2;
      controlAngle = controlAngle - Math.PI / 2;
    }
  }
  xCPA = xA + Math.cos(controlAngle + constAngle) * CPBDistance;
  yCPA = -Math.sin(controlAngle + constAngle) * CPBDistance + yA;
  xCPG = xA + Math.cos(controlAngle - constAngle) * CPBDistance;
  yCPG = yA - Math.sin(controlAngle - constAngle) * CPBDistance;
  var xD = destinationX;
  var yD = destinationY;
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  var svgNS = svg.namespaceURI;
  svg.setAttribute('height',
                   document.body.getBoundingClientRect().height + "px");
  svg.setAttribute('width', document.body.getBoundingClientRect().width + "px");
  svg.setAttribute('style', 'position:absolute;top:0;left:0');
  svg.setAttribute('class', "highLayer");
  svg.id = "svg";
  var path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', 'M ' + xA + ' ' + yA + ' C ' + xCPA + ' ' + yCPA +
                             ', ' + xCPB + ' ' + yCPB + ', ' + xB + ' ' + yB +
                             ' L ' + xC + ' ' + yC + ' L ' + xD + ' ' + yD +
                             ' L ' + xE + ' ' + yE + ' L ' + xF + ' ' + yF +
                             ' C ' + xCPF + ' ' + yCPF + ', ' + xCPG + ' ' +
                             yCPG + ', ' + xG + ' ' + yG + ' Z');
  if (tutTable[curr + 1].myArrowColor == null)
    arrCol = "yellow";
  else
    arrCol = tutTable[curr + 1].myArrowColor;
  path.setAttribute('fill', arrCol);
  path.id = "path";
  svg.appendChild(path);
  /*// debugging points
  //<!-- Mark relevant points -->
  svg.setAttribute('class', "superHighLayer");
  var g = document.createElementNS(svgNS, 'g');
  g.setAttribute('stroke', 'black');
  g.setAttribute('stoke-width', "4");
  g.setAttribute('fill', "black");
  svg.appendChild(g);
  var pointA = document.createElementNS(svgNS, 'circle');
  pointA.setAttribute('cx', xA);
  pointA.setAttribute('cy', yA);
  pointA.setAttribute('r', "3");
  g.appendChild(pointA);
  var pointB = document.createElementNS(svgNS, 'circle');
  pointB.setAttribute('cx', xB);
  pointB.setAttribute('cy', yB);
  pointB.setAttribute('r', "3");
  g.appendChild(pointB);
  var pointC = document.createElementNS(svgNS, 'circle');
  pointC.setAttribute('cx', xC);
  pointC.setAttribute('cy', yC);
  pointC.setAttribute('r', "3");
  g.appendChild(pointC);
  var pointD = document.createElementNS(svgNS, 'circle');
  pointD.setAttribute('cx', xD);
  pointD.setAttribute('cy', yD);
  pointD.setAttribute('r', "3");
  g.appendChild(pointD);
  var pointE = document.createElementNS(svgNS, 'circle');
  pointE.setAttribute('cx', xE);
  pointE.setAttribute('cy', yE);
  pointE.setAttribute('r', "3");
  g.appendChild(pointE);
  var pointF = document.createElementNS(svgNS, 'circle');
  pointF.setAttribute('cx', xF);
  pointF.setAttribute('cy', yF);
  pointF.setAttribute('r', "3");
  g.appendChild(pointF);
  var pointG = document.createElementNS(svgNS, 'circle');
  pointG.setAttribute('cx', xG);
  pointG.setAttribute('cy', yG);
  pointG.setAttribute('r', "3");
  g.appendChild(pointG);
  var pointCPB = document.createElementNS(svgNS, 'circle');
  pointCPB.setAttribute('cx', xCPB);
  pointCPB.setAttribute('cy', yCPB);
  pointCPB.setAttribute('r', "3");
  g.appendChild(pointCPB);
  var pointCPF = document.createElementNS(svgNS, 'circle');
  pointCPF.setAttribute('cx', xCPF);
  pointCPF.setAttribute('cy', yCPF);
  pointCPF.setAttribute('r', "3");
  g.appendChild(pointCPF);
  var pointCPA = document.createElementNS(svgNS, 'circle');
  pointCPA.setAttribute('cx', xCPA);
  pointCPA.setAttribute('cy', yCPA);
  pointCPA.setAttribute('r', "3");
  g.appendChild(pointCPA);
  var pointCPG = document.createElementNS(svgNS, 'circle');
  pointCPG.setAttribute('cx', xCPG);
  pointCPG.setAttribute('cy', yCPG);
  pointCPG.setAttribute('r', "3");
  g.appendChild(pointCPG);*/
  document.body.appendChild(svg);
}

/* @problem: Sometimes .cloneNode(true) doesn't copy the styles and your are
 * left with everything copied but no styling applied to the clonedNode (it
 * looks plain / ugly). Solution:
 *
 * @solution: call synchronizeCssStyles to copy styles from source (src) element
 * to destination (dest) element.
 *
 * @author: Luigi D'Amico (www.8bitplatoon.com) + Gemma Martini because it only
 * worked on Chrome
 *
 */
function synchronizeCssStyles(src, destination, recursively) {

  // if recursively = true, then we assume the src dom structure and destination
  // dom structure are identical (ie: cloneNode was used)

  // window.getComputedStyle vs document.defaultView.getComputedStyle
  // @TBD: also check for compatibility on IE/Edge
  var cssObj = window.getComputedStyle(src, null);
  var style = ""
  var cssObjProp;
  for (i = 0; i < cssObj.length; i++) {
    cssObjProp = cssObj.item(i);
    style += cssObjProp + ":" + cssObj.getPropertyValue(cssObjProp) + "; ";
  }
  destination.style.cssText = style;
  // destination.style.cssText = document.defaultView.getComputedStyle(src,
  // "").cssText;

  if (recursively) {
    var vSrcElements = src.getElementsByTagName("*");
    var vDstElements = destination.getElementsByTagName("*");

    for (var idx = vSrcElements.length; idx--;) {
      var vSrcElement = vSrcElements[idx];
      var vDstElement = vDstElements[idx];
      style = "";
      cssObj = window.getComputedStyle(vSrcElement, null);
      for (i = 0; i < cssObj.length; i++) {
        cssObjProp = cssObj.item(i);
        style += cssObjProp + ":" + cssObj.getPropertyValue(cssObjProp) + "; ";
      }
      vDstElement.style.cssText = style;

      // vDstElement.style.cssText =
      // document.defaultView.getComputedStyle(vSrcElement, "").cssText;
    }
  }
}

/** This is callback if we are inside focusItem
 * @param{HTMLelement} toolTip element that represents the tool tip
 * @param{number} finalLeft final left padding of toolTip when it wasn't scaled
 *  yet
 * @param{number} finalTop final top padding of toolTip when it wasn't scaled
 * yet
 * @param{number} scalingFactor represents the scaling factor of tool tip
 * @param{number} originalWidth width of toolTip before scaling
 * @param{number} originalHeight height of toolTip before being scaled
 * @author: Gemma Martini
 */
function focusItemCallback(toolTip, finalLeft, finalTop, scalingFactor,
                           originalWidth, originalHeight) {
  // Called when it's the last iteration
  var animatedItemRect =
      document.getElementById("backgroundDiv").getBoundingClientRect();
  var finalWidth = animatedItemRect.width;
  var finalHeight = animatedItemRect.height;
  // Finding real allignment from left and top
  var finalLeft = animatedItemRect.left + window.pageXOffset;
  var finalTop = animatedItemRect.top + window.pageYOffset;
  // Finding center for toolTip
  if (curr == tutTable.length - 1) {
    // Last step of tutorial
    var x = finalLeft + finalWidth - (toolTipWidth() / 2);
    var y = finalTop - (toolTipHeight() / 2);
  } else {
    // If node isn't the last element of the tutorial
    holeEl = tutTable[curr + 1].myNode;
    var nextRect = holeEl.getBoundingClientRect();
    var nRl = nextRect.left + window.pageXOffset;
    var nRt = nextRect.left + window.pageYOffset;
    // Classifying relative position using quadrants around center of
    // zoomedEl
    // Quadrant 2 & quadrant 3
    if ((nRl + nextRect.width / 2 <= (finalLeft + finalWidth / 2))) {
      x = finalLeft + (toolTipWidth() / 2);
      y = finalTop + finalHeight + (toolTipHeight() / 2);
    }
    // Quadrant 1 & quadrant 4
    if ((nRl + nextRect.width / 2 > (finalLeft + finalWidth / 2))) {
      x = finalLeft + finalWidth - (toolTipWidth() / 2);
      y = finalTop + finalHeight + (toolTipHeight() / 2);
    }
    var value = toolTipWidth() / 2 + itemFrameRatio * window.innerWidth;

    while (x - value < window.pageXOffset) {
      x++;
    }
  }
  //  (x - toolTipWidth() / 2 - itemFrameRatio * window.offsetWidth));
  createToolTip(x, y);
}

/**
 * This is the callback if we are inside createToolTip
 *
 * @param {HTMLelement} toolTip element that represents the tool tip -- NULL
 * HERE
 * @param {number} finalLeft final left padding of toolTip when it wasn't scaled
 * yet
 * @param {number} finalTop final top padding of toolTip when it wasn't scaled
 * yet
 * @param {number} scalingFactor represents the scaling factor of tool tip
 * @param {number} originalWidth width of toolTip before scaling
 * @param {number} originalHeight height of toolTip before being scaled
 *
 * @author: Gemma Martini
 */
function createToolTipCallback(toolTip, finalLeft, finalTop, scalingFactor,
                               originalWidth, originalHeight) {
  // Called when it's the last iteration
  var finalWidth = originalWidth * scalingFactor;
  var finalHeight = originalHeight * scalingFactor;
  if (curr != tutTable.length - 1) {
    // If it's not the last step of tutorial
    holeEl = tutTable[curr + 1].myNode;
    drawArrow(toolTip, holeEl, tutTable[curr + 1].fromWhere);
    // Keeping light holeEl
    var holeRect = holeEl.getBoundingClientRect();
    var hRl = holeRect.left + window.pageXOffset;
    var hRt = holeRect.top + window.pageYOffset;
    var hRw = holeRect.width;
    var hRh = holeRect.height;
    var newHole = holeEl.cloneNode(true);
    synchronizeCssStyles(holeEl, newHole, true);
    newHole.id = "newHole";
    var holeBorderRadius = window.getComputedStyle(holeEl, null)
                               .getPropertyValue("border-top-left-radius");
    var holeBackground = createBackground(hRl, hRt, hRw, hRh,
                                          tutTable[curr + 1].myBackgroundColor,
                                          parseInt(holeBorderRadius), false);
    holeBackground.appendChild(newHole);
    holeBackground.className = "hole";
    holeBackground.id = "holeBackground";

    // Setting functionality to that part of the window
    var clickDiv = createDiv(hRl, hRt, hRw, hRh, "transparent", 0);
    clickDiv.id = "clickDiv";
    clickDiv.className = "superHighLayer";
    clickDiv.onclick = function() {
      closeStep();
      curr++;
      contItem = 1;
      contToolTip = 1;
      tutStep();
    };
  }
}

/**
 * This scrolls into view only when it's needed
 * param {HTMLelement} el element to be into view
 *
 * @author: Gemma Martini
 */
function scrollIntoViewIfNeeded(el) {
  var myRect = el.getBoundingClientRect();
  if ((myRect.top < 0) || (myRect.left < 0) ||
      (myRect.top + myRect.height > window.innerHeight) ||
      (myRect.left + myRect.width > window.innerWidth))
    el.scrollIntoView();
}
/**
 * This function isn't a creation of the author, but it can be found on this
 * link https://css-tricks.com/snippets/javascript/lighten-darken-color/
 */
function LightenDarkenColor(col, amt) {
  var usePound = false;
  if (col[0] == "#") {
    col = col.slice(1);
    usePound = true;
  }
  var num = parseInt(col, 16);
  var r = (num >> 16) + amt;
  if (r > 255)
    r = 255;
  else if (r < 0)
    r = 0;
  var b = ((num >> 8) & 0x00FF) + amt;
  if (b > 255)
    b = 255;
  else if (b < 0)
    b = 0;
  var g = (num & 0x0000FF) + amt;
  if (g > 255)
    g = 255;
  else if (g < 0)
    g = 0;
  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}
/*
 * This function translates color from rgb to hex. It's been copied from stack
 * overflow
 * https://stackoverflow.com/questions/1740700/how-to-get-hex-color-value-rather-than-rgb-value
 *
 */
function rgb2hex(rgb) {
  if (/^#[0-9A-F]{6}$/i.test(rgb))
    return rgb;

  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  function hex(x) { return ("0" + parseInt(x).toString(16)).slice(-2); }
  return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

/**
 * Draws a trapezoid from the element in the page and the zoomed one
 * @param {HTMLelement} fromEl element the trapezoid starts from
 * @param {HTMLelement} toEl element the trapezoid goes to
 *
 * @author: Gemma Martini
 */
function drawTrapezoid(fromEl, toEl) {
  var previousTrapezoid = document.getElementById("trapezoids");
  if (previousTrapezoid != null)
    previousTrapezoid.remove();
  var xA, yA, xB, yB, xC, yC, xD, yD, xE, yE, xF, yF;
  var fromRect = fromEl.getBoundingClientRect();
  var toRect = toEl.getBoundingClientRect();
  yA = fromRect.top + window.pageYOffset;
  xA = fromRect.left + window.pageXOffset;
  xD = xA + fromRect.width;
  yD = yA;
  xB = toRect.left + window.pageXOffset;
  yB = toRect.top + window.pageYOffset;
  xC = xB + toRect.width;
  yC = yB;
  xF = xC;
  yF = yC + toRect.height;
  var xH = xB;
  var yH = yF;
  xE = xD;
  yE = yD + fromRect.height;
  var xG = xA;
  var yG = yE;
  var radiusTo = parseInt(window.getComputedStyle(toEl, null)
                              .getPropertyValue("border-top-left-radius"));
  if (radiusTo != null) {
    var scalingF =
        window.getComputedStyle(toEl, null).getPropertyValue("transform");
    var delta = (1 - Math.sqrt(2) / 2) * radiusTo * toEl.currScaling;
    xB = xB + delta;
    yB = yB + delta;
    xC = xB + toRect.width - 2 * delta;
    yC = yB;
    xF = xC;
    yF = yC + toRect.height - 2 * delta;
    xH = xB;
    yH = yF;
  }
  var radiusFrom = parseInt(window.getComputedStyle(fromEl, null)
                                .getPropertyValue("border-top-left-radius"));
  if (radiusFrom != null) {
    var delta2 = (1 - Math.sqrt(2) / 2) * radiusFrom;
    xA = xA + delta2;
    yA = yA + delta2;
    xD = xA + fromRect.width - 2 * delta2;
    yD = yA;
    xE = xD;
    yE = yD + fromRect.height - 2 * delta2;
    xG = xA;
    yG = yE;
  }
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  var svgNS = svg.namespaceURI;
  svg.setAttribute('height',
                   document.body.getBoundingClientRect().height + "px");
  svg.setAttribute('width', document.body.getBoundingClientRect().width + "px");
  svg.setAttribute('style', 'position:absolute;top:0;left:0');
  svg.setAttribute('class', "middleLayer");
  svg.setAttribute('opacity', '0.5');
  svg.id = "trapezoids";
  var path1 = document.createElementNS(svgNS, 'path');
  var path2 = document.createElementNS(svgNS, 'path');
  var fromX, fromY, toX, toY;
  fromX = fromRect.left + window.pageXOffset + fromRect.width / 2;
  fromY = fromRect.top + window.pageYOffset + fromRect.height / 2;
  toX = toRect.left + window.pageXOffset + toRect.width / 2;
  toY = toRect.top + window.pageYOffset + toRect.height / 2;
  // Q1
  if (toX >= fromX && toY <= fromY) {
    path1.setAttribute('d', 'M ' + xA + ' ' + yA + ' L ' + xB + ' ' + yB +
                                ' L ' + xH + ' ' + yH + ' L ' + xG + ' ' + yG +
                                'Z');
    path2.setAttribute('d', 'M ' + xG + ' ' + yG + ' L ' + xH + ' ' + yH +
                                ' L ' + xF + ' ' + yF + ' L ' + xE + ' ' + yE +
                                'Z');
  }
  // Q2
  if (toX < fromX && toY < fromY) {
    path1.setAttribute('d', 'M ' + xG + ' ' + yG + ' L ' + xH + ' ' + yH +
                                ' L ' + xF + ' ' + yF + ' L ' + xE + ' ' + yE +
                                'Z');
    path2.setAttribute('d', 'M ' + xE + ' ' + yE + ' L ' + xF + ' ' + yF +
                                ' L ' + xC + ' ' + yC + ' L ' + xD + ' ' + yD +
                                'Z');
  }
  // Q3
  if (toX <= fromX && toY >= fromY) {
    path1.setAttribute('d', 'M ' + xB + ' ' + yB + ' L ' + xA + ' ' + yA +
                                ' L ' + xD + ' ' + yD + ' L ' + xC + ' ' + yC +
                                'Z');
    path2.setAttribute('d', 'M ' + xC + ' ' + yC + ' L ' + xD + ' ' + yD +
                                ' L ' + xE + ' ' + yE + ' L ' + xF + ' ' + yF +
                                'Z');
  }

  // Q4
  if (toX > fromX && toY > fromY) {
    path1.setAttribute('d', 'M ' + xG + ' ' + yG + ' L ' + xH + ' ' + yH +
                                ' L ' + xB + ' ' + yB + ' L ' + xA + ' ' + yA +
                                'Z');
    path2.setAttribute('d', 'M ' + xA + ' ' + yA + ' L ' + xB + ' ' + yB +
                                ' L ' + xC + ' ' + yC + ' L ' + xD + ' ' + yD +
                                'Z');
  }
  var color, colorWeaker1, colorWeaker2;
  var style = (window.getComputedStyle(fromEl, null)
                   .getPropertyValue("background-color"));
  if (style != 'rgba(0, 0, 0, 0)') {
    color = rgb2hex(style);
  } else
    color = tutTable[curr].myBackgroundColor;
  colorWeaker1 = LightenDarkenColor(color, 40);
  colorWeaker2 = LightenDarkenColor(color, 60);
  if (color === "#ffffff")
    color = "#f2f2f2";
  path1.setAttribute('fill', colorWeaker1);
  path1.setAttribute('stroke', color);
  path1.setAttribute('stroke-width', "2");
  path1.id = "path1";
  svg.appendChild(path1);
  path2.setAttribute('fill', colorWeaker2);
  path2.setAttribute('stroke', color);
  path2.setAttribute('stroke-width', "1");
  path2.id = "path2";
  svg.appendChild(path2);
  /* // debugging points
   //<!-- Mark relevant points -->
   svg.setAttribute('class', "superHighLayer");
   var g = document.createElementNS(svgNS, 'g');
   g.setAttribute('stroke', 'black');
   g.setAttribute('stoke-width', "4");
   g.setAttribute('fill', "black");
   svg.appendChild(g);
   var pointA = document.createElementNS(svgNS, 'circle');
   pointA.setAttribute('cx', xA);
   pointA.setAttribute('cy', yA);
   pointA.setAttribute('r', "3");
   g.appendChild(pointA);
   var pointB = document.createElementNS(svgNS, 'circle');
   pointB.setAttribute('cx', xB);
   pointB.setAttribute('cy', yB);
   pointB.setAttribute('r', "3");
   g.appendChild(pointB);
   var pointC = document.createElementNS(svgNS, 'circle');
   pointC.setAttribute('cx', xC);
   pointC.setAttribute('cy', yC);
   pointC.setAttribute('r', "3");
   g.appendChild(pointC);
   var pointD = document.createElementNS(svgNS, 'circle');
   pointD.setAttribute('cx', xD);
   pointD.setAttribute('cy', yD);
   pointD.setAttribute('r', "3");
   g.appendChild(pointD);
   var pointE = document.createElementNS(svgNS, 'circle');
   pointE.setAttribute('cx', xE);
   pointE.setAttribute('cy', yE);
   pointE.setAttribute('r', "3");
   g.appendChild(pointE);
   var pointF = document.createElementNS(svgNS, 'circle');
   pointF.setAttribute('cx', xF);
   pointF.setAttribute('cy', yF);
   pointF.setAttribute('r', "3");
   g.appendChild(pointF);
   var pointG = document.createElementNS(svgNS, 'circle');
   pointG.setAttribute('cx', xG);
   pointG.setAttribute('cy', yG);
   pointG.setAttribute('r', "3");
   g.appendChild(pointG);
   var pointH = document.createElementNS(svgNS, 'circle');
   pointH.setAttribute('cx', xH);
   pointH.setAttribute('cy', yH);
   pointH.setAttribute('r', "3");
   g.appendChild(pointH);
  */
  document.body.appendChild(svg);
}
/**
 * This is the animation that makes the selected item to move and scale
 * increasingly till reaching the desired position and dimension. At the end
 * of the animation it adds an arrow from the animatingEl if it's a tool tip to
 * the next element of the tutorial, if it exists, and makes holeEli light
 * @param {function} currCallback which is the function to be called at the
 * end of the animation
 * @param {HTMLelement} animatingEl which is the element to be animated
 * @param {number} finalLeft final position of node from left when it's not
 * scaled yet
 * @param {number} finalTop final position of node from top when it's not
 * scaled yet
 * @param {number} scalingFactor how much the node should be scaled at the end
 * @param {number} frameRate how much time should pass between a
 * transformation and the next one
 * @param {number} numberOfTransformations number of steps the transformation
 * should be made of
 * param {number} shrinkingFactor represents how much the node should be
 * shrank before being scaled
 *
 * @author: Gemma Martini
 */
function animatedZoom(currCallback, animatingEl, finalLeft, finalTop,
                      scalingFactor, frameRate, numberOfTransformations,
                      shrinkingFactor) {
  var node = animatingEl;
  rect = node.getBoundingClientRect();
  var originalTop = rect.top + window.pageYOffset;
  var originalLeft = rect.left + window.pageXOffset;
  var originalWidth = rect.width;
  var originalHeight = rect.height;
  var scaling =
      (Math.pow(scalingFactor * shrinkingFactor, 1 / numberOfTransformations));
  var translatingX = (finalLeft - originalLeft) / numberOfTransformations;
  var translatingY = (finalTop - originalTop) / numberOfTransformations;
  id = setInterval(frame, frameRate);
  function frame() {
    if (shrinkingFactor == 1) {
      nowScaling = Math.pow(scaling, contItem) / shrinkingFactor;
      nowTranslatingX = translatingX * contItem;
      nowTranslatingY = translatingY * contItem;

      scaleAndTranslate(node, nowScaling, nowTranslatingX, nowTranslatingY);
      scrollIntoViewIfNeeded(node);
      if ((tutTable[curr].myNode != null) &&
          ((contItem % 2 == 0) || (contItem == numberOfTransformations))) {
        document.getElementById("backgroundDiv").currScaling =
            Math.pow(scaling, contItem);
        drawTrapezoid(document.getElementById("currHoleBackground"),
                      document.getElementById("backgroundDiv"));
      }
      if (contItem == numberOfTransformations) {
        if (shrinkingFactor == 1)
          currZoomedItem = animatingEl;
        clearInterval(id);
        currCallback(animatingEl, finalLeft, finalTop, scalingFactor,
                     originalWidth, originalHeight);
      } else
        contItem++;
    } else {
      nowScaling = Math.pow(scaling, contToolTip) / shrinkingFactor;
      nowTranslatingX = translatingX * contToolTip;
      nowTranslatingY = translatingY * contToolTip;
      scaleAndTranslate(node, nowScaling, nowTranslatingX, nowTranslatingY);
      if (contToolTip == numberOfTransformations) {
        if (shrinkingFactor == 1)
          currZoomedItem = animatingEl;
        clearInterval(id);
        currCallback(animatingEl, finalLeft, finalTop, scalingFactor,
                     originalWidth, originalHeight);
      } else
        contToolTip++;
    }
  }
  frame();
}

/**
 *  (1) Scrolls the page to focus on el
 *  (2) Clones el
 *  (3) Puts under it a matt div in order to preserve its color
 *  (4) Zooms it to the desired position (which is chose as the diagonal
 * opposite of the next element of the tutorial)
 *  (5) Begins the animation
 *
 * @author: Gemma Martini
 *
 * @param {HTMLelement} el element that has to be focused
 */
function focusItem(el) {
  // Scrolling to center vertically
  scrollIntoViewIfNeeded(el);
  var copyEl = el.cloneNode(true);
  synchronizeCssStyles(el, copyEl, true);
  copyEl.id = "copyEl";
  var rect = el.getBoundingClientRect();
  // leftEl is the position of the element and his copy from left
  var leftEl = rect.left + window.pageXOffset;
  // topEl is the position of the element and his copy from top
  var topEl = rect.top + window.pageYOffset;
  var widthEl = el.offsetWidth;
  var heightEl = el.offsetHeight;
  // Keeping the colour of element inserting background div
  var backColor = tutTable[curr].myBackgroundColor;
  var backgroundDiv = createBackground(leftEl, topEl, widthEl, heightEl,
                                       backColor, 2 * backgroundFrame, true);
  backgroundDiv.id = "backgroundDiv";
  backgroundDiv.className = "veryHighLayer";
  var lighterColor = LightenDarkenColor(backColor, 30);
  dontClickDiv = createBackground(backgroundFrame, backgroundFrame, widthEl,
                                  heightEl, "white", 0, false);
  dontClickDiv.setAttribute('style',
                            dontClickDiv.getAttribute('style') + " opacity:0");
  dontClickDiv.className = "superHighLayer";
  backgroundDiv.appendChild(copyEl);
  backgroundDiv.appendChild(dontClickDiv);
  backgroundDiv.style.padding = backgroundFrame + "px";
  var divRect = backgroundDiv.getBoundingClientRect();
  var x = window.innerWidth / 2 + window.pageXOffset;
  var y = window.innerHeight / 2 + window.pageYOffset;
  //(x,y) is the center of the window
  if (curr != tutTable.length - 1) {
    // In order not to cover the next element of the tutorial there are many
    // cases to take into consideration
    var nextEl = tutTable[curr + 1].myNode;
    var nextElRect = nextEl.getBoundingClientRect();
    var finalTop, finalLeft, ratioX, ratioY;
    if (((nextElRect.left + nextElRect.width / 2) <
         window.pageXOffset + window.innerWidth) &&
        ((nextElRect.top + nextElRect.height / 2) <
         window.pageYOffset + window.innerHeight)) {
      // NextEl is inside current window -> 4 cases (relatively to currentEl the
      // one whose attributes are in divRect) The element has a frame around
      // itself
      ratioX = ((1 - itemFrameRatio) * window.innerWidth / 2) / (divRect.width);
      ratioY =
          ((1 - itemFrameRatio) * window.innerHeight / 2) / (divRect.height);
      if (ratioX <= ratioY)
        mulFactor = ratioX;
      else
        mulFactor = ratioY;
      if (mulFactor > maxMulFactor)
        mulFactor = maxMulFactor;
      var currentX = divRect.left + divRect.width / 2;
      var currentY = divRect.top + divRect.height / 2;
      // Quadrant 1 -> go bottom-left
      if (((nextElRect.left + nextElRect.width / 2) >= currentX) &&
          ((nextElRect.top + nextElRect.height / 2) <= currentY)) {
        finalLeft = window.pageXOffset + itemFrameRatio * window.innerWidth +
                    divRect.width / 2 * mulFactor - divRect.width / 2;
        finalTop = (1 - itemFrameRatio) * window.innerHeight +
                   window.pageYOffset - toolTipHeight() -
                   (divRect.height * mulFactor / 2) - divRect.height / 2;
      }
      // Quadrant 2 -> go bottom-right
      if ((nextElRect.left + nextElRect.width / 2 < currentX) &&
          ((nextElRect.top + nextElRect.height / 2) < currentY)) {
        finalLeft = (1 - itemFrameRatio) * window.innerWidth +
                    window.pageXOffset - (divRect.width * mulFactor / 2) -
                    divRect.width / 2;
        finalTop = (1 - itemFrameRatio) * window.innerHeight +
                   window.pageYOffset - toolTipHeight() -
                   (divRect.height * mulFactor / 2) - divRect.height / 2;
      }
      // Quadrant 3 -> go top-right
      if ((nextElRect.left + nextElRect.width / 2 <= currentX) &&
          ((nextElRect.top + nextElRect.height / 2) >= currentY)) {
        finalLeft = (1 - itemFrameRatio) * window.innerWidth +
                    window.pageXOffset - (divRect.width * mulFactor / 2) -
                    divRect.width / 2;
        finalTop = window.pageYOffset +
                   itemFrameRatio * window.innerHeight / 2 +
                   divRect.height * mulFactor / 2 - divRect.height / 2;
      } // Quadrant 4 -> go top-left
      if ((nextElRect.left + nextElRect.width / 2 > currentX) &&
          ((nextElRect.top + nextElRect.height / 2) > currentY)) {
        // Since scaleAndTranslate translates first it's necessary to find out
        // the left allingment that doesn't become negative when the element is
        // scaled
        finalLeft = window.pageXOffset + itemFrameRatio * window.innerWidth +
                    divRect.width / 2 * mulFactor - divRect.width / 2;
        finalTop = window.pageYOffset +
                   itemFrameRatio * window.innerHeight / 2 +
                   divRect.height * mulFactor / 2 - divRect.height / 2;
      }
    }
    // NextEl is outside from current window
    else {
      // The element has a frame around itself
      ratioX = ((1 - itemFrameRatio) * window.innerWidth) / (divRect.width);
      ratioY = ((1 - itemFrameRatio) * window.innerHeight) / (divRect.height);
      if (ratioX <= ratioY)
        mulFactor = ratioX;
      else
        mulFactor = ratioY;
      if (mulFactor > maxMulFactor)
        mulFactor = maxMulFactor;
      finalTop = y - (divRect.height / 2);
      finalLeft = x - divRect.width / 2;
      if ((finalTop + divRect.height / 2 + (divRect.height / 2) * mulFactor +
           toolTipHeight()) >
          (window.innerHeight * (1 - itemFrameRatio) + window.pageYOffset))
        // If there's not enough room for the tool tip
        finalTop = window.innerHeight * (1 - itemFrameRatio) +
                   window.pageYOffset - toolTipHeight() -
                   (divRect.height * maxMulFactor / 2) - divRect.height / 2;
    }
  } else {
    // The element is the last element
    // The element has a frame around itself
    ratioX = ((1 - itemFrameRatio) * window.innerWidth) / (divRect.width);
    ratioY = ((1 - itemFrameRatio) * window.innerHeight) / (divRect.height);
    if (ratioX <= ratioY)
      mulFactor = ratioX;
    else
      mulFactor = ratioY;
    if (mulFactor > maxMulFactor)
      mulFactor = maxMulFactor;
    finalTop = y - (divRect.height / 2);
    finalLeft = x - divRect.width / 2;
    if (finalTop + divRect.height / 2 - (divRect.height / 2) * mulFactor -
            toolTipHeight() <
        window.pageYOffset + itemFrameRatio * window.innerHeight)
      // If there's not enough room for the tool tip (which is on top this time)
      finalTop = window.pageYOffset + itemFrameRatio * window.innerHeight +
                 toolTipHeight() + (divRect.height * maxMulFactor / 2) -
                 divRect.height / 2;
  }
  // Keeping visible the current element of the tutorial, if it exists
  if (curr != 0) {
    var currHoleRect = tutTable[curr].myNode.getBoundingClientRect();
    var newCurrHole = tutTable[curr].myNode.cloneNode(true);
    synchronizeCssStyles(tutTable[curr].myNode, newCurrHole, true);
    newCurrHole.id = "newCurrHole";
    var holeBorderRadius = window.getComputedStyle(tutTable[curr].myNode, null)
                               .getPropertyValue("border-top-left-radius");
    var currHoleBackground = createBackground(
        currHoleRect.left + window.pageXOffset,
        currHoleRect.top + window.pageYOffset, currHoleRect.width,
        currHoleRect.height, tutTable[curr].myBackgroundColor,
        parseInt(holeBorderRadius), false);
    currHoleBackground.appendChild(newCurrHole);
    currHoleBackground.className = "hole";
    currHoleBackground.id = "currHoleBackground";
    currHoleBackground.className = "bottomLayer";
  }

  animatedZoom(focusItemCallback, backgroundDiv, finalLeft, finalTop, mulFactor,
               intervalOfTimer, numberOfIterations, 1);
}

/**
 * Creates a tool tip div in the given position with the given text in it. The
 * div gets shrunk and the it is scaled gradually using animatedZoom
 *
 * @author: Gemma Martini
 *
 * @param {number} x is the x-coordinate of the center of the tooltip
 * @param {number} y is the y-coordinate of the center of the tooltip
 */
function createToolTip(x, y) {
  // Creating new div in (x,y)
  var color2 = tutTable[curr].myBackgroundColor2;
  var text = tutTable[curr].myDescription;
  var backgroundDiv =
      createDiv(x - toolTipWidth() / 2, y - toolTipHeight() / 2, toolTipWidth(),
                toolTipHeight(), color2, toolTipWidth());
  backgroundDiv.className = "tTip";
  var textDiv = document.createElement("div");
  textDiv.id = "toolTipTextDiv";
  backgroundDiv.id = "toolTipDiv";
  backgroundDiv.className = "superHighLayer";
  textDiv.innerHTML += text;
  textDiv.className += " textTip";
  var closeTip = document.createElement("a");
  closeTip.className = "closeTip";
  closeTip.innerHTML += '×';
  closeTip.id = "closeTip";
  closeTip.onclick = function() {
    closeStep();
    callback();
  };
  backgroundDiv.appendChild(textDiv);
  backgroundDiv.appendChild(closeTip);
  textDiv.style.fontSize = "30px";
  closeTip.style.fontSize = "35px";
  closeTip.style.position = "fixed";
  closeTip.style.left =
      5 / 8 * backgroundDiv.getBoundingClientRect().width + "px";
  closeTip.style.top =
      1 / 15 * backgroundDiv.getBoundingClientRect().height + "px";
  while (textDiv.getBoundingClientRect().height +
             closeTip.getBoundingClientRect().height >
         backgroundDiv.getBoundingClientRect().height) {
    textDiv.style.fontSize = parseInt(textDiv.style.fontSize) - 1 + "px";
    closeTip.style.fontSize = parseInt(closeTip.style.fontSize) - 1 + "px";
  }
  // The div is shrank in order to animate scaling later
  var shrinkingFactor = 50;
  // The backgroundDiv should be positioned centered in (x,y)
  var finalLeft = x - (toolTipWidth() / 2);
  var finalTop = y - (toolTipHeight() / 2);
  // Begin animation that will zoom backgroundDiv
  animatedZoom(createToolTipCallback, backgroundDiv, finalLeft, finalTop, 1,
               intervalOfTimer, numberOfIterations, shrinkingFactor);
}

/**
 * Closes a step of the tutorial
 *
 * @author: Gemma Martini
 */
function closeStep() {
  clearInterval(id);
  for (var i = 0; i < ids.length; i++) {
    var el = document.getElementById(ids[i]);
    if (el)
      el.remove();
  }
}

/**
 * (1) Shades the page
 * (2) if it's the first step creates toolTip in the center of the page
 * (3) otherwise it focuses the current element
 *
 * @author: Gemma Martini
 *
 */
function tutStep() {
  // Shading the page
  shadePage();
  var el = tutTable[curr].myNode;
  var x, y;
  if (curr == 0) {
    // First step of tutorial -> only show initial tool tip
    x = window.innerWidth / 2 + window.pageXOffset;
    y = window.innerHeight / 2 + window.pageYOffset;
    //(x,y) is the center of the window
    createToolTip(x, y);
  } else {
    focusItem(el);
  }
  // The other elements are created inside animatedZoom
}

/**
 * creates a tutorial out of the given array
 *
 * @author: Gemma Martini
 *
 * @param {array} tutorialTable
 * @param {function} doneCallback function to call when pressed "x"
 *
 */
function tutGem(tutorialTable, doneCallback) {
  window.onresize = function(event) {
    closeStep();
    tutStep();
  };
  tutTable = tutorialTable;
  callback = doneCallback;
  curr = 0;
  contItem = 1;
  contToolTip = 1;
  tutStep();
}
