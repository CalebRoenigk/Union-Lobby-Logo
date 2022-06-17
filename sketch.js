var mgr;
let maskEditor;
let effectImg;
// let patternElements = [];

function preload() {
  effectImg = loadImage('assets/img/animation.gif');
}

function setup() {
  mgr = new SceneManager();
  createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);

  // Preload scenes. Preloading is normally optional
  // ... but needed if showNextScene() is used.
  mgr.addScene(Logo_Clock); // Need to add Dynamic Colors
  mgr.addScene(Logo_Strings); // Need to add Dynamic Colors
  mgr.addScene(Logo_Quilt); // Need to add Dynamic Colors, Random Seed
  mgr.addScene(Logo_Rope); // Need to add Dynamic Colors
  mgr.addScene(Logo_Block);
  // mgr.addScene ( Logo_Link ); // Disabled until rendering time bug can be fixed Need to add Dynamic Colors
  mgr.addScene(Logo_Radiant); // Need to add Dynamic Colors
  mgr.addScene(Logo_Scales); // Need to add Dynamic Colors
  mgr.addScene(Logo_Trains); // Need to add Dynamic Colors
  mgr.addScene(Logo_Holographic);
  mgr.addScene(Logo_Swirl); // Need to add Dynamic Colors
  mgr.addScene(Logo_LCD); // Need to add Dynamic Colors
  mgr.addScene(Logo_Topography); // Need to add Dynamic Colors
  mgr.addScene(Logo_Particles); // Need to add Dynamic Colors
  // mgr.addScene ( Logo_Cracks ); // Disabled until dependancy bug can be fixed Need to add Dynamic Colors
  // mgr.addScene ( Logo_Collapse ); // Disabled until rendering bug can be fixed Need to add Dynamic Colors
  mgr.addScene(Logo_Type); // Need to add Dynamic Colors
  mgr.addScene(Logo_Zigxel); // Need to add Dynamic Colors
  mgr.addScene(Logo_Diagram); // Need to add Dynamic Colors

  mgr.showNextScene();
  maskEditor = new MaskEditor();
}

function draw() {
  mgr.draw();
  maskEditor.drawMask();
  
  // if (keyIsDown(LEFT_ARROW) && maskEditor.configureMode == true) {
  //   maskEditor.printMaskPoints();
  // }
  // if (keyIsDown(RIGHT_ARROW)) {
  //   maskEditor.configureMode = !maskEditor.configureMode;
  // }
}

function mousePressed() {
  mgr.handleEvent("mousePressed");
}

function keyPressed() {
  // You can optionaly handle the key press at global level...
  switch (key) {
    case "1":
      mgr.showScene(Logo_Quilt);
      break;
    case "2":
      mgr.showScene(Logo_Rope);
      break;
    case "3":
      mgr.showScene(Logo_Block);
      break;
    case "4":
      mgr.showScene(Logo_Strings);
      break;
    case "5":
      mgr.showScene(Logo_Radiant);
      break;
    case "6":
      mgr.showScene(Logo_Scales);
      break;
    case "7":
      mgr.showScene(Logo_Trains);
      break;
    case "8":
      mgr.showScene(Logo_Link);
      break;
    case "9":
      mgr.showScene(Logo_Holographic);
      break;
    case "0":
      mgr.showScene(Logo_Swirl);
      break;
  }

  // ... then dispatch via the SceneManager.
  mgr.handleEvent("keyPressed");
}

// =============================================================
// =                         BEGIN MASK EDITOR                 =
// =============================================================

class MaskEditor {
  constructor() {
    this.configureMode = false;

    this.masks = [];

    this.handleSize = 12;

    this.generateMaskPoints();
  }

  generateMaskPoints() {
    this.masks.push(
      new Mask(createVector(width / 2, height), createVector(0, 0), [
        new MaskPoint(0, createVector(60, 37), "vertex"),
        new MaskPoint(1, createVector(71, 559), "vertex"),
        new MaskPoint(2,createVector(107, 767),"quadratic",createVector(71, 559)),
        new MaskPoint(3,createVector(107, 767),"quadratic",createVector(326, 782)),
        new MaskPoint(4, createVector(326, 782), "vertex"),
        new MaskPoint(5, createVector(319, 33), "vertex"),
      ])
    );

    this.masks.push(
      new Mask(createVector(width / 2, height), createVector(width / 2, 0), [
        new MaskPoint(0, createVector(491, 25), "vertex"),
        new MaskPoint(1, createVector(492, 777), "vertex"),
        new MaskPoint(2, createVector(742, 770), "vertex"),
        new MaskPoint(3, createVector(745, 24), "vertex"),
      ])
    );

    this.linkEditor();

    for (let m = 0; m < this.masks.length; m++) {
      this.masks[m].linkMask();
    }
  }

  printMaskPoints() {
    let mask = [];
    for (let m = 0; m < this.masks.length; m++) {
      let maskObject = this.masks[m].getMask();
      mask.push(maskObject);
    }

    print(JSON.stringify(mask));
  }

  drawMask() {
    this.checkInteraction();

    for (let s = 0; s < this.masks.length; s++) {
      this.masks[s].drawMask();
    }

    if (this.configureMode) {
      this.drawHandles();
    }
  }

  drawHandles() {
    for (let s = 0; s < this.masks.length; s++) {
      this.masks[s].renderHandles();
    }
  }

  checkInteraction() {
    let mousePosition = createVector(mouseX, mouseY);

    // Iterate over all interaction points
    for (let s = 0; s < this.masks.length; s++) {
      this.masks[s].checkInteraction(mousePosition);
    }
  }

  linkEditor() {
    for (let m = 0; m < this.masks.length; m++) {
      this.masks[m].editor = this;
    }
  }
}

class Mask {
  constructor(size, position, cutout) {
    this.editor = null;
    this.size = size;
    this.position = position;
    this.cutout = cutout;
    this.maskColor = color("black");

    this.pointDraggingIndex = -1;
  }

  getMask() {
    return {
      size: this.size.toString(),
      position: this.position.toString(),
      cutout: this.getPoints(),
    };
  }

  checkInteraction(mousePosition) {
    // Iterate over all interaction points
    for (let p = 0; p < this.cutout.length; p++) {
      this.cutout[p].checkInteraction(mousePosition);
    }
  }

  drawMask() {
    // Fill the mask with the mask color
    noStroke();
    fill(this.maskColor);
    if(this.editor.configureMode)
      {
        fill(color('red'));
      }

    // Create the base mask shape
    beginShape();
    vertex(this.position.x, this.position.y);
    vertex(this.position.x + this.size.x, this.position.y);
    vertex(this.position.x + this.size.x, this.position.y + this.size.y);
    vertex(this.position.x, this.position.y + this.size.y);

    // Iterate over the cutout points
    beginContour();
    for (let p = 0; p < this.cutout.length; p++) {
      let cutoutPoint = this.cutout[p];
      if (cutoutPoint.type == "vertex") {
        vertex(cutoutPoint.position.x, cutoutPoint.position.y);
      } else {
        quadraticVertex(
          cutoutPoint.position.x,
          cutoutPoint.position.y,
          cutoutPoint.control.x,
          cutoutPoint.control.y
        );
      }
    }
    endContour();
    endShape();
  }

  renderHandles() {
    for (let p = 0; p < this.cutout.length; p++) {
      let cutoutPoint = this.cutout[p];
      if (cutoutPoint.type == "vertex") {
        noFill();
        stroke(color("pink"));
        if (cutoutPoint.isDragging) {
          stroke(color("magenta"));
        }
        strokeWeight(this.editor.handleSize);

        point(cutoutPoint.position.x, cutoutPoint.position.y);

        noStroke();
        fill(color("white"));
        textSize(16);
        textAlign(LEFT);

        text(cutoutPoint.index, cutoutPoint.position.x, cutoutPoint.position.y);
      } else {
        noFill();
        stroke(color("yellow"));
        strokeWeight(1);

        line(
          cutoutPoint.position.x,
          cutoutPoint.position.y,
          cutoutPoint.control.x,
          cutoutPoint.control.y
        );

        noFill();
        stroke(color("pink"));
        if (cutoutPoint.isDragging) {
          stroke(color("magenta"));
        }
        strokeWeight(this.editor.handleSize);

        point(cutoutPoint.position.x, cutoutPoint.position.y);

        noFill();
        stroke(color("cyan"));
        if (cutoutPoint.isDraggingControl) {
          stroke(color("blue"));
        }
        strokeWeight(this.editor.handleSize);

        point(cutoutPoint.control.x, cutoutPoint.control.y);

        noStroke();
        fill(color("white"));
        textSize(16);
        textAlign(LEFT);

        text(cutoutPoint.index, cutoutPoint.position.x, cutoutPoint.position.y);

        noStroke();
        fill(color("white"));
        textSize(16);
        textAlign(LEFT);

        text(cutoutPoint.index, cutoutPoint.control.x, cutoutPoint.control.y);
      }
    }
  }

  linkMask() {
    for (let p = 0; p < this.cutout.length; p++) {
      this.cutout[p].mask = this;
    }
  }

  getPoints() {
    let points = [];
    for (let p = 0; p < this.cutout.length; p++) {
      points.push(this.cutout[p].getPoint());
    }

    return points;
  }
}

class MaskPoint {
  constructor(index, position, type, control) {
    this.index = index;
    this.position = position;
    this.control = control;
    if (control === undefined) {
      this.control = null;
    }
    this.type = type;
    this.isDragging = false;
    this.isDraggingControl = false;
    this.mask = null;
  }

  renderPoint() {
    let isHoveringControl = this.isMouseOnControlPoint(
      createVector(mouseX, mouseY),
      this.control
    );
    let isHoveringPoint = this.isMouseOnPoint(
      createVector(mouseX, mouseY),
      this.position
    );

    if (this.type == "vertex") {
      noFill();
      stroke(color("cyan"));
      if (isHoveringPoint) {
        stroke(color("magenta"));
      }
      strokeWeight(8);

      point(this.position.x, this.position.y);
    } else {
      noFill();
      stroke(color("yellow"));
      if (isHoveringPoint || isHoveringControl) {
        stroke(color("orange"));
      }
      strokeWeight(1);

      line(this.position.x, this.position.y, this.control.x, this.control.y);

      noFill();
      stroke(color("cyan"));
      if (isHoveringPoint) {
        stroke(color("magenta"));
      }
      strokeWeight(8);

      point(this.position.x, this.position.y);

      noFill();
      stroke(color("cyan"));
      if (isHoveringControl) {
        stroke(color("magenta"));
      }
      strokeWeight(8);

      point(this.control.x, this.control.y);
    }
  }

  checkInteraction(mousePosition, pointsDragging) {
    if (this.isDragging) {
      // The mouse is dragging this point
      // Move the point to where the mouse is
      this.position = mousePosition;
      if (!mouseIsPressed) {
        // The mouse has let go of the point
        // Drop the point where the mouse is
        this.isDragging = false;
        this.mask.pointDraggingIndex = -1;
      }
    }

    if (
      !this.isDragging &&
      mouseIsPressed &&
      this.isMouseOnPoint(mousePosition, this.position)
    ) {
      // The mouse is over the point
      // Check if the mouse is already dragging another point
      if (!pointsDragging) {
        // The mouse has picked up the point
        this.position = mousePosition;
        this.isDragging = true;
        this.mask.pointDraggingIndex = this.index;
      }
    }

    // Control
    if (this.control != null) {
      if (this.isDraggingControl) {
        // The mouse is dragging this point
        // Move the point to where the mouse is
        this.control = mousePosition;
        if (!mouseIsPressed) {
          // The mouse has let go of the point
          // Drop the point where the mouse is
          this.isDraggingControl = false;
          this.mask.pointDraggingIndex = -1;
        }
      }

      if (
        !this.isDraggingControl &&
        mouseIsPressed &&
        this.isMouseOnPoint(mousePosition, this.control)
      ) {
        // The mouse is over the point
        // Check if the mouse is already dragging another point
        if (!pointsDragging) {
          // The mouse has picked up the point
          this.control = mousePosition;
          this.isDraggingControl = true;
          this.mask.pointDraggingIndex = this.index;
        }
      }
    }
  }

  // Is the mouse on the point
  isMouseOnPoint(mousePosition, position) {
    if (
      dist(position.x, position.y, mousePosition.x, mousePosition.y) <=
      this.mask.editor.handleSize
    ) {
      return true;
    } else {
      return false;
    }
  }

  getPoint() {
    let control = null;
    if (this.control != null) {
      control = this.control.toString();
    }

    return {
      index: this.index,
      position: this.position.toString(),
      type: this.type,
      control: control,
    };
  }
}

// =============================================================
// =                         BEGIN SCENES                      =
// =============================================================

// Block Scene
function Logo_Block() {
  class BlockRenderer {
    constructor() {
      this.time = 0;

      this.rows = 6;

      this.rowPosition = [];
      this.rowWeight = [];
      this.rowFrequency = [];
      this.rowDashes = [];
      this.rowGradients = [];
      this.rowDashColors = [];
      this.rowGradientColors = [];
      this.rowDashTotalLength = [];

      this.rowDashMinMax = createVector(5, 9);
      this.rowGradientStopsMinMax = createVector(5, 9);
      this.dashLengthMinMax = createVector(width / 12, width / 3);
      this.noiseOffset = width * 2;
      this.noiseScale = 0.1;

      this.dashColors = [
        color("#fba809"),
        color("#8a7328"),
        color("#0b4727"),
        color("#fc93bb"),
        color("#fd2f0b"),
        color("#090909"),
        color("#a6b4b4"),
        color("#0657d0"),
        color("#ecf9f8"),
      ];

      this.generateRowHeights();
      this.generateRowDashes();
    }

    renderBlocks(time) {
      this.time = time;

      this.updateRowThickness();

      let weightTotal = 0;
      for (let r = 0; r < this.rows; r++) {
        let start = this.rowPosition[r];
        let end = createVector(width, start.y);

        this.renderRow(r, start, end);
      }
    }

    generateRowHeights() {
      for (let r = 0; r < this.rows; r++) {
        this.rowFrequency.push(random(4, 12));
      }
      this.updateRowThickness();
    }

    generateRowDashes() {
      // Iterate over the rows
      let rowDashsArray = [];
      let rowGradientsArray = [];
      let rowTotalLengthArray = [];
      let rowDashColorsArray = [];
      let rowGradientColorsArray = [];

      for (let r = 0; r < this.rows; r++) {
        let totalDashes = round(
          random(this.rowDashMinMax.x, this.rowDashMinMax.y)
        );
        let dashSet = [];
        let dashGradientSet = [];
        let dashColorSet = [];
        let dashGradientColorSet = [];
        // Create the dash set
        for (let d = 0; d < totalDashes; d++) {
          let dashLength = random(
            this.dashLengthMinMax.x,
            this.dashLengthMinMax.y
          );
          let dashGradient = 1 - random(0, 1) > 0.75;
          let dashColor = this.dashColors[
            round(random(0, this.dashColors.length - 1))
          ];

          let gradientStops = round(
            random(this.rowGradientStopsMinMax.x, this.rowGradientStopsMinMax.y)
          );
          let dashGradientColorStops = [];
          let remainingValue = 1;
          for (let s = 0; s < gradientStops; s++) {
            let stopPosition = Clamp(
              (round(
                Clamp(randomGaussian(0.5), 0.25, 1) *
                  (remainingValue / (gradientStops - s)) *
                  10
              ) /
                10) *
                1.25,
              0,
              1
            );
            let stop = new GradientStop(
              stopPosition,
              this.dashColors[round(random(0, this.dashColors.length - 1))]
            );

            dashGradientColorStops.push(stop);
            remainingValue -= stopPosition;
          }

          // Modify the stops to fit the gradient length
          if (
            dashGradientColorStops[dashGradientColorStops.length - 1].position <
            0.9
          ) {
            let maxStopPosition =
              dashGradientColorStops[dashGradientColorStops.length - 1]
                .position;
            for (let s = 0; s < dashGradientColorStops.length; s++) {
              if (dashGradientColorStops[s].position != 0) {
                dashGradientColorStops[s].position =
                  round(
                    map(
                      dashGradientColorStops[s].position,
                      0,
                      maxStopPosition,
                      0,
                      1,
                      true
                    ) * 10
                  ) / 10;
              }
            }
          }

          let gradient = new GradientRamp(dashGradientColorStops);

          dashSet.push(dashLength);
          dashSet.push(0);
          dashGradientSet.push(dashGradient);
          dashGradientSet.push(false);
          dashGradientColorSet.push(gradient);
          dashGradientColorSet.push(gradient);
          dashColorSet.push(dashColor);
          dashColorSet.push(dashColor);
        }

        rowDashsArray.push(dashSet);
        rowGradientsArray.push(dashGradientSet);

        let rowTotalLength = this.getTotalDashLength(dashSet);
        rowTotalLengthArray.push(rowTotalLength);

        rowDashColorsArray.push(dashColorSet);
        rowGradientColorsArray.push(dashGradientColorSet);
      }
      this.rowDashes = rowDashsArray;
      this.rowGradients = rowGradientsArray;
      this.rowDashTotalLength = rowTotalLengthArray;
      this.rowDashColors = rowDashColorsArray;
      this.rowGradientColors = rowGradientColorsArray;
    }

    updateRowThickness() {
      let rowAdditionArray = [];
      let rowWeightArray = [];
      let rowPositions = [];

      let weightTotal = 0;
      for (let r = 0; r < this.rows - 1; r++) {
        let rowAddition =
          (height / (this.rows - 1)) * r + height / (this.rows - 1) / 2;
        if (r % 2 == 0) {
          let rowBase = (height / (this.rows - 1)) * 0.25;
          rowAddition += SineWave(
            rowBase,
            this.rowFrequency[r] / 3,
            r,
            rowBase / 2,
            0.25,
            this.time
          );
        } else {
          let rowBase = (height / (this.rows - 1)) * 0.125;
          rowAddition += SineWave(
            rowBase,
            this.rowFrequency[r] / 2,
            r,
            rowBase / 2,
            0.35,
            this.time
          );
        }

        // Measure the weight of the row
        let weight = 0;
        if (r == 0) {
          weight = dist(0, 0, 0, rowAddition);
        } else {
          weight = dist(0, rowAdditionArray[r - 1], 0, rowAddition);
        }

        // Get the halfway point of the row
        let rowPosition = p5.Vector.lerp(
          createVector(0, weightTotal),
          createVector(0, weightTotal + weight),
          0.5
        );

        rowPositions.push(rowPosition);
        rowAdditionArray.push(rowAddition);
        rowWeightArray.push(weight);

        weightTotal += this.rowWeight[r];
      }

      this.rowWeight = rowWeightArray;
      this.rowPosition = rowPositions;

      this.rowWeight.push(
        createVector(0, height).dist(
          this.rowPosition[this.rowPosition.length - 1]
        )
      );
      this.rowPosition.push(
        p5.Vector.lerp(
          this.rowPosition[this.rowPosition.length - 1],
          createVector(0, height),
          0.75
        )
      );
    }

    getTotalDashLength(dashes) {
      let lengthTotal = 0;
      for (let d = 0; d < dashes.length; d++) {
        lengthTotal += dashes[d];
      }

      return lengthTotal;
    }

    renderRow(r, start, end) {
      let dashTotal = 0;
      let dashLength = this.rowDashTotalLength[r];

      for (let a = 0; a < this.rowDashes[r].length; ) {
        let dash = this.rowDashes[r][a];
        let gap = this.rowDashes[r][a + 1];
        let gradientFill = this.rowGradients[r][a];

        let dashRemaining = dashLength - (dashTotal + dash);
        let dashStyle = [0, dashTotal, dash, dashRemaining];

        let strokeColor = color("red");
        if (a % 4 == 0) {
          strokeColor = color("blue");
        }
        strokeColor = this.rowDashColors[r][a / 2];

        noFill();
        stroke(strokeColor);
        strokeWeight(this.rowWeight[r] + 2);
        strokeCap(SQUARE);
        drawingContext.setLineDash(dashStyle);

        let direction = 1;
        if (r % 2 == 0) {
          direction = -1;
        }
        let dashOffset = noise(r, r, this.time * this.noiseScale) * 2 - 1;
        let xOffset =
          SineWave(dashLength * 2, 0.375 + (r - 4) * 0.02, r, 0, 1, this.time) *
          direction *
          dashOffset;

        drawingContext.lineDashOffset = xOffset;

        if (gradientFill) {
          let gradient = drawingContext.createLinearGradient(
            0 + dashTotal - xOffset,
            height,
            0 + dashTotal + dash - xOffset,
            height
          );

          for (let s = 0; s < this.rowGradientColors[r][a].stops.length; s++) {
            gradient.addColorStop(
              this.rowGradientColors[r][a].stops[s].position,
              this.rowGradientColors[r][a].stops[s].stopColor
            );
          }

          drawingContext.strokeStyle = gradient;
        }

        line(start.x, start.y, end.x, end.y);

        dashTotal += dash;
        a += 2;
      }
    }
  }

  this.time = 0;
  this.blockRenderer = new BlockRenderer();

  this.setup = function () {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
  };

  this.draw = function () {
    background(220);
    this.time += deltaTime / 1000;
    this.blockRenderer.renderBlocks(this.time);
  };
}

// Rope Scene
function Logo_Rope() {
  class Stripe {
    constructor(x, sineWaves, gradientSineWave) {
      this.x = x;
      this.rows = 24;
      this.width = 175;
      this.height = height * 1.25;

      this.sineWaves = sineWaves;

      this.basePoints = [];
      this.displacedPoints = [];

      this.gradientStops = 5;
      this.gradient = [];
      this.gradientSineWave = gradientSineWave;

      this.time = 0;

      this.generateGradient();
      this.createBasePoints();
    }

    createBasePoints() {
      let center = createVector(this.x, height / 2);
      let rowHeight = this.height / this.rows;

      for (let p = 0; p < this.rows; p++) {
        let centerPoint = createVector(
          center.x,
          rowHeight * p + rowHeight / 2 - (this.height - height) / 2
        );

        this.basePoints.push(centerPoint);
      }
    }

    draw(time) {
      this.time = time;
      this.displaceCenterPoints();

      this.assembleStripeShape();
    }

    displaceCenterPoints() {
      this.displacedPoints = [];

      for (let s = 0; s < this.sineWaves.length; s++) {
        let thisWave = this.sineWaves[s];
        for (let p = 0; p < this.rows; p++) {
          let thisPoint = this.basePoints[p];

          if (s == 0) {
            this.displacedPoints.push(createVector(thisPoint.x, thisPoint.y));
          }

          let x = SineWave(
            thisWave.amplitude,
            thisWave.frequency,
            thisWave.phase + p,
            thisWave.verticalOffset,
            thisWave.speed,
            this.time
          );
          this.displacedPoints[p] = createVector(
            this.displacedPoints[p].x + x,
            this.displacedPoints[p].y
          );
        }
      }
    }

    assembleStripeShape() {
      let rowHeight = this.height / this.rows;

      beginShape();
      for (let d = 0; d < this.rows * 2; d++) {
        let xSide = 1;
        let pointIndex = d;
        if (pointIndex > this.rows - 1) {
          pointIndex = this.rows - ((d % this.rows) + 1);
        }
        if (d < this.rows - 1) {
          xSide = -1;
        }

        let centerPoint = this.displacedPoints[pointIndex];

        let pointA = createVector(
          centerPoint.x + (this.width / 2) * xSide,
          centerPoint.y + (rowHeight / 2) * xSide
        );
        let pointB = createVector(
          centerPoint.x + (this.width / 2) * xSide,
          centerPoint.y - (rowHeight / 2) * xSide
        );
        vertex(pointA.x, pointA.y);
        vertex(pointB.x, pointB.y);
      }

      // Create the gradient fill
      fill(color("red"));
      noStroke();
      this.fillGradient();

      endShape();
    }

    fillGradient() {
      let gradientTime = ((this.time * 400) % height) * 2;
      let gradientShuffle = SineWave(
        this.gradientSineWave.amplitude,
        this.gradientSineWave.frequency,
        this.gradientSineWave.phase,
        this.gradientSineWave.verticalOffset,
        this.gradientSineWave.speed,
        this.time
      );
      let gradient = drawingContext.createLinearGradient(
        0,
        -height * 2 + gradientShuffle,
        width,
        height * 3 + gradientShuffle
      );

      for (let g = 0; g < this.gradient.length; g++) {
        gradient.addColorStop(this.gradient[g].step, this.gradient[g].color);
      }
      blendMode(EXCLUSION);
      drawingContext.fillStyle = gradient;
    }

    generateGradient() {
      let gradientStopValue = 0;
      let gradientStepRange = createVector(0.1, 0.3);
      for (let g = 0; g < this.gradientStops; g++) {
        let randomGrayscale = color(random(0, 255));
        let thisStep = random(gradientStepRange.x, gradientStepRange.y);

        this.gradient.push({
          step: Clamp(gradientStopValue + thisStep, 0, 1),
          color: randomGrayscale,
        });

        gradientStopValue += thisStep;
      }
    }
  }

  this.stripes = [];
  this.time = 0;

  this.setup = function () {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);

    randomSeed(day() * month() * hour() * minute() * second());

    let wave1AmpRange = createVector(45, 112);
    let wave1FreqRange = createVector(0.075, 0.25);
    let wave1SpeedRange = createVector(1, 4);

    let wave2AmpRange = createVector(-32, -9);
    let wave2FreqRange = createVector(0.137, 0.45);
    let wave2SpeedRange = createVector(3, 9);

    let wave3AmpRange = createVector(4, 11);
    let wave3FreqRange = createVector(0.84, 1.5);
    let wave3SpeedRange = createVector(0.25, 0.75);

    let wavePhaseRange = createVector(-12, 12);

    let gradientAmpRange = createVector(0.75, 1.25);
    let gradientFreqRange = createVector(0.75, 1.25);
    let gradientSpeedRange = createVector(0.125, 0.375);

    for (let s = 0; s < 5; s++) {
      let randomX = random(0, width);

      let sineWave1 = new SineWaveProperties(
        random(wave1AmpRange.x, wave1AmpRange.y),
        random(wave1FreqRange.x, wave1FreqRange.y),
        random(wavePhaseRange.x, wavePhaseRange.y),
        0,
        random(wave1SpeedRange.x, wave1SpeedRange.y)
      );
      let sineWave2 = new SineWaveProperties(
        random(wave2AmpRange.x, wave2AmpRange.y),
        random(wave2FreqRange.x, wave2FreqRange.y),
        random(wavePhaseRange.x, wavePhaseRange.y),
        0,
        random(wave2SpeedRange.x, wave2SpeedRange.y)
      );
      let sineWave3 = new SineWaveProperties(
        random(wave3AmpRange.x, wave3AmpRange.y),
        random(wave3FreqRange.x, wave3FreqRange.y),
        random(wavePhaseRange.x, wavePhaseRange.y),
        0,
        random(wave3SpeedRange.x, wave3SpeedRange.y)
      );

      let gradientSineWave = new SineWaveProperties(
        random(gradientAmpRange.x, gradientAmpRange.y),
        random(gradientFreqRange.x, gradientFreqRange.y),
        random(wavePhaseRange.x, wavePhaseRange.y),
        0,
        random(gradientSpeedRange.x, gradientSpeedRange.y)
      );

      this.stripes.push(
        new Stripe(randomX, [sineWave1, sineWave2, sineWave3], gradientSineWave)
      );
    }
  };

  this.draw = function () {
    blendMode(REPLACE);
    background(242);
    this.time += deltaTime / 1000;

    for (let s = 0; s < this.stripes.length; s++) {
      this.stripes[s].draw(this.time);
    }
  };
}

// Quilt Scene
function Logo_Quilt() {
  class QuiltRenderer {
    constructor() {
      this.time = 0;

      this.resolution = 12;
      this.subresolution = 6;

      this.noisePositionOffset = 20;

      this.noiseSpeed = 0.25;
      this.noiseSize = 0.21;

      this.strokeSize = 4;
    }

    renderQuilt(time) {
      this.time = time;
      for (let x = 0; x < this.resolution; x++) {
        for (let y = 0; y < this.resolution; y++) {
          let position = createVector(
            x * (width / this.resolution),
            y * (height / this.resolution)
          );
          let size = createVector(
            width / this.resolution,
            height / this.resolution
          );
          let noiseTime = time * this.noiseSpeed;
          let noiseSample = noise(
            x * this.noiseSize + noiseTime,
            y * this.noiseSize + noiseTime,
            noiseTime
          );
          let h = 255 * noiseSample;
          let s = SineWave(64, 0.5, noiseSample, 140, 1, this.time);
          colorMode(HSB, 255);
          let squareColor = color([h, s, 230]);

          this.renderSquare(position, size, squareColor, this.subresolution);
        }
      }
    }

    renderSquare(position, size, squareColor, resolution) {
      let lineSize = min(size.x, size.y) / resolution;
      let lineStart = createVector(0, -(lineSize / 2));
      let lineEnd = createVector(0, lineSize / 2);

      let hueRotation = 360 * (hue(squareColor) / 256);

      let start = this.rotatePoint(
        createVector(0, 0),
        lineStart,
        hueRotation,
        false
      );
      let end = this.rotatePoint(
        createVector(0, 0),
        lineEnd,
        hueRotation,
        false
      );

      noFill();
      stroke(squareColor);
      strokeWeight(this.strokeSize);
      strokeCap(SQUARE);

      for (let x = 0; x < resolution; x++) {
        for (let y = 0; y < resolution; y++) {
          let centerPoint = createVector(
            position.x + x * (size.x / resolution) + size.x / resolution / 2,
            position.y + y * (size.y / resolution) + size.y / resolution / 2
          );

          let lineStart = p5.Vector.add(centerPoint, start);
          let lineEnd = p5.Vector.add(centerPoint, end);

          line(lineStart.x, lineStart.y, lineEnd.x, lineEnd.y);
        }
      }
    }

    rotatePoint(center, point, angle, anticlock_wise = false) {
      if (angle == 0) {
        return { x: parseFloat(point.x), y: parseFloat(point.y) };
      }
      if (anticlock_wise) {
        var radians = (Math.PI / 180) * angle;
      } else {
        var radians = (Math.PI / -180) * angle;
      }
      var cos = Math.cos(radians);
      var sin = Math.sin(radians);
      var nx =
        cos * (point.x - center.x) + sin * (point.y - center.y) + center.x;
      var ny =
        cos * (point.y - center.y) - sin * (point.x - center.x) + center.y;
      return createVector(nx, ny);
    }
  }

  this.time = 0;
  this.quiltRenderer = new QuiltRenderer();

  this.setup = function () {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
    colorMode(HSB, 255);
  };

  this.draw = function () {
    this.time += deltaTime / 1000;
    background(0);
    this.quiltRenderer.renderQuilt(this.time);
  };
}

// Strings Scene
function Logo_Strings() {
  class StringRenderer {
    constructor() {
      this.time = 0;
      this.stringCount = 175;
      this.strings = [];

      this.stringStrokeWeight = 1.5;
      this.stringSampleGradient = new GradientRamp([
        new GradientStop(0, color("#1b87ff")),
        new GradientStop(0.4, color("#4f119e")),
        new GradientStop(0.75, color("#ff6f00")),
        new GradientStop(1, color("#ffc000")),
      ]);

      this.anchorMargin = 0.125;
      this.anchorMarginWidth = 2;

      this.heightMargin = 0.25;

      this.minDisplacementAmplitude = height * 0.25;
      this.minDisplacementFrequency = 0.05;
      this.minDisplacementPhase = -2;
      this.minDisplacementVerticalOffset = 0;
      this.minDisplacementSpeed = 0.02;

      this.minSineDisplacement = new SineWaveProperties(
        this.minDisplacementAmplitude,
        this.minDisplacementFrequency,
        this.minDisplacementPhase,
        this.minDisplacementVerticalOffset,
        this.minDisplacementSpeed
      );

      this.maxDisplacementAmplitude = height;
      this.maxDisplacementFrequency = 0.875;
      this.maxDisplacementPhase = 3;
      this.maxDisplacementVerticalOffset = 0;
      this.maxDisplacementSpeed = 0.126;

      this.maxSineDisplacement = new SineWaveProperties(
        this.maxDisplacementAmplitude,
        this.maxDisplacementFrequency,
        this.maxDisplacementPhase,
        this.maxDisplacementVerticalOffset,
        this.maxDisplacementSpeed
      );

      this.createStrings();
    }

    createStrings() {
      // Create each string
      for (let s = 0; s < this.stringCount; s++) {
        let stringColor = this.stringSampleGradient.sampleColor(
          s / this.stringCount
        );

        let anchorRange = createVector(
          this.anchorMargin * width,
          this.anchorMargin * width +
            this.anchorMargin * width * this.anchorMarginWidth
        );

        // Anchors are spawned on the left and right sides of the canvas, just slightly out of the canvas bounds
        // Controls are spawned at the canvas left and right edges
        // let anchor1 = createVector(-random(anchorRange.x, anchorRange.y), random(0 - (height * this.heightMargin), height + (height * this.heightMargin)));
        let anchor1 = createVector(
          -random(anchorRange.x, anchorRange.y),
          (s / this.stringCount) * height
        );
        let control1 = createVector(
          anchor1.x - random(anchorRange.x, anchorRange.y),
          random(
            0 - height * this.heightMargin,
            height + height * this.heightMargin
          )
        );
        // let anchor2 = createVector(width + random(anchorRange.x, anchorRange.y), random(0 - (height * this.heightMargin), height + (height * this.heightMargin)));
        let anchor2 = createVector(
          width + random(anchorRange.x, anchorRange.y),
          (s / this.stringCount) * height
        );
        let control2 = createVector(
          anchor2.x + random(anchorRange.x, anchorRange.y),
          random(
            0 - height * this.heightMargin,
            height + height * this.heightMargin
          )
        );

        let anchor1SineProperties = this.getSineProperties();
        let control1SineProperties = this.getSineProperties();
        let anchor2SineProperties = this.getSineProperties();
        let control2SineProperties = this.getSineProperties();

        let lineString = new LineString(
          this,
          anchor1,
          control1,
          anchor2,
          control2,
          anchor1SineProperties,
          control1SineProperties,
          anchor2SineProperties,
          control2SineProperties,
          stringColor,
          s
        );

        this.strings.push(lineString);
      }
    }

    renderStrings(time) {
      this.time = time;
      drawingContext.setLineDash([0, 0]);
      // Create each string
      for (let s = 0; s < this.strings.length; s++) {
        this.strings[s].renderString();
      }
    }

    getSineProperties() {
      let amplitude = random(
        this.minSineDisplacement.amplitude,
        this.maxSineDisplacement.amplitude
      );
      let frequency = random(
        this.minSineDisplacement.frequency,
        this.maxSineDisplacement.frequency
      );
      let phase = random(
        this.minSineDisplacement.phase,
        this.maxSineDisplacement.phase
      );
      let verticalOffset = random(
        this.minSineDisplacement.verticalOffset,
        this.maxSineDisplacement.verticalOffset
      );
      let speed = random(
        this.minSineDisplacement.speed,
        this.maxSineDisplacement.speed
      );

      return new SineWaveProperties(
        amplitude,
        frequency,
        phase,
        verticalOffset,
        speed
      );
    }
  }

  class LineString {
    constructor(
      stringRenderer,
      anchor1,
      control1,
      anchor2,
      control2,
      anchor1SineProperties,
      control1SineProperties,
      anchor2SineProperties,
      control2SineProperties,
      stringColor,
      stringIndex
    ) {
      this.time = 0;
      this.stringRenderer = stringRenderer;

      this.anchor1 = anchor1;
      this.control1 = control1;
      this.anchor2 = anchor2;
      this.control2 = control2;

      this.handlePoints = [anchor1, control1, anchor2, control2];

      this.anchor1SineProperties = anchor1SineProperties;
      this.control1SineProperties = control1SineProperties;
      this.anchor2SineProperties = anchor2SineProperties;
      this.control2SineProperties = control2SineProperties;

      this.stringColor = stringColor;

      this.stringIndex = stringIndex;

      this.renderDebug = false;
    }

    renderString() {
      this.time = this.stringRenderer.time;

      // Displace the handles
      let handlePoints = this.displaceHandles();

      // If render Debug is on then render the handle points
      if (this.renderDebug) {
        for (let h = 0; h < this.handlePoints.length; h++) {
          let pointColor = color("red");
          let textValue = "Anchor ";
          if (h % 2 == 0) {
            pointColor = color("blue");
            textValue = "Control ";
          }

          let textAlignSide = LEFT;
          let pointNumber = 1;
          let stringName = "String " + this.stringIndex.toString() + " - ";
          if (h >= 2) {
            textAlignSide = RIGHT;
            pointNumber = 2;
          }

          noFill();
          stroke(pointColor);
          strokeWeight(3);

          point(this.handlePoints[h].x, this.handlePoints[h].y);

          noStroke();
          fill(pointColor);
          textAlign(textAlignSide);
          textSize(8);

          text(
            stringName + textValue + pointNumber.toString(),
            this.handlePoints[h].x,
            this.handlePoints[h].y
          );
        }
      }

      noFill();
      stroke(this.stringColor);
      strokeWeight(this.stringRenderer.stringStrokeWeight);

      bezier(
        handlePoints[1].x,
        handlePoints[1].y,
        handlePoints[0].x,
        handlePoints[0].y,
        handlePoints[2].x,
        handlePoints[2].y,
        handlePoints[3].x,
        handlePoints[3].y
      );
    }

    displaceHandles() {
      // Displace the handles from their base positions
      let anchor1 = this.getHandlePointOffset(
        this.anchor1,
        this.anchor1SineProperties.amplitude,
        this.anchor1SineProperties.frequency,
        this.anchor1SineProperties.phase,
        this.anchor1SineProperties.verticalOffset,
        this.anchor1SineProperties.speed,
        1.35
      );
      let control1 = this.getHandlePointOffset(
        this.control1,
        this.control1SineProperties.amplitude,
        this.control1SineProperties.frequency,
        this.control1SineProperties.phase,
        this.control1SineProperties.verticalOffset,
        this.control1SineProperties.speed,
        -2.81
      );
      let anchor2 = this.getHandlePointOffset(
        this.anchor2,
        this.anchor2SineProperties.amplitude,
        this.anchor2SineProperties.frequency,
        this.anchor2SineProperties.phase,
        this.anchor2SineProperties.verticalOffset,
        this.anchor2SineProperties.speed,
        -0.56
      );
      let control2 = this.getHandlePointOffset(
        this.control2,
        this.control2SineProperties.amplitude,
        this.control2SineProperties.frequency,
        this.control2SineProperties.phase,
        this.control2SineProperties.verticalOffset,
        this.control2SineProperties.speed,
        3.3
      );

      return [anchor1, control1, anchor2, control2];
    }

    getHandlePointOffset(
      point,
      amplitude,
      frequency,
      phase,
      verticalOffset,
      speed,
      yPhaseOffset
    ) {
      let xOffset = SineWave(
        0,
        frequency,
        phase,
        verticalOffset,
        speed,
        this.time
      );
      let yOffset = SineWave(
        amplitude,
        frequency,
        phase + yPhaseOffset,
        verticalOffset,
        speed,
        this.time
      );

      return p5.Vector.add(point, createVector(xOffset, yOffset));
    }
  }

  this.time = 0;
  this.stringRenderer = new StringRenderer();

  this.setup = function () {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
    randomSeed(day() * month() * hour() * minute() * second());

    frameRate(30);
  };

  this.draw = function () {
    background(15);
    this.time += deltaTime / 1000;

    this.stringRenderer.renderStrings(this.time);
  };

  this.gcd = function (a, b) {
    if (!b) return a;

    return gcd(b, a % b);
  };
}

// Radiant Scene
function Logo_Radiant() {
  class PointRenderer {
    constructor(count, center) {
      this.time = 0;
      this.count = count;

      this.center = center;

      this.gradient = new GradientRamp([
        new GradientStop(0, color("#1b87ff")),
        new GradientStop(0.4, color("#4f119e")),
        new GradientStop(0.75, color("#ff6f00")),
        new GradientStop(1, color("#ffc000")),
      ]);

      this.radius = width * 2;
      this.PHI = (1 + Math.sqrt(5)) / 2;

      this.colors = this.gradient.getColorSamples(this.count, true, 1, 0.5);
      this.nextColors = this.gradient.getColorSamples(this.count, true, 1, 0.5);
      this.points = [];
      this.pointSizePhases = [];

      this.pointSize = 14;

      this.viewportRenderMargin = this.pointSize * 2;

      this.colorTransitionDuration = 1.25;
      this.colorTransitionTime = this.colorTransitionDuration;

      this.rotationSpeed = 0.05;

      this.populatePoints();
    }

    populatePoints() {
      for (let p = 0; p < this.count; p++) {
        let f = p / this.count;
        let angle = p * this.PHI;
        let dist = f * this.radius;

        let x = 0.5 + cos(angle * TWO_PI) * dist;
        let y = 0.5 + sin(angle * TWO_PI) * dist;

        if (p > 2) {
          this.points.push(createVector(x + this.center.x, y + this.center.y));
          this.pointSizePhases.push(random(0, p * 0.732));
        }
      }
    }

    renderPoints(time) {
      this.time = time;
      colorMode(RGB);

      // Rotate the points
      for (let p = 0; p < this.points.length; p++) {
        this.rotatePoint(p);
      }

      // Remove the delta time from the transition time
      this.colorTransitionTime -=
        deltaTime / (1000 * this.colorTransitionDuration);

      // If the transition has completed, create a new transition
      if (this.colorTransitionTime <= 0) {
        this.colors = this.nextColors;

        // Populate the next set of colors
        this.nextColors = this.gradient.getColorSamples(
          this.count,
          true,
          1,
          0.5
        );

        // Reset the timer
        this.colorTransitionTime = 1;
      }

      for (let p = 0; p < this.points.length; p++) {
        let pointColor = lerpColor(
          this.colors[p],
          this.nextColors[p],
          1 - this.colorTransitionTime / 1
        );

        noFill();
        stroke(pointColor);
        let pointSize =
          this.pointSize +
          SineWave(
            (p / this.points.length) * this.pointSize * 1.25,
            0.375,
            this.pointSizePhases[p],
            0.25,
            4,
            this.time
          );
        strokeWeight(pointSize);

        // Only render points in the viewport, includes the margins of the viewport
        if (
          this.points[p].x >= -this.viewportRenderMargin &&
          this.points[p].x <= width + this.viewportRenderMargin &&
          this.points[p].y >= -this.viewportRenderMargin &&
          this.points[p].y <= height + this.viewportRenderMargin
        ) {
          point(this.points[p].x, this.points[p].y);
        }
      }
    }

    getNewColors() {
      this.colors = this.gradient.sampleColor(this.count, true, 0.5, 0.5, true);
    }

    rotatePoint(index) {
      let point = this.points[index];
      let angle = this.rotationSpeed * (Math.PI / 180); // Convert to radians
      let rotatedX =
        Math.cos(angle) * (point.x - this.center.x) -
        Math.sin(angle) * (point.y - this.center.y) +
        this.center.x;
      let rotatedY =
        Math.sin(angle) * (point.x - this.center.x) +
        Math.cos(angle) * (point.y - this.center.y) +
        this.center.y;

      this.points[index].x = rotatedX;
      this.points[index].y = rotatedY;
    }
  }

  this.pointRenderer = new PointRenderer(3000, createVector(width, 0));
  this.time = 0;

  this.setup = function () {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
    randomSeed(day() * month() * hour() * minute() * second());
  };

  this.draw = function () {
    background(15);
    this.time += deltaTime / 1000;
    this.pointRenderer.renderPoints(this.time);
  };
}

// Scales Scene
function Logo_Scales() {
  class ScaleRenderer {
    constructor() {
      this.time = 0;
      this.resolution = 20;

      this.scaleSize = createVector(96, 56);
      this.scaleStrokeWeight = 4;

      this.noiseSpeed = createVector(3, 2, 1);
      this.noiseSize = createVector(0.125, 0.125, 0.005);
    }

    renderScales(time) {
      this.time = time;

      drawingContext.setLineDash([0, 0]);
      strokeCap(ROUND);

      for (let x = 0; x < this.resolution; x++) {
        for (let y = 0; y < this.resolution; y++) {
          let noiseSample = noise(
            (x + time * this.noiseSpeed.x) * this.noiseSize.x,
            (y + time * this.noiseSpeed.y) * this.noiseSize.y,
            (x * y + time * this.noiseSpeed.z) * this.noiseSize.z
          );

          let center = createVector(
            x * (width / this.resolution),
            y * (height / this.resolution)
          ).add(
            createVector(
              width / this.resolution / 2,
              height / this.resolution / 2
            )
          );
          let size = createVector(
            this.scaleSize.x * noiseSample,
            this.scaleSize.y * noiseSample
          );

          // fill(color('white'));
          stroke(color("black"));
          strokeWeight(size.y);

          let rotation = noiseSample * 360;

          let sine = SineWave(
            6,
            0.25 + noiseSample / 100,
            x * y + (x + y) + noiseSample,
            0,
            7,
            this.time
          );

          // Move the scale to the piviot point (0,0) and then rotate it then move the scale back
          push();
          translate(center.x, center.y);
          rotate(rotation);
          translate(size.x / 2 + sine, 0);
          rectMode(CENTER);
          line(0, 0, size.x, 0);
          stroke(color("white"));
          strokeWeight(size.y - this.scaleStrokeWeight);
          line(0, 0, size.x, 0);
          pop();
        }
      }
    }
  }

  this.scaleRenderer = new ScaleRenderer();
  this.time = 0;

  this.setup = function () {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
    angleMode(DEGREES);
  };

  this.draw = function () {
    this.time += deltaTime / 1000;

    background(255);

    this.scaleRenderer.renderScales(this.time);
  };
}

// Trains Scene
function Logo_Trains() {
  class TrainManager {
    constructor() {
      this.time = 0;
      this.stationResolution = 16;
      this.trainCount = 35;
      this.trainLengthMinMax = createVector(1, 8);
      this.trainGapLengthMinMax = createVector(12, 32);
      this.trainColorRange = createVector(45, 255);
      this.stationColorRange = createVector(45, 255);
      this.trainSpeedMinMax = createVector(-46, -200);

      this.stationSize = 8;
      this.trainSize = 6;

      this.stationRenderChance = 0.5;

      this.stations = [];
      this.stationRender = [];
      this.stationColor = [];
      this.trains = [];

      this.generateStations();
    }

    generateStations() {
      let stations = [];
      let stationRenders = [];
      let colors = [];
      for (let x = 0; x < this.stationResolution + 2; x++) {
        let stationRow = [];
        let renderStationRow = [];
        let stationColorRow = [];
        for (let y = 0; y < this.stationResolution + 2; y++) {
          let xPos =
            x * (width / this.stationResolution) +
            width / this.stationResolution / 2 -
            width / this.stationResolution;
          let yPos =
            y * (height / this.stationResolution) +
            height / this.stationResolution / 2 -
            height / this.stationResolution;
          let station = createVector(xPos, yPos);
          stationRow.push(station);

          let renderStation = false;
          if (random(0, 1) > 1 - this.stationRenderChance) {
            renderStation = true;
          }
          renderStationRow.push(renderStation);

          stationColorRow.push(
            color(random(this.stationColorRange.x, this.stationColorRange.y))
          );
        }
        stations.push(stationRow);
        stationRenders.push(renderStationRow);
        colors.push(stationColorRow);
      }

      this.stations = stations;
      this.stationRender = stationRenders;
      this.stationColor = colors;

      this.generateTrains();
    }

    generateTrains() {
      for (let t = 0; t < this.trainCount; t++) {
        let line = t % (this.stationResolution + 2);
        let trainCarDashes = this.generateTrainCars();
        let trainSpeed = random(
          this.trainSpeedMinMax.x,
          this.trainSpeedMinMax.y
        );
        let train = new Train(
          this,
          line,
          trainCarDashes,
          color(random(this.trainColorRange.x, this.trainColorRange.y)),
          trainSpeed
        );

        this.trains.push(train);
      }
    }

    generateTrainCars() {
      // Returns a dash array set for a train line
      let dashSet = [];
      let trainIterations = floor(random(1, 4));
      let stationGapWidth = width / this.stationResolution;
      for (let d = 0; d < trainIterations; d++) {
        // Add a train and gap width to the dash set
        let trainLength =
          floor(random(this.trainLengthMinMax.x, this.trainLengthMinMax.y)) *
          stationGapWidth;
        let gapLength =
          floor(
            random(this.trainGapLengthMinMax.x, this.trainGapLengthMinMax.y)
          ) * stationGapWidth;

        dashSet.push(trainLength);
        dashSet.push(gapLength);
      }

      return dashSet;
    }

    renderAll(time) {
      this.time = time;
      this.renderStations();
      this.renderTrains();
    }

    renderStations() {
      for (let x = 0; x < this.stationResolution + 2; x++) {
        for (let y = 0; y < this.stationResolution + 2; y++) {
          let stationPoint = this.stations[x][y];

          if (this.stationRender[x][y]) {
            noFill();
            stroke(color(this.stationColor[x][y]));
            strokeWeight(this.stationSize);
            drawingContext.setLineDash([0, 0]);

            point(stationPoint.x, stationPoint.y);
          }
        }
      }
    }

    renderTrains() {
      for (let t = 0; t < this.trains.length; t++) {
        this.trains[t].renderTrain();
      }
    }
  }

  class Train {
    constructor(manager, line, trainLengths, trainColor, speed) {
      this.manager = manager;
      this.line = line;

      this.stops = [];

      this.maxInSingleDirection = 4;
      this.currentTrackingDirection = 0;
      this.stepsInDirection = 0;
      this.directionCooldown = 0;
      this.cooldownDirection = 0;
      this.canGoOppisiteDirection = true;

      this.railLength = 0;

      this.trainLengths = trainLengths;

      this.trainColor = trainColor;

      this.speed = speed;
      this.offset = random(0, 1000);

      this.generateLine();
    }

    generateLine() {
      // Get the starting poistion
      let startX = this.manager.stations.length;
      let startY = this.line;
      let startStation = this.manager.stations[startX - 1][startY];
      this.stops.push(startStation);

      // Create the station stops
      let currentStation = createVector(startX, startY);
      for (let s = 0; s < this.manager.stationResolution + 2; s++) {
        let direction = Clamp(floor(randomGaussian() * 2) - 1, -1, 1);
        let stop;

        if (
          !this.canGoOppisiteDirection &&
          direction == this.cooldownDirection
        ) {
          if (direction == -1) {
            direction = 1;
          } else if (direction == 1) {
            direction = -1;
          } else {
            direction = 1;
          }
        }

        if (direction == 0) {
          stop = this.manager.stations[currentStation.x - 1][currentStation.y];
          currentStation.y -= 0;
        }

        if (direction == 1) {
          if (currentStation.y == 0) {
            // Invert the direction because you are going past the top
            stop = this.manager.stations[currentStation.x - 1][
              currentStation.y + 1
            ];
            currentStation.y += 1;
          } else {
            stop = this.manager.stations[currentStation.x - 1][
              currentStation.y - 1
            ];
            currentStation.y -= 1;
          }
        }

        if (direction == -1) {
          if (currentStation.y == this.manager.stationResolution + 1) {
            // Invert the direction because you are going past the bottom
            stop = this.manager.stations[currentStation.x - 1][
              currentStation.y - 1
            ];
            currentStation.y -= 1;
          } else {
            stop = this.manager.stations[currentStation.x - 1][
              currentStation.y + 1
            ];
            currentStation.y += 1;
          }
        }

        this.stops.push(stop);

        currentStation.x -= 1;

        if (direction == this.currentTrackingDirection) {
          this.stepsInDirection++;
        } else {
          this.currentTrackingDirection = direction;
        }

        if (this.stepsInDirection >= this.maxInSingleDirection) {
          this.directionCooldown = 2;
          this.cooldownDirection = direction;
          this.canGoOppisiteDirection = false;
        }

        if (this.directionCooldown > 0) {
          this.directionCooldown--;
        }

        if (this.directionCooldown == 0) {
          this.canGoOppisiteDirection = true;
        }
      }

      this.getRailLength();
    }

    getRailLength() {
      // Iterate over all the points and add their distances to the rail length
      for (let p = 0; p < this.stops.length - 1; p++) {
        let nextStopDistance = dist(
          this.stops[p].x,
          this.stops[p].y,
          this.stops[p + 1].x,
          this.stops[p + 1].y
        );
        this.railLength += nextStopDistance;
      }
    }

    renderTrain() {
      // Draw the train line
      noFill();
      stroke(this.trainColor);
      strokeWeight(this.manager.trainSize);
      drawingContext.setLineDash(this.trainLengths);
      drawingContext.lineDashOffset =
        this.manager.time * this.speed + this.offset;

      beginShape();
      for (let s = 0; s < this.stops.length; s++) {
        vertex(this.stops[s].x, this.stops[s].y);
      }

      endShape();
    }
  }

  this.trainManager = new TrainManager();
  this.time = 0;

  this.setup = function () {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
  };

  this.draw = function () {
    this.time += deltaTime / 1000;
    background(5);
    this.trainManager.renderAll(this.time);
  };
}

// Link Scene
function Logo_Link() {
  class Link {
    constructor(
      manager,
      start,
      size,
      linkColor,
      handleColor,
      linkIndex,
      travelInterval
    ) {
      this.manager = manager;

      this.start = start;

      this.linkIndex = linkIndex;

      this.size = size;
      this.color = linkColor;
      this.handleColor = handleColor;

      this.pointA = null;
      this.pointB = null;

      this.travelDuration = travelInterval * 0.5; // 1.5
      this.breakDuration = this.travelDuration; // 1.5

      this.isATraveling = true;
      this.travelATime = 0;
      this.breakATime = 0;
      this.traveledLastFrameA = false;
      this.isBTraveling = false;
      this.travelBTime = 0;
      this.breakBTime = 0;
      this.traveledLastFrameB = false;

      this.targetPointA = null;
      this.targetPointB = null;

      this.aIndex = this.start;
      this.bIndex = this.start;

      this.leadingLines = true;
      this.targetAVisual = null;

      this.debug = false;

      this.getPoints();
    }

    getPoints() {
      this.pointA = this.manager.stations[this.start.x][this.start.y];
      this.pointB = p5.Vector.add(this.pointA, createVector(0, 0));

      this.updateTarget("A");
    }

    updateLink() {
      this.moveLink();
    }

    renderTargets() {
      // Render the targeting visuals
      if (this.leadingLines) {
        noFill();
        stroke(this.handleColor);
        strokeWeight(this.size.y - 9);
        point(this.targetAVisual.x, this.targetAVisual.y);
        strokeWeight(1);
        line(
          this.targetAVisual.x,
          this.targetAVisual.y,
          this.pointA.x,
          this.pointA.y
        );
      }
    }

    renderLink() {
      blendMode(BLEND);
      drawingContext.setLineDash([0, 0]);
      strokeCap(ROUND);

      // Render link
      noFill();
      stroke(color(this.color));
      strokeWeight(this.size.y);

      line(this.pointA.x, this.pointA.y, this.pointB.x, this.pointB.y);

      noFill();
      stroke(color(this.handleColor));
      strokeWeight(this.size.y - 5);

      point(this.pointA.x, this.pointA.y);
      point(this.pointB.x, this.pointB.y);

      // Render Targets
      if (this.debug) {
        noFill();
        stroke(color("blue"));
        strokeWeight(4);
        point(this.targetPointB.x, this.targetPointB.y);
        strokeWeight(1);
        line(
          this.pointB.x,
          this.pointB.y,
          this.targetPointB.x,
          this.targetPointB.y
        );

        noStroke();
        fill(color("blue"));
        text(
          "Travel: " +
            round((this.travelBTime / this.travelDuration) * 10) / 10,
          this.pointB.x,
          this.pointB.y + 10
        );

        noFill();
        stroke(color("red"));
        strokeWeight(4);
        point(this.targetPointA.x, this.targetPointA.y);
        strokeWeight(1);
        line(
          this.pointA.x,
          this.pointA.y,
          this.targetPointA.x,
          this.targetPointA.y
        );

        noStroke();
        fill(color("red"));
        text(
          "Travel: " +
            round((this.travelATime / this.travelDuration) * 10) / 10,
          this.pointA.x,
          this.pointA.y
        );
      }
    }

    moveLink() {
      // Check if either point was travling last frame
      if (this.isATraveling) {
        this.traveledLastFrameA = true;
      } else {
        this.traveledLastFrameA = false;
      }
      if (this.isBTraveling) {
        this.traveledLastFrameB = true;
      } else {
        this.traveledLastFrameB = false;
      }

      // Move Point A
      if (this.isATraveling) {
        this.travelATime += deltaTime / 1000;

        if (this.travelATime >= this.travelDuration) {
          this.isATraveling = false;

          // Let the manager know A has arrived at a station
          if (this.traveledLastFrameA) {
            // print('Arrival at: ' + this.aIndex);
            this.manager.addPopulationCount(this.aIndex.x, this.aIndex.y);
          }
          let x = lerp(this.pointA.x, this.targetPointA.x, easeInOutSine(1));
          let y = lerp(this.pointA.y, this.targetPointA.y, easeInOutSine(1));

          this.pointA = createVector(x, y);

          this.updateTarget("A");

          this.travelATime = 0;
        } else {
          let aTravel = this.travelATime / this.travelDuration / 2;
          let x = lerp(
            this.pointA.x,
            this.targetPointA.x,
            easeInOutSine(aTravel)
          );
          let y = lerp(
            this.pointA.y,
            this.targetPointA.y,
            easeInOutSine(aTravel)
          );

          this.pointA = createVector(x, y);
        }
      } else {
        this.breakATime += deltaTime / 1000;

        // Update the targeting visual for A
        if (this.leadingLines) {
          let aBreak = this.breakATime / this.breakDuration / 2;
          let x = lerp(
            this.targetAVisual.x,
            this.targetPointA.x,
            easeInOutSine(aBreak)
          );
          let y = lerp(
            this.targetAVisual.y,
            this.targetPointA.y,
            easeInOutSine(aBreak)
          );
          this.targetAVisual = createVector(x, y);
        }
      }

      // Toggle the state of Point A
      if (this.breakATime >= this.breakDuration) {
        this.isATraveling = true;
        this.breakATime = 0;
      }

      // Move Point B
      if (this.isBTraveling) {
        this.travelBTime += deltaTime / 1000;

        if (this.travelBTime >= this.travelDuration) {
          this.isBTraveling = false;

          if (this.traveledLastFrameB) {
            // Let the manager know B has left a station
            // this.manager.removePopulationCount(this.bIndex.x,this.bIndex.y);
          }

          let x = lerp(this.pointB.x, this.targetPointB.x, easeInOutSine(1));
          let y = lerp(this.pointB.y, this.targetPointB.y, easeInOutSine(1));

          this.pointB = createVector(x, y);

          this.travelBTime = 0;
        } else {
          let bTravel = this.travelBTime / this.travelDuration / 2;
          let x = lerp(
            this.pointB.x,
            this.targetPointB.x,
            easeInOutSine(bTravel)
          );
          let y = lerp(
            this.pointB.y,
            this.targetPointB.y,
            easeInOutSine(bTravel)
          );

          this.pointB = createVector(x, y);
        }
      } else {
        this.breakBTime += deltaTime / 1000;
      }

      // Toggle the state of Point B
      if (this.breakBTime >= this.breakDuration) {
        this.isBTraveling = true;
        this.breakBTime = 0;
      }
    }

    updateTarget(point) {
      if (point == "A") {
        // Update A
        let x = round(random(-1, 1));
        let y = round(random(-1, 1));

        this.bIndex = p5.Vector.add(this.aIndex, createVector(0, 0));
        this.aIndex = p5.Vector.add(this.aIndex, createVector(x, y));

        if (
          this.aIndex.x <= 0 ||
          this.aIndex.x >= this.manager.stations.length - 1 ||
          this.aIndex.y <= 0 ||
          this.aIndex.y >= this.manager.stations[0].length - 1
        ) {
          // The link is now outta bounds, delete it
          this.manager.removeLink(this.linkIndex);
        } else {
          if (this.targetPointA == null) {
            this.targetPointA = p5.Vector.add(this.pointA, createVector(0, 0));
          }
          this.targetPointB = p5.Vector.add(
            this.targetPointA,
            createVector(0, 0)
          );
          this.targetPointA = createVector(
            this.manager.stations[this.aIndex.x][this.aIndex.y].x,
            this.manager.stations[this.aIndex.x][this.aIndex.y].y
          );

          if (this.targetAVisual == null) {
            this.targetAVisual = this.targetPointA;
            this.targetBVisual = this.targetPointB;
          }
        }
      }
    }
  }

  class StationPopulationChangeIndicator {
    constructor(
      manager,
      position,
      delay,
      duration,
      indicatorFillOpacityModifier,
      indicatorIndex
    ) {
      this.manager = manager;

      this.center = position;
      this.delay = delay;

      this.indicatorFillOpacityModifier = indicatorFillOpacityModifier;

      this.indicatorIndex = indicatorIndex;

      this.duration = duration;
      this.playTime = 0;
    }

    renderIndicator() {
      if (this.delay <= 0) {
        this.playTime += deltaTime / 1000;

        let animationInterpolation = easeOutCubic(
          this.playTime / this.duration
        );
        if (this.direction == 1) {
          animationInterpolation = easeInCubic(this.playTime / this.duration);
        }

        let indicatorOpacity =
          round(
            lerp(this.startOpacity, this.endOpacity, animationInterpolation) *
              100
          ) / 100;
        let indicatorSize =
          round(
            lerp(this.startSize, this.endSize, animationInterpolation) * 100
          ) / 100;

        // Render the indicator at the correct display time
        ellipseMode(CENTER);
        stroke(color("rgba(44,66,81," + indicatorOpacity + ")"));
        strokeWeight(1);
        fill(
          "rgba(183,206,206," +
            round(indicatorOpacity * this.indicatorFillOpacityModifier * 10) /
              10 +
            ")"
        );

        ellipse(this.center.x, this.center.y, indicatorSize, indicatorSize);

        if (this.playTime >= this.duration) {
          this.manager.removeIndicator(this.indicatorIndex);
        }
      } else {
        this.delay -= deltaTime / 1000;
      }
    }
  }

  class Arrival extends StationPopulationChangeIndicator {
    constructor(
      manager,
      position,
      delay,
      duration,
      indicatorSize,
      indicatorFillOpacityModifier,
      indicatorIndex
    ) {
      super(
        manager,
        position,
        delay,
        duration,
        indicatorFillOpacityModifier,
        indicatorIndex
      );
      this.direction = 0;
      this.startSize = 0;
      this.endSize = indicatorSize;
      this.startOpacity = 0.25;
      this.endOpacity = 0;
    }
  }

  class Departure extends StationPopulationChangeIndicator {
    constructor(
      manager,
      position,
      delay,
      duration,
      indicatorSize,
      indicatorFillOpacityModifier,
      indicatorIndex
    ) {
      super(
        manager,
        position,
        delay,
        duration,
        indicatorFillOpacityModifier,
        indicatorIndex
      );
      this.direction = 1;
      this.startSize = indicatorSize;
      this.endSize = 0;
      this.startOpacity = 0;
      this.endOpacity = 0.25;
    }
  }

  class LinkManager {
    constructor() {
      this.time = 0;
      this.stationResolution = 12;

      this.stationSize = 2;
      this.linkSize = 12;

      this.stationRender = true;
      this.stationColor = color(180);

      this.linkCount = 128;

      this.stations = [];

      this.stationPopulation = [];
      this.populationsLastFrame = [];

      this.links = [];

      this.linkColors = [
        color("#2C4251"),
        color("#FCA311"),
        color("#B7CECE"),
        color("#2E80C7"),
      ];

      this.linkSpawnInterval = 0.5;
      this.spawnTimer = 0;

      this.populationChangeRender = [];
      this.populationChangeInterval = 0.05;
      this.populationArrivalIndicatorDuration = 1.5;
      this.populationDepartureIndicatorDuration = 0.5;
      this.indicatorSize = 128;
      this.indicatorFillOpacityModifier = 0.75;

      this.generateStations();
      this.generateLinks();
    }

    generateStations() {
      let stations = [];
      let populations = [];
      for (let x = 0; x < this.stationResolution + 6; x++) {
        let stationRow = [];
        let populationRow = [];
        for (let y = 0; y < this.stationResolution + 6; y++) {
          let xPos =
            x * (width / this.stationResolution) +
            width / this.stationResolution / 2 -
            (width / this.stationResolution) * 3;
          let yPos =
            y * (height / this.stationResolution) +
            height / this.stationResolution / 2 -
            (height / this.stationResolution) * 3;
          let station = createVector(xPos, yPos);
          stationRow.push(station);
          populationRow.push(0);
        }
        stations.push(stationRow);
        populations.push(populationRow);
      }

      this.stations = stations;
      this.stationPopulation = populations;
    }

    generateLinks() {
      for (let l = 0; l < this.linkCount; l++) {
        this.generateLink();
      }
    }

    spawnLink() {
      this.spawnTimer += deltaTime / 1000;
      if (this.spawnTimer >= this.linkSpawnInterval) {
        this.spawnTimer = 0;
      }

      if (this.links.length < this.linkCount && this.spawnTimer == 0) {
        this.generateLink();
      }
    }

    generateLink() {
      let randX =
        floor(
          Clamp(
            randomGaussian((this.stationResolution + 6 - 4) / 2, 5),
            1,
            this.stationResolution - 2
          )
        ) + 3;
      let randY =
        floor(
          Clamp(
            randomGaussian((this.stationResolution + 6 - 4) / 2, 5),
            1,
            this.stationResolution - 2
          )
        ) + 3;
      let linkSpawn = createVector(randX, randY);
      let linkColor = this.linkColors[
        round(random(0, this.linkColors.length - 1))
      ];
      let handleColor = this.getHandleColor(linkColor);
      let travelInterval = round(random(1, 4));
      let newLink = new Link(
        this,
        linkSpawn,
        createVector(width / this.stationResolution, this.linkSize),
        linkColor,
        handleColor,
        this.links.length,
        travelInterval
      );
      this.links.push(newLink);
    }

    renderAll(time) {
      this.time = time;

      // Store the station counts to the last frame station counts
      let oldPopulations = [];
      for (let x = 0; x < this.stationPopulation.length; x++) {
        let oldPopulationRow = [];
        for (let y = 0; y < this.stationPopulation[0].length; y++) {
          let thisStationPopulation = this.stationPopulation[x][y];

          oldPopulationRow.push(thisStationPopulation);
        }
        oldPopulations.push(oldPopulationRow);
      }
      this.populationsLastFrame = oldPopulations;

      this.spawnLink();
      if (this.stationRender) {
        this.renderStations();
      }
      this.renderLinks();
    }

    renderStations() {
      for (let x = 3; x < this.stationResolution + 3; x++) {
        for (let y = 3; y < this.stationResolution + 3; y++) {
          let stationPoint = this.stations[x][y];

          noFill();
          stroke(this.stationColor);
          strokeWeight(this.stationSize);

          point(stationPoint.x, stationPoint.y);
        }
      }
    }

    renderLinks() {
      // Update all links
      for (let l = 0; l < this.links.length; l++) {
        this.links[l].updateLink();
      }

      // Check if any links have arrived at a station
      this.checkStationPopulationChanges();

      // Render any population change indicators
      this.renderPopulationIndicators();

      // Update all link targets
      for (let l = 0; l < this.links.length; l++) {
        this.links[l].renderTargets();
      }

      // After target rendering, render the links themselves
      for (let l = 0; l < this.links.length; l++) {
        this.links[l].renderLink();
      }
    }

    checkStationPopulationChanges() {
      let populationChanges = [];
      // Check the station population changes
      for (let x = 0; x < this.stationPopulation.length; x++) {
        let populationRowChanges = [];
        for (let y = 0; y < this.stationPopulation[0].length; y++) {
          let thisStationPopulation = this.stationPopulation[x][y];
          let lastFrameStationPopulation = this.populationsLastFrame[x][y];

          populationRowChanges.push(
            thisStationPopulation - lastFrameStationPopulation
          );
        }
        populationChanges.push(populationRowChanges);
      }

      // Spawn arrival and departure objects
      for (let x = 0; x < populationChanges.length; x++) {
        for (let y = 0; y < populationChanges[0].length; y++) {
          if (populationChanges[x][y] != 0) {
            if (abs(populationChanges[x][y]) > 2) {
              let indicatorPosition = this.stations[x][y];
              let indicatorIndex = this.populationChangeRender.length;
              let indicatorDelay = 0;
              if (populationChanges[x][y] < 0) {
                // Depatures
                // this.populationChangeRender.push(new Departure(this, indicatorPosition, indicatorDelay, this.populationDepartureIndicatorDuration, this.indicatorSize/2, this.indicatorFillOpacityModifier, indicatorIndex));
              } else {
                // Arrivals
                this.populationChangeRender.push(
                  new Arrival(
                    this,
                    indicatorPosition,
                    indicatorDelay,
                    this.populationArrivalIndicatorDuration,
                    this.indicatorSize,
                    this.indicatorFillOpacityModifier,
                    indicatorIndex
                  )
                );
              }
            }
          }
        }
      }
    }

    renderPopulationIndicators() {
      // Render any population changes currently active
      let populationRenderDestroy = 0;
      for (let u = 0; u < this.populationChangeRender.length; u++) {
        this.populationChangeRender[u].renderIndicator();
      }
    }

    getHandleColor(linkColor) {
      let hueShift = 15;
      if (hue(linkColor) <= 128) {
        hueShift *= -1;
      }
      let newHue = round((hue(linkColor) + hueShift) % 256);
      let newSaturation = round(saturation(linkColor));
      let brightnessShift = 12;
      if (brightness(linkColor) <= 70) {
        brightnessShift = 22;
      }
      let newBrightness = round(
        Clamp(brightness(linkColor) - brightnessShift, 0, 100)
      );
      return color(
        "hsb(" + newHue + ", " + newSaturation + "%, " + newBrightness + "%)"
      );
    }

    removeLink(linkIndex) {
      this.links.splice(linkIndex, 1);
      // Iterate over the links array and update all links with their new index
      for (let l = 0; l < this.links.length; l++) {
        this.links[l].linkIndex = l;
      }
    }

    addPopulationCount(x, y) {
      this.stationPopulation[x][y]++;
    }

    removePopulationCount(x, y) {
      this.stationPopulation[x][y]--;
    }

    removeIndicator(indicatorIndex) {
      this.populationChangeRender.splice(indicatorIndex, 1);
      // Iterate over the indicator array and update all indicators with their new index
      for (let r = 0; r < this.populationChangeRender.length; r++) {
        this.populationChangeRender[r].indicatorIndex = r;
      }
    }
  }

  this.linkManager = new LinkManager();
  this.time = 0;

  this.setup = function () {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
  };

  this.draw = function () {
    this.time += deltaTime / 1000;
    background(255);
    this.linkManager.renderAll(this.time);
  };
}

// Holographic Scene
function Logo_Holographic() {
  class GradientManager {
    constructor(bubbleColorsSample) {
      this.time = 0;
      this.divisions = 12;

      this.bubbles = [];
      this.bubbleCount = 12;
      this.bubbleColorsSample = bubbleColorsSample;

      this.gradientColors = 6;
      this.gradient = null;

      this.sectionOffsets = [];
      this.offsetAmplitude = 0.3;

      this.generateBubbles();
      this.generateGradient();
      this.updateSectionOffsets();
    }

    renderSections(time) {
      this.time = time;
      this.updateSectionOffsets();

      // Update the bubbles
      for (let b = 0; b < this.bubbles.length; b++) {
        this.bubbles[b].updateBubble();
      }

      // Render each section
      for (let x = 0; x < this.divisions; x++) {
        // Render base
        let position = createVector(x * (width / this.divisions), 0);
        let size = createVector(width / this.divisions, height);
        let sectionOffset = createVector(
          (x + 1 - this.divisions / 2) * (width / this.divisions),
          this.sectionOffsets[x]
        );

        noStroke();
        fill(color("red"));
        this.linearGradient(sectionOffset);

        rect(position.x, position.y, size.x, size.y);

        // Render each bubble
        for (let b = 0; b < this.bubbles.length; b++) {
          let bubble = this.bubbles[b];
          noStroke();
          fill(color("red"));
          this.radialGradient(
            bubble.position,
            bubble.radius,
            bubble.color,
            sectionOffset
          );

          rect(position.x, position.y, size.x, size.y);
        }
      }
    }

    generateBubbles() {
      for (let b = 0; b < this.bubbleCount; b++) {
        let bubbleRadius = random(200, 700);
        let bubblePosition = createVector(
          random(0 + width / 10, width - width / 10),
          random(0 + height / 10, height - height / 10)
        );
        let bubbleColor = this.bubbleColorsSample[
          floor(random(0, this.bubbleColorsSample.length - 1))
        ];
        this.bubbles.push(
          new GradientBubble(this, bubblePosition, bubbleRadius, bubbleColor)
        );
      }
    }

    generateGradient() {
      let colorStops = [];
      let noiseScale = 0.25;
      for (let y = 0; y < this.gradientColors + 1; y++) {
        let stopColor = this.bubbleColorsSample[
          floor(random(0, this.bubbleColorsSample.length - 1))
        ];
        let stop = new GradientStop(y / this.gradientColors, stopColor);
        colorStops.push(stop);
      }

      this.gradient = new GradientRamp(colorStops);
    }

    updateSectionOffsets() {
      for (let x = 0; x < this.divisions; x++) {
        this.sectionOffsets[x] = round(
          SineWave(
            height * this.offsetAmplitude,
            0.25,
            x * (x + x) * ((x + x) * (x + x)),
            0,
            2,
            this.time
          )
        );
      }
    }

    linearGradient(offset) {
      let gradient = drawingContext.createLinearGradient(
        0 + offset.x,
        height + height * this.offsetAmplitude + offset.y,
        width + offset.x,
        0 - height * this.offsetAmplitude + offset.y
      );

      for (let s = 0; s < this.gradient.stops.length; s++) {
        gradient.addColorStop(
          this.gradient.stops[s].position,
          this.gradient.stops[s].stopColor
        );
      }

      drawingContext.fillStyle = gradient;
    }

    radialGradient(center, radius, fillColor, offset) {
      let gradient = drawingContext.createRadialGradient(
        center.x,
        center.y + offset.y,
        0,
        center.x,
        center.y + offset.y,
        radius
      );

      gradient.addColorStop(0, fillColor);
      gradient.addColorStop(
        1,
        color(
          "rgba(" +
            [red(fillColor), green(fillColor), blue(fillColor)].join(",") +
            ", 0)"
        )
      );

      drawingContext.fillStyle = gradient;
    }
  }

  class GradientBubble {
    constructor(manager, position, radius, color) {
      this.manager = manager;

      this.position = position;
      this.radius = radius;

      this.color = color;

      this.velocity = createVector(random(-1, 1), random(-1, 1));
    }

    updateBubble() {
      if (
        this.position.x + this.velocity.x < 0 ||
        this.position.x + this.velocity.x > width
      ) {
        this.velocity.x *= -1;
      }
      if (
        this.position.y + this.velocity.y < 0 ||
        this.position.y + this.velocity.y > height
      ) {
        this.velocity.y *= -1;
      }

      this.position.add(this.velocity);
    }
  }

  this.bubbleColorsSample = [
    color("#465b9a"),
    color("#e64685"),
    color("#7300a6"),
    color("#2c48fe"),
    color("#38b5b4"),
    color("#a6fe28"),
    color("#009e75"),
    color("#d93958"),
    color("#fea8ef"),
  ];
  this.gradientManager = new GradientManager(this.bubbleColorsSample);
  this.time = 0;

  this.setup = function () {
    pixelDensity(1);
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
  };

  this.draw = function () {
    background(220);
    this.time += deltaTime / 1000;
    this.gradientManager.renderSections(this.time);
  };
}

// Swirl Scene
function Logo_Swirl() {
  class RaceRenderer {
    constructor() {
      this.time = 0;
      this.count = 64;
      this.gapMultiplier = 1.25;
      this.circleMaxSize = width * 3;
      this.center = createVector(width, 0);
    }
    renderTrack(time) {
      this.time = time;
      for (let c = 0; c < this.count; c++) {
        noFill();
        stroke(color("black"));
        strokeWeight(1);
        drawingContext.setLineDash([0, 0]);

        circle(
          this.center.x,
          this.center.y,
          (this.circleMaxSize / this.count) * (c + 1)
        );
      }

      this.renderPoints();
    }

    renderPoints() {
      for (let p = 0; p < this.count; p++) {
        let t = this.slantedSineWave(0.5, 4, p / this.count, 0, 0.5, 0.25);
        let t2 = this.slantedSineWave(
          0.5,
          4,
          p / this.count,
          (p / this.count) * 3,
          0.5,
          0.25
        );

        let pointOnCircle = this.getPointOnCircle(
          t,
          ((this.circleMaxSize / this.count) * (p + 1)) / 2
        );
        pointOnCircle.add(this.center);
        let pointOnCircle2 = this.getPointOnCircle(
          t2,
          ((this.circleMaxSize / this.count) * (p + 1)) / 2
        );
        pointOnCircle2.add(this.center);

        blendMode(BLEND);
        let strokeColor = color("white");

        if (p % 2 == 0) {
          strokeColor = color("white");
        }

        if (p % 2 == 0) {
          blendMode(DIFFERENCE);
        }

        // Get the length of the distance between the two points
        let pointDist = dist(
          pointOnCircle.x,
          pointOnCircle.y,
          pointOnCircle2.x,
          pointOnCircle2.y
        );
        let radius = ((width / this.count) * (p + 1)) / 2;
        let circumfrence = 2 * PI * radius;
        let degrees = (360 / ((this.count + 1) * this.gapMultiplier)) * (p + 1);
        let radianLength = (degrees / 360) * circumfrence;
        let circleOffset =
          (t / PI) * ((this.circleMaxSize / this.count) * (p + 1));

        noFill();
        stroke(strokeColor);
        strokeWeight(this.circleMaxSize / this.count / 2);
        drawingContext.setLineDash([radianLength, circumfrence - radianLength]);
        drawingContext.lineDashOffset =
          PI * -p +
          circleOffset +
          this.slantedSineWave(256, 0.125, p, 0, 6, p * 0.5);

        circle(
          this.center.x,
          this.center.y,
          (this.circleMaxSize / this.count) * (p + 1)
        );

        stroke(strokeColor);

        point(pointOnCircle.x, pointOnCircle.y);
        point(pointOnCircle2.x, pointOnCircle2.y);
      }
    }

    slantedSineWave(amplitude, frequency, phase, verticalOffset, speed, slant) {
      let slantAddition = this.time * slant;
      return (
        SineWave(
          amplitude,
          frequency,
          phase,
          verticalOffset,
          speed,
          this.time
        ) + slantAddition
      );
    }

    getPointOnCircle(t, r) {
      return createVector(r * Math.sin(t), r * Math.cos(t));
    }
  }

  this.raceRenderer = new RaceRenderer();
  this.time = 0;

  this.setup = function () {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
  };

  this.draw = function () {
    blendMode(BLEND);
    background(220);
    this.time += deltaTime / 1000;
    this.raceRenderer.renderTrack(this.time);
  };
}

// LCD Scene
function Logo_LCD() {
  class LCDRenderer {
    constructor() {
      this.time = 0;
      this.columnCount = 47;
      this.rowCount = 16;
      this.columnGap = 0.25;
      this.rowGap = 0.0625;

      this.hueDuration = 11;
      this.saturationDuration = 8;
      this.redOffset = this.hueDuration;
      this.greenOffset = 0;
      this.blueOffset = this.hueDuration * 2;

      this.columnOffset = true;
      this.columnOffsetTime = 12;
      this.columnBaseOffsets = [];

      this.colorArray = [];

      this.generateColorArray();
    }

    renderLCD(time) {
      this.time = time;
      this.renderColorArray();
    }

    generateColorArray() {
      // Create a base color array that is sorted y,x
      let colorArray = [];
      for (let y = 0; y < this.rowCount; y++) {
        let colorRow = [];
        for (let x = 0; x < this.columnCount; x++) {
          let index = x + y * this.columnCount;

          // Every this.hueDuration jump to another hue, reset the brightness
          let hueJumpAmount = round(
            round(255 / this.columnCount + this.columnCount) * HALF_PI
          );
          let hueCurrentIndex = floor(index / this.hueDuration);
          let hueCurrent = (hueJumpAmount * hueCurrentIndex) % 255;

          let brightnessMinMax = createVector(25, 95);
          let brightnessCurrentIndex = index % this.hueDuration;
          let brightnessCurrent = map(
            brightnessCurrentIndex,
            0,
            this.hueDuration - 1,
            brightnessMinMax.x,
            brightnessMinMax.y
          );

          let saturationCurrent = 100;

          let dashColor = color(
            "hsb(" +
              hueCurrent +
              ", " +
              saturationCurrent +
              "%, " +
              brightnessCurrent +
              "%)"
          );
          colorRow.push(dashColor);
        }

        colorArray.push(colorRow);
      }

      // Duplicate the array along the y position
      let doubleLengthArray = colorArray;
      for (let y = 0; y < this.rowCount; y++) {
        doubleLengthArray.push(colorArray[y]);
      }

      // Flip the color array so it is sorted x,y
      let colorTransposeArray = doubleLengthArray[0].map((_, colIndex) =>
        doubleLengthArray.map((row) => row[colIndex])
      );

      // Take channels from the old y,x array and map them onto the x,y array
      let saturationSwitch = true;
      for (let y = 0; y < this.rowCount * 2; y++) {
        for (let x = 0; x < this.columnCount; x++) {
          let index = x + y * this.columnCount;
          let maxIndex = this.rowCount * 2 * this.columnCount;

          let rIndex = (index + this.redOffset) % maxIndex;
          let rPosition = createVector(
            rIndex % this.columnCount,
            floor(rIndex / this.columnCount)
          );

          let gIndex = (index + this.greenOffset) % maxIndex;
          let gPosition = createVector(
            gIndex % this.columnCount,
            floor(gIndex / this.columnCount)
          );

          let bIndex = (index + this.blueOffset) % maxIndex;
          let bPosition = createVector(
            bIndex % this.columnCount,
            floor(bIndex / this.columnCount)
          );

          // Get the base channels
          let r = red(colorArray[rPosition.y][rPosition.x]);
          let g = green(colorArray[gPosition.y][gPosition.x]);
          let b = blue(colorArray[bPosition.y][bPosition.x]);

          // Swap the saturation on or off given this.saturationDuration
          if (index % this.saturationDuration == 0) {
            saturationSwitch = !saturationSwitch;
          }

          let shiftedColor = color([r, g, b]);

          // Dull the saturation when switched off
          if (!saturationSwitch) {
            let shiftedHue = round(hue(shiftedColor));
            let shiftedSaturation = 7;
            let shiftedBrightness = Clamp(
              round(brightness(shiftedColor)) - 16,
              2,
              50
            );

            shiftedColor = color(
              "hsb(" +
                shiftedHue +
                ", " +
                shiftedSaturation +
                "%, " +
                shiftedBrightness +
                "%)"
            );
          }

          // Store the transposed item
          colorTransposeArray[x][y] = shiftedColor;
        }
      }

      // Generate the offsets for each column
      let columnBaseOffsets = [];
      let randomTotalOffset = 0;
      for (let x = 0; x < this.columnCount; x++) {
        let constantOffset = x / 4;
        let randomOffset =
          floor(
            random(this.columnOffsetTime / 4, this.columnOffsetTime * 2) * 10
          ) / 10;
        randomTotalOffset += randomOffset;
        columnBaseOffsets.push(constantOffset + randomTotalOffset);
      }

      this.columnBaseOffsets = columnBaseOffsets;
      this.colorArray = colorTransposeArray;
    }

    renderColorArray() {
      for (let x = 0; x < this.columnCount; x++) {
        for (let y = 0; y < this.rowCount * 2; y++) {
          let columnWidth = width / this.columnCount;
          let columnGap = columnWidth * this.columnGap;
          let rowHeight = height / this.rowCount;
          let rowGap = rowHeight * this.rowGap + (columnWidth - columnGap);
          let start = createVector(
            x * columnWidth + columnWidth / 2,
            y * rowHeight + (columnWidth - columnGap * 2)
          );
          let end = createVector(
            x * columnWidth + columnWidth / 2,
            y * rowHeight + (columnWidth - columnGap * 2) + (rowHeight - rowGap)
          );

          // Only offset if true
          if (this.columnOffset) {
            let yOffset = createVector(
              0,
              -(
                easeInOutQuint(
                  ((this.time + this.columnBaseOffsets[x]) %
                    this.columnOffsetTime) /
                    this.columnOffsetTime
                ) * height
              )
            );
            start.add(yOffset);
            end.add(yOffset);
          }

          // Only render if start or end points are visible
          if (
            (start.y >= 0 && start.y <= height) ||
            (end.y >= 0 && end.y <= height)
          ) {
            noFill();
            stroke(this.colorArray[x][y]);
            strokeWeight(columnWidth - columnGap);

            line(start.x, start.y, end.x, end.y);
          }
        }
      }
    }
  }

  this.lcdRenderer = new LCDRenderer();
  this.time = 0;

  this.setup = function () {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
  };

  this.draw = function () {
    background(0);
    this.time += deltaTime / 1000;
    this.lcdRenderer.renderLCD(this.time);
  };
}

// Topography Scene
function Logo_Topography() {
  class TopographyRenderer {
    constructor() {
      this.time = 0;
      this.divisions = 28;
      this.subDivisions = 44;

      this.changeScale = 0.125;
      this.masterSpeed = 1;
      this.timeSpeed = 0.375;

      this.majorPoints = [];

      this.minorPointsMovementSpeed = 0.05;

      // this.generateMajorPoints();
    }

    generateMajorPoints() {
      // Generate pairs of points going down and at an angle to the comp
      for (let p = 0; p < this.divisions + 4; p++) {
        let widthMargin = width / 2;
        let heightSpacing = height / this.divisions;
        let start = createVector(
          -widthMargin,
          -(heightSpacing / 2) + heightSpacing * p - (heightSpacing / 2) * p
        );
        let end = createVector(
          width + widthMargin,
          -(heightSpacing / 2) + heightSpacing * p + (heightSpacing / 2) * p
        );

        this.majorPoints.push([start, end]);
      }
    }

    renderTopography(time) {
      this.time = time;
      let pointArray = [];
      drawingContext.setLineDash([0, 0]);
      for (let y = 0; y < this.divisions; y++) {
        let widthChange = SineWave(
          0.071,
          0.25,
          y * y * this.changeScale,
          2,
          12 * this.masterSpeed,
          this.time
        );
        let xChange = SineWave(
          0.41,
          0.32,
          (y + y) * this.changeScale,
          0,
          1 * this.masterSpeed,
          this.time
        );
        let yStartChange = SineWave(
          height / this.divisions / 2,
          0.082,
          (y + y) * y,
          0,
          5 * this.masterSpeed,
          this.time
        );
        let yEndChange = SineWave(
          -(height / this.divisions) / 2,
          0.163,
          y * y + y,
          0,
          2 * this.masterSpeed,
          this.time
        );

        let start = createVector(
          width * widthChange + xChange * width,
          y * ((height * 1.5) / this.divisions) + yStartChange
        );
        let end = createVector(
          width - width * widthChange + xChange * width,
          y * ((height * 1.5) / this.divisions) + yEndChange
        );

        let pointRow = [];
        for (let x = 0; x < this.subDivisions; x++) {
          let baseCompletion = x / this.subDivisions;
          let timeOffset = time * this.timeSpeed * 0.0625;
          let timeAdjustedOffset = (baseCompletion + timeOffset) % 1;
          let division = p5.Vector.lerp(start, end, timeAdjustedOffset);
          pointRow.push(division);
        }
        pointArray.push(pointRow);
      }

      // Transpose the array
      let transposedArray = pointArray[0].map((_, colIndex) =>
        pointArray.map((row) => row[colIndex])
      );
      for (let x = 0; x < transposedArray.length; x++) {
        let renderThisLine = this.checkForRenderedPoints(transposedArray[x]);
        if (renderThisLine) {
          let strokeSize = 0;
          beginShape();
          for (let y = 0; y < transposedArray[x].length; y++) {
            vertex(transposedArray[x][y].x, transposedArray[x][y].y);
            if (y == transposedArray[x].length / 2) {
              strokeSize = map(
                transposedArray[x][y].x,
                0,
                width,
                SineWave(17, 0.25, -6, 18, 2, this.time),
                SineWave(17, 0.25, -24, 18, 2, this.time),
                true
              );
            }
          }

          noFill();
          stroke(color("white"));
          strokeWeight(strokeSize * 0.75);

          endShape();
        }
      }
    }

    checkForRenderedPoints(points) {
      for (let p = 0; p < points.length; p++) {
        if (
          (points[p].x >= 0 && points[p].x <= width) ||
          (points[p].y >= 0 && points[p].y <= height)
        ) {
          return true;
        }
      }

      return false;
    }
  }

  this.time = 0;
  this.topographyRenderer = new TopographyRenderer();

  this.setup = function () {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
  };

  this.draw = function () {
    background(5);
    this.time += deltaTime / 1000;
    this.topographyRenderer.renderTopography(this.time);
  };
}

// Particles Scene
function Logo_Particles() {
  class ParticleEmitter {
    constructor(
      color,
      emitSize,
      rate,
      interval,
      count,
      life,
      shrinkOverLife,
      random,
      randomVelocity,
      smoothness,
      direction,
      position,
      size
    ) {
      this.time = 0;
      this.color = color;
      this.emitSize = emitSize;
      this.rate = rate;
      this.interval = interval;
      this.count = count;
      this.life = life;
      this.shrinkOverLife = shrinkOverLife;
      this.random = random;
      this.randomVelocity = randomVelocity;
      this.smoothness = smoothness;
      this.direction = direction;
      this.position = position;
      this.size = size;

      this.emitTimer = 0;
      this.emitTotal = 0;

      this.particles = [];
    }

    renderParticles(time) {
      this.time = time;
      for (let p = 0; p < this.particles.length; p++) {
        this.particles[p].renderParticle();
      }

      if (this.particles.length < this.count && this.emitTimer <= 0) {
        this.emitTimer = this.interval;
        for (let n = 0; n < this.rate; n++) {
          this.emitParticle();
        }
      }
      this.emitTimer -= deltaTime / 1000;
    }

    emitParticle() {
      let emitCenter = createVector(0, 0).add(this.position);
      let emitLocation = createVector(
        random(-this.size.x / 2, this.size.x / 2),
        random(-this.size.y / 2, this.size.y / 2)
      ).add(emitCenter);
      let emitSize = random(this.emitSize.x, this.emitSize.y);
      let randomVelocity = createVector(
        random(-this.randomVelocity.x, this.randomVelocity.x),
        random(-this.randomVelocity.y, this.randomVelocity.y)
      ).add(this.direction);

      let particle = new Particle(
        this,
        emitLocation,
        randomVelocity,
        this.random,
        this.randomVelocity,
        emitSize,
        this.color,
        this.getNewParticleIndex(),
        this.smoothness,
        this.life,
        this.shrinkOverLife
      );
      this.particles.push(particle);
    }

    removeParticle(index) {
      this.particles.splice(index, 1);
      for (let p = 0; p < this.particles.length; p++) {
        this.particles[p].index = p;
      }
    }

    getNewParticleIndex() {
      this.emitTotal++;
      this.emitTotal = this.emitTotal % 90000;

      return this.emitTotal;
    }
  }

  class Particle {
    constructor(
      emitter,
      position,
      velocity,
      randomWander,
      randomVelocity,
      size,
      color,
      index,
      smoothness,
      life,
      shrinkOverLife
    ) {
      this.emitter = emitter;
      this.position = position;
      this.velocity = velocity;
      this.randomWander = randomWander;
      this.randomVelocity = randomVelocity;
      this.size = size;
      this.renderSize = size;
      this.color = color;
      this.index = index;
      this.smoothness = smoothness;
      this.life = life;
      this.shrinkOverLife = shrinkOverLife;
      if (shrinkOverLife === undefined) {
        this.shrinkOverLife = true;
      }

      this.lifetime = 0;
    }

    renderParticle() {
      // Update the movement
      this.updateMovement();

      // Render
      noFill();
      stroke(this.color);
      strokeWeight(this.renderSize);

      point(this.position.x, this.position.y);

      this.lifetime += deltaTime / 1000;

      if (this.lifetime >= this.life) {
        this.size = 0;
        this.emitter.removeParticle(this.index);
      }
    }

    updateMovement() {
      let randomDirection = createVector(
        random(-this.randomVelocity.x, this.randomVelocity.x),
        random(-this.randomVelocity.y, this.randomVelocity.y)
      ).mult(this.randomWander);
      let moveDirection = createVector(0, 0)
        .add(this.velocity)
        .add(randomDirection);

      this.position.lerp(moveDirection.add(this.position), this.smoothness);

      if (this.shrinkOverLife) {
        let newSize = lerp(this.size, 0, this.lifetime / this.life);
        this.renderSize = newSize;
      }
    }
  }

  class DotGrid {
    constructor() {
      this.time = 0;
      this.col = 32;
      this.row = 32;
      this.size = createVector(width * 1.25, height * 1.25);
      this.start = createVector(-width * 0.125, -height * 0.125);
    }

    renderGrid(time) {
      this.time = time;
      for (let x = 0; x < this.col; x++) {
        let xOffset = SineWave(
          this.size.x / this.col,
          0.31,
          x,
          0,
          1,
          this.time
        );
        for (let y = 0; y < this.row; y++) {
          let yOffset = SineWave(
            height * 0.0625,
            0.28,
            y + x,
            0,
            1.25,
            this.time
          );
          let position = createVector(
            (this.size.x / this.col) * x + yOffset,
            (this.size.y / this.row) * y + xOffset
          ).add(this.start);

          noFill();
          stroke(
            lerpColor(
              color("#663ace"),
              color("#ff75ff"),
              ((this.col * this.row - (this.row * x + y)) * 0.75) /
                (this.col * this.row)
            )
          );
          strokeWeight(5);

          point(position.x, position.y);
        }
      }
    }
  }

  this.time = 0;
  this.particleEmitters = [];
  this.dotGrid = new DotGrid();

  this.setup = function () {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
    let emitterA = new ParticleEmitter(
      color("#e66cfb"),
      createVector(12, 46),
      8,
      0.3,
      160,
      3.125,
      true,
      0.5,
      createVector(22, 18),
      0.18,
      createVector(0, -21),
      createVector(width / 2, height * 1.25),
      createVector(width * 1.25, 50)
    );
    let emitterB = new ParticleEmitter(
      color("#fc0f01"),
      createVector(4, 11),
      1,
      0.5,
      12,
      6,
      true,
      0.8,
      createVector(13, 6),
      0.18,
      createVector(0, -12),
      createVector(width / 2, height * 1.25),
      createVector(width * 1.25, 50)
    );
    let emitterC = new ParticleEmitter(
      color("#2724d8"),
      createVector(22, 42),
      3,
      0.4,
      32,
      3,
      true,
      0.875,
      createVector(11, 6),
      0.18,
      createVector(0, -38),
      createVector(width / 2, height * 1.25),
      createVector(width * 1.25, 50)
    );
    this.particleEmitters = [emitterA, emitterB, emitterC];
    let emitterD = new ParticleEmitter(
      color("#ffc862"),
      createVector(12, 16),
      2,
      0.5,
      46,
      7,
      false,
      0.5,
      createVector(16, 3),
      0.18,
      createVector(-2, -16),
      createVector(width / 2, height * 1.25),
      createVector(width * 1.25, 50)
    );
    let emitterE = new ParticleEmitter(
      color("#7343ea"),
      createVector(15, 65),
      6,
      0.3,
      81,
      4,
      true,
      0.625,
      createVector(16, 18),
      0.18,
      createVector(0, -21),
      createVector(width / 2, height * 1.25),
      createVector(width * 1.25, 50)
    );
    let emitterF = new ParticleEmitter(
      color("#e66cfb"),
      createVector(12, 46),
      8,
      0.3,
      200,
      3.125,
      true,
      0.5,
      createVector(22, 18),
      0.18,
      createVector(0, -38),
      createVector(width / 2, height * 1.25),
      createVector(width, 50)
    );
    this.particleEmitters = [
      emitterA,
      emitterB,
      emitterC,
      emitterD,
      emitterE,
      emitterF,
    ];
  };

  this.draw = function () {
    background(color("#010068"));
    this.time += deltaTime / 1000;

    this.dotGrid.renderGrid(this.time);

    for (let e = 0; e < this.particleEmitters.length; e++) {
      if (e == 5) {
        noStroke();
        fill(0);
        let gradient = drawingContext.createLinearGradient(
          0,
          height * 1.25,
          width,
          height / 2
        );
        gradient.addColorStop(0, color("#010068F9"));
        gradient.addColorStop(1, color("#090C7D00"));
        drawingContext.fillStyle = gradient;

        rect(0, 0, width, height);
      }
      this.particleEmitters[e].renderParticles(this.time);
    }
  };
}

// Cracks Scene
function Logo_Cracks() {
  this.voronoi; //object voronoi
  this.bbox; //The box that contains the cells

  // A site is a coord (x,y) for compute a cell
  this.sites; //[ {x: 200, y: 200}, {x: 50, y: 250}, {x: 400, y: 100} /* , ... */ ];

  // Variables for voronoi computing
  this.diagram;
  this.edgs;
  this.cells;

  //Variables for numer of cells in a grid. For random cells, just fill the number of cols.
  this.cols = 12;
  this.rows = 16;
  this.lines = 7;

  this.time = 0;
  this.vorSpeed = 0.05;

  this.setup = function () {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);

    this.voronoi = new Voronoi(); //Declare Voronoi object

    this.bbox = { xl: 0, xr: width, yt: 0, yb: height }; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom

    //Create an empty array for the coord of all sites
    this.sites = []; //[ {x: 200, y: 200}, {x: 50, y: 250}, {x: 400, y: 100} /* , ... */ ];

    // Phased Voronoi
    let siteArray = [];
    for (let x = 0; x < cols; x++) {
      let siteRow = [];
      for (let y = 0; y < rows; y++) {
        let sX = SineWave(
          width / 2,
          (x + y) / 12,
          x,
          width / 2,
          this.vorSpeed,
          this.time
        );
        let sY = SineWave(
          height / 2,
          (x + y) / 12,
          y,
          height / 2,
          this.vorSpeed,
          this.time
        );
        siteRow.push({ x: sX, y: sY });
      }
      siteArray.push(siteRow);
    }
    this.sites = siteArray.flat();

    //Object that contains the data for computing
    this.diagram = this.voronoi.compute(this.sites, this.bbox);
  };

  this.draw = function () {
    background(0);

    this.time += deltaTime / 1000;

    // you can use a stroke color
    noStroke();

    //we need to create 2 array for ref to each cells and edges
    this.edgs = this.diagram.edges;
    this.cells = this.diagram.cells;

    //Position of the moving cell in voronoi
    let siteArray = [];
    for (let x = 0; x < cols; x++) {
      let siteRow = [];
      for (let y = 0; y < rows; y++) {
        let sX = SineWave(
          width / 2,
          (x + y) / 12,
          x,
          width / 2,
          this.vorSpeed,
          this.time
        );
        let sY = SineWave(
          height / 2,
          (x + y) / 12,
          y,
          height / 2,
          this.vorSpeed,
          this.time
        );
        siteRow.push({ x: sX, y: sY });
      }
      siteArray.push(siteRow);
    }
    this.sites = siteArray.flat();

    //execute the voronoi each frame
    this.diagram = this.voronoi.compute(this.sites, this.bbox);

    //render the voronoi
    //for each cell in the array of cells
    for (let i = 0; i < this.cells.length; i++) {
      //var cell is a ref to the cell
      let cell = this.cells[i];
      //We need to know how many vertices for each cell
      let lon = cell.halfedges.length;
      //for colors
      fill(color("white"));
      stroke(color("black"));
      strokeWeight(map(getSiteSize(this.cells[i], lon), 0, 8000, 1, 12));
      strokeJoin(ROUND);

      //let draw a cell
      beginShape();
      for (let j = 0; j < lon; j++) {
        //we draw each vertice from the starting point
        vertex(
          this.cells[i].halfedges[j].getStartpoint().x,
          this.cells[i].halfedges[j].getStartpoint().y
        );
      }
      //With CLOSE we don't need the end Point
      endShape(CLOSE);
    }
  };

  function getSiteSize(cell, lon) {
    let points = [];
    for (let j = 0; j < lon; j++) {
      //we draw each vertice from the starting point
      points.push(
        createVector(
          cell.halfedges[j].getStartpoint().x,
          cell.halfedges[j].getStartpoint().y
        )
      );
    }

    return calcPolygonArea(points);
  }

  function calcPolygonArea(vertices) {
    var total = 0;

    for (var i = 0, l = vertices.length; i < l; i++) {
      var addX = vertices[i].x;
      var addY = vertices[i == vertices.length - 1 ? 0 : i + 1].y;
      var subX = vertices[i == vertices.length - 1 ? 0 : i + 1].x;
      var subY = vertices[i].y;

      total += addX * addY * 0.5;
      total -= subX * subY * 0.5;
    }

    return Math.abs(total);
  }
}

// Collapse Scene
function Logo_Collapse() {
  class TileRenderer {
    constructor(canvasGraphic) {
      this.time = 0;

      this.canvas = canvasGraphic;

      this.rows = 28;
      this.columns = 14;

      this.tileSpeed = 12;

      this.graphic = createGraphics(width, height);
    }

    renderCollapse() {
      // Update the tile graphic
      this.renderTiles();

      // Create the planes
      this.canvas.texture(this.graphic);
      this.canvas.rotateX(45);
      this.canvas.noStroke();
      this.canvas.plane(width * 2);

      this.canvas.rotateX(90);
      this.canvas.plane(width * 2);
    }

    renderTiles() {
      this.time += deltaTime / 1000;

      let tileSize = createVector(
        this.graphic.width / this.columns,
        this.graphic.height / this.rows
      );
      for (let x = 0; x < this.columns; x++) {
        for (let y = 0; y < this.rows * 2; y++) {
          let start = createVector(tileSize.x * x, tileSize.y * y);
          let yOffset = (this.time * this.tileSpeed) % this.graphic.height;
          start.add(createVector(0, -yOffset));

          this.graphic.noStroke();
          this.graphic.fill(color("black"));
          if ((x + y) % 2 == 0) {
            this.graphic.fill(color("white"));
          }

          this.graphic.rect(start.x, start.y, tileSize.x, tileSize.y);
        }
      }
    }
  }

  this.canvasGraphic = createGraphics(
    mgr.canvasSize.x,
    mgr.canvasSize.y,
    WEBGL
  );
  this.tileRenderer = new TileRenderer(this.canvasGraphic);

  function setup() {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
    this.canvasGraphic.angleMode(DEGREES);
    this.canvasGraphic.perspective(125, 1, 0.1, width / 2);
    this.canvasGraphic.camera(0, 0, 250, 0, 0, 0);
  }

  this.draw = function () {
    this.canvasGraphic.background(220);
    this.tileRenderer.renderCollapse();
    image(this.tileRenderer.canvas, 0, 0);
  };
}

// Clock Scene
function Logo_Clock() {
  class ClockRenderer {
    constructor() {
      this.renderDebug = false;

      // Guides
      this.marginTop = 55;
      this.marginLeft = 72;
      this.marginRight = 68;
      this.marginBottom = 50;
      this.colWidth = 237;
      this.col1 = createVector(
        this.marginLeft,
        this.marginLeft + this.colWidth
      );
      this.col2 = createVector(
        width - this.marginRight - this.colWidth,
        width - this.marginRight
      );

      // Text
      this.textDisplay = [
        [
          new TimeText("It is", 1, true),
          new TimeText("a", 1, false),
          new TimeText("ten", 2, true),
          new TimeText("quarter", 2, false),
        ],
        [
          new TimeText("twenty", 1, true),
          new TimeText("five", 1, false),
          new TimeText("half", 2, true),
          new TimeText("past", 2, false),
        ],
        [
          new TimeText("to", 1, true),
          new TimeText("one", 1, false),
          new TimeText("two", 2, true),
          new TimeText("three", 2, false),
        ],
        [
          new TimeText("four", 1, true),
          new TimeText("five", 1, false),
          new TimeText("six", 2, true),
          new TimeText("seven", 2, false),
        ],
        [
          new TimeText("eight", 1, true),
          new TimeText("nine", 1, false),
          new TimeText("ten", 2, true),
          new TimeText("eleven", 2, false),
        ],
        [new TimeText("tweleve", 1, true), new TimeText("o'clock", 2, true)],
      ];

      // Display
      this.textActiveColor = color("white");
      this.textInactiveColor = color("rgba(255,255,255,0.25)");
      this.textSize = 50;
      this.textRowHeight = min(
        (height - (this.marginTop + this.marginBottom)) /
          this.textDisplay.length,
        this.textSize * 1.5
      );
    }

    renderClock() {
      if (this.renderDebug) {
        this.renderGuides();
      }
      this.getTimeAsText();
      this.renderTextDisplay();
    }

    renderGuides() {
      noFill();
      stroke(color("rgb(0,255,255)"));
      strokeWeight(1);

      line(this.col1.x, 0, this.col1.x, height);
      line(this.col1.y, 0, this.col1.y, height);
      line(this.col2.x, 0, this.col2.x, height);
      line(this.col2.y, 0, this.col2.y, height);
      line(0, this.marginTop, width, this.marginTop);
      line(0, height - this.marginBottom, width, height - this.marginBottom);
    }

    getTimeAsText() {
      // Set all text to inactive
      for (let x = 0; x < this.textDisplay.length; x++) {
        for (let y = 0; y < this.textDisplay[x].length; y++) {
          this.textDisplay[x][y].setActive(false);
        }
      }

      let prefix = this.getPrefixText();

      // Get minute text
      let minuteText = this.getMinuteText();

      /// Get Preposition
      let preposition = this.getPrepositionText();

      // Get Hour
      let hourText = this.getHourText();

      return [prefix, minuteText, preposition, hourText].join(" ");
    }

    getPrefixText() {
      let minuteValue = floor((minute() + 1) / 5);
      switch (minuteValue) {
        case 0:
        default:
          return "";
        case 1:
        case 2:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 10:
        case 11:
          this.textDisplay[0][0].setActive(true);
          return "It is";
        case 3:
        case 9:
          this.textDisplay[0][0].setActive(true);
          this.textDisplay[0][1].setActive(true);
          return "It is a";
      }
    }

    getHourText() {
      let hourValue = this.wrapHour(hour());
      if (minute() + 1 > 30) {
        hourValue = this.wrapHour(hour() + 1);
      }

      let hourText = "zero";
      switch (hourValue) {
        case 1:
          this.textDisplay[2][1].setActive(true);
          hourText = "one";
          break;
        case 2:
          this.textDisplay[2][2].setActive(true);
          hourText = "two";
          break;
        case 3:
          this.textDisplay[2][3].setActive(true);
          hourText = "three";
          break;
        case 4:
          this.textDisplay[3][0].setActive(true);
          hourText = "four";
          break;
        case 5:
          this.textDisplay[3][1].setActive(true);
          hourText = "five";
          break;
        case 6:
          this.textDisplay[3][2].setActive(true);
          hourText = "six";
          break;
        case 7:
          this.textDisplay[3][3].setActive(true);
          hourText = "seven";
          break;
        case 8:
          this.textDisplay[4][0].setActive(true);
          hourText = "eight";
          break;
        case 9:
          this.textDisplay[4][1].setActive(true);
          hourText = "nine";
          break;
        case 10:
          this.textDisplay[4][2].setActive(true);
          hourText = "ten";
          break;
        case 11:
          this.textDisplay[4][3].setActive(true);
          hourText = "eleven";
          break;
        case 12:
          this.textDisplay[5][0].setActive(true);
          hourText = "tweleve";
          break;
      }

      let suffix = "";
      if (minute() == 0) {
        this.textDisplay[5][1].setActive(true);
        suffix = " o'clock";
      }

      return hourText + suffix;
    }

    wrapHour(hour) {
      return hour % 12;
    }

    getMinuteText() {
      let minuteValue = floor((minute() + 1) / 5);
      switch (minuteValue) {
        case 0:
        default:
          return "";
        case 1:
        case 11:
          this.textDisplay[1][1].setActive(true);
          return "five";
        case 2:
        case 10:
          this.textDisplay[0][2].setActive(true);
          return "ten";
        case 3:
        case 9:
          this.textDisplay[0][1].setActive(true);
          this.textDisplay[0][3].setActive(true);
          return "a quarter";
        case 4:
        case 8:
          this.textDisplay[1][0].setActive(true);
          return "twenty";
        case 5:
        case 7:
          this.textDisplay[1][0].setActive(true);
          this.textDisplay[1][1].setActive(true);
          return "twenty five";
        case 6:
          this.textDisplay[1][2].setActive(true);
          return "half";
      }
    }

    getPrepositionText() {
      let minuteValue = floor((minute() + 1) / 5);
      switch (minuteValue) {
        case 0:
        default:
          return "";
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
          this.textDisplay[1][3].setActive(true);
          return "past";
        case 7:
        case 8:
        case 9:
        case 10:
        case 11:
          this.textDisplay[2][0].setActive(true);
          return "to";
      }
    }

    renderTextDisplay() {
      for (let y = 0; y < this.textDisplay.length; y++) {
        for (let i = 0; i < this.textDisplay[y].length; i++) {
          // Render the text
          noStroke();
          fill(this.textInactiveColor);
          if (this.textDisplay[y][i].active) {
            fill(this.textActiveColor);
          }
          textSize(this.textSize);
          textFont("IBM Plex Sans");
          textAlign(LEFT);
          let renderCol = this.col1;
          if (this.textDisplay[y][i].col == 2) {
            renderCol = this.col2;
          }
          let xPosition = renderCol.x;
          if (!this.textDisplay[y][i].start) {
            textAlign(RIGHT);
            xPosition = renderCol.y;
          }
          let yPosition =
            y * this.textRowHeight + this.marginTop + this.textSize;

          text(this.textDisplay[y][i].text, xPosition, yPosition);
        }
      }
    }
  }

  class TimeText {
    constructor(text, col, start) {
      this.text = text;
      this.col = col;
      this.start = start;
      if (start === undefined) {
        this.start = false;
      }
      this.active = true;
    }

    setActive(active) {
      this.active = active;
    }
  }

  this.clockRenderer = new ClockRenderer();

  this.setup = function () {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
  };

  this.draw = function () {
    background(0);
    this.clockRenderer.renderClock();
  };
}

// Type Scene
function Logo_Type()
{
  class TypeRenderer
    {
      constructor(graphic)
      {
        this.graphic = graphic;
        this.brightnessAdjust = -40;
        this.contrastAdjust = 1.65;
        
        this.characters = ['N', 'O', 'U', 'I', 'n', 'o', 'u', 'i', ' '];
      }
      
      renderType(frame)
      {
        // Get graphic brightness
        let brightnessArray = this.getBrightness(frame);
        // Covert the brightness to type
        let typeArray = this.brightnessToType(brightnessArray);
        
        // Render the type array to the canvas
        this.renderTypeArray(typeArray);
      }
      
      getBrightness(frame)
      {
        let imageFrame = this.getGifFrame(frame);
        // loadPixels();
        imageFrame.loadPixels();
        
        let brightnessArray = [];
        // Iterate over the graphic height
        for(let y = 0; y < this.graphic.height; y++)
          {
            let brightnessRow = [];
            // Iterate over the graphic width
            for(let x = 0; x < this.graphic.width; x++)
              {
                let index = (x + y * this.graphic.width) * 4;
                
                let r = imageFrame.pixels[index + 0];
                let g = imageFrame.pixels[index + 1];
                let b = imageFrame.pixels[index + 2];
                
                let brightness = Clamp((this.averageBrightness([r,g,b]) + this.brightnessAdjust) * this.contrastAdjust, 0, 255);
                
                brightnessRow.push(brightness);
              }
            brightnessArray[y] = brightnessRow;
          }
        
        return brightnessArray;
      }
      
      averageBrightness(rgb)
      {
        return (rgb[0] + rgb[1] + rgb[2]) / 3;
      }
      
      brightnessToType(brightnessArray)
      {
        let typeArray = [];
        // Iterate over the graphic height
        for(let y = 0; y < this.graphic.height; y++)
          {
            let typeRow = [];
            // Iterate over the graphic width
            for(let x = 0; x < this.graphic.width; x++)
              {
                let brightness = brightnessArray[x][y];
                
                let character = this.convertToType(brightness);
                
                typeRow.push(character);
              }
            typeArray[y] = typeRow;
          }
        
        return typeArray;
      }
      
      convertToType(brightness)
      {
        let index = ceil(map(floor(brightness), 255, 0, 0, this.characters.length - 1));
        return this.characters[index];
      }
      
      renderTypeArray(typeArray)
      {
        // Black out the background
        background(0);
        
        // Get the size of the type based on the scale difference between the canvas and the graphic
        let typeWidth = (width / this.graphic.width);
        let typeHeight = (height / this.graphic.height);
        
        for(let x = 0; x < width / (width / this.graphic.width); x++)
          {
            for(let y = 0; y < height / (height / this.graphic.height); y++)
              {
                noStroke();
                fill(color('white'));
                textStyle(NORMAL);
                textAlign(CENTER, CENTER);
                textSize(min(typeWidth, typeHeight));
                
                text(typeArray[x][y], (x * typeWidth) + (typeWidth / 2), (y * typeHeight) + (typeHeight / 2));
              }
          }
      }
      
      getGifFrame(frame)
      {
        let gifClone = this.graphic.get();
        // access original gif properties
        let gp = this.graphic.gifProperties;
        // make a new object for the clone
        gifClone.gifProperties = {
          displayIndex: gp.displayIndex,
          // we still point to the original array of frames
          frames: gp.frames,
          lastChangeTime: gp.lastChangeTime,
          loopCount: gp.loopCount,
          loopLimit: gp.loopLimit,
          numFrames: gp.numFrames,
          playing: gp.playing,
          timeDisplayed: gp.timeDisplayed
        };
        // optional tweak the start frame
        gifClone.setFrame(frame % gp.numFrames);

        return gifClone;
      }
    }
  
  this.typeRenderer = new TypeRenderer(effectImg);
  this.time = 0;

  this.setup = function () {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
    this.typeRenderer.renderType(floor(this.time));
  };

  this.draw = function() {
    // background(0);
    this.time += deltaTime / 90;
    
    this.typeRenderer.renderType(floor(this.time));
  }
}

// Zigxel Scene
function Logo_Zigxel()
{
  class ZigxelRenderer
    {
      constructor(graphic)
      {
        this.graphic = graphic;
        
        this.baseZigs = 4;
        this.valueStops = 5;
        this.sourceSampleRate = 2; // The number of pixels that are sampled during the read of brightness from the source image, 1 is all pixels, 2 is every other, etc
        
        this.brightnessAdjust = -30;
        this.contrastAdjust = 1.35;

        this.strokeSize = 1;
      }
      
      renderZigxelImage(frame)
      {
        // Get graphic brightness
        let brightnessArray = this.getBrightness(frame);
        // Covert the brightness to values
        let valueArray = this.brightnessToValue(brightnessArray);
        
        // Render the zigxels array to the canvas
        this.renderZigxels(valueArray);
      }
      
      getBrightness(frame)
      {
        let imageFrame = this.getGifFrame(frame);
        // loadPixels();
        imageFrame.loadPixels();
        
        let brightnessArray = [];
        // Iterate over the graphic height
        for(let y = 0; y < floor(this.graphic.height / this.sourceSampleRate); y++)
          {
            let brightnessRow = [];
            // Iterate over the graphic width
            for(let x = 0; x < floor(this.graphic.width / this.sourceSampleRate); x++)
              {
                let index = ((x * this.sourceSampleRate) + (y * this.sourceSampleRate) * this.graphic.width) * 4;
                
                let r = imageFrame.pixels[index + 0];
                let g = imageFrame.pixels[index + 1];
                let b = imageFrame.pixels[index + 2];
                
                let brightness = Clamp((this.averageBrightness([r,g,b]) + this.brightnessAdjust) * this.contrastAdjust, 0, 255);
                
                brightnessRow.push(brightness);
              }
            brightnessArray[y] = brightnessRow;
          }
        
        return brightnessArray;
      }
      
      averageBrightness(rgb)
      {
        return (rgb[0] + rgb[1] + rgb[2]) / 3;
      }
      
      brightnessToValue(brightnessArray)
      {
        let valueArray = [];
        // Iterate over the graphic height
        for(let y = 0; y < floor(this.graphic.height / this.sourceSampleRate); y++)
          {
            let valueRow = [];
            // Iterate over the graphic width
            for(let x = 0; x < floor(this.graphic.width / this.sourceSampleRate); x++)
              {
                let brightness = brightnessArray[x][y];
                
                let remappedValue = floor(map(floor(brightness), 255, 0, 0, this.valueStops - 1));
                
                valueRow.push(remappedValue);
              }
            valueArray[y] = valueRow;
          }
        
        return valueArray;
      }
      
      renderZigxels(valueArray)
      {
        // White out the background
        background(255);
        
        // Get the size of the zigxel based on the scale difference between the canvas and the graphic
        let zigxelWidth = (width / (this.graphic.width / this.sourceSampleRate));
        let zigxelHeight = (height / (this.graphic.height / this.sourceSampleRate));
        
        for(let x = 0; x < width / (width / (this.graphic.width / this.sourceSampleRate)); x++)
          {
            for(let y = 0; y < height / (height / (this.graphic.height / this.sourceSampleRate)); y++)
              {
                let position = createVector(x * (width / (this.graphic.width / this.sourceSampleRate)), y * (height / (this.graphic.height / this.sourceSampleRate)));
                let size = createVector(zigxelWidth, zigxelHeight);
                let direction = ((x + y * (width / (width / (this.graphic.width / this.sourceSampleRate)))) % 2) == 1;
                this.renderZigxel(position, size, direction, valueArray[x][y]);
              }
          }
      }
      
      renderZigxel(position, size, direction, value)
        {
          let lineCount = this.baseZigs * value;

          // Get Edge Points
          let top = [];
          let left = [];
          let right = [];
          let bottom = [];
          for(let l = 0; l < (lineCount/2); l++)
            {
              top.push(createVector(position.x + ((size.x / (lineCount/2)) * l) + ((size.x / (lineCount/2)) / 2), position.y))
              left.push(createVector(position.x, position.y - (position.x - (position.x + ((size.x / (lineCount/2)) * l) + ((size.x / (lineCount/2)) / 2)))));
              right.push(createVector(position.x + size.x, position.y - (position.x - (position.x + ((size.x / (lineCount/2)) * l) + ((size.x / (lineCount/2)) / 2)))));
              bottom.push(createVector(position.x + ((size.x / (lineCount/2)) * l) + ((size.x / (lineCount/2)) / 2), position.y + size.y));
            }

          let connectedEdges1 = [top, left];
          let connectedEdges2 = [right, bottom];

          if(!direction)
            {
              connectedEdges1 = [left.reverse(), bottom];
              connectedEdges2 = [top.reverse(), right];
            }

          // Connect the edge points with lines
          for(let e = 0; e < connectedEdges1[0].length; e++)
            {
              let start1 = connectedEdges1[0][e];
              let end1 = connectedEdges1[1][e];

              let start2 = connectedEdges2[0][e];
              let end2 = connectedEdges2[1][e];

              noFill();
              stroke(color('black'));
              strokeWeight(this.strokeSize);

              line(start1.x, start1.y, end1.x, end1.y);
              line(start2.x, start2.y, end2.x, end2.y);
            }
        }
      
      getGifFrame(frame)
      {
        let gifClone = this.graphic.get();
        // access original gif properties
        let gp = this.graphic.gifProperties;
        // make a new object for the clone
        gifClone.gifProperties = {
          displayIndex: gp.displayIndex,
          // we still point to the original array of frames
          frames: gp.frames,
          lastChangeTime: gp.lastChangeTime,
          loopCount: gp.loopCount,
          loopLimit: gp.loopLimit,
          numFrames: gp.numFrames,
          playing: gp.playing,
          timeDisplayed: gp.timeDisplayed
        };
        // optional tweak the start frame
        gifClone.setFrame(frame % gp.numFrames);

        return gifClone;
      }
    }
  
  this.zigxelRenderer = new ZigxelRenderer(effectImg);
  this.time = 0;

  this.setup = function () {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
    this.zigxelRenderer.renderZigxelImage(floor(this.time));
  };

  this.draw = function() {
    // background(0);
    this.time += deltaTime / 125;
    this.zigxelRenderer.renderZigxelImage(floor(this.time));
  }
}

// Diagram Scene
function Logo_Diagram()
{
  class CircleGenerator
    {
      constructor()
      {
        this.count = 32;
        
        this.circles = [];
        this.linkedCircles = [];
        this.tangentCircles = [];
        this.patternCircles = [];
        
        this.linkChance = 0.01;
        this.linkMax = round(this.count / 3);
        this.tangentChance = 0.009;
        this.tangentMax = round(this.count / 4);
        this.circleSizes = createVector(15,50);
        
        this.tangentFills = [color('#FFC107'), color('#2196F3'), color('#E91E81')];
        
        this.generateCircles();
      }
      
      generateCircles()
      {
        while(this.circles.length < this.count)
          {
            let radius = random(this.circleSizes.x, this.circleSizes.y);
            let center = createVector(random(radius, width - radius), random(radius, width - radius));
            
            if(this.checkValidSpawn(center, radius))
              {
                let drawRadius = floor(random(0,2)) >= 1;
                let fillCircle = floor(random(0,4)) >= 3;
                let patternCircle = floor(random(0,3)) >= 2;
                this.circles.push(new CircleObject(this, this.circles.length, center, radius, drawRadius, fillCircle, patternCircle));
                if(patternCircle)
                  {
                    this.patternCircles.push(this.circles.length - 1);
                  }
              }
            
            // Try to link the most recent two circles
            if(random(0,1) > 1 - this.linkChance && this.circles.length > 1 && this.linkedCircles.length <= this.linkMax)
              {
                this.linkedCircles.push([this.circles.length - 1, this.circles.length - 2]);
              }
            
            // Try to tangent the most recent three circles
            if(this.circles.length > 5 && ((random(0,1) > 1 - this.tangentChance && this.tangentCircles.length <= this.tangentMax) || this.tangentCircles < 1))
              {
                let centerIndex = floor(random(1, this.circles.length - 2));
                this.tangentCircles.push([centerIndex - 1, centerIndex, centerIndex + 1]);
              }
          }
      }
      
      renderCircles()
      {
        // // Remove the old pattern elements
        // for(let e = 0; e < patternElements.length; e++)
        //   {
        //     patternElements[e].remove();
        //   }
        // patternElements = [];
        
        // Update the physics
        for(let c of this.circles)
          {
              c.moveCircle();
              c.bounceCircle();
              c.renderCircle();
              // for(let other of this.circles)
              //   {
              //       if (c !== other && c.intersects(other))
              //       {
              //         // The ball is bouncing off another ball
              //           // let xVelocity = max(other.velocity.x, c.velocity.x);
              //           // let yVelocity = max(other.velocity.y, c.velocity.y);
              //           // c.velocity.x = xVelocity;
              //           // c.velocity.y = yVelocity;
              //           // other.velocity.x = xVelocity;
              //           // other.velocity.y = yVelocity;
                      
              //           other.velocity.x *= -1;
              //           other.velocity.y *= -1;
              //       }
              //   }
          }
        
        // Render the tangent circles
        for(let t = 0; t < this.tangentCircles.length; t++)
          {
            // Get the points on each circle that point towards the other
            let circleA = this.circles[this.tangentCircles[t][0]];
            let circleB = this.circles[this.tangentCircles[t][1]];
            let circleC = this.circles[this.tangentCircles[t][2]];
            
            let tangentABLines = this.getCommonTangentLines(circleA.position, circleA.radius, circleB.position, circleB.radius);
            let tangentLineAB = this.getClosestTangent(circleC.position, tangentABLines);
            
            let tangentACLines = this.getCommonTangentLines(circleA.position, circleA.radius, circleC.position, circleC.radius);
            let tangentLineAC = this.getClosestTangent(circleB.position, tangentACLines);
            
            let tangentBCLines = this.getCommonTangentLines(circleB.position, circleB.radius, circleC.position, circleC.radius);
            let tangentLineBC = this.getClosestTangent(circleA.position, tangentBCLines);
            
            let allTangents = [tangentLineAB, tangentLineAC, tangentLineBC];
            
            let lineAPoint1 = createVector(0, -(tangentLineAB.a * 0 + tangentLineAB.c) / tangentLineAB.b);
            let lineAPoint2 = createVector(width, -(tangentLineAB.a * width + tangentLineAB.c) / tangentLineAB.b);
            
            let lineBPoint1 = createVector(0, -(tangentLineAC.a * 0 + tangentLineAC.c) / tangentLineAC.b);
            let lineBPoint2 = createVector(width, -(tangentLineAC.a * width + tangentLineAC.c) / tangentLineAC.b);
            
            let lineCPoint1 = createVector(0, -(tangentLineBC.a * 0 + tangentLineBC.c) / tangentLineBC.b);
            let lineCPoint2 = createVector(width, -(tangentLineBC.a * width + tangentLineBC.c) / tangentLineBC.b);
            
            let pointA = this.getLinesIntersection(lineAPoint1, lineAPoint2, lineBPoint1, lineBPoint2);
            let pointB = this.getLinesIntersection(lineCPoint1, lineCPoint2, lineBPoint1, lineBPoint2);
            let pointC = this.getLinesIntersection(lineCPoint1, lineCPoint2, lineAPoint1, lineAPoint2);
            
            // Render the tangent points
            noFill();
            stroke(color('black'));
            strokeWeight(4);
            
            point(pointA.x,pointA.y);
            point(pointB.x,pointB.y);
            point(pointC.x,pointC.y);
            
            // Render the tangent fills
            let tangentShapes = [[lineAPoint1, lineBPoint1, lineBPoint2, lineAPoint2], [lineCPoint1, lineBPoint1, lineBPoint2, lineCPoint2], [lineCPoint1, lineAPoint1, lineAPoint2, lineCPoint2]];
            for(let s = 0; s < tangentShapes.length; s++)
              {
                let shapeColor = this.tangentFills[s % this.tangentFills.length];
                
                blendMode(OVERLAY);
                noStroke();
                fill(shapeColor);
                drawingContext.setLineDash([0,0]);
                
                let shape = tangentShapes[s];
                beginShape();
                for(let v = 0; v < shape.length; v++)
                  {
                    vertex(shape[v].x, shape[v].y)
                  }

                endShape();
              }
            
            // Render the tangent lines
            for(let l = 0; l < allTangents.length; l++)
              {
                let pointA = createVector(0, -(allTangents[l].a * 0 + allTangents[l].c) / allTangents[l].b);
                let pointB = createVector(width, -(allTangents[l].a * width + allTangents[l].c) / allTangents[l].b);
                
                blendMode(BLEND);
                noFill();
                stroke(color('black'));
                strokeWeight(1);
                drawingContext.setLineDash([0,0]);

                line(pointA.x, pointA.y, pointB.x, pointB.y);
              }
          }
        
        // Render circles
        for(let c = 0; c < this.circles.length; c++)
          {
            this.circles[c].renderCircle();
          }
        
        // Render the linked circles
        for(let l = 0; l < this.linkedCircles.length; l++)
          {
            // Get the points on each circle that point towards the other
            let circleA = this.circles[this.linkedCircles[l][0]];
            let circleB = this.circles[this.linkedCircles[l][1]];
            
            let circleAPoint = circleA.getNearestPointOnCircle(circleB.position);
            let circleBPoint = circleB.getNearestPointOnCircle(circleA.position);
            
            // Render the connecting line
            noFill();
            stroke(color('black'));
            strokeWeight(1);
            drawingContext.setLineDash([8,8]);
            
            line(circleAPoint.x, circleAPoint.y, circleBPoint.x, circleBPoint.y);
          }
      }
      
      checkValidSpawn(center, radius)
      {
        for(let c = 0; c < this.circles.length; c++)
          {
            if(this.circles[c].isWithinRadius(center, radius))
              {
                return false;
              }
          }
        return true;
      }
      
      getCommonTangentLines(center1, radius1, center2, radius2)
        {
          // Compute the common tangent line of two circles: (center1.x, center1.y) - radius1 and (center2.x, center2.y) - radius2
          // Return in the form of line equation: ax + by + c == 0
          let delta1 = (center1.x - center2.x) * (center1.x - center2.x) + (center1.y - center2.y) * (center1.y - center2.y) - (radius1 + radius2) * (radius1 + radius2);
          let delta2 = (center1.x - center2.x) * (center1.x - center2.x) + (center1.y - center2.y) * (center1.y - center2.y) - (radius1 - radius2) * (radius1 - radius2);
          let p1 = radius1 * (center1.x * center2.x + center1.y * center2.y - center2.x * center2.x - center2.y * center2.y);
          let p2 = radius2 * (center1.x * center1.x + center1.y * center1.y - center1.x * center2.x - center1.y * center2.y);
          let q = center1.x * center2.y - center2.x * center1.y;
          let results = [];
          if(delta1 >= 0) {
            let l11 = {
              a: (center2.x - center1.x) * (radius1 + radius2) + (center1.y - center2.y) * Math.sqrt(delta1),
              b: (center2.y - center1.y) * (radius1 + radius2) + (center2.x - center1.x) * Math.sqrt(delta1),
              c: p1 + p2 + q * Math.sqrt(delta1)
            };
            let l12 = {
              a: (center2.x - center1.x) * (radius1 + radius2) - (center1.y - center2.y) * Math.sqrt(delta1),
              b: (center2.y - center1.y) * (radius1 + radius2) - (center2.x - center1.x) * Math.sqrt(delta1),
              c: p1 + p2 - q * Math.sqrt(delta1)
            };
            results.push(l11);
            results.push(l12);
          }
          if(delta2 >= 0) {
            let l21 = {
              a: (center2.x - center1.x) * (radius1 - radius2) + (center1.y - center2.y) * Math.sqrt(delta2),
              b: (center2.y - center1.y) * (radius1 - radius2) + (center2.x - center1.x) * Math.sqrt(delta2),
              c: p1 - p2 + q * Math.sqrt(delta2)
            };
            let l22 = {
              a: (center2.x - center1.x) * (radius1 - radius2) - (center1.y - center2.y) * Math.sqrt(delta2),
              b: (center2.y - center1.y) * (radius1 - radius2) - (center2.x - center1.x) * Math.sqrt(delta2),
              c: p1 - p2 - q * Math.sqrt(delta2)
            };
            results.push(l21);
            results.push(l22);
          }
          return results;
        }
      
      getClosestTangent(center, lines)
      {
        let closestLine;
        let closestDistance;
        
        for(let l = 0; l < lines.length; l++)
          {
            let lineEquation = lines[l];
            let pointA = createVector(0, -(lineEquation.a * 0 + lineEquation.c) / lineEquation.b);
            let pointB = createVector(width, -(lineEquation.a * width + lineEquation.c) / lineEquation.b);
            
            let lineDist = this.getDistanceToLine(center, pointA, pointB);
            
            if(closestDistance === undefined || lineDist < closestDistance)
              {
                closestDistance = lineDist;
                closestLine = lines[l];
              }
          }
        
        return closestLine;
      }
      
      getDistanceToLine(center, linePoint1, linePoint2)
      {
        return Math.abs(((center.x * (linePoint2.y - linePoint1.y)) - (center.y * (linePoint2.x - linePoint1.x)) + (linePoint2.x * linePoint1.y) - (linePoint2.y * linePoint1.x))) / Math.sqrt(((linePoint2.y - linePoint1.y) ^ 2) + ((linePoint2.x - linePoint1.x) ^ 2));
      }
      
      getLinesIntersection(line1Point1, line1Point2, line2Point1, line2Point2)
        {
            var ua, ub, denom = (line2Point2.y - line2Point1.y)*(line1Point2.x - line1Point1.x) - (line2Point2.x - line2Point1.x)*(line1Point2.y - line1Point1.y);
            if (denom == 0) {
                return null;
            }
            ua = ((line2Point2.x - line2Point1.x)*(line1Point1.y - line2Point1.y) - (line2Point2.y - line2Point1.y)*(line1Point1.x - line2Point1.x))/denom;
            ub = ((line1Point2.x - line1Point1.x)*(line1Point1.y - line2Point1.y) - (line1Point2.y - line1Point1.y)*(line1Point1.x - line2Point1.x))/denom;
            return {
                x: line1Point1.x + ua * (line1Point2.x - line1Point1.x),
                y: line1Point1.y + ua * (line1Point2.y - line1Point1.y),
                seg1: ua >= 0 && ua <= 1,
                seg2: ub >= 0 && ub <= 1
            };
        }
      
      renderTangentLines(lines)
      {
        for(let l = 0; l < lines.length; l++)
          {
            let lineEquation = lines[l];
            let pointA = createVector(0, -(lineEquation.a * 0 + lineEquation.c) / lineEquation.b);
            let pointB = createVector(width, -(lineEquation.a * width + lineEquation.c) / lineEquation.b);
            
            let randomColor = color([(l/lines.length * 255), 0, 255 - (l/lines.length * 255)]);
            
            noFill();
            stroke(randomColor);
            strokeWeight(1);
            drawingContext.setLineDash([0,0]);
            
            line(pointA.x, pointA.y, pointB.x, pointB.y);
            
            noFill();
            stroke(randomColor);
            strokeWeight(3);
            
            point(pointA.x, pointA.y);
            point(pointB.x, pointB.y);
            
            noStroke();
            fill(randomColor);
            textSize(12);
            
            text("Line " + l, (l + 1) * 45, height);
          }
        
            
      }
    }

  class CircleObject
    {
      constructor(handler, index, position, radius, drawRadius, fillCircle, patternCircle)
      {
        this.handler = handler;
        
        this.index = index;
        
        this.radius = radius;
        this.diameter = this.radius * 2;
        this.position = position;
        this.lastPosition = null;
        
        this.drawRadius = drawRadius;
        if(drawRadius === undefined)
          {
            this.drawRadius = false;
          }
        this.fillCircle = fillCircle;
        if(fillCircle === undefined)
          {
            this.fillCircle = false;
          }
        this.patternCircle = patternCircle;
        if(patternCircle === undefined)
          {
            this.patternCircle = false;
          }
        
        this.velocity = createVector(random(-0.5,0.5), random(-0.5,0.5));
        
        // this.generateElements();
      }
      
      // generateElements()
      // {
      //   // Create the pattern circle
      //   if(this.patternCircle)
      //     {
      //       let patternElement = createDiv();
      //       patternElement.position(this.position.x - this.radius, this.position.y - this.radius);
      //       patternElement.size(this.diameter, this.diameter);
      //       patternElement.class('pattern');
            
      //       patternElements.push(patternElement);
      //     }
      // }
      
      renderCircle()
      {
        // Draw Main Circle
        if(this.fillCircle)
          {
            fill(color('white'));
          }
        else
          {
            noFill();
          }
        stroke(color('black'));
        strokeWeight(1);
        drawingContext.setLineDash([0,0]);
        
        circle(this.position.x, this.position.y, this.diameter);

        // Draw Radius
        if(this.drawRadius)
          {
            // Draw Radius Line
            noFill();
            stroke(color('black'));
            strokeWeight(1);

            line(this.position.x, this.position.y, this.position.x + this.radius, this.position.y);

            // Draw Radius Text
            if(!this.patternFill)
              {
                noStroke();
                fill(color('black'));
                textAlign(CENTER);
                textSize(Clamp(this.radius * 0.15, 4, 16));
                textStyle(BOLD);
                textFont('Helvetica');

                text(round(this.radius.toString()), this.position.x + (this.radius/2), this.position.y - Clamp(this.radius * 0.1, 1, this.radius)/2);
              }

            // Draw Center
            noFill();
            stroke(color('black'));
            strokeWeight(Clamp(this.radius * 0.1, 1, this.radius));

            point(this.position.x, this.position.y)
          }
        
        // Draw the pattern fill
        // this.generateElements();
        
        // Store the position as the last position
        this.lastPosition = createVector(0,0).add(this.position);
      }
      
      moveCircle()
      {
          this.position.add(this.velocity);
          this.checkStall();
    }
      
      bounceCircle()
      {
      if (this.position.x > width - this.radius || this.position.x < 0 + this.radius) {
        this.velocity.x *= -1;
      }
      if (this.position.y > height - this.radius || this.position.y < 25 + this.radius) {
        this.velocity.y *= -1;
      }
    }
      
      checkStall()
      {
        let positionPrecision = 100;
        if(this.lastPosition != null && (round(this.lastPosition.x * positionPrecision)/positionPrecision === round(this.position.x * positionPrecision)/positionPrecision) && (round(this.lastPosition.y * positionPrecision)/positionPrecision === round(this.position.y * positionPrecision)/positionPrecision))
            {
              // print('stall!');
            }
      }
      
      isWithinRadius(center, radius)
      {
        return this.position.dist(center) <= radius + this.radius;
      }
      
      intersects(other)
      {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      return (d < this.radius + other.radius);
    }
      
      getNearestPointOnCircle(point)
      {
        return p5.Vector.sub(point, this.position).setMag(this.radius).add(this.position);
      }
    }
  
  this.circleHandler = new CircleGenerator();

  this.setup = function() {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
    randomSeed(year() + month() + day() + hour() + minute() + second());
    background(128);
    this.circleHandler.renderCircles();
  }

  this.draw = function() {
    blendMode(BLEND);
    background(128);
    this.circleHandler.renderCircles();
  }
}