var mgr;
let maskEditor;
let effectImg;
let sprites;
let galagaHighscore = 0;
let galaga;
// let patternElements = [];

function preload() {
  effectImg = loadImage('assets/img/animation.gif');
  sprites = loadImage("assets/img/galaga.png");
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
  mgr.addScene(Logo_Pond);
  mgr.addScene(Logo_Swirl); // Need to add Dynamic Colors
  mgr.addScene(Logo_LCD); // Need to add Dynamic Colors
  mgr.addScene(Logo_Topography); // Need to add Dynamic Colors
  // mgr.addScene(Logo_Particles); // Need to add Dynamic Colors, too buggy, please remove
  // mgr.addScene ( Logo_Cracks ); // Disabled until dependancy bug can be fixed Need to add Dynamic Colors
  mgr.addScene ( Logo_Collapse );
  mgr.addScene(Logo_Type); // Need to add Dynamic Colors
  mgr.addScene(Logo_Zigxel); // Need to add Dynamic Colors
  // mgr.addScene(Logo_Diagram); // Disabled until tangent lines bug can be fixed Need to add Dynamic Colors
  mgr.addScene(Logo_Pond);
  // mgr.addScene(Logo_Spray); // Some Kind of Flicker bug here...
  mgr.addScene(Logo_Golf);
  mgr.addScene(Logo_Galaga);
  // mgr.addScene(Logo_Electrons); // Need to add Dynamic Colors and some Kind of Flicker bug here...

  mgr.showNextScene();
  maskEditor = new MaskEditor();
  
  // Auto refresh every 24 hrs
  let hourCurrent = hour();
  let minuteCurrent = minute();
  let currentMilli = (((hourCurrent * 60) * 60) * 1000) + ((minuteCurrent * 60) * 1000);
  let maxMilli = (((23 * 60) * 60) * 1000) + ((59 * 60) * 1000);
  let milliToMidnight = abs(maxMilli - currentMilli); // ABS just in case
  setInterval(function () {
    location.reload();
  }, milliToMidnight);
}

function draw() {
  mgr.draw();
  maskEditor.drawMask();
  
  if (keyIsDown(LEFT_ARROW) && maskEditor.configureMode == true) {
    maskEditor.printMaskPoints();
  }
  if (keyIsDown(RIGHT_ARROW)) {
    maskEditor.configureMode = !maskEditor.configureMode;
  }
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
        new MaskPoint(0, createVector(64, 39), "vertex"),
        new MaskPoint(1, createVector(75, 547), "vertex"),
        new MaskPoint(2,createVector(111, 755),"quadratic",createVector(75, 547)),
        new MaskPoint(3,createVector(111, 755),"quadratic",createVector(324, 769)),
        new MaskPoint(4, createVector(324, 769), "vertex"),
        new MaskPoint(5, createVector(316, 34), "vertex"),
      ])
    );

    this.masks.push(
      new Mask(createVector(width / 2, height), createVector(width / 2, 0), [
        new MaskPoint(0, createVector(485, 27), "vertex"),
        new MaskPoint(1, createVector(488, 766), "vertex"),
        new MaskPoint(2, createVector(737, 766), "vertex"),
        new MaskPoint(3, createVector(736, 27), "vertex"),
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
      textStyle(NORMAL);
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

// Pond Scene
function Logo_Pond()
{
  class Fish
    {
      constructor(index,position, debug, bodyColor)
      {
        this.index = index;
        this.position = position;
        this.resolution = Clamp(5, 3, 100);
        this.length = 75;
        
        this.sightRadius = 75;
        this.facingSpeed = 0.0625;
        this.targetMargin = 75;
        this.targetArea = createVector(-40, 40);
        this.minMaxTargetRandomTime = createVector(12, 24);
        this.targetTime = 0;
        this.targetTimeStart = 0;
        
        this.baseSpineSpeed = 0.25;
        this.spineSpeedOffset = -0.2;
        this.maxSpineStrech = 8;
        this.spineAmp = 2;
        this.spineFreq = 2;
        this.spinePhase = 0;
        this.spineVertOffset = 0;
        this.spineSpeed = -3;
        this.spineSegmentPhase = 0.5
        this.sineSpeedAmpOffset = 0.25;
        
        this.headSize = 25;
        this.tailSize = 0;
        this.finHeight = 12;
        this.finWidth = 6;
        this.finDrag = 3;
        this.finAnchorOffset = 0;
        this.finCount = 2;
        this.finDownScale = 0.75;
        this.shadowOffset = createVector(12, 20);
        this.bodyColor = bodyColor;
        this.finColor = this.getFinColor(bodyColor);
        this.shadowColor = color('rgba(31,73,135,1)');
        
        this.target = this.position;
        this.targetStartDist = 0;
        this.facing = createVector(1,0).setMag(this.length);
        this.targetFacing = createVector(1,0).setMag(this.length);
        this.endpoint = p5.Vector.sub(this.position, this.facing);
        this.spineTargets = [];
        this.spine = [];
        this.spineBodyPoints = [];
        this.headPoints = [];
        this.velocity = createVector(0,0);
        this.speed = 0;
        
        this.debug = debug;
        this.targetColor = color('red');
        this.targetSize = 12;
        this.visionConeColor = color('magenta');
        this.facingTargetColor = color('blue');
        this.facingColor = color('yellow');
        this.facingVectorGap = 0.75;
        this.facingSize = 4;
        this.spineBaseColor = color('black');
        this.spineTargetColor = color('darkblue');
        this.spineTargetSize = 4;
        this.spinePointColor = color('lime');
        this.bodyPointColor = color('cyan');
        this.bodyHandleColor = color('darkturquoise');
        this.bodyPointSize = 2;
        
        this.getSpineTargets();
        this.generateSpine();
        this.updateTarget();
      }
      
      // Returns a fin color from a given body color
      getFinColor(bodyColor)
      {
        let newBrightness = round(Clamp(brightness(bodyColor) - 18, 0, 100));
        
        return color('hsb(' + round(hue(bodyColor)) + ', ' + round(saturation(bodyColor)) + '%, ' + newBrightness + '%)');
      }
      
      // Runs after the action timer has hit zero and makes the fish move or wait
      doAction()
      {
        if(random(0, 1) > 0.25)
          {
            // Move
            // Get a new Target
            this.addTarget();
            
            // Reset the action timer
            this.actionTimer = this.moveTime;
          }
        else
          {
            // Break
            // Reset the action timer
            this.actionTimer = this.breakTime
          }
      }
      
      updateTarget()
      {
        // Update the target random time
        this.targetTime -= deltaTime / 1000;
        if(this.targetTime <= 0)
          {
            this.targetTimeStart = random(this.minMaxTargetRandomTime.x, this.minMaxTargetRandomTime.y);
            this.targetTime = this.targetTimeStart;
            
            // this.targetOffsetRotation = round(random(-this.targetRandomRotationOffset, this.targetRandomRotationOffset) * 100) / 100;
            let randomX = randomGaussian(width/2, width/2);
            let randomY = randomGaussian(height/2, height/2);
            
            this.target = createVector(randomX, randomY);
            
            // Clamp the target to the bounds
            this.target.x = Clamp(this.target.x, this.targetMargin, width - this.targetMargin);
            this.target.y = Clamp(this.target.y, this.targetMargin, height - this.targetMargin);
          }
        
        // Update the facing rotation
        this.targetFacing = p5.Vector.sub(this.target, this.position).normalize().setMag(this.length);
        
        // Update the target when the fish reaches the target
        let distToTarget = p5.Vector.dist(this.position, this.target);
        if(distToTarget <= 0.5)
          {
            this.targetTime = 0;
            this.updateTarget();
          }
      }
      
      // Updates the fish and then renders
      update(time)
      {
        // Update the target
        this.updateTarget();
        
        // Store the last position
        let lastPosition = createVector(this.position.x, this.position.y);
        
        // Move towards the target
        let interpolationValue = (this.targetTimeStart - this.targetTime) / this.targetTimeStart;
        this.position = p5.Vector.lerp(this.position, this.target, easeInOutSine(interpolationValue));
        
        // Update the velocity
        this.velocity = p5.Vector.sub(this.position, lastPosition);
        // Update the speed
        this.speed = this.velocity.mag();
        
        // Update the facing
        angleMode(RADIANS);
        let facingHeading = lerp(this.facing.heading(), this.targetFacing.heading(), this.facingSpeed);
        this.facing.setHeading(facingHeading);
        
        // Update the endpoint
        this.endpoint = p5.Vector.sub(this.position, this.facing);
        
        // Update the spine targets
        this.getSpineTargets();
        
        // Update spine
        this.updateSpine(time);
        
        // Generate body points
        this.generateBodyPoints();
      }
      
      renderDebug()
      {
        // Target
        noFill();
        stroke(this.targetColor);
        strokeWeight(this.targetSize * 0.45);

        point(this.target.x, this.target.y);

        strokeWeight(1);
        
        line(this.target.x - (this.targetSize / 2), this.target.y, this.target.x + (this.targetSize / 2), this.target.y);
        line(this.target.x, this.target.y - (this.targetSize / 2), this.target.x, this.target.y + (this.targetSize / 2));

        strokeWeight(1);

        line(this.position.x, this.position.y, this.target.x, this.target.y);
        
        let targetRaw = p5.Vector.sub(this.target, this.position);
        
        noStroke();
        fill(this.targetColor);
        textSize(8);
        textAlign(CENTER);
        
        text('⊙ M: ' + (round(targetRaw.mag())).toString(), this.target.x, this.target.y + this.targetSize);

        // Vision Cone
        noFill();
        stroke(this.visionConeColor);

        let facingAngle = this.facing.heading() * (180 / PI);
        let startAngle = (this.targetArea.x + facingAngle) * (PI / 180);
        let endAngle = (this.targetArea.y + facingAngle) * (PI / 180);
        
        arc(this.position.x, this.position.y, this.sightRadius * 2, this.sightRadius * 2, startAngle, endAngle, PIE);
        
        let arcMiddlePoint = p5.Vector.add(this.facing, this.position);
        let arcLeftPoint = p5.Vector.sub(arcMiddlePoint, this.position).rotate(this.targetArea.x * (PI / 180)).add(this.position);
        let arcLeftOffsetPoint = p5.Vector.sub(arcLeftPoint, this.position).setMag(20).add(arcLeftPoint);
        let arcRightPoint = p5.Vector.sub(arcMiddlePoint, this.position).rotate(this.targetArea.y * (PI / 180)).add(this.position);
        let arcRightOffsetPoint = p5.Vector.sub(arcRightPoint, this.position).setMag(20).add(arcRightPoint);
        
        strokeWeight(4);
        point(arcMiddlePoint.x, arcMiddlePoint.y);
        point(arcLeftPoint.x, arcLeftPoint.y);
        point(arcRightPoint.x, arcRightPoint.y);
        
        noStroke();
        fill(this.visionConeColor);
        
        text(round((arcLeftPoint.sub(this.position).heading() * (180 / PI))).toString() + '°', arcLeftOffsetPoint.x, arcLeftOffsetPoint.y);
        text(round((arcRightPoint.sub(this.position).heading() * (180 / PI))).toString() + '°', arcRightOffsetPoint.x, arcRightOffsetPoint.y);
        
        noFill();
        strokeWeight(1);
        
        // Facing Vectors
        // Facing Target
        stroke(this.facingTargetColor);
        
        let facingTargetTemp = p5.Vector.add(this.targetFacing, this.position);
        let facingTargetPositionOffset = createVector(this.targetFacing.x, this.targetFacing.y).setMag(this.sightRadius * this.facingVectorGap).add(this.position);
        
        line(facingTargetPositionOffset.x, facingTargetPositionOffset.y, facingTargetTemp.x, facingTargetTemp.y);
        
        strokeWeight(this.facingSize);
        
        point(facingTargetTemp.x, facingTargetTemp.y);
        
        let facingTargetPointOffset = p5.Vector.sub(facingTargetTemp, this.position).setMag(20).add(facingTargetTemp);
        
        noStroke();
        fill(this.facingTargetColor);
        
        text(round(facingTargetTemp.sub(this.position).heading() * (180 / PI)).toString() + '°', facingTargetPointOffset.x, facingTargetPointOffset.y);
        
        noFill();
        strokeWeight(1);
        
        // Facing
        stroke(this.facingColor);
        strokeWeight(1);
        
        let facingTemp = p5.Vector.add(this.facing, this.position);
        let facingPositionOffset = createVector(this.facing.x, this.facing.y).setMag(this.sightRadius * this.facingVectorGap).add(this.position);
        
        line(facingPositionOffset.x, facingPositionOffset.y, facingTemp.x, facingTemp.y);
        
        strokeWeight(this.facingSize);
        
        point(facingTemp.x, facingTemp.y);

        // Spine Base
        stroke(this.spineBaseColor);
        strokeWeight(1);
        
        let facingTempNegative = p5.Vector.sub(this.position, this.facing);

        line(this.position.x, this.position.y,  facingTempNegative.x, facingTempNegative.y);
        
        // Spine Targets
        stroke(this.spineTargetColor);
        strokeWeight(this.spineTargetSize);
        
        for(let i = 0; i < this.spineTargets.length; i++)
          {
            point(this.spineTargets[i].x, this.spineTargets[i].y);
          }

        // Spine
        stroke(this.spinePointColor);
        
        for(let i = 0; i < this.spine.length; i++)
          {
            point(this.spine[i].x, this.spine[i].y);
          }
        
        // Body Points
        // Head
        stroke(this.bodyHandleColor);
        strokeWeight(1);
        
        line(this.headPoints[0][0].x, this.headPoints[0][0].y, this.headPoints[0][1].x, this.headPoints[0][1].y);
        line(this.headPoints[2][0].x, this.headPoints[2][0].y, this.headPoints[2][1].x, this.headPoints[2][1].y);
        
        stroke(this.bodyPointColor);
        strokeWeight(this.bodyPointSize);
        
        point(this.headPoints[0][1].x, this.headPoints[0][1].y);
        point(this.headPoints[1].x, this.headPoints[1].y);
        point(this.headPoints[2][1].x, this.headPoints[2][1].y);
        
        // Body
        for(let i = 0; i < this.spineBodyPoints.length; i++)
          {
            let leftPoint = this.spineBodyPoints[i][0];
            let rightPoint = this.spineBodyPoints[i][1];
            
            point(leftPoint.x, leftPoint.y);
            point(rightPoint.x, rightPoint.y);
          }
      }
      
      // Renders the fish
      render(pass)
      {
        switch(pass)
          {
            case 'diffuse':
            default:
              // Render the body
              this.renderBody();
              
              // Debug
              if(this.debug)
              {
                this.renderDebug();
              }
              break;
            case 'shadow':
              // Render the shadow
              this.renderShadow();
              break;
          }
      }
      
      generateBodyPoints()
      {
        this.spineBodyPoints = [];
        // Iterate over the spine, adding 2 points for each spine point (1 for each side of the body)
        for(let i = 0; i < this.spine.length - 1; i++)
          {
            let bodyWidthAtSpinePoint = lerp(this.headSize, this.tailSize, i / this.spine.length);
            let thisSpinePoint = this.spine[i];
            let nextSpinePoint = this.spine[i+1];
            let leftPoint = p5.Vector.rotate(p5.Vector.sub(nextSpinePoint, thisSpinePoint), HALF_PI).setMag(bodyWidthAtSpinePoint/2).add(this.spine[i]);
            let rightPoint = p5.Vector.rotate(p5.Vector.sub(nextSpinePoint, thisSpinePoint), -HALF_PI).setMag(bodyWidthAtSpinePoint/2).add(this.spine[i]);
            this.spineBodyPoints.push([leftPoint, rightPoint]);
          }
        
        // Right Point
        let rightPoint = this.spineBodyPoints[0][1];
        let facingRightTemp = p5.Vector.add(this.facing, -rightPoint).setMag(this.headSize);
        let rightControl = p5.Vector.add(rightPoint, facingRightTemp);
        
        // Left Point
        let leftPoint = this.spineBodyPoints[0][0];
        let facingLeftTemp = p5.Vector.add(this.facing, -leftPoint).setMag(this.headSize);
        let leftControl = p5.Vector.add(leftPoint, facingLeftTemp);
        
        // Middle Point
        let middlePoint = p5.Vector.lerp(leftControl, rightControl, 0.5);
        
        this.headPoints = [[rightPoint, rightControl], middlePoint, [leftPoint, leftControl]];
      }
      
      renderBody(offset, fillColor)
      {
        // Set the offset if none exists
        if(offset == null || offset === undefined)
          {
            offset = createVector(0,0);
          }
        
        // Iterate over the body points and connect them into the body shape
        beginShape();
        
        noStroke();
        if(fillColor == null || fillColor === undefined)
          {
            fill(this.bodyColor);
          }
        else
          {
            fill(fillColor);
          }
        
        if(this.debug)
          {
            noFill();
            stroke(this.bodyColor);
            strokeWeight(1);
          }

        for(let i = 0; i < (this.spineBodyPoints.length * 2) + 1; i++)
          {
            if(i < this.spineBodyPoints.length)
              {
                // Left Side
                vertex(this.spineBodyPoints[i][0].x + offset.x, this.spineBodyPoints[i][0].y + offset.y);
              }
            if(i == this.spineBodyPoints.length)
              {
                // Tail Point
                vertex(this.spine[this.spine.length - 1].x + offset.x, this.spine[this.spine.length - 1].y + offset.y);
              }
            if(i > this.spineBodyPoints.length)
              {
                // Right Side
                let iterationIndex = this.spineBodyPoints.length - ((i + 1) % (this.spineBodyPoints.length + 1));
                vertex(this.spineBodyPoints[iterationIndex][1].x + offset.x, this.spineBodyPoints[iterationIndex][1].y + offset.y);
              }
          }
        
        // Draw the head
        // Curve
        bezierVertex(this.headPoints[0][1].x + offset.x, this.headPoints[0][1].y + offset.y, this.headPoints[2][1].x + offset.x, this.headPoints[2][1].y + offset.y, this.headPoints[2][0].x + offset.x, this.headPoints[2][0].y + offset.y);
        
        endShape(CLOSE);
        
        // Add the fins
        this.renderFins(offset, fillColor);
      }
      
      renderFins(offset, fillColor)
      {
        // Set the offset if none exists
        if(offset == null || offset === undefined)
          {
            offset = createVector(0,0);
          }
        
        let finInterval = Clamp(ceil((this.spineBodyPoints.length - 1) / this.finCount), 1, 100);
        for(let i = 0; i < Clamp(this.finCount, 0, this.spineBodyPoints.length - 1); i++)
          {
            // Get the fin anchors
            let finAnchors = i * finInterval;
            finAnchors = Clamp(finAnchors + this.finAnchorOffset, 0, this.spineBodyPoints.length - 1);
            let finDownScale = pow(this.finDownScale, i);

            // Left
            let leftOffset = createVector(this.facing.x, this.facing.y).rotate(HALF_PI).setMag(this.finWidth * finDownScale);
            let finDrag = p5.Vector.sub(this.spineBodyPoints[finAnchors + 1][0], this.spineBodyPoints[finAnchors][0]).setMag(this.finDrag);

            let leftA = this.spineBodyPoints[finAnchors][0];
            let leftB = p5.Vector.sub(this.spineBodyPoints[finAnchors + 1][0], this.spineBodyPoints[finAnchors][0]).setMag(this.finHeight * finDownScale).add(leftA);
            let leftC = p5.Vector.sub(leftB, leftOffset).add(finDrag * finDownScale);

            // Right
            let rightOffset = createVector(this.facing.x, this.facing.y).rotate(-HALF_PI).setMag(this.finWidth * finDownScale);

            let rightA = this.spineBodyPoints[finAnchors][1];
            let rightB = p5.Vector.sub(this.spineBodyPoints[finAnchors + 1][1], this.spineBodyPoints[finAnchors][1]).setMag(this.finHeight * finDownScale).add(rightA);
            let rightC = p5.Vector.sub(rightB, rightOffset).add(finDrag * finDownScale);

            noStroke();
            if(fillColor == null || fillColor === undefined)
              {
                fill(this.finColor);
              }
            else
              {
                fill(fillColor);
              }

            if(this.debug)
              {
                noFill();
                stroke(this.finColor);
                strokeWeight(1);
              }

            triangle(leftA.x + offset.x, leftA.y + offset.y, leftB.x + offset.x, leftB.y + offset.y, leftC.x + offset.x, leftC.y + offset.y);
            triangle(rightA.x + offset.x, rightA.y + offset.y, rightB.x + offset.x, rightB.y + offset.y, rightC.x + offset.x, rightC.y + offset.y);
          }
      }
      
      renderShadow()
      {
        // Render the body
        this.renderBody(this.shadowOffset, this.shadowColor);
      }
      
      getSpineTargets()
      {
        this.spineTargets = [];
        this.spineTargets.push(this.position);
        
        // Iterate over the resolution between the endpoint and head and create spine targets
        for(let i = 0; i < this.resolution - 2; i++)
          {
            this.spineTargets.push(p5.Vector.lerp(this.position, this.endpoint, (i + 1) / (this.resolution - 1)));
          }
        
        this.spineTargets.push(this.endpoint);
      }
      
      generateSpine()
      {
        // Iterate over the spine targets and create spine
        for(let i = 0; i < this.spineTargets.length; i++)
          {
            this.spine.push(createVector(this.spineTargets[i].x, this.spineTargets[i].y));
          }
      }
      
      updateSpine(time)
      {
        // Iterate over the spine and lerp them towards their targets
        for(let i = 0; i < this.spine.length; i++)
          {
            let targetPosition = this.spineTargets[i];
            let lerpSpeed = this.baseSpineSpeed + ((this.spineSpeedOffset / this.spine.length) * (i + 1));
            
            this.spine[i].lerp(targetPosition, lerpSpeed);
          }
        
        // Lock the length between the spine points
        let spineSegmentLength = this.length / this.resolution;
        let maxSpineSegmentLength = spineSegmentLength + this.maxSpineStrech;
        let minSpineSegmentLength = spineSegmentLength - this.maxSpineStrech;
        for(let i = this.spine.length - 1; i > 0; i--)
          {
            let currentSpinePoint = this.spine[i];
            let nextSpinePoint = this.spine[i-1];
            
            // Too far away, correct the positioning
            if(p5.Vector.dist(currentSpinePoint, nextSpinePoint) > maxSpineSegmentLength)
              {
                this.spine[i] = p5.Vector.sub(currentSpinePoint, nextSpinePoint).setMag(maxSpineSegmentLength).add(nextSpinePoint);
                continue;
              }
            
            // Too close, correct the positioning
            if(p5.Vector.dist(currentSpinePoint, nextSpinePoint) < minSpineSegmentLength)
              {
                this.spine[i] = p5.Vector.sub(currentSpinePoint, nextSpinePoint).setMag(minSpineSegmentLength).add(nextSpinePoint);
                continue;
              }
          }
        
        // Offset the spine points with a sine wave
        for(let i = 0; i < this.spine.length; i++)
          {
            let currentSpinePoint = this.spine[i];
            let currentDistanceToTarget = p5.Vector.dist(currentSpinePoint, this.target) / 50;
            let sineOffset = SineWave(this.spineAmp + (this.sineSpeedAmpOffset * this.speed), this.spineFreq, this.spinePhase + currentDistanceToTarget, this.spineVertOffset, this.spineSpeed, time) * (i / this.spine.length);
            let offsetVector = p5.Vector.rotate(this.facing, HALF_PI).normalize().mult(sineOffset);
            
            this.spine[i].add(offsetVector);
          }
      }
    }

  class LillyPad
    {
      constructor(position, size, debug, lillyPadMinSize, lillyPadMaxSize)
      {
        this.position = position;
        this.size = size;
        this.rotation = round(random(0, 360));
        this.creaseCount = round(random(3, 7));
        this.hasLilly = 1 - random(0,1) > 0.7;
        
        this.basePosition = createVector(this.position.x, this.position.y);
        this.targetPosition = createVector(this.position.x, this.position.y);
        this.cutAngle = 12;
        this.centerSize = this.size * 0.25;
        this.creaseMaxDisplacement = (360 / this.creaseCount) * 0.25;
        this.creaseSize = 0.7;
        this.lillyLayers = 4;
        this.lillySize = this.size * 0.625;
        this.lillyBasePetals = 6;
        this.lillyPetalWidth = 2;
        
        this.interactionRadius = (this.size / 2) * 1.5;
        this.maxDisplacement = 5 * map(this.size, lillyPadMinSize, lillyPadMaxSize, 1, 2);
        this.interactionSpeed = 0.05;
        this.displacing = false;
        
        this.creases = [];
        this.lilly = createVector(0,0);
        
        this.creaseWeight = 2;
        this.padColor = color('#8BC34A');
        this.creaseColor = color('#7FB73E');
        this.shadowOffset = createVector(12, 20);
        this.shadowColor = color('rgba(31,73,135,1)');
        this.lillyCenterColor = color('#F5E355');
        this.lillyPetalColor = color('#F4F6D9');
        
        this.debug = debug;
        this.interactionColor = color('magenta');
        this.interactionActiveColor = color('pink');
        this.targetSize = 4;
        this.targetColor = color('red');
        this.baseColor = color('yellow');
        
        this.generateCreases();
        
        if(this.hasLilly)
          {
            this.generateLilly();
          }
      }
      
      generateCreases()
      {
        // Iterate over the creases, creating crease points
        let startCreasePoint = createVector(this.creaseSize * (this.size / 2), 0);
        let creaseRotationInterval = (360 / (this.creaseCount + 1));
        for(let i = 0; i < this.creaseCount; i++)
          {
            angleMode(DEGREES);
            let offsetDisplacement = round(random(-this.creaseMaxDisplacement, this.creaseMaxDisplacement));
            let creaseRotation = Clamp(((creaseRotationInterval * i) + offsetDisplacement) * (PI / 180), 0, 360 - (this.cutAngle * 2));
            let creasePoint = p5.Vector.rotate(startCreasePoint, creaseRotation);
            this.creases.push(creasePoint);
          }
      }
      
      generateLilly()
      {
        // Get a random position for the lilly
        this.lilly = createVector(random(-this.size/4,this.size/4), random(-this.size/4,this.size/4));
      }
      
      update(fishPositions)
      {
        // Iterate over the fish positions
        let displacement = createVector(0,0);
        for(let i = 0; i < fishPositions.length; i++)
          {
            // If a fish position is within the interaction radius, move the pad
            if(p5.Vector.dist(fishPositions[i], this.position) <= this.interactionRadius)
              {
                let displacementAmount = map(p5.Vector.dist(fishPositions[i], this.position), 0, this.interactionRadius, this.maxDisplacement, 0);
                let displacementVector = p5.Vector.sub(this.position, fishPositions[i]).setMag(displacementAmount);
                displacement.add(displacementVector);
              }
          }
        
        if(displacement.x != 0 || displacement.y != 0)
          {
            this.displacing = true;
          }
        else
          {
            this.displacing = false;
          }
        
        // Get new target
        this.targetPosition.add(displacement).lerp(this.basePosition, this.interactionSpeed);
        
        // Get new position
        this.position.lerp(this.targetPosition, this.interactionSpeed);
      }
      
      render(pass)
      {
        switch(pass)
          {
            case 'diffuse':
            default:
              // Render the pad
              this.renderPad();
              
              // Debug
              if(this.debug)
              {
                this.renderDebug();
              }
              break;
            case 'shadow':
              // Render the shadow
              this.renderShadow();
              break;
          }
      }
      
      renderShadow()
      {
        this.renderPad(this.shadowOffset, this.shadowColor);
      }
      
      renderPad(offset, fillColor)
      {
        // Set the offset if none exists
        if(offset == null || offset === undefined)
          {
            offset = createVector(0,0);
          }
        
        // Draw the arc
        if(fillColor == null || fillColor === undefined)
          {
            fillColor = this.padColor;
          }
        noStroke();
        fill(fillColor);
        
        if(this.debug)
          {
            noFill();
            stroke(fillColor);
            strokeWeight(1);
          }
        
        arc(this.position.x + offset.x, this.position.y + offset.y, this.size, this.size, (0 + this.rotation) * (PI/180), ((360 - this.cutAngle) + this.rotation) * (PI/180));
        
        // Draw the center fill
        if(!this.debug && (offset.x == 0 && offset.y == 0))
          {
            noFill();
            stroke(fillColor);
            strokeWeight(this.centerSize);
            
            point(this.position.x + offset.x, this.position.y + offset.y);
          }
        
        // Draw the creases
        if(offset.x == 0 && offset.y == 0)
          {
            noFill();
            stroke(this.creaseColor);
            strokeWeight(this.creaseWeight);
            
            for(let i = 0; i < this.creases.length; i++)
              {
                let creaseEndpoint = p5.Vector.add(this.creases[i], this.position);
                
                line(this.position.x, this.position.y, creaseEndpoint.x, creaseEndpoint.y);
              }
          }
        
        if(this.hasLilly)
          {
            this.renderLilly(offset, fillColor);
          }
      }
      
      renderLilly(offset, fillColor)
      {
        // Petals
        // Iterate over the layers
        let layerSizeInterval = this.lillySize / this.lillyLayers;
        for(let l = this.lillyLayers; l > 0; l--)
          {
            // Get the color of the layer
            let layerColor = lerpColor(this.lillyCenterColor, this.lillyPetalColor, l / (this.lillyLayers - 1));
            
            if(!(offset.x == 0 && offset.y == 0))
              {
                layerColor = fillColor;
              }
            
            // Iterate over the petals in the layer
            let layerPetals = this.lillyBasePetals;
            if(l == this.lillyLayers - 1)
              {
                layerPetals = this.lillyBasePetals * 1;
              }
            
            let centerPoint = p5.Vector.add(this.position, this.lilly);
            let petalRotationInterval = 360 / layerPetals;
            let layerRotation = (l % 2) * 45;
            let layerSize = layerSizeInterval * (l + 1);
            let petalWidth = petalRotationInterval * this.lillyPetalWidth;
            
            for(let p = 0; p < (layerPetals + 1); p++)
              {
                let petalRotation = ((petalRotationInterval * p) + layerRotation) * (180/PI);
                let petalEndPoint = createVector(layerSize/2, 0).rotate(petalRotation).add(centerPoint).add(offset);
                let petalMidPoint = createVector((layerSize/2) / 2, 0).rotate(petalRotation);
                let petalLeftControl = p5.Vector.rotate(petalMidPoint, -(petalWidth/2) * (PI/180)).add(this.position).add(this.lilly).add(offset);
                let petalRightControl = p5.Vector.rotate(petalMidPoint, (petalWidth/2) * (PI/180)).add(this.position).add(this.lilly).add(offset);

                noStroke();
                fill(layerColor);
                
                if(this.debug)
                  {
                    if(l == this.lillyLayers)
                      {
                        stroke(layerColor);
                        strokeWeight(1);
                        noFill();
                      }
                    else
                      {
                        noFill();
                        noStroke();
                      }
                  }
                
                beginShape();
                vertex(centerPoint.x, centerPoint.y);
                quadraticVertex(centerPoint.x, centerPoint.y, petalLeftControl.x, petalLeftControl.y);
                vertex(petalEndPoint.x, petalEndPoint.y);
                quadraticVertex(petalRightControl.x, petalRightControl.y, centerPoint.x, centerPoint.y);
                endShape();
              }
          }
        
        // Center Point
        if(offset.x == 0 && offset.y == 0)
          {
            noFill();
            stroke(this.lillyCenterColor);
            strokeWeight(this.lillySize * 0.25);

            point(this.lilly.x + this.position.x, this.lilly.y + this.position.y);
          }
      }
      
      renderDebug()
      {
        // Interaction Radius
        noFill();
        stroke(this.interactionColor);
        strokeWeight(1);
        
        if(this.displacing)
          {
            stroke(this.interactionActiveColor);
          }
        
        circle(this.position.x, this.position.y, this.interactionRadius*2);
        
        // Target
        stroke(this.targetColor);
        
        line(this.position.x, this.position.y, this.targetPosition.x, this.targetPosition.y);
        
        strokeWeight(this.targetSize);
        
        point(this.targetPosition.x, this.targetPosition.y);
        
        // Base
        stroke(this.baseColor);
        
        point(this.basePosition.x, this.basePosition.y);
      }
    }
  
  this.fish = [];
  this.fishCount = 6;
  this.lillyPads = [];
  this.lillyPadCount = 24;
  this.lillyPadMinSize = 30;
  this.lillyPadMaxSize = 72;
  this.lillyPadPadding = 100;
  this.debug = false;
  this.time = 0;

  this.setup = function() {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
    randomSeed(year() + month() + day() + hour() + minute() + second());
    let fishColors = [color('#607D8B'), color('#E79721'), color('#D34B0D'), color('#FCFBCC')];
    this.fish = [];
    for(let i = 0; i < this.fishCount; i++)
      {
        this.fish.push(new Fish(i,createVector(random(0, width), random(0, height)), this.debug, fishColors[round(random(0, fishColors.length - 1))]));
      }
    
    for(let i = 0; i < this.lillyPadCount; i++)
      {
        this.lillyPads.push(new LillyPad(createVector(random(this.lillyPadPadding, width - this.lillyPadPadding), random(this.lillyPadPadding, height - this.lillyPadPadding)), random(this.lillyPadMinSize,this.lillyPadMaxSize), this.debug, this.lillyPadMinSize, this.lillyPadMaxSize));
      }
    print('setup')
  }

  this.draw = function() {
    background(color('#00BCD4'));
    this.time += deltaTime / 1000;
    let fishPositions = [];
    // Update and Draw Shadows
    for(let i = 0; i < this.fishCount; i++)
      {
        this.fish[i].update(this.time);
        fishPositions.push(this.fish[i].position);
        this.fish[i].render('shadow');
      }
    
    // Update and Draw Lilly Shadows
    for(let i = 0; i < this.lillyPadCount; i++)
      {
        this.lillyPads[i].update(fishPositions);
        this.lillyPads[i].render('shadow');
      }
    
    // Lighten the shadows
    background(color('rgba(0,188,212, 0.75)'));
    
    // Draw Fish
    for(let i = 0; i < this.fishCount; i++)
      {
        this.fish[i].render('diffuse');
      }
    
    // Draw the Lillies
    for(let i = 0; i < this.lillyPadCount; i++)
      {
        this.lillyPads[i].render('diffuse');
      }
  }
}

// Spray Scene
function Logo_Spray()
{
  class SprayPainter
    {
      constructor()
      {
        this.sprayer = null;
        this.sprayTime = 4;
        this.sprayRadius = 150;
        this.sprayDensity = 250;
        this.paintSize = 5;
        
        this.generateSprayer();
      }
      
      // Generate a single sprayer
      generateSprayer()
      {
        // Select the color of the paint
        let sprayColor = color('hsb(' + round(random(0, 360)) + ', 80%, 90%)');
        
        // Get a random position in the canvas
        let x = 0;
        let y = 0;
        if(random(0,1) < 0.5)
          {
            // X Axis Choice
            x = round(random(0 - this.sprayRadius, width + this.sprayRadius));
            // Random Y Edge
            if(random(0,1) < 0.5)
              {
                // Neg Y
                y = 0 - this.sprayRadius;
              }
            else
              {
                // Pos Y
                y = height + this.sprayRadius;
              }
          }
        else
          {
            // Y Axis Choice
            y = round(random(0 - this.sprayRadius, height + this.sprayRadius));
            // Random X Edge
            if(random(0,1) < 0.5)
              {
                // Neg X
                x = 0 - this.sprayRadius;
              }
            else
              {
                // Pos X
                x = width + this.sprayRadius;
              }
          }
        let sprayerStartPosition = createVector(x,y);
        // Get the reflected point on the oppisite side of the canvas
        let randomCenter = createVector(round(random(0, width)), round(random(0, height)));
        let negX = x - ((x - randomCenter.x) * 2);
        let negY = y - ((y - randomCenter.y) * 2);
        let sprayerEndPosition = createVector(negX,negY);
        
        // Create the sprayer
        this.sprayer = new Sprayer(this, sprayerStartPosition, sprayerEndPosition, this.sprayRadius, this.sprayDensity, sprayColor, this.paintSize, this.sprayTime);
      }
      
      render()
      {
        if(this.sprayer != null)
          {
            this.sprayer.render();
          }
      }
    }

  class Sprayer
    {
      constructor(painter, start, end, radius, density, color, size, duration)
      {
        this.painter = painter; 
        this.position = start;
        this.start = start;
        this.destination = end;
        this.radius = radius;
        this.sizeFalloff = radius * 0.25;
        this.density = density;
        this.color = color;
        this.size = size;
        this.duration = duration;
        
        this.timeLeft = duration;
        this.heading = p5.Vector.sub(this.position, this.destination).heading() * (180/PI);
      }
      
      render()
      {
        // Move the sprayer
        this.moveSprayer();
        
        // Iterate and place random points inside of the radius
        let minX = this.position.x - this.radius;
        let maxX = this.position.x + this.radius;
        let minY = this.position.y - this.radius;
        let maxY = this.position.y + this.radius;
        for(let i = 0; i < this.density; i++)
          {
            let spray = createVector(round(random(minX, maxX)), round(random(minY, maxY)));
            // Only draw the point if it is within the radius
            if(p5.Vector.dist(spray, this.position) <= this.radius)
              {
                // Get the size of the point
                let size = map(p5.Vector.dist(spray, this.position), this.sizeFalloff, this.radius, this.size, 0, true);
                
                noFill();
                stroke(this.color);
                strokeWeight(size);
                
                point(spray.x, spray.y);
              }
          }
      }
      
      moveSprayer()
      {
        this.timeLeft -= deltaTime/1000;
        
        if(this.timeLeft <= 0)
          {
            // Trigger a new sprayer
            this.painter.generateSprayer();
          }
        
        let interpolationValue = this.timeLeft / this.duration;
        this.position = p5.Vector.lerp(this.start, this.destination, interpolationValue);
      }
    }
  
  this.painter = new SprayPainter();

  this.setup = function() {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
    randomSeed(year() + month() + day() + hour() + minute() + second());
    background(0);
    mgr.clearFrames = false;
  }

  this.draw = function() {
    this.painter.render();
    mgr.clearFrames = false;
  }
}

// Golf Scene
function Logo_Golf()
{
  class Ground
  {
    constructor()
    {
      this.grassColor = color('green');
      this.stripOpacity = 0.0375;
      this.mowColor = color('rgba(255,255,255,' + this.stripOpacity + ')');
      this.negMowColor = color('rgba(0,0,0,' + this.stripOpacity + ')');
      this.stripSize = 100;
      
      this.othroOffset = 0.65;
    }
    
    render()
    {
      background(this.grassColor);
      
      // Render the mow strips going left
      noFill();
      stroke(this.mowColor);
      strokeWeight(this.stripSize * this.othroOffset);
      let posAngle = 45 * (PI/180);
      let posVector = createVector(1,0).setHeading(posAngle * this.othroOffset).setMag(((width + (this.stripSize * 2)) * sqrt(2*(1/this.othroOffset))) * (1 / this.othroOffset));
      for(let x = -width * 2; x < width*3; x += (this.stripSize * 2) * sqrt(2))
        {
          let start = createVector(x + (this.stripSize/2), -(this.stripSize/2));
          let end = p5.Vector.add(start, posVector);
          
          line(start.x, start.y, end.x, end.y);
        }
      
      stroke(this.negMowColor);
      strokeWeight(this.stripSize * this.othroOffset);
      let negAngle = -45 * (PI/180);
      let negVector = createVector(1,0).setHeading(negAngle * this.othroOffset).setMag(((width + (this.stripSize * 2)) * sqrt(2*(1/this.othroOffset))) * (1 / this.othroOffset));
      for(let x = -width * 2; x < width*3; x += (this.stripSize * 2) * sqrt(2))
        {
          let start = createVector(x + (this.stripSize/2), -(this.stripSize/2));
          let end = p5.Vector.sub(start, negVector);
          
          line(start.x, start.y, end.x, end.y);
        }
    }
    }

  class Golfer
    {
      constructor()
      {
        this.hole = null;
        this.ball = null;
        
        this.holeCount = 1;
        
        this.holeMargin = 125;
        this.ballMargin = 75;
        
        this.ballHitWait = 1;
        
        this.ballSpeedRange = createVector(0.5, 3); // The speed range for how fast the ball can travel given its travel length
        this.ballHeightRange = createVector(15, 150); // The height range for how high the ball can travel given its travel length
        
        this.ballHitTimer = 0;
        
        this.ballCloseRanges = [width * 0.75, width * 0.4, width * 0.1];
        
        this.debug = false;
        this.ballCloseRangeColors = [color('cyan'), color('yellow'), color('magenta')];
        
        this.spawnRanges = [[createVector(100,100), createVector(300,700)], [createVector(500,100), createVector(700,700)]];
        
        this.newHole();
        this.newBall();
      }
      
      // Generates a new hole
      newHole()
      {
        let spawnRange = this.getRandomSpawnRange();
        
        let holePosition = createVector(round(random(spawnRange[0].x, spawnRange[0].y)), round(random(spawnRange[1].x, spawnRange[1].y)));
        
        this.hole = new Hole(holePosition, this);
      }
      
      // Generates a new ball
      newBall()
      {
        let spawnRange = this.getRandomSpawnRange();
        
        let ballPosition = createVector(round(random(spawnRange[0].x, spawnRange[0].y)), round(random(spawnRange[1].x, spawnRange[1].y)));
        
        this.ball = new GolfBall(this, ballPosition, this.debug);
        this.ball.render();
      }
      
      // Renders the game
      render()
      {
        // Update the ball
        this.ballHitTimer -= deltaTime / 1000;
        if(this.ballHitTimer <= 0)
          {
            this.targetBall();
          }
        
        if(this.debug)
          {
            // Draw the hole close ranges
            noFill();
            strokeWeight(1);
            for(let i = 0; i < this.ballCloseRanges.length; i++)
              {
                stroke(this.ballCloseRangeColors[i]);
                
                ellipse(this.hole.position.x, this.hole.position.y, this.ballCloseRanges[i] * 2, (this.ballCloseRanges[i] * 0.55) * 2);
              }
            
            // Draw a line between the start position and the hole
            let distanceToHoleFromStart = p5.Vector.dist(this.ball.startPosition, this.hole.position);
            // Find the correct color to use
            for(let i = 0; i < this.ballCloseRanges.length; i++)
              {
                if(distanceToHoleFromStart <= this.ballCloseRanges[i])
                  {
                    stroke(this.ballCloseRangeColors[i]);
                  }
              }         
            
            line(this.ball.startPosition.x, this.ball.startPosition.y + this.ball.ballSize/2, this.hole.position.x, this.hole.position.y);
          }
        
        if(this.ball != null && this.hole != null)
          {
            // Determine the render order of the hole and ball
            if(this.hole.position.y > this.ball.position.y)
              {
                this.ball.render();
                this.hole.render();
              }
            else
              {
                this.hole.render();
                this.ball.render();
              }
          }
      }
      
      // Retargets the ball
      targetBall()
      {
        if(this.ball != null && this.hole != null)
          {
            // Determine the range index of the ball
            let rangeIndex = -1;
            let distanceToHoleFromStart = p5.Vector.dist(this.ball.startPosition, this.hole.position);
            for(let i = 0; i < this.ballCloseRanges.length; i++)
              {
                if(distanceToHoleFromStart <= this.ballCloseRanges[i])
                  {
                    rangeIndex = i;
                  }
              }

            // Target the ball
            let ballTarget = createVector(0,0);
            if(rangeIndex == -1)
              {
                ballTarget = createVector(round(random(this.ballMargin, width - this.ballMargin)), round(random(this.ballMargin, height - this.ballMargin)));
              }
            else
              {
                // Get the targeting range of the ball
                let targetXRange = createVector(max(this.ballMargin, this.hole.position.x - this.ballCloseRanges[rangeIndex]), min(width - this.ballMargin, this.hole.position.x + this.ballCloseRanges[rangeIndex]));
            let targetYRange = createVector(max(this.ballMargin, this.hole.position.y - this.ballCloseRanges[rangeIndex]), min(height - this.ballMargin, this.hole.position.y + this.ballCloseRanges[rangeIndex]));

                ballTarget = createVector(round(random(targetXRange.x, targetXRange.y)), round(random(targetYRange.x, targetYRange.y)));
              }

            // Determine the aim assist 
            let aimAssist = 0;
            for(let i = 0; i < this.ballCloseRanges.length; i++)
              {
                if(distanceToHoleFromStart <= this.ballCloseRanges[i])
                  {
                    aimAssist = i / (this.ballCloseRanges.length - 1);
                  }
              }
            let newTarget = p5.Vector.lerp(ballTarget, this.hole.position, aimAssist);
            ballTarget = newTarget;

            let targetDistance = p5.Vector.dist(this.ball.position, ballTarget);
            let ballTravelDuration = map(targetDistance, 0, width * sqrt(2), this.ballSpeedRange.x, this.ballSpeedRange.y, true);
            let ballTravelHeight = map(targetDistance, 0, width * sqrt(2), this.ballHeightRange.x, this.ballHeightRange.y, true);

            this.ball.setTarget(ballTarget, ballTravelDuration, ballTravelHeight);

            this.ballHitTimer = ballTravelDuration + this.ballHitWait;
          }
      }
      
      // Checks if the stage can be advanced
      checkAdvanceStage()
      {
        if(p5.Vector.dist(this.ball.position, this.hole.position) <= this.hole.holeSize/2)
          {
            this.advanceStage();
          }
      }
      
      // Moves the stage to the next hole
      advanceStage()
      {
        this.holeCount++;
        
        this.ballHitTimer = 0;
        this.newHole();
        this.newBall();
        
        this.render();
      }
      
      // Returns a random spawn range
      getRandomSpawnRange()
      {
        if(random(0,1) > 0.5)
          {
            // Range Left
            return [createVector(this.spawnRanges[0][0].x, this.spawnRanges[0][1].x), createVector(this.spawnRanges[0][0].y, this.spawnRanges[0][1].y)];
          }
        else
          {
            // Range Right
            return [createVector(this.spawnRanges[1][0].x, this.spawnRanges[1][1].x), createVector(this.spawnRanges[1][0].y, this.spawnRanges[1][1].y)];
          }
      }
    }

  class Hole
    {
      constructor(position, golfer)
      {
        this.golfer = golfer;
        this.position = position;
        this.flagResoultion = 6;
        
        // Runtime
        this.windTime = 0;
        this.flagPoints = [];
        
        // Props
        this.holeSize = 36;
        this.poleHeight = 256;
        this.poleThickness = 8;
        this.poleDashHeight = 32;
        this.poleMainColor = color('#FFFEF5');
        this.poleAltColor = color('#E94242');
        this.flagSize = createVector(72, 48);
        this.flagColor = color('#FAFAFA');
        this.flagAmp = this.flagSize.y * 0.25;
        this.flagFreq = 1;
        this.flagPhase = 0;
        this.flagVertOffset = 0;
        this.flagSpeed = -6;
        this.flagWaveFalloff = 1.25;
        this.textColor = color('#1B1B5F');
        this.textSize = 16;
        
        this.generateFlag();
      }
      
      // Generates the flag points for later rendering
      generateFlag()
      {
        let startFlag = createVector(0, -this.poleHeight + (this.flagSize.y / 2) + (this.poleThickness / 4)).add(this.position);
        let endFlag = createVector(this.flagSize.x, 0).add(startFlag);
        
        // Iterate over the flag points and generate them
        for(let i = 0; i < this.flagResoultion; i++)
          {
            let interpolationValue = i / (this.flagResoultion - 1);
            let segmentHeight = lerp(this.flagSize.y, 0, interpolationValue);
            let segmentCenter = p5.Vector.lerp(startFlag, endFlag, interpolationValue);
            
            let topPoint = createVector(0, -segmentHeight/2).add(segmentCenter);
            let bottomPoint = createVector(0, segmentHeight/2).add(segmentCenter);
            
            this.flagPoints.push([topPoint, bottomPoint]);
          }
      }
      
      // Renders the hole
      render()
      {
        // Render the hole
        this.renderHole();
        
        // Render the flag
        this.renderFlag();
        
        // Render the pole
        this.renderPole();
      }
      
      // Renders the hole
      renderHole()
      {
        noStroke();
        fill(color(0));
        
        ellipse(this.position.x, this.position.y, this.holeSize, this.holeSize/2);
      }
      
      // Renders the pole
      renderPole()
      {
        // Render the base pole
        let startPole = createVector(0, 0).add(this.position);
        let endPole = createVector(0, -this.poleHeight).add(startPole);
        
        noFill();
        stroke(this.poleMainColor);
        strokeWeight(this.poleThickness);
        strokeCap(SQUARE);
        
        line(startPole.x, startPole.y, endPole.x, endPole.y);
        
        // Draw the alternating dash colors
        let dashTopColor = this.poleMainColor;
        for(let i = 0; i < floor(this.poleHeight / this.poleDashHeight); i++)
          {
            if(i % 2 != 0)
              {
                dashTopColor = this.poleAltColor;
              }
            else
              {
                dashTopColor = this.poleMainColor;
              }
            
            let startDash = createVector(0, -(i * this.poleDashHeight)).add(startPole);
            let endDash = createVector(0, -this.poleDashHeight).add(startDash);
            if(endDash.y < endPole.y)
              {
                endDash.y = endPole.y;
              }
            
            noFill();
            stroke(dashTopColor);
            strokeWeight(this.poleThickness);
            
            line(startDash.x, startDash.y, endDash.x, endDash.y);
            
            noStroke();
            fill(dashTopColor);
            
            ellipse(startDash.x, startDash.y, this.poleThickness, this.poleThickness/2);
          }
        
        // Draw the end cap top
        dashTopColor = color('hsb(' + round(hue(dashTopColor)) + ', ' + round(saturation(dashTopColor) - 20) + '%, ' + round(brightness(dashTopColor) + 20) + '%)');
        noStroke();
        fill(dashTopColor);
        
        ellipse(endPole.x, endPole.y, this.poleThickness, this.poleThickness/2);
      }
      
      // Renders the flag and pole
      renderFlag()
      {
        // Update the wind time
        this.windTime += deltaTime / 1000;
        
        // Iterate over the flag points and render them as a shape
        noStroke();
        fill(this.flagColor);
        
        beginShape();
        for(let i = 0; i < this.flagPoints.length * 2; i++)
          {
            if(i < this.flagPoints.length)
              {
                // Top Side
                let offset = p5.Vector.lerp(createVector(0,0), createVector(0, SineWave(this.flagAmp, this.flagFreq, this.flagPhase + i, this.flagVertOffset, this.flagSpeed, this.windTime)), i / (this.flagPoints.length * this.flagWaveFalloff));
                vertex(this.flagPoints[i][0].x, this.flagPoints[i][0].y + offset.y);
              }
            if(i >= this.flagPoints.length)
              {
                // Bottom Side
                let iterationIndex = this.flagPoints.length - ((i + 1) % (this.flagPoints.length)) - 1;
                let offset = p5.Vector.lerp(createVector(0,0), createVector(0, SineWave(this.flagAmp, this.flagFreq, this.flagPhase + iterationIndex, this.flagVertOffset, this.flagSpeed, this.windTime)), iterationIndex / (this.flagPoints.length * this.flagWaveFalloff));
                if(i < (this.flagPoints.length * 2) - 1)
                  {
                    vertex(this.flagPoints[iterationIndex][1].x, this.flagPoints[iterationIndex][1].y + offset.y);
                  }
              }
          }
        
        endShape(CLOSE);
        
        // Render the hole text
        let offset = p5.Vector.lerp(createVector(0,0), createVector(0, SineWave(this.flagAmp, this.flagFreq, this.flagPhase + (round(this.flagResoultion) - 1), this.flagVertOffset, this.flagSpeed, this.windTime) * 0.375), (round(this.flagResoultion) - 1) / (this.flagPoints.length * this.flagWaveFalloff));
        let textCenter = createVector(0, this.textSize * 1.25).add(this.flagPoints[round(this.flagResoultion / 2) - 1][0]).sub(offset);
        noStroke();
        fill(this.textColor);
        textSize(this.textSize);
        textAlign(CENTER);
        textStyle(BOLD);
        
        text(this.golfer.holeCount, textCenter.x, textCenter.y)
      }
    }

  class GolfBall
    {
      constructor(golfer, position, debug)
      {
        this.golfer = golfer;
        this.position = position;
        this.height = 0;
        
        // Runtime
        this.travelDuration = 0;
        this.travelLeft = 0;
        this.target = position;
        this.moveHeight = 0;
        this.startPosition = position;
        
        // Props
        this.ballColor = color('#F6F6F6');
        this.shadowColor = color('rgba(6,14,50, 0.25)');
        this.ballSize = 16;
        this.moveMidpoint = 0.25;
        this.moveBounceEnd = 0.9;
        
        this.debug = debug;
        this.targetSize = 6;
        this.targetColor = color('red');
        this.targetStartColor = color('orange');
        this.positionPointColor = color('lime');
      }
      
      setTarget(target, duration, moveHeight)
      {
        this.target = target;
        this.startPosition = createVector(this.position.x, this.position.y);
        this.travelDuration = duration;
        this.travelLeft = duration;
        this.moveHeight = moveHeight;
      }
      
      moveBall()
      {
        this.travelLeft -= deltaTime / 1000;
        
        if(this.travelLeft <= 0)
          {
            this.travelLeft = 0;
            this.golfer.checkAdvanceStage();
          }
        
        let interpolationValue = easeOutSine((this.travelDuration - this.travelLeft) / this.travelDuration);
        let interpolationYValue = easeOutBounce(interpolationValue);
        let midY = lerp(this.startPosition.y, this.target.y, 0.5) - this.moveHeight;
        
        // If the ball is less than or equal to 50% done use the sharp up easing
        if(interpolationValue <= this.moveMidpoint)
          {
            this.height = lerp(0, -this.moveHeight, easeOutQuart(interpolationValue * (1 / this.moveMidpoint)));
          }
        else
          {
            // Use the bounce down easing
            this.height = lerp(-this.moveHeight, 0, easeOutBounce(map(interpolationValue, this.moveMidpoint, this.moveBounceEnd, 0, 1, true)));
          }
        
        this.position = p5.Vector.lerp(this.startPosition, this.target, interpolationValue);
      }
      
      render()
      {
        // Debug
        if(this.debug)
          {
            // Draw targeting line
            noFill();
            stroke(this.targetColor);
            strokeWeight(1);
            
            line(this.target.x, this.target.y + (this.ballSize/2), this.startPosition.x, this.startPosition.y + (this.ballSize/2));
            
            // Draw target
            strokeWeight(this.targetSize);
            
            point(this.target.x, this.target.y + (this.ballSize/2));
            
            // Draw target start
            stroke(this.targetStartColor);
            
            point(this.startPosition.x, this.startPosition.y + (this.ballSize/2));
            
            // Draw the target halfway height
            let halfwayTarget = p5.Vector.lerp(this.startPosition, this.target, this.moveMidpoint);
            let halfwayHeight = createVector(0, -this.moveHeight).add(halfwayTarget);
            let targetEndBounce = p5.Vector.lerp(this.startPosition, this.target, this.moveBounceEnd);
            stroke(this.targetColor);
            strokeWeight(1);
            
            line(halfwayTarget.x, halfwayTarget.y + (this.ballSize/2), halfwayHeight.x, halfwayHeight.y + (this.ballSize/2));
            
            // Draw the halfway height point
            strokeWeight(this.targetSize);
            
            point(halfwayHeight.x, halfwayHeight.y + (this.ballSize/2));
            
            // Draw the target halfway point
            point(halfwayTarget.x, halfwayTarget.y + (this.ballSize/2));
            
            // Draw the target bounce end point
            point(targetEndBounce.x, targetEndBounce.y + (this.ballSize/2));
            
            // Draw the position point
            stroke(this.positionPointColor);
            
            point(this.position.x, this.position.y + (this.ballSize/2));
          }
        
        // Move the ball
        this.moveBall();
        
        // Render the shadow
        noStroke();
        fill(this.shadowColor);
        
        ellipse(this.position.x, this.position.y + (this.ballSize / 2), this.ballSize, this.ballSize/2);
        
        // Render the ball
        fill(this.ballColor);
        
        circle(this.position.x, this.position.y + this.height, this.ballSize);
      }
    }
  
  this.ground = new Ground();
  this.golfer = new Golfer();

  this.setup = function() {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
    randomSeed(year() + month() + day() + hour() + minute() + second());
  }

  this.draw = function() {
    this.ground.render();
    this.golfer.render();
  }
}

// Galaga Scene
function Logo_Galaga()
{
  class Galaga
    {
      constructor(spriteSheet, highScore)
      {
        // Game Area
        this.gameArea = {start: createVector(width/2, 0), size: createVector(width/2, height)};
        // Game Board
        this.gameBoard = {start: createVector((width/2) + 100, 40), size: createVector((width / 2) - 175, height - 90)};
        // Score Board
        this.scoreBoard = {start: createVector(82, 50), size: createVector((width / 2) - 175, height - 275)};
        
        // Props
        this.spriteSize = 3;
        this.spritePixelOverdraw = 0.25;
        this.entryLoopRadius = 45;
        this.entryUpwardsLoopRotatePoint = createVector(this.gameBoard.size.x * 0.25, this.gameBoard.size.y * 0.55).add(this.gameBoard.start);
        
        // Sprite Manager
        this.spriteManager = new SpriteManager(spriteSheet);
        
        // Background
        this.background = new StarField(this);
        
        // Info
        this.info = new InfoBoard(this);
        
        // Enemy Array
        this.enemyArray = new EnemyArray(this, floor(this.gameBoard.size.x / (12 * this.spriteSize)) - 2, floor((this.gameBoard.size.y * 0.4) / (12 * this.spriteSize)) - 2);
        
        // Ship
        this.ship = new Ship(this);
        
        // Fireables
        this.bullets = new Queue();
        this.lasers = new Queue();

        // Game State
        this.highScore = highScore;
        if(highScore === undefined)
          {
            this.highScore = 0;
          }
        this.hasOneUp = false;
        this.score = 0;
        this.roundRecap = false;
        this.roundRating = 'PERFECT!'; // PERFECT!, GREAT!, GOOD., POOR.
        this.roundHits = 0;
        this.roundMisses = 0;
        this.roundBonus = 0;
        this.lives = 2;
        this.gameRecap = false;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.shotsMissed = 0;
        this.stageStart = false;
        this.deathDisplay = false;
        this.deathDisplayTimer = 0;
        this.gameRecapTimer = 0;
        // Stage
        this.level = 1;
        this.enemiesRemaining = 0;
        this.enemiesUnspawned = 0;
        this.enemiesPerWave = 0;
        this.wavesPerSpawn = 0;
        this.levelEntrancePattern = 0;
        this.shootingModes = [];
        this.levelShootCount = 0;
        this.nextLevelStartTimer = 0;
        // Spawning
        this.spawnTimer = 0;
        this.waveTimer = 0;
        this.spawnQueue = new Queue();
        this.enemyQueue = new Queue();
        this.sideSpawnedLast = 0;
        this.mixedWaveChance = 0.03;
        this.grasshopperWaveChance = 0.09;
        this.butterflyWaveChance = 0.2;
        
        // Props
        this.deathDisplayDuration = 2;
        this.spawnInterval = 4;
        this.spawnWaveInterval = 0.625;
        this.spawnEnemyInterval = 0.2;
        this.spawnEnemyShootDelayInterval = 0.05;
        this.maxLives = 10;
        this.levelGapDuration = 3;
        this.nextLevelReady = 0.75;
        this.gameRecapDuration = 8;
        
        // Debug
        this.debug = false;
        this.gameBorderColor = color('red');
        this.entryRotatePointSize = 4;
        this.entryRotatePointColor = color('lime');
        
        // Get the stage 1 settings
        this.getSettingsForStage();
      }
      
      // Renders the current game frame
      render()
      {
        // Check for the game recap
        this.gameRecapTimer -= deltaTime / 1000;
        if(this.gameRecap)
          {
            this.stageStart = false;
            this.deathDisplay = false;
            this.roundRecap = false;
          }
        if(this.gameRecapTimer <= 0 && this.gameRecap)
          {
            if(this.highScore < this.score)
              {
                this.highScore = this.score;
              }
            this.resetGame();
          }
        
        // Check if the next level gap is happening
        this.nextLevelStartTimer -= deltaTime / 1000;
        if(this.nextLevelStartTimer <= this.nextLevelReady && (this.roundRecap || this.stageStart))
          {
            this.roundRecap = false;
            this.stageStart = true;
            this.deathDisplay = false;
            if(this.nextLevelStartTimer <= 0)
              {
                this.stageStart = false;
                // Get new settings for stage
                this.getSettingsForStage();
              }
          }
        
        // Update the spawning of the waves
        this.updateSpawns();
        
        // Render the black background
        background(0);
        
        // Render star field
        this.background.render();
        
        // Render a cover behind the board to prevent enemies from being seen on the board
        noStroke();
        fill(color(0));
        
        rect(0, 0, width/2, height);
        
        // Update the death display
        if(this.deathDisplay)
          {
            this.deathDisplayTimer -= deltaTime / 1000;
            if(this.deathDisplayTimer <= 0)
              {
                this.deathDisplay = false;
                this.ship.canMove = true;
                this.ship.hideShip = false;
              }
          }
        
        // Render the info board
        this.info.render();
        
        // Render the debug if needed
        if(this.debug)
          {
            // Game Border
            noFill();
            stroke(this.gameBorderColor);
            strokeWeight(1);

            rect(this.gameBoard.start.x, this.gameBoard.start.y, this.gameBoard.size.x, this.gameBoard.size.y);
            
            // Entry Rotate Points
            let entryLoopPointDistToStartEdgeX = this.entryUpwardsLoopRotatePoint.x - this.gameBoard.start.x;
            let gameBoardEndX = this.gameBoard.start.x + this.gameBoard.size.x;
            let flippedEntryUpwardsLoopRotatePoint = createVector(gameBoardEndX - entryLoopPointDistToStartEdgeX, this.entryUpwardsLoopRotatePoint.y);
            stroke(this.entryRotatePointColor);
            strokeWeight(this.entryRotatePointSize);
            
            point(this.entryUpwardsLoopRotatePoint.x, this.entryUpwardsLoopRotatePoint.y);
            point(flippedEntryUpwardsLoopRotatePoint.x, flippedEntryUpwardsLoopRotatePoint.y);
            
            noStroke();
            fill(this.entryRotatePointColor);
            textSize(6);
            textAlign(LEFT);
            
            text('Upwards Entry Center', this.entryUpwardsLoopRotatePoint.x + 2, this.entryUpwardsLoopRotatePoint.y);
            text('Upwards Entry Center Flipped', flippedEntryUpwardsLoopRotatePoint.x + 2, flippedEntryUpwardsLoopRotatePoint.y);
            
            // Entry Rotate Radi
            noFill();
            stroke(this.entryRotatePointColor);
            strokeWeight(1);
            
            circle(this.entryUpwardsLoopRotatePoint.x, this.entryUpwardsLoopRotatePoint.y, this.entryLoopRadius * 2);
            circle(flippedEntryUpwardsLoopRotatePoint.x, flippedEntryUpwardsLoopRotatePoint.y, this.entryLoopRadius * 2);
          }
        
        // Update the enemy array
        this.enemyArray.update();
        
        // Render each enemy in the enemy array
        this.enemyArray.render();
        
        // Render the player ship
        this.ship.render();
        
        // Update and render all fireables
        this.updateFireables();
      }
      
      // Checks if the stage should advance after the death of an enemy
      confirmEnemyDeath()
      {
        // Check if all enemies have been destroyed
        if(this.enemiesRemaining <= 0)
          {
            this.advanceStage();
          }
      }
      
      // Checks if the stage should restart after the death of the player
      confirmPlayerDeath()
      {
        if(this.lives <= 0)
          {
            // Store the current hits to the game hits
            this.shotsHit += this.roundHits;
            this.roundHits = 0;
            this.shotsMissed += this.roundMisses;
            this.roundMisses = 0;
            this.gameRecapTimer = this.gameRecapDuration;
            this.gameRecap = true;
            this.stageStart = false;
            this.deathDisplay = false;
            this.roundRecap = false;
          }
      }
      
      // Determines if a new wave of enemies needs to be spawned and spawn any waves avaible
      updateSpawns()
      {
        this.spawnTimer -= deltaTime / 1000;
        this.waveTimer += deltaTime / 1000;
        if(this.spawnTimer <= 0)
          {
            // Attempt to spawn enemies
            if(this.enemiesUnspawned > 0)
              {
                let wavesToSpawn = this.wavesPerSpawn;
                // Iterate over each wave
                for(let w = 0; w < wavesToSpawn; w++)
                  {
                    // Determine how many enemies can spawn in this wave
                    let openSlots = this.enemyArray.getOpenSlots();
                    let maxEnemiesInWave = min(this.enemiesPerWave, this.enemiesUnspawned, openSlots.size());
                    let waveEnemyType = this.getEnemyWaveType();
                    let enemies = [];
                    for(let e = 0; e < maxEnemiesInWave; e++)
                      {
                        this.enemiesUnspawned--;
                        let enemySlot = openSlots.dequeue()[0];
                        let enemyFirstShotDelay = 0.625 + (e * this.spawnEnemyShootDelayInterval);
                        // NEED TO CHANGE ENTRANCE PATTERN TO BE DYNAMIC PER WAVE!!
                        let enemy = null;
                        if(waveEnemyType == 'Mixed')
                          {
                            // Random Enemy
                            let randomEnemy = round(random(0,2));
                            switch(randomEnemy)
                              {
                                case 0:
                                  // Grasshopper Enemy
                                  enemy = new Grasshopper(this, 2.5, this.generateEntryPath(1, ((w + this.sideSpawnedLast) % 2) == 1), enemySlot, this.shootingModes, enemyFirstShotDelay);
                                  break;
                                case 1:
                                  // Butterfly Enemy
                                  enemy = new Butterfly(this, 2.5, this.generateEntryPath(1, ((w + this.sideSpawnedLast) % 2) == 1), enemySlot, this.shootingModes, enemyFirstShotDelay);
                                  break;
                                case 2:
                                default:
                                  // Bee Enemy
                                  enemy = new Bee(this, 2.5, this.generateEntryPath(1, ((w + this.sideSpawnedLast) % 2) == 1), enemySlot, this.shootingModes, enemyFirstShotDelay);
                                  break;
                              }
                          }
                        else if(waveEnemyType == 'Grasshopper')
                          {
                            // Grasshopper Enemy
                            enemy = new Grasshopper(this, 2.5, this.generateEntryPath(1, ((w + this.sideSpawnedLast) % 2) == 1), enemySlot, this.shootingModes, enemyFirstShotDelay);
                          }
                        else if(waveEnemyType == 'Butterfly')
                          {
                            // Butterfly Enemy
                            enemy = new Butterfly(this, 2.5, this.generateEntryPath(1, ((w + this.sideSpawnedLast) % 2) == 1), enemySlot, this.shootingModes, enemyFirstShotDelay);
                          }
                        else if(waveEnemyType == 'Bee')
                          {
                            // Bee Enemy
                            enemy = new Bee(this, 2.5, this.generateEntryPath(1, ((w + this.sideSpawnedLast) % 2) == 1), enemySlot, this.shootingModes, enemyFirstShotDelay);
                          }
                        
                        enemies.push(enemy);
                      }
                    
                    // Create the spawn wave
                    let wave = new SpawnWave(enemies, this.waveTimer + (floor(w / 2) * this.spawnWaveInterval));
                    this.spawnQueue.enqueue(wave);
                    this.sideSpawnedLast++;
                  }
              }
            
            this.spawnTimer = this.spawnInterval;
          }
        
        // Spawn any avaible waves
        if(this.spawnQueue.size() > 0)
          {
            let newSpawnQueue = new Queue();
            // Iterate over the spawn queue and check if any of the spawnable waves are ready
            while(this.spawnQueue.size() > 0)
              {
                let wave = this.spawnQueue.dequeue()[0];
                if(wave.start <= this.waveTimer)
                  {
                    // Spawn the wave
                    // Iterate over the enemeies in the wave and set them as spawnables
                    for(let e = 0; e < wave.enemies.length; e++)
                      {
                        let enemy = new SpawnEnemy(wave.enemies[e], this.waveTimer + (e * this.spawnEnemyInterval));
                        this.enemyQueue.enqueue(enemy);
                      }
                  }
                else
                  {
                    newSpawnQueue.enqueue(wave);
                  }
              }
            this.spawnQueue = newSpawnQueue;
          }
        
        // Spawn any enemies
        if(this.enemyQueue.size() > 0)
          {
            let newEnemyQueue = new Queue();
            // Iterate over the enemy queue and check if any of the spawnable enemies are ready
            while(this.enemyQueue.size() > 0)
              {
                let enemy = this.enemyQueue.dequeue()[0];
                if(enemy.start <= this.waveTimer)
                  {
                    // Spawn the Enemy
                    this.enemyArray.heldEnemies[enemy.enemy.enemySlot.x][enemy.enemy.enemySlot.y] = enemy.enemy;
                  }
                else
                  {
                    newEnemyQueue.enqueue(enemy);
                  }
              }
            this.enemyQueue = newEnemyQueue;
          }
      }
      
      // Returns the type of wave to spawn
      getEnemyWaveType()
      {
        // Chances for each type of wave
        let randomRoll = random(0,1);
        if(randomRoll > 1 - this.mixedWaveChance)
          {
            // Mixed
            return 'Mixed';
          }
        if(randomRoll > 1 - this.grasshopperWaveChance)
          {
            // Grasshopper
            return 'Grasshopper';
          }
        if(randomRoll > 1 - this.butterflyWaveChance)
          {
            // Butterfly
            return 'Butterfly';
          }
        
        // If all other waves have failed, just spawn bees
        return 'Bee';
      }
      
      // Generates an entry path given a mode input
      generateEntryPath(mode, side)
      {
        let entryPath = null;
        switch(mode)
          {
            case 0:
            default:
              entryPath = this.generateDownwardsLoopEntry(side);
              break;
            case 1:
              entryPath = this.generateUpwardsLoopEntry(side);
              break;
          }
        
        return entryPath;
      }
      
      // Generates the upwards loop entry path
      generateUpwardsLoopEntry(side)
      {
        // Create the path
        let pathSegments = [];
        
        let outOfBoundsSpawnDistance = 50;
        
        if(side)
          {
            // Flipped
            // Offset to the top half a sprite size
            let offsetPath = createVector((12 * this.spriteSize) / 2, (12 * this.spriteSize) / 2);
            let entryLoopPointDistToStartEdgeX = this.entryUpwardsLoopRotatePoint.x - this.gameBoard.start.x;
            let gameBoardEndX = this.gameBoard.start.x + this.gameBoard.size.x;
            let flippedEntryUpwardsLoopRotatePoint = createVector(gameBoardEndX - entryLoopPointDistToStartEdgeX, this.entryUpwardsLoopRotatePoint.y);
            // Segment 1
            // Get the end of first segment
            let endSeg1 = createVector(this.entryLoopRadius, 0).rotate(135 * (PI/180)).add(flippedEntryUpwardsLoopRotatePoint).sub(offsetPath);
            // Get the start of first segment
            let distToSide = this.entryUpwardsLoopRotatePoint.x - this.gameBoard.start.x;
            let startSeg1 = createVector((distToSide + outOfBoundsSpawnDistance), distToSide + outOfBoundsSpawnDistance).add(endSeg1);

            pathSegments.push(new LinearSegment([startSeg1, endSeg1]));

            // Segment 2
            // Use the end of seg1 as the start of seg2
            let startSeg2 = endSeg1;
            // End of seg2 is a 4th of the way around the circle
            let endSeg2 = createVector(-(this.entryLoopRadius / sqrt(2)), -(this.entryLoopRadius / sqrt(2))).add(flippedEntryUpwardsLoopRotatePoint).sub(offsetPath);
            // The control vectors are a subset of the radius of the loop
            let controlLength = this.entryLoopRadius / 2.5;
            let startControlSeg2 = createVector(-controlLength, -controlLength).add(startSeg2);
            let endControlSeg2 = createVector(-controlLength, controlLength).add(endSeg2);

            pathSegments.push(new BezierSegment([startSeg2, startControlSeg2, endControlSeg2, endSeg2]));

            // Segment 3
            // Use the end of seg2 as the start of seg3
            let startSeg3 = endSeg2;
            // End of seg3 is two 4ths of the way around the circle
            let endSeg3 = createVector((this.entryLoopRadius / sqrt(2)), -(this.entryLoopRadius / sqrt(2))).add(flippedEntryUpwardsLoopRotatePoint).sub(offsetPath);
            let startControlSeg3 = createVector(controlLength, -controlLength).add(startSeg3);
            let endControlSeg3 = createVector(-controlLength, -controlLength).add(endSeg3);

            pathSegments.push(new BezierSegment([startSeg3, startControlSeg3, endControlSeg3, endSeg3]));

            // Segment 4
            // Use the end of seg3 as the start of seg4
            let startSeg4 = endSeg3;
            // End of seg4 is three 4ths of the way around the circle
            let endSeg4 = createVector((this.entryLoopRadius / sqrt(2)), (this.entryLoopRadius / sqrt(2))).add(flippedEntryUpwardsLoopRotatePoint).sub(offsetPath);
            let startControlSeg4 = createVector(controlLength, controlLength).add(startSeg4);
            let endControlSeg4 = createVector(controlLength, -controlLength).add(endSeg4);

            pathSegments.push(new BezierSegment([startSeg4, startControlSeg4, endControlSeg4, endSeg4]));

            // Segment 5
            // Use the end of seg4 as the start of seg5
            let startSeg5 = endSeg4;
            // End of seg5 is all of the way around the circle
            let endSeg5 = createVector(-(this.entryLoopRadius / sqrt(2)), (this.entryLoopRadius / sqrt(2))).add(flippedEntryUpwardsLoopRotatePoint).sub(offsetPath);
            let startControlSeg5 = createVector(-controlLength, controlLength).add(startSeg5);
            let endControlSeg5 = createVector(controlLength, controlLength).add(endSeg5);

            pathSegments.push(new BezierSegment([startSeg5, startControlSeg5, endControlSeg5, endSeg5]));

            // Segment 6
            // The last segment in the normal transform
            // Use the end of seg5 as the start of seg6
            let startSeg6 = endSeg5;
            // Move the end of the segment to the middle of the board
            let xDistToCenter = (this.gameBoard.start.x + (this.gameBoard.size.x/2)) - startSeg6.x;
            let endSeg6 = createVector(xDistToCenter, xDistToCenter).add(startSeg6).sub(offsetPath);

            pathSegments.push(new LinearSegment([startSeg6, endSeg6]));
          }
        else
          {
            // Non-flipped
            // Offset to the left half a sprite size
            let offsetPath = createVector((12 * this.spriteSize) / 2, (12 * this.spriteSize) / 2);
            // Segment 1
            // Get the end of first segment
            let endSeg1 = createVector(this.entryLoopRadius, 0).rotate(45 * (PI/180)).add(this.entryUpwardsLoopRotatePoint).sub(offsetPath);
            // Get the start of first segment
            let distToSide = this.entryUpwardsLoopRotatePoint.x - this.gameBoard.start.x;
            let startSeg1 = createVector(-(distToSide + outOfBoundsSpawnDistance), distToSide + outOfBoundsSpawnDistance).add(endSeg1);

            pathSegments.push(new LinearSegment([startSeg1, endSeg1]));

            // Segment 2
            // Use the end of seg1 as the start of seg2
            let startSeg2 = endSeg1;
            // End of seg2 is a 4th of the way around the circle
            let endSeg2 = createVector(this.entryLoopRadius / sqrt(2), -(this.entryLoopRadius / sqrt(2))).add(this.entryUpwardsLoopRotatePoint).sub(offsetPath);
            // The control vectors are a subset of the radius of the loop
            let controlLength = this.entryLoopRadius / 2.5;
            let startControlSeg2 = createVector(controlLength, -controlLength).add(startSeg2);
            let endControlSeg2 = createVector(controlLength, controlLength).add(endSeg2);

            pathSegments.push(new BezierSegment([startSeg2, startControlSeg2, endControlSeg2, endSeg2]));

            // Segment 3
            // Use the end of seg2 as the start of seg3
            let startSeg3 = endSeg2;
            // End of seg3 is two 4ths of the way around the circle
            let endSeg3 = createVector(-(this.entryLoopRadius / sqrt(2)), -(this.entryLoopRadius / sqrt(2))).add(this.entryUpwardsLoopRotatePoint).sub(offsetPath);
            let startControlSeg3 = createVector(-controlLength, -controlLength).add(startSeg3);
            let endControlSeg3 = createVector(controlLength, -controlLength).add(endSeg3);

            pathSegments.push(new BezierSegment([startSeg3, startControlSeg3, endControlSeg3, endSeg3]));

            // Segment 4
            // Use the end of seg3 as the start of seg4
            let startSeg4 = endSeg3;
            // End of seg4 is three 4ths of the way around the circle
            let endSeg4 = createVector(-(this.entryLoopRadius / sqrt(2)), (this.entryLoopRadius / sqrt(2))).add(this.entryUpwardsLoopRotatePoint).sub(offsetPath);
            let startControlSeg4 = createVector(-controlLength, controlLength).add(startSeg4);
            let endControlSeg4 = createVector(-controlLength, -controlLength).add(endSeg4);

            pathSegments.push(new BezierSegment([startSeg4, startControlSeg4, endControlSeg4, endSeg4]));

            // Segment 5
            // Use the end of seg4 as the start of seg5
            let startSeg5 = endSeg4;
            // End of seg5 is all of the way around the circle
            let endSeg5 = createVector((this.entryLoopRadius / sqrt(2)), (this.entryLoopRadius / sqrt(2))).add(this.entryUpwardsLoopRotatePoint).sub(offsetPath);
            let startControlSeg5 = createVector(controlLength, controlLength).add(startSeg5);
            let endControlSeg5 = createVector(-controlLength, controlLength).add(endSeg5);

            pathSegments.push(new BezierSegment([startSeg5, startControlSeg5, endControlSeg5, endSeg5]));

            // Segment 6
            // The last segment in the normal transform
            // Use the end of seg5 as the start of seg6
            let startSeg6 = endSeg5;
            // Move the end of the segment to the middle of the board
            let xDistToCenter = (this.gameBoard.start.x + (this.gameBoard.size.x/2)) - startSeg6.x;
            let endSeg6 = createVector(xDistToCenter, -xDistToCenter).add(startSeg6);

            pathSegments.push(new LinearSegment([startSeg6, endSeg6]));
          }
        
        return new MovementPath(pathSegments);
      }
      
      // Generates the downwards loop entry path
      generateDownwardsLoopEntry(side)
      {
        // All Beziers
      }
      
      // Updates all bullets and lasers currently in the scene
      updateFireables()
      {
        // Update bullets
        // Create a new replacement queue
        let newBulletQueue = new Queue();
        // Iterate over the bullet queue and either update or destory the bullet
        while(this.bullets.size() > 0)
          {
            // Grab the bullet
            let bullet = this.bullets.dequeue()[0];
            
            // Update the bullet
            bullet.update();
            
            // Test if the bullet has hit the player
            let hitPlayer = this.ship.checkHit(bullet.position, bullet.hitBox);
            
            // If the bullet has hit the player
            if(hitPlayer && this.ship.canMove)
              {
                // Remove a life
                this.lives--;
                this.confirmPlayerDeath();
                this.deathDisplayTimer = this.deathDisplayDuration;
                this.deathDisplay = true;
                this.ship.displayDeath();
              }
            
            // Test if the bullet has gone out of bounds
            let isBulletVisible = this.isInGameBoard(bullet.position, 50);
            if(isBulletVisible && !hitPlayer)
              {
                // Render the bullet
                bullet.render();
                
                // Add the bullet to the new queue
                newBulletQueue.enqueue(bullet);
              }
          }
        
        this.bullets = newBulletQueue;
        
        // Update Lasers
        // Create a new replacement queue
        let newLaserQueue = new Queue();
        // Iterate over the laser queue and either update or destory the laser
        while(this.lasers.size() > 0)
          {
            // Grab the laser
            let laser = this.lasers.dequeue()[0];
            
            // Update the laser
            laser.update();
            
            // Test if the laser has hit an enemy by iterating through all enemies
            let enemies = this.enemyArray.getAllEnemies();
            let hitEnemy = false;
            for(let i = 0; i < enemies.length; i++)
              {
                let enemy = this.enemyArray.heldEnemies[enemies[i].x][enemies[i].y];
                hitEnemy = enemy.checkHit(laser.position, laser.hitBox);
                if(hitEnemy)
                  {
                    enemy.triggerDeath();
                    this.roundHits++;
                    break;
                  }
              }
            
            // Test if the laser has gone out of bounds
            let isLaserVisible = this.isInGameBoard(laser.position, 50);
            if(isLaserVisible && !hitEnemy)
              {
                // Render the laser
                laser.render();
                
                // Add the bullet to the new queue
                newLaserQueue.enqueue(laser);
              }
            
            if(!isLaserVisible && !hitEnemy)
              {
                // The laser missed everything
                this.roundMisses++;
              }
          }
        
        this.lasers = newLaserQueue;
      }
      
      // Returns a boolean test if a position is within the game board bounds, can add a margin
      isInGameBoard(position, margin)
      {
        if(margin === undefined || margin == null)
          {
            margin = 0;
          }
        
        let start = this.gameBoard.start;
        let end = p5.Vector.add(this.gameBoard.start, this.gameBoard.size);
        
        if(position.x >= start.x - margin && position.x <= end.x + margin)
          {
            if(position.y >= start.y - margin && position.y <= end.y + margin)
              {
                return true;
              }
          }
        
        return false;
      }
      
      // Adjusts settings for new stage
      getSettingsForStage()
      {
        // Each stage has an amount of enemies that you need to dispatch, higher as you go on > enemies = round((0.75 * stage) + 4)
        this.enemiesRemaining = round((0.75 * this.level) + 4);
        this.enemiesUnspawned = round((0.75 * this.level) + 4);
        
        // Each stage has an amount of enemies that can spawn in a single wave, higher as you go on > enemies = round((0.15 * stage) + 1)
        this.enemiesPerWave = ceil((0.15 * this.level) + 1);
        
        // Each stage has an amount of waves that can spawn at once, higher as you go on > enemies = floor((0.05 * stage) + 1.6);
        this.wavesPerSpawn = floor((0.05 * this.level) + 1.6);
        
        // Each stage has an entrance pattern > Alternating every stage between 0 and 1
        this.levelEntrancePattern = this.level % 2;
        
        // Each stage has one or multiple shoot modes (shoot on enter, shoot in formation, shoot on dive) > for every 2 stages pattern changes like this repeating [SOE, SOF, SOD, SOE/SOD, SOF/SOD, SOE/SOF/SOD]
        this.shootingModes = this.getShootingModes();
        
        // Each stage has progressively more shoot amounts per enemy > shots = ceil((0.07 * stage) + -0.1)
        this.levelShootCount = ceil((0.07 * this.level) + -0.1);
        
        // Reset round specific data
        this.shotsHit += this.roundHits;
        this.roundHits = 0;
        this.shotsMissed += this.roundMisses;
        this.roundMisses = 0;
      }
      
      // Returns an array of all possible shooting modes for the current stage
      getShootingModes()
      {
        let shootingModes = [];
        let stageCase = this.level % 6;
        
        // Enter
        if(stageCase == 0 || stageCase == 3 || stageCase == 5)
          {
            shootingModes.push('onEnter');
          }
        
        // Formation
        if(stageCase == 1 || stageCase == 4 || stageCase == 5)
          {
            shootingModes.push('onFormation');
          }
        
        // Dive
        if(stageCase == 2 || stageCase == 3 || stageCase == 4 || stageCase == 5)
          {
            shootingModes.push('onDive');
          }
        
        return shootingModes;
      }
      
      // Returns the closest position of an enemy projectile to a position
      getClosestEnemyProjectile(position)
      {
        let enemyProjectilesHeld = this.getAllEnemyProjectiles();
        // If there are no enemys in the held slots, return the passed position
        if(enemyProjectilesHeld.length == 0)
          {
            return position;
          }
        else
          {
            // Iterate over the enemy projectiles and find the closest to the position, returning the true game position of the projectile when found
            let closestDistance = 0;
            let closestProjectilePosition = createVector(0,0);
            for(let i = 0; i < enemyProjectilesHeld.length; i++)
              {
                let currentPosition = enemyProjectilesHeld[i];
                let distToPosition = p5.Vector.dist(currentPosition, position);
                if(i == 0)
                  {
                    // Store the first projectile
                    closestDistance = distToPosition;
                    closestProjectilePosition = currentPosition;
                  }
                
                
                if(distToPosition < closestDistance)
                  {
                    // Store the current projectile positon
                    closestDistance = distToPosition;
                    closestProjectilePosition = currentPosition;
                  }
              }
            
            return closestProjectilePosition;
          }
      }
      
      // Returns an array of all the active enemy projectiles
      getAllEnemyProjectiles()
      {
        let projectiles = [];
        let newBulletQueue = new Queue();
        // Iterate over the bullet queue and extract all their positions
        while(this.bullets.size() > 0)
          {
            // Grab the bullet
            let bullet = this.bullets.dequeue()[0];
            
            // Get the position of the bullet
            projectiles.push(bullet.position);
            
            // Add the bullet to the new queue
            newBulletQueue.enqueue(bullet);
          }
        
        this.bullets = newBulletQueue;
        
        return projectiles;
      }
      
      // Advance the stage
      advanceStage()
      {
        this.level++;
        // Give a bonus life every 5 stages (capped to a max)
        if(this.level % 5 == 0)
          {
            if(this.lives < this.maxLives)
              {
                this.lives++;
              }
          }
        
        this.roundRecap = true;
        this.calculateRoundRating();
        this.nextLevelStartTimer = this.levelGapDuration;
      }
      
      // Stores a round rating based on the round hit to miss ratio
      calculateRoundRating()
      {
        let hitMissRatio = this.roundHits / (this.roundMisses + this.roundHits);
        let rating = 'PERFECT!';
        if(hitMissRatio >= 0.9)
          {
            rating = 'PERFECT!';
          }
        else if(hitMissRatio >= 0.75)
          {
            rating = 'GREAT!';
          }
        else if(hitMissRatio >= 0.5)
          {
            rating = 'GOOD.';
          }
        else
          {
            rating = 'POOR...'; 
          }
        this.roundRating = rating;
      }
      
      // Resets the whole game
      resetGame()
      {
        galagaHighscore = this.highScore;
        galaga = new Galaga(sprites, this.highScore);
      }
    }

  // Used to render the starfield background
  class StarField
    {
      constructor(gameManager)
      {
        this.gameManager = gameManager;
        this.starCount = 45;
        this.starColors = [color('#f80000'), color('#0050f8'), color('#00a058'), color('#f8e800'), color('#b000f8'), color('#50f8f8'), color('#f800f8'), color('#00f850'), color('#f89800')];
        this.starSpeeds = createVector(1, 4);
        this.starSpeedMult = 48;
        this.starSize = createVector(2,2);
        
        // Runtime
        this.stars = [];
        this.colors = [];
        this.speeds = [];
        
        this.generateStars();
      }
      
      // Creates a series of stars and offsets
      generateStars()
      {
        // Iterate over the star count
        let start = this.gameManager.gameArea.start;
        for(let i = 0; i < this.starCount; i++)
          {
            // Create the star offset
            let offsetY = round(random(0,this.gameManager.gameArea.size.y));
            // Create the star position
            this.stars.push(createVector(start.x + round(random(0, this.gameManager.gameArea.size.x)), start.y + offsetY));
            // Create the star color
            this.colors.push(this.starColors[round(random(0, this.starColors.length - 1))]);
            // Create the star speed
            this.speeds.push(round(random(this.starSpeeds.x, this.starSpeeds.y)) * this.starSpeedMult);
          }
      }
      
      // Updates and renders the star field
      render()
      {
        // Render each star
        this.renderStars();
      }
      
      // Renders all the stars
      renderStars()
      {
        // Iterate over each star
        let fieldHeight = this.gameManager.gameArea.size.y;
        let fieldStart = this.gameManager.gameArea.start.y;
        for(let i = 0; i < this.stars.length; i++)
          {
            // Get the properties of the star
            let position = this.stars[i];
            let color = this.colors[i];
            let speed = this.speeds[i];
            
            // Update the offset
            position.y += (deltaTime / 1000) * speed;
            
            // Loop the position
            position.y = (position.y % (fieldHeight - fieldStart)) + fieldStart;
            
            // Render the star
            noStroke();
            fill(color);
            
            rect(position.x, round(position.y), this.starSize.x, this.starSize.y);
          }
      }
    }

  // Used to render the info board
  class InfoBoard
    {
      constructor(gameManager)
      {
        this.gameManager = gameManager;
        
        // Props
        this.textHeight = 24;
        this.scoreLength = 6;
        this.spriteSize = 3;
        this.mainColor = color('#FFFFFF');
        this.subColor = color('#f80000');
        this.highlightColor = color('#f8e800');
        this.altColor = color('#50f8f8');
        this.deathMessage2Length = 0.5;
        this.pulseTime = 0;
        this.pulseSpeed = 1.5;
        
        // Sprites
        this.lifeSprite = [];
        this.levelSprites = [];
        
        // Info Locations
        this.highScore = createVector(0,0);
        this.oneUp = createVector(0,0);
        this.score = createVector(0,0);
        this.highScoreValue = createVector(0,0);
        this.roundRating = createVector(0,0);
        this.roundHits = createVector(0,0);
        this.roundBonus = createVector(0,0);
        this.gameHitMiss = createVector(0,0);
        this.level = createVector(0,0);
        this.lives = createVector(0,0);
        
        // Debug
        this.debug = false;
        this.boardBorderColor = color('red');
        this.pointSize = 6;
        this.livesAnchorColor = color('cyan');
        
        this.generateInfoLocations();
        this.fetchUISprites();
      }
      
      // Generates the info anchor points
      generateInfoLocations()
      {
        // General Purpose Properties
        let startBoard = this.gameManager.scoreBoard.start;
        let centerBoard = createVector(this.gameManager.scoreBoard.start.x + (this.gameManager.scoreBoard.size.x/2), this.gameManager.scoreBoard.start.y + (this.gameManager.scoreBoard.size.y/2));
        let endBoard = createVector(this.gameManager.scoreBoard.start.x + this.gameManager.scoreBoard.size.x, this.gameManager.scoreBoard.start.y + this.gameManager.scoreBoard.size.y);
        let lineHeightHalf = this.textHeight / 2;
        let row1 = this.gameManager.scoreBoard.start.y + lineHeightHalf;
        let row2 = this.gameManager.scoreBoard.start.y + this.textHeight + (this.textHeight / 4);
        let rowCenter = centerBoard.y + lineHeightHalf;
        
        // High Score
        this.highScore = createVector(centerBoard.x, row1);
        
        // 1 Up
        let highScoreWidth = textWidth('HIGH SCORE');
        let halfRemainingArea = (this.gameManager.scoreBoard.size.x - highScoreWidth) / 2;
        this.oneUp = createVector(startBoard.x + (halfRemainingArea / 2), row1);
        
        // Score
        this.score = createVector(startBoard.x, row2);
        
        // High Score (Value)
        this.highScoreValue = createVector(centerBoard.x, row2);
        
        // Round Recap - Hits
        this.roundHits = createVector(centerBoard.x, rowCenter);
        
        // Round Recap - Rating
        this.roundRating = createVector(centerBoard.x, rowCenter - (this.textHeight * 2));
        
        // Round Recap - Bonus
        this.roundBonus = createVector(centerBoard.x, rowCenter + (this.textHeight * 2));
        
        // Lives
        this.lives = createVector(startBoard.x, endBoard.y);
        
        // Level
        this.level = createVector(endBoard.x, endBoard.y);
        
        // Game Recap - Hit-Miss Ratio
        this.gameHitMiss = createVector(this.roundBonus.x, this.roundBonus.y + (this.textHeight * 2));
      }
      
      // Fetches sprite info
      fetchUISprites()
      {
        // Life
        this.lifeSprite = this.gameManager.spriteManager.getSpriteIcon('Life');
        
        // Levels
        this.levelSprites.push(this.gameManager.spriteManager.getSpriteIcon('Level1'));
        this.levelSprites.push(this.gameManager.spriteManager.getSpriteIcon('Level5'));
        this.levelSprites.push(this.gameManager.spriteManager.getSpriteIcon('Level10'));
        this.levelSprites.push(this.gameManager.spriteManager.getSpriteIcon('Level20'));
        this.levelSprites.push(this.gameManager.spriteManager.getSpriteIcon('Level30'));
        this.levelSprites.push(this.gameManager.spriteManager.getSpriteIcon('Level50'));
      }
      
      // Render the info board
      render()
      {
        // Debug
        if(this.debug)
          {
            // Border
            noFill();
            stroke(this.boardBorderColor);
            strokeWeight(1);

            rect(this.gameManager.scoreBoard.start.x, this.gameManager.scoreBoard.start.y, this.gameManager.scoreBoard.size.x, this.gameManager.scoreBoard.size.y);
            
            // Lives Anchor
            stroke(this.livesAnchorColor);
            strokeWeight(this.pointSize);
            
            point(this.level.x, this.level.y);
          }
        
        // Update the pulse time
        this.pulseTime += deltaTime / 1000;
        
        // Highscore
        noStroke();
        fill(this.subColor);
        textFont('VT323');
        textSize(this.textHeight);
        textAlign(CENTER);
        
        text('HIGH SCORE', this.highScore.x, this.highScore.y);
        
        // One Up
        if(this.gameManager.hasOneUp)
          {
            text('1UP', this.oneUp.x, this.oneUp.y);
          }
        
        // Highscore (Value)
        fill(this.mainColor);
        
        text(this.gameManager.highScore.toString().padStart(this.scoreLength, '0'), this.highScoreValue.x, this.highScoreValue.y);
        
        // Score
        textAlign(LEFT);
        
        text(this.gameManager.score.toString().padStart(this.scoreLength, '0'), this.score.x, this.score.y);
        
        // Round Recap
        if(this.gameManager.roundRecap)
          {
            // Rating
            fill(this.subColor);
            textAlign(CENTER);
            
            text(this.gameManager.roundRating, this.roundRating.x, this.roundRating.y);
            
            // Hits
            fill(this.altColor);
            
            text('NUMBER OF HITS    ' + this.gameManager.roundHits, this.roundHits.x, this.roundHits.y);
            
            // Bonus
            if(this.gameManager.roundBonus > 0)
              {
                fill(this.highlightColor);
            
                text('SPECIAL BONUS ' + this.gameManager.roundBonus + ' PTS', this.roundBonus.x, this.roundBonus.y);
              }
          }
        
        // Game Recap
        if(this.gameManager.gameRecap)
          {
            // Rating
            fill(this.subColor);
            textAlign(CENTER);
            
            text('-RESULTS-', this.roundRating.x, this.roundRating.y);
            
            // Shots Fired
            fill(this.highlightColor);
            
            text('SHOTS FIRED    ' + this.gameManager.shotsFired, this.roundHits.x, this.roundHits.y);
            
            // Shots Hit
            text('NUMBER OF HITS    ' + this.gameManager.shotsHit, this.roundBonus.x, this.roundBonus.y);
            
            // Shots Hit
            fill(this.mainColor);
            
            text('HIT-MISS RATIO    ' + ((round((this.gameManager.shotsHit / this.gameManager.shotsFired) * 10) / 10) * 100).toString() + ' %', this.gameHitMiss.x, this.gameHitMiss.y);
          }
        
        // Stage Start
        if(this.gameManager.stageStart)
          {
            // Level Announcement
            fill(this.altColor);
            textAlign(CENTER);
            
            text('- STAGE ' + this.gameManager.level + ' -', this.roundHits.x, this.roundHits.y);
          }
        
        // Death Display
        if(this.gameManager.deathDisplay)
          {
            // Death display is broken into 2 parts
            let deathMessage = 'FIGHTER DESTROYED!';
            let deathMessageColor = this.pulseColor(this.subColor, this.mainColor);
            if(this.gameManager.deathDisplayTimer <= this.gameManager.deathDisplayDuration * this.deathMessage2Length)
              {
                // The ready message
                deathMessage = 'READY';
                deathMessageColor = this.altColor;
              }
            
            fill(deathMessageColor);
            textAlign(CENTER);
            
            text(deathMessage, this.roundHits.x, this.roundHits.y);
          }
        
        // Level
        this.renderLevel();
        
        // Lives
        this.renderLives();
      }
      
      // Renders the total level
      renderLevel()
      {
        // Get Badge counts
        let badgeCounts = this.getLevelBadgeCounts();
        
        // Start rendering the badges from right to left
        let badgeHeight = (13 * this.spriteSize);
        let levelsWidth = this.gameManager.scoreBoard.size.x * (1/2);
        let rowWidthLeft = levelsWidth;
        let currentRowIndex = 0;
        for(let b = 0; b < badgeCounts.length; b++)
          {
            // Render each indiviual badge
            for(let i = 0; i < badgeCounts[b]; i++)
              {
                // Get the width of the current badge
                let currentBadgeSprite = this.levelSprites[b];
                let currentBadgeWidth = (currentBadgeSprite[0].length * this.spriteSize);
                if(currentBadgeWidth > rowWidthLeft)
                  {
                    // Reset the row width and add 1 to the row index
                    currentRowIndex++;
                    rowWidthLeft = levelsWidth;
                  }
                
                // Get the position of the current badge
                let badgeEndWidthPosition = this.level.x - (levelsWidth - rowWidthLeft);
                let badgeStartHeightPosition = this.level.y - (badgeHeight * (currentRowIndex + 1));
                let spritePosition = createVector(badgeEndWidthPosition - currentBadgeWidth, badgeStartHeightPosition);
                
                // Draw the sprite
                this.drawSprite(spritePosition, currentBadgeSprite);
                
                // Remove the badge width from the remaining width
                rowWidthLeft -= currentBadgeWidth + this.spriteSize;
              }
          }
      }
      
      // Returns an array of level counts
      getLevelBadgeCounts()
      {
        // First calculate how many of each level badge there should be
        let rawLevel = this.gameManager.level + 0;
        let subtractiveTotal = 0;
        // Remove the largest levels down to the smallest level
        let level50Count = floor(rawLevel / 50);
        subtractiveTotal += 50 * level50Count;
        let level30Count = floor((rawLevel - subtractiveTotal) / 30);
        subtractiveTotal += 30 * level30Count;
        let level20Count = floor((rawLevel - subtractiveTotal) / 20);
        subtractiveTotal += 20 * level20Count;
        let level10Count = floor((rawLevel - subtractiveTotal) / 10);
        subtractiveTotal += 10 * level10Count;
        let level5Count = floor((rawLevel - subtractiveTotal) / 5);
        subtractiveTotal += 5 * level5Count;
        let level1Count = floor((rawLevel - subtractiveTotal) / 1);
        
        return [level1Count, level5Count, level10Count, level20Count, level30Count, level50Count];
      }
      
      // Renders the total lives
      renderLives()
      {
        // Lives takes up half of the bottom board
        // Base sprite size is 12
        // Determine how many lives can fit in a single row of lives
        let livesWidth = this.gameManager.scoreBoard.size.x * (1/2);
        let rowLifeCount = floor(livesWidth / (this.spriteSize * 12));
        let lifeHeight = this.spriteSize * 12;
        
        // Iterate over the total count of lives and render each sprite
        for(let l = 0; l < this.gameManager.lives; l++)
          {
            let columnLifeIndex = l % rowLifeCount;
            let rowLifeIndex = floor(l / rowLifeCount);
            let spritePosition = createVector(this.lives.x + (columnLifeIndex * lifeHeight), this.lives.y - ((rowLifeIndex + 1) * lifeHeight));
            
            this.drawSprite(spritePosition, this.lifeSprite);
          }
      }
      
      // Draws the sprite at a given position scaled based on the sprite size set in the constructor
      drawSprite(position, sprite)
      {
        // Iterate over the rows of the sprite
        for(let y = 0; y < sprite.length; y++)
          {
            // Iterate over the indiviual row
            for(let x = 0; x < sprite[y].length; x++)
              {
                // Get the pixel color and position
                let pixelColor = color(sprite[y][x]);
                let pixelPosition = createVector(position.x + (x * this.spriteSize), position.y + (y * this.spriteSize));
                
                noStroke();
                fill(pixelColor);
                
                rect(pixelPosition.x, pixelPosition.y, this.spriteSize);
              }
          }
      }
      
      // Pulses between two colors
      pulseColor(colorA, colorB)
      {
        let pulseFactor = TriangleWave(1, this.pulseSpeed, this.pulseTime);
        
        if(pulseFactor > 0)
          {
            return colorA;
          }
        
        return colorB;
      }
    }

  // The sprite manager that handles sprite data
  class SpriteManager
    {
      constructor(spriteSheet)
      {
        this.spriteSheet = spriteSheet;
        this.spriteSize = createVector(12,12);
        
        this.spriteSheet.loadPixels();
      }
      
      // Gets a sprite as if it were an icon, this is pretty much just a shortcut for getting sprites for the UI, works more or less the same as the getSprite Method
      getSpriteIcon(type)
      {
        let start = createVector(0,0);
        let size = createVector(12,12);
        switch(type)
          {
            case 'Life':
            default:
              // Life
              start.x = 6 * 12;
              start.y = 0;
              size = createVector(12,12);
              break;
            case 'Level1':
              // Level 1
              start.x = 111;
              start.y = 42;
              size = createVector(5,10);
              break;
            case 'Level5':
              // Level 5
              start.x = 111;
              start.y = 55;
              size = createVector(5,11);
              break;
            case 'Level10':
              // Level 10
              start.x = 108;
              start.y = 68;
              size = createVector(11,12);
              break;
            case 'Level20':
              // Level 20
              start.x = 107;
              start.y = 81;
              size = createVector(13,13);
              break;
            case 'Level30':
              // Level 30
              start.x = 107;
              start.y = 94;
              size = createVector(13,13);
              break;
            case 'Level50':
              // Level 50
              start.x = 108;
              start.y = 107;
              size = createVector(11,13);
              break;
          }
        
        let sprite = this.getSpritePixels(start, size);
        
        return sprite;
      }
      
      // Returns the sprite for a given entity
      getEntitySprite(type, rotation, open)
      {
        if(open == null || open === undefined)
          {
            open = false;
          }
        
        // Convert the rotation into a spriteRotationIndex, this only refers to the rotation of provided sprites, not the flipped versions
        let rotationIndex = 0;
        // Determine if the sprite needs to be flipped
        let flipX = false;
        let flipY = false;
        if(rotation <= 180 && rotation >= 90)
          {
            rotationIndex = floor((180 - rotation) / 15) % 7;
          }
        else if(rotation < 90)
          {
            rotationIndex = floor((90 - (90 - rotation)) / 15) % 7;
            flipX = true;
          }
        else if(rotation > 180 && rotation <= 270)
          {
            rotationIndex = floor(abs(180 - rotation) / 15) % 7;
            flipY = true;
          }
        else
          {
            rotationIndex = (floor((90 + (360 - rotation)) / 15) + 1) % 7;
            flipY = true;
            flipX = true;
          }
        let typeIndex = 0;
        switch(type)
          {
            case 'Ship':
            default:
              typeIndex = 0;
              break;
            case 'Grasshopper':
              typeIndex = 1;
              break;
            case 'Butterfly':
              typeIndex = 2;
              break;
            case 'Bee':
              typeIndex = 3;
              break;
            case 'Sparrow':
              typeIndex = 4;
              break;
            case 'Hornet':
              typeIndex = 5;
              break;
            case 'Dragonfly':
              typeIndex = 6;
              break;
            case 'Bullet':
              typeIndex = 8;
              rotationIndex = 7;
              break;
            case 'Laser':
              typeIndex = 8;
              rotationIndex = 6;
              break;
          }
        
        // Handle all cases where open state is true and the object has a flutter state
        if(open && (rotationIndex == 0 || rotationIndex == 6))
          {
            if(rotationIndex == 0)
              {
                rotationIndex = 7;
              }
            else
              {
                rotationIndex = 8;
              }
          }
        
        // Retrieve the pixels of the sprite
        let start = createVector(12 * rotationIndex, 12 * typeIndex);
        let size = createVector(12,12);
        let sprite = this.getSpritePixels(start, size);
        
        // Flip the array of pixels if the rotation is not in the provided set
        sprite = this.flipSprite(sprite, flipX, flipY);
        
        // Return the sprite
        return sprite;
      }
      
      // Returns an effect sprite, used for explosions
      getExplosionSprite(t)
      {
        let explosionFrames = 4;
        // Remap the value of t to the total explosion frames
        let explosionFrame = round(t * (explosionFrames - 1));
        let sprite = this.getSpritePixels(createVector(explosionFrame * 12,108), createVector(12,12));
        
        return sprite;
      }
      
      // Flips a sprite's pixels on the given axises
      flipSprite(sprite, flipX, flipY)
      {
        let flippedSprite = [];
        // Iterate over the sprite's rows
        for(let y = 0; y < sprite.length; y++)
          {
            let flippedSpriteRow = [];
            for(let x = 0; x < sprite[y].length; x++)
              {
                let xPos = x;
                let yPos = y;
                
                // Flip the pixel if needed
                if(flipX)
                  {
                    // X Flip
                    xPos = (sprite[y].length - 1) - x;
                  }
                if(flipY)
                  {
                    // Y Flip
                    yPos = (sprite.length - 1) - y;
                  }
                
                let pixel = sprite[yPos][xPos];
                
                flippedSpriteRow.push(pixel);
              }
            flippedSprite.push(flippedSpriteRow);
          }
        
        return flippedSprite;
      }
      
      // Returns a sprite pixel array given start and size
      getSpritePixels(start, size)
      {
        let spritePixels = [];
        for(let y = start.y; y < (start.y + size.y); y++)
          {
            let spriteRow = [];
            for(let x = start.x; x < (start.x + size.x); x++)
              {
                let pixelIndex = (x + (y * this.spriteSheet.width)) * 4;
                let r = this.spriteSheet.pixels[pixelIndex];
                let g = this.spriteSheet.pixels[pixelIndex + 1];
                let b = this.spriteSheet.pixels[pixelIndex + 2];
                let a = this.spriteSheet.pixels[pixelIndex + 3];
                
                spriteRow.push([r,g,b,a]);
              }
            spritePixels.push(spriteRow);
          }
        
        return spritePixels;
      }
    }

  // Manages the enemy array
  class EnemyArray
    {
      constructor(gameManager, col, row)
      {
        this.gameManager = gameManager;
        
        this.columns = col;
        this.rows = row;
        this.movementMode = 'Move'; // Move, Pulse
        
        // Movement Mode Settings
        this.moveAmp = 18;
        this.moveFreq = 1;
        this.movePhase = 0;
        this.moveOffset = 0;
        this.moveSpeed = 6;
        this.modeIterations = 0;
        this.modeToggle = false;
        this.modeMaxIterations = 4;
        
        this.basePositions = [];
        
        this.currentPositions = [];
        this.heldEnemies = [];
        this.moveTime = 0;
        
        // Debug
        this.debug = false;
        this.pointSize = 2;
        this.arrayPointColor = color('cyan');
        this.arrayCurrentPointColor = color('red');
        
        this.generateBasePositions();
      }
      
      // Generates the base positions
      generateBasePositions()
      {
        // Iterate to generate the base positions
        let spriteSize = this.gameManager.spriteSize * 12;
        let start = createVector(spriteSize, spriteSize).add(this.gameManager.gameBoard.start);
        for(let x = 0; x < this.columns; x++)
          {
            let row = [];
            let heldRow = [];
            for(let y = 0; y < this.rows; y++)
              {
                row.push(createVector(x * spriteSize, y * spriteSize).add(start));
                heldRow.push(null);
              }
            this.basePositions.push(row);
            this.heldEnemies.push(heldRow);
          }
      }
      
      // Updates the current positions of each enemy index
      update()
      {
        // Add to the movement time
        this.moveTime += deltaTime / 1000;
        
        // Determine what movement mode should be active
        if(this.modeToggle && this.movementMode == 'Pulse')
          {
            this.movementMode = 'Move';
          }
        if(!this.modeToggle && this.movementMode == 'Move')
          {
            this.movementMode = 'Pulse';
          }
        
        // Generate the offsets
        let offsets = this.generateOffsets(this.movementMode);
        
        // Apply the offsets
        this.setCurrentPositions(offsets);
        
        // Update each enemy in the held enemies
        for(let x = 0; x < this.heldEnemies.length; x++)
          {
            for(let y = 0; y < this.heldEnemies[x].length; y++)
              {
                if(this.heldEnemies[x][y] != null)
                  {
                    this.heldEnemies[x][y].update();
                  }
              }
          }
      }
      
      // Generates offsets based on the given movement mode
      generateOffsets(movementMode)
      {
        let offsets = [];
        let centerAnchor = createVector(floor(this.basePositions.length / 2), 0);
        
        for(let x = 0; x < this.basePositions.length; x++)
          {
            let offsetRow = [];
            for(let y = 0; y < this.basePositions[x].length; y++)
              {
                let offset = createVector(0,0);
                
                if(movementMode == 'Move')
                  {
                    // Move
                    // Movement only happens on the X
                    offset.x = TriangleWave(this.moveAmp, this.moveSpeed, this.moveTime);
                  }
                else
                  {
                    // Pulse
                    // Movement happens in a scaling way
                    // Get the distance of the index from the center scale point
                    let distX = (x - centerAnchor.x);
                    let distY = (y - centerAnchor.y);
                    let moveAmpMax = this.moveAmp * floor(this.basePositions.length / 2);
                    offset.x = map(TriangleWave(this.moveAmp, this.moveSpeed, this.moveTime) * distX, -moveAmpMax, moveAmpMax, -this.moveAmp, this.moveAmp);
                    offset.y = map(TriangleWave(this.moveAmp, this.moveSpeed, this.moveTime) * distY, -moveAmpMax, moveAmpMax, -this.moveAmp, this.moveAmp);
                  }
                
                if(x == 0 && y == 0 && round(offset.x * 10)/10 == 0)
                  {
                    this.modeIterations++;
                    if(this.modeIterations >= this.modeMaxIterations)
                      {
                        this.modeToggle = !this.modeToggle;
                        this.modeIterations = 0;
                      }
                  }
                
                offsetRow.push(offset);
              }
            offsets.push(offsetRow);
          }
        
        return offsets;
      }
      
      // Generates the current positions based on the offsets given
      setCurrentPositions(offsets)
      {
        this.currentPositions = [];
        
        for(let x = 0; x < offsets.length; x++)
          {
            let currentRow = [];
            for(let y = 0; y < offsets[x].length; y++)
              {
                let offset = offsets[x][y];
                let basePosition = this.basePositions[x][y];
                
                currentRow.push(offset.add(basePosition));
              }
            this.currentPositions.push(currentRow);
          }
      }
      
      // Renders the enemy array
      render()
      {
        // Render each enemy in the held enemies array
        for(let x = 0; x < this.heldEnemies.length; x++)
          {
            for(let y = 0; y < this.heldEnemies[x].length; y++)
              {
                if(this.heldEnemies[x][y] != null)
                  {
                    this.heldEnemies[x][y].render();
                  }
              }
          }
        
        // Debug
        if(this.debug)
          {
            // Points
            for(let x = 0; x < this.basePositions.length; x++)
              {
                for(let y = 0; y < this.basePositions[x].length; y++)
                  {
  //                   // True Top
  //                   stroke(this.arrayPointColor);
  //                   strokeWeight(1);
                    
  //                   point(this.basePositions[x][y].x, this.basePositions[x][y].y);
                    
                    // Center
                    let centerPoint = createVector(this.basePositions[x][y].x + ((12 / 2) * this.gameManager.spriteSize), this.basePositions[x][y].y + ((12 / 2) * this.gameManager.spriteSize));
                    noFill();
                    stroke(this.arrayPointColor);
                    strokeWeight(this.pointSize);
                    
                    point(centerPoint.x, centerPoint.y);
                    
                    noStroke();
                    fill(this.arrayPointColor);
                    textFont('Sans Serif');
                    textSize(6);
                    textAlign(LEFT);
                    
                    text(x + ',' + y, centerPoint.x + 2, centerPoint.y);
                    
                    // Current Positions
                    let currentCenterPoint = createVector(this.currentPositions[x][y].x + ((12 / 2) * this.gameManager.spriteSize), this.currentPositions[x][y].y + ((12 / 2) * this.gameManager.spriteSize));
                    noFill();
                    stroke(this.arrayCurrentPointColor);
                    strokeWeight(this.pointSize);
                    
                    point(currentCenterPoint.x, currentCenterPoint.y);
                  }
              }
          }
      }
      
      // Returns the current position of an index in the positions array
      getArrayPosition(slot)
      {
        return this.currentPositions[slot.x][slot.y];
      }
      
      // Returns a queue of all open enemy slots
      getOpenSlots()
      {
        let openSlots = new Queue();
        for(let y = 0; y < this.rows; y++)
          {
            for(let x = 0; x < this.columns; x++)
              {
                if(this.heldEnemies[x][y] == null)
                  {
                    openSlots.enqueue(createVector(x,y));
                  }
              }
          }
        
        return openSlots;
      }
      
      // Returns the position of the closest enemy to a passed position
      getClosestEnemy(position)
      {
        let enemiesHeld = this.getAllEnemies();
        // If there are no enemys in the held slots, return the passed position
        if(enemiesHeld.length == 0)
          {
            return position;
          }
        else
          {
            // Iterate over the enemies and find the closest to the position, returning the true game position of the enemy when found
            let closestDistance = 0;
            let closestEnemyPosition = createVector(0,0);
            for(let i = 0; i < enemiesHeld.length; i++)
              {
                let currentPosition = this.currentPositions[enemiesHeld[i].x][enemiesHeld[i].y];
                let distToPosition = p5.Vector.dist(currentPosition, position);
                if(i == 0)
                  {
                    // Store the first enemy
                    closestDistance = distToPosition;
                    closestEnemyPosition = currentPosition;
                  }
                
                
                if(distToPosition < closestDistance)
                  {
                    // Store the current enemy
                    closestDistance = distToPosition;
                    closestEnemyPosition = currentPosition;
                  }
              }
            
            return closestEnemyPosition;
          }
      }
      
      // Returns an array of all enemies currently held as slots
      getAllEnemies()
      {
        let enemies = [];
        for(let y = 0; y < this.rows; y++)
          {
            for(let x = 0; x < this.columns; x++)
              {
                if(this.heldEnemies[x][y] != null)
                  {
                    enemies.push(createVector(x,y));
                  }
              }
          }
        
        return enemies;
      }
    }

  // The player ship
  class Ship
    {
      constructor(gameManager)
      {
        this.gameManager = gameManager;
        this.position = createVector(0,0);
        
        // Props
        this.minX = this.gameManager.gameBoard.start.x + (this.gameManager.spriteSize * 12);
        this.maxX = (this.gameManager.gameBoard.start.x + this.gameManager.gameBoard.size.x) - (this.gameManager.spriteSize * 12);
        this.hitBox = new Hitbox(createVector(0,0), createVector(12 * this.gameManager.spriteSize, 12 * this.gameManager.spriteSize));
        this.canMove = true;
        this.hideShip = false;
        this.isExploding = false;
        this.explosionTimer = 0;
        this.explosionDuration = 0.4;
        this.shotDetectionRadius = 50;
        this.recentFireShotDetectionRadius = 25;
        this.enemyDetectionRadius = 30;
        this.shootTimer = 0;
        this.shootCooldown = 0.2;
        this.moveDirection = createVector(0,0);
        
        // AI
        this.aiTimer = 0;
        this.aiUpdateInterval = 0.125;
        this.randomFireChance = 0.09;
        this.moveLockedInputTimer = 0;
        this.moveLockInputRange = createVector(this.aiUpdateInterval * 2, this.aiUpdateInterval * 6);
        this.currentShotDetectionRadius = this.shotDetectionRadius;
        this.currentAIMode = 'Staying Still';
        
        // Debug
        this.debug = false;
        this.railEndSize = 3;
        this.railColor = color('magenta');
        this.positionColor = color('cyan');
        this.hitboxColor = color('lime');
        this.shotDetectionColor = color('red');
        this.enemyDetectionColor = color('yellow');
        this.aiModeColor = color('pink');
        
        this.setStartPosition();
      }
      
      // Sets the default ship position
      setStartPosition()
      {
        this.position = createVector(lerp(this.minX, this.maxX, 0.5) - ((this.gameManager.spriteSize * 12) / 2), (this.gameManager.gameBoard.start.y + this.gameManager.gameBoard.size.y) - (this.gameManager.spriteSize * 12));
      }
      
      // Updates the ships movement
      update()
      {
        // Updates the fire timer
        this.shootTimer -= deltaTime / 1000;
        
        // Update the random movement lock
        this.moveLockedInputTimer -= deltaTime / 1000;
        
        if(this.shootTimer <= 0)
          {
            this.currentShotDetectionRadius = this.shotDetectionRadius;
          }
        
        this.position.add(this.moveDirection);
        
        // Clamp the movement
        if(this.position.x < this.minX)
          {
            this.position.x = this.minX;
          }
        if(this.position.x > this.maxX)
          {
            this.position.x = this.maxX;
          }
      }
      
      // Renders the ship
      render()
      {
        // Debug
        if(this.debug)
          {
            // Rail
            let yPosition = (this.gameManager.gameBoard.start.y + this.gameManager.gameBoard.size.y) - ((this.gameManager.spriteSize * 12));
            noFill();
            stroke(this.railColor);
            strokeWeight(1);
            
            line(this.minX, yPosition, this.maxX, yPosition);
            
            strokeWeight(this.railEndSize);
            
            point(this.minX, yPosition);
            point(this.maxX, yPosition);
            
            // Position
            stroke(this.positionColor);
            
            point(this.position.x + ((this.gameManager.spriteSize * 12) / 2), this.position.y);
            
            // Hitbox
            noFill();
            stroke(this.hitboxColor);
            strokeWeight(1);
            
            rect(this.position.x + this.hitBox.start.x, this.position.y + this.hitBox.start.y, this.hitBox.size.x, this.hitBox.size.y);
            
            // Shot Detection
            stroke(this.shotDetectionColor);
            
            circle(this.position.x + ((this.gameManager.spriteSize * 12)/2), this.position.y + ((this.gameManager.spriteSize * 12)/2), this.currentShotDetectionRadius * 2);
            
            // Enemy Detection
            stroke(this.enemyDetectionColor);
            
            circle(this.position.x + ((this.gameManager.spriteSize * 12)/2), this.position.y + ((this.gameManager.spriteSize * 12)/2), this.enemyDetectionRadius * 2);
            
            // AI Mode
            let aiModeLabelPosition = createVector(this.gameManager.gameBoard.start.x + (this.gameManager.gameBoard.size.x/2), this.gameManager.gameBoard.start.y + this.gameManager.gameBoard.size.y);
            noStroke();
            fill(this.aiModeColor);
            textSize(8);
            textAlign(CENTER);
            
            text(this.currentAIMode, aiModeLabelPosition.x, aiModeLabelPosition.y + 8);
          }
        
        // Explosion Update
        this.explosionTimer -= deltaTime / 1000;
        if(this.explosionTimer <= 0 && this.isExploding)
          {
            this.isExploding = false;
            this.hideShip = true;
          }
        
        // Render the ship sprite
        if(!this.hideShip)
          {
            // Update the AI if possible
            this.aiTimer -= deltaTime / 1000;
            if(this.aiTimer <= 0)
              {
                this.aiTimer = this.aiUpdateInterval;
                this.currentAIMode = this.aiUpdate();
              }
            
            // Updates the ship's movement
            this.update();
            
            this.renderShip();
          }
      }
      
      // Renders the actual ship
      renderShip()
      {
        // Fetch the sprite
        let sprite = this.gameManager.spriteManager.getEntitySprite('Ship', 90);
        
        if(this.isExploding)
          {
            sprite = this.gameManager.spriteManager.getExplosionSprite((this.explosionDuration - this.explosionTimer) / this.explosionDuration);
            this.moveDirection = createVector(0,0);
          }
        
        // Render the sprite
        this.drawSprite(this.position, sprite);
      }
      
      // Draws the sprite at a given position scaled based on the sprite size set in the game manager
      drawSprite(position, sprite)
      {
        // Iterate over the rows of the sprite
        for(let y = 0; y < sprite.length; y++)
          {
            // Iterate over the indiviual row
            for(let x = 0; x < sprite[y].length; x++)
              {
                // Get the pixel color and position
                let pixelColor = color(sprite[y][x]);
                let pixelPosition = createVector(position.x + (x * this.gameManager.spriteSize), position.y + (y * this.gameManager.spriteSize));
                
                noStroke();
                fill(pixelColor);
                
                rect(pixelPosition.x, pixelPosition.y, this.gameManager.spriteSize);
              }
          }
      }
      
      // Returns if an object hits inside this enemy hitbox
      checkHit(position, hitbox)
      {
        return this.hitBox.checkIntersect(this.position, position, hitbox);
      }
      
      // Displays the death of the ship
      displayDeath()
      {
        // Render the ship explosion then hide the ship until ready to show again
        this.explosionTimer = this.explosionDuration;
        this.isExploding = true;
        this.canMove = false;
        this.moveDirection = createVector(0,0);
      }
      
      // The Ship's AI, including movement and shooting
      aiUpdate()
      {
        // The ship should decide if it randomly wants to fire
        if(random(0,1) > (1 - this.randomFireChance))
          {
            this.attemptFireLaser();
          }
        
        // First and foremost, the ship should actively try to move away from the closest enemy if they are within the enemyDetection radius
        let closestEnemyPosition = this.getClosestEnemyPosition();
        if(p5.Vector.dist(closestEnemyPosition, createVector(this.hitBox.size.x / 2, this.hitBox.size.y / 2).add(this.position)) <= this.enemyDetectionRadius && (closestEnemyPosition.x != this.position.x && closestEnemyPosition.y != this.position.y))
          {
            if(closestEnemyPosition.x < this.position.x)
              {
                this.movementDirection = createVector(1,0);
              }
            else if(closestEnemyPosition.x > this.position.x)
              {
                this.movementDirection = createVector(-1,0);
              }
            // Leave the function, make no further decisions
            return 'Moving Away from Enemy';
          }
        
        // The ship should try to move away from the closest bullet if there is one within the shot detection radius
        let closestShotPosition = this.getClosestShotPosition();
        if(p5.Vector.dist(closestShotPosition, createVector(this.hitBox.size.x / 2, this.hitBox.size.y / 2).add(this.position)) <= this.currentShotDetectionRadius && (closestShotPosition.x != this.position.x && closestShotPosition.y != this.position.y))
          {
            if(closestShotPosition.x < this.position.x)
              {
                this.movementDirection = createVector(1,0);
              }
            else if(closestShotPosition.x > this.position.x)
              {
                this.movementDirection = createVector(-1,0);
              }
            // Leave the function, make no further decisions
            return 'Moving Away from Bullet';
          }
        
        // The ship should pick a random movement option, move in a direction for a random amount of time, move towards the closest enemy, or stay still
        if(this.moveLockedInputTimer <= 0)
          {
            let randomMoveOption = round(random(0,2));
            let randomChoiceMode = 'Still';
            switch(randomMoveOption)
              {
                case 0:
                  // Move in a random direction for a random amount of time
                  let randomMovementDirection = createVector((round(random(0,1)) * 2) - 1, 0);
                  let randomMovementLockDuration = random(this.moveLockInputRange.x, this.moveLockInputRange.y);
                  this.moveDirection = randomMovementDirection;
                  this.moveLockedInputTimer = randomMovementLockDuration;
                  randomChoiceMode = 'Moving in Random Direction';
                  break;
                case 1:
                  // Move towards the closest enemy
                  let closestEnemy = this.gameManager.enemyArray.getClosestEnemy(this.position);
                  if(closestEnemy.x < this.position.x)
                    {
                      this.moveDirection = createVector(-1,0);
                    }
                  else if(closestEnemy.x > this.position.x)
                    {
                      this.moveDirection = createVector(1,0);
                    }
                  else
                    {
                      this.moveDirection = createVector(0,0);
                    }
                  randomChoiceMode = 'Moving Towards Enemy';
                  break;
                case 2:
                default:
                  // Stay still
                  this.moveDirection = createVector(0,0);
                  randomChoiceMode = 'Staying Still';
                  break;
              }
            
            return randomChoiceMode;
          }
        
        return this.currentAIMode + '.';
      }
      
      // Attempts to fire the laser
      attemptFireLaser()
      {
        if(this.shootTimer <= 0)
          {
            this.shootTimer = this.shootCooldown;
            this.fireShot();
          }
      }
      
      // Fires a shot straight up
      fireShot()
      {
        // Create the shot
        let laser = new Laser(this.gameManager, createVector(this.hitBox.size.x/2, 0).add(this.position));
        // Add the shot to the game manager
        this.gameManager.lasers.enqueue(laser);
        
        // Sets the closer dectection radius
        this.currentShotDetectionRadius = this.recentFireShotDetectionRadius;
      }
      
      // Tests to find the closest enemy position
      getClosestEnemyPosition()
      {
        return this.gameManager.enemyArray.getClosestEnemy(this.position);
      }
      
      // Tests to find the closest shot positon
      getClosestShotPosition()
      {
        return this.gameManager.getClosestEnemyProjectile(this.position);
      }
    }

  // A Generic Enemy
  class Enemy
    {
      constructor(gameManager, type, entryTime, entryPath, enemySlot, pointValue, displayPointValue, shootModes, shootDelay, canDive, canShootEntry)
      {
        this.gameManager = gameManager;
        this.type = type;
        this.pointValue = pointValue;
        
        // Runtime
        // Core
        this.position = createVector(0,0);
        this.lastPosition = createVector(0,0);
        this.rotation = 90;
        this.open = false;
        this.enemySlot = enemySlot;
        this.shootModes = shootModes;
        // Time
        this.timeAlive = 0;
        this.entryTimer = entryTime;
        this.diveTimer = 0;
        this.transitTimer = 0;
        this.deathTimer = 0;
        this.shootTimer = shootDelay;
        // Entry
        this.entryPath = entryPath;
        this.startTransitPosition = createVector(0,0);
        this.canShootEntry = true;
        if(canShootEntry === undefined)
          {
            this.canShootEntry = false;
          }
        // State
        this.isEntering = true;
        this.isTransiting = false;
        this.isStill = false;
        this.isExploding = false;
        this.isDiving = false;
        this.canShoot = true;
        this.canDive = canDive;
        if(canDive === undefined)
          {
            this.canDive = false;
          }
        this.entryDiveDelay = 3;
        // Shooting
        this.shootCount = 0;
        // AI
        this.aiTimer = 0;
        this.aiUpdateInterval = 0.125;
        this.randomFireChance = 0.03;
        this.currentAIMode = null;
        this.aiShootDelay = 1.25;
        this.aiShootTimer = 0;
        this.diveAITimer = 0;
        this.diveCooldown = 7;
        this.randomDiveChance = 0.05;
              
        // Props
        this.entryTime = entryTime;
        this.transitTime = 0.5;
        this.deathTime = 0.4;
        this.diveTime = 8;
        this.shootInterval = 0.125;
        this.hitBox = new Hitbox(createVector(0,0), createVector(12 * this.gameManager.spriteSize, 12 * this.gameManager.spriteSize));
        this.deathDisplayColor = color('#f80000');
        this.deathTextSize = 12;
        this.displayPointValue = displayPointValue;
        if(displayPointValue === undefined)
          {
            this.displayPointValue = false;
          }
        // Dive Props
        this.loopingDiveSnakeCount = 3;
        this.loopingDiveTurnRadius = 55;
        this.divePath = this.generateLoopingDive();
        this.diveFirstShotAt = 0.4;
        this.diveShootCount = 1;
        this.wrappingDiveSnakingCount = 3;
        this.wrappingDiveSnakeDistance = 125;
        this.wrappingDiveSnakeWidth = 50;
        
        // Debug
        this.debug = false;
        this.rotationalVectorColor = color('yellow');
        this.hitboxColor = color('lime');
        this.divePointSize = 4;
        this.diveColor = color('magenta');
        
        // Set up shooting on entry if needed
        this.entryShootSetup();
      }
      
      // Sets up settings for entry shooting based on shoot modes and personal data
      entryShootSetup()
      {
        // Can shoot on entry
        if(this.canShootEntry)
          {
            if(this.shootModes.indexOf('onEnter') != -1)
              {
                // Can shoot on entry
                this.shootCount = 1;
                this.canShootEntry = true;
                this.canShoot = true;
              }
          }
        else
          {
            this.shootCount = 0;
            this.canShootEntry = false;
            this.canShoot = false;
          }
      }
      
      update()
      {
        // Update the AI if possible
        this.aiTimer -= deltaTime / 1000;
        
        // Update the AI shoot timer
        this.aiShootTimer -= deltaTime / 1000;
        if(this.aiShootTimer <= 0)
          {
            this.aiShootTimer = this.aiUpdateInterval;
            this.currentAIMode = this.aiUpdate();
          }
        
        // Update the dive AI timer
        this.diveAITimer -= deltaTime / 1000;
        
        this.timeAlive += deltaTime / 1000;
        this.lastPosition = createVector(this.position.x, this.position.y);
        
        // Do Enter
        if(this.isEntering)
          {
            this.entryTimer -= deltaTime / 1000;
            if(this.entryTimer <= 0)
              {
                // Entering is done, do transit
                this.isEntering = false;
                this.isTransiting = true;
                this.entryTimer = this.entryTime;
                this.transitTimer = this.transitTime;
                this.diveAITimer = this.entryDiveDelay;
                this.startTransitPosition = createVector(this.position.x,this.position.y);
              }
            
            this.animateEntry();
          }
        
        // Do Transit
        if(this.isTransiting)
          {
            this.transitTimer -= deltaTime / 1000;
            if(this.transitTimer <= 0)
              {
                // Transit is done, do standard movement
                this.isTransiting = false;
                this.transitTimer = this.transitTime;
                this.isStill = true;
              }
            
            this.animateTransit();
          }
        
        // Do Still
        if(this.isStill)
          {
            this.position = this.gameManager.enemyArray.getArrayPosition(this.enemySlot);
            
            // Force the last position to make the rotation look down
            this.lastPosition = createVector(0, -1).add(this.position);
          }
        
        // Do Dive
        if(this.isDiving)
          {
            this.diveTimer -= deltaTime / 1000;
            if(this.diveTimer <= 0)
              {
                // Dive is done
                this.isDiving = false;
                this.isStill = true;
                this.diveTimer = this.diveTime;
                this.diveAITimer = this.diveCooldown
              }
            
            this.animateDive();
          }
        
        // Do Die
        if(this.isExploding)
          {
            this.deathTimer -= deltaTime / 1000;
            if(this.deathTimer <= 0)
              {
                // Kill the enemy
                // Remove them from the held array
                this.gameManager.enemyArray.heldEnemies[this.enemySlot.x][this.enemySlot.y] = null;
                
                // Decrease the remaining counter on the stage by 1
                this.gameManager.enemiesRemaining--;
                this.gameManager.confirmEnemyDeath();
              }
            
            // Draw the point value text if needed
            if(this.displayPointValue)
              {
                noStroke();
                fill(this.deathDisplayColor);
                textFont('VT323');
                textSize(this.deathTextSize);
                textAlign(CENTER);
                
                text(this.pointValue, this.position.x + (this.hitBox.size.x/2), this.position.y + (this.deathTextSize / 2) + (this.hitBox.size.y/2));
              }
          }
        
        // Do Shoot
        if(this.canShoot)
          {
            this.shootTimer -= deltaTime / 1000;
            if(this.shootTimer <= 0)
              {
                if(this.shootCount <= 1)
                  {
                    // Stop Shooting after this shoot
                    this.canShoot = false;
                  }
                else
                  {
                    this.shootTimer = this.shootInterval;
                  }
                
                // Shoot and reset the timer
                this.fireShot();
              }
          }
        
        // Update the rotation
        if(this.position != this.lastPosition)
          {
            this.rotation = round(p5.Vector.sub(this.lastPosition, this.position).angleBetween(createVector(10,0)) * (180/PI)) + 180;
          }
      }
      
      // Animates the entry of the enemy
      animateEntry()
      {
        let interpolationValue = (this.entryTime - this.entryTimer) / this.entryTime;
        
        // Set position to the interpolated point on the entry path
        this.position = this.entryPath.getPointOnPath(interpolationValue);
      }
      
      // Animates the transit of the enemy
      animateTransit()
      {
        let interpolationValue = (this.transitTime - this.transitTimer) / this.transitTime;
        
        // Set position to the interpolated point on the transit path
        this.position = p5.Vector.lerp(this.startTransitPosition, this.gameManager.enemyArray.getArrayPosition(this.enemySlot), interpolationValue);
      }
      
      // Animates the dive of the enemy
      animateDive()
      {
        let interpolationValue = (this.diveTime - this.diveTimer) / this.diveTime;
        
        // Set position to the interpolated point on the entry path
        this.position = this.divePath.getPointOnPath(interpolationValue);
      }
      
      // Renders the enemy
      render()
      {
        // Debug
        if(this.debug)
          {
            // Entry Path Render
            if(this.entryTimer > 0 && this.isEntering)
              {
                // Make the entry path render itself
                this.entryPath.drawPath();
              }
            
            // Rotational Vector
            let rotationalVector = p5.Vector.sub(this.position, this.lastPosition).setMag(20).add(this.lastPosition);
            noFill();
            stroke(this.rotationalVectorColor);
            strokeWeight(1);
            
            line(this.lastPosition.x, this.lastPosition.y, rotationalVector.x, rotationalVector.y);
            
            noStroke();
            fill(this.rotationalVectorColor);
            textAlign(LEFT);
            textSize(7);
            
            text(this.rotation + '°', this.lastPosition.x, this.lastPosition.y);
            
            // Hitbox
            noFill();
            stroke(this.hitboxColor);
            strokeWeight(1);
            
            rect(this.position.x + this.hitBox.start.x, this.position.y + this.hitBox.start.y, this.hitBox.size.x, this.hitBox.size.y);
            
            // Dive Path Render
            if(this.diveTimer > 0 && this.isDiving)
              {
                // Make the dive path render itself
                this.divePath.drawPath();
              }
            
          }
        
        // Get the sprite of the enemy
        let sprite = this.gameManager.spriteManager.getEntitySprite(this.type, this.rotation, this.open);
        
        // Fetch the exploding sprite if the enemy is dying
        if(this.isExploding)
          {
            // Get the exploding sprite
            sprite = this.gameManager.spriteManager.getExplosionSprite((this.deathTime - this.deathTimer) / this.deathTime);
          }
        
        // Render the enemy
        this.drawSprite(this.position, sprite);
        
      }
      
      // Draws the sprite at a given position scaled based on the sprite size set in the game manager
      drawSprite(position, sprite)
      {
        // Iterate over the rows of the sprite
        for(let y = 0; y < sprite.length; y++)
          {
            // Iterate over the indiviual row
            for(let x = 0; x < sprite[y].length; x++)
              {
                // Get the pixel color and position
                let pixelColor = color(sprite[y][x]);
                let pixelPosition = createVector(position.x + (x * this.gameManager.spriteSize), position.y + (y * this.gameManager.spriteSize));
                
                noStroke();
                fill(pixelColor);
                
                rect(pixelPosition.x, pixelPosition.y, this.gameManager.spriteSize + this.gameManager.spritePixelOverdraw);
              }
          }
      }
      
      // Returns if an object hits inside this enemy hitbox
      checkHit(position, hitbox)
      {
        return this.hitBox.checkIntersect(this.position, position, hitbox);
      }
      
      // Starts the death animation and adds points to the game manager
      triggerDeath()
      {
        // Add to the score
        this.gameManager.score += this.pointValue;
        
        // Start the death animation
        this.isExploding = true;
        this.isDiving = false;
        this.isEntering = false;
        this.isTransiting = false;
        this.isStill = false;
        this.deathTimer = this.deathTime;
      }
      
      // Fires a shot straight down
      fireShot()
      {
        // Create the shot
        let bullet = new Bullet(this.gameManager, createVector(this.hitBox.size.x/2, this.hitBox.size.y).add(this.position));
        // Add the shot to the game manager
        this.gameManager.bullets.enqueue(bullet);
        
        // Decrease the shoot count
        this.shootCount--;
      }
      
      // Updates the AI
      aiUpdate()
      {
        // Random chance to shoot while in formation if allowed
        if(this.shootModes.indexOf('onFormation') != -1 && this.isStill)
          {
            // The enemy can shoot in formation
            // Randomly decide to fire
            if(this.aiShootTimer <= 0)
              {
                if(random(0,1) > (1 - this.randomFireChance))
                  {
                    this.aiTimer = this.aiShootDelay;
                    this.fireShot();
                    
                    // Break out of the AI
                    return 'Shooting In Formation';
                  }
              }
          }
        
        // Random chance to dive if allowed with cooldown
        if(this.canDive && this.diveTimer <= 0 && this.isStill)
          {
            // Random chance to dive
            if(random(0,1) > (1 - this.randomDiveChance))
              {
                // Break out of the AI
                return this.dive();
              }
          }
      }
      
      // Makes the enemy dive
      dive()
      {
        this.isDiving = true;
        this.isStill = false;
        this.diveTimer = this.diveTime;
        
        if(this.shootModes.indexOf('onDive') != -1)
          {
            // The enemy can shoot in dive
            this.canShoot = true;
            this.shootTimer = this.diveTime * this.diveFirstShotAt;
            this.shootCount = this.diveShootCount;
            return 'Diving and Shooting';
          }
        
        return 'Diving';
      }
      
      // Generates the looping dive motion path
      generateLoopingDive()
      {
        // Iterate over the dive count and create the rotation points
        let rotationPoints = [];
        let start = this.gameManager.enemyArray.basePositions[this.enemySlot.x][this.enemySlot.y];
        let diveBuffer = createVector(0, 30);
        for(let i = 0; i < this.loopingDiveSnakeCount; i++)
          {
            let currentPoint = createVector(0, (i + 1) * (this.loopingDiveTurnRadius * 2)).add(start).add(diveBuffer);
            rotationPoints.push(currentPoint);
          }
        
        // Determine the last rotation point, aka the Big Loop
        let lastRotationPoint = rotationPoints[rotationPoints.length - 1];
        let boardEdge = p5.Vector.add(this.gameManager.gameBoard.start, this.gameManager.gameBoard.size);
        boardEdge.x = lastRotationPoint.x;
        let distToGameBoardEdge = p5.Vector.dist(lastRotationPoint, boardEdge);
        let turnMargin = 75;
        distToGameBoardEdge += turnMargin;
        rotationPoints.push(createVector(lastRotationPoint.x, lastRotationPoint.y + (distToGameBoardEdge/2)));
        
        // Create the loop path segments
        let segments = [];
        // Segment 1 is linear
        let startSeg1 = start;
        let endSeg1 = p5.Vector.add(diveBuffer, start);
        
        let seg1 = new LinearSegment([startSeg1, endSeg1]);
        segments.push(seg1);
        
        // Do the iterations to move down the chain of alternating snaking points
        let lastEnd = endSeg1;
        let lastDirection = 1;
        for(let i = 0; i < this.loopingDiveSnakeCount; i++)
          {
            // Get the side of the snaking
            let side = i % 2;
            let direction = 1;
            if(side == 0)
              {
                direction = -1;
              }
            
            let controlLength = this.loopingDiveTurnRadius / 1.75;
            
            // Create the top quarter of the circle
            // Anchor 1
            let anchor1 = lastEnd;
            // Anchor 2
            let anchor2 = createVector(this.loopingDiveTurnRadius * direction, this.loopingDiveTurnRadius).add(anchor1);
            // Control 1
            let control1 = createVector(controlLength * direction, 0).add(anchor1);
            // Control 2
            let control2 = createVector(0, -controlLength).add(anchor2);
            
            let topSegment = new BezierSegment([anchor1, control1, control2, anchor2]);
            segments.push(topSegment);
            
            // Create the bottom quarter of the circle
            // Anchor 3
            let anchor3 = anchor2;
            // Anchor 4
            let anchor4 = createVector(-this.loopingDiveTurnRadius * direction, this.loopingDiveTurnRadius).add(anchor3);
            // Control 3
            let control3 = createVector(0, controlLength).add(anchor3);
            // Control 4
            let control4 = createVector(controlLength * direction, 0).add(anchor4);
            
            let bottomSegment = new BezierSegment([anchor3, control3, control4, anchor4]);
            segments.push(bottomSegment);
            lastEnd = anchor4;
            lastDirection = direction;
          }
        
        // Do the last Big Loop and then the slink back to the slot position
        // Section 1
        let controlLength = this.loopingDiveTurnRadius;
        let anchor1BigLoopSeg1 = lastEnd;
        let anchor2BigLoopSeg1 = createVector(-(distToGameBoardEdge/2) * lastDirection, (distToGameBoardEdge/2)).add(anchor1BigLoopSeg1);
        let control1BigLoopSeg1 = createVector(-controlLength * lastDirection, 0).add(anchor1BigLoopSeg1);
        let control2BigLoopSeg1 = createVector(0, -controlLength).add(anchor2BigLoopSeg1)
        
        let bigLoopSeg1 = new BezierSegment([anchor1BigLoopSeg1, control1BigLoopSeg1, control2BigLoopSeg1, anchor2BigLoopSeg1]);
        segments.push(bigLoopSeg1);
        
        // Section 2
        let anchor1BigLoopSeg2 = anchor2BigLoopSeg1;
        let anchor2BigLoopSeg2 = createVector((distToGameBoardEdge/2) * lastDirection, (distToGameBoardEdge/2)).add(anchor1BigLoopSeg2);
        let control1BigLoopSeg2 = createVector(0, (controlLength * 1.2)).add(anchor1BigLoopSeg2);
        let control2BigLoopSeg2 = createVector(-(controlLength * 1.2) * lastDirection, 0).add(anchor2BigLoopSeg2)
        
        let bigLoopSeg2 = new BezierSegment([anchor1BigLoopSeg2, control1BigLoopSeg2, control2BigLoopSeg2, anchor2BigLoopSeg2]);
        segments.push(bigLoopSeg2);
        
        // Section 3
        let anchor1BigLoopSeg3 = anchor2BigLoopSeg2;
        let anchor2BigLoopSeg3 = createVector((distToGameBoardEdge/2) * lastDirection, -(distToGameBoardEdge/2)).add(anchor1BigLoopSeg3);
        let control1BigLoopSeg3 = createVector((controlLength * 1.2) * lastDirection, 0).add(anchor1BigLoopSeg3);
        let control2BigLoopSeg3 = createVector(0, (controlLength * 1.2)).add(anchor2BigLoopSeg3)
        
        let bigLoopSeg3 = new BezierSegment([anchor1BigLoopSeg3, control1BigLoopSeg3, control2BigLoopSeg3, anchor2BigLoopSeg3]);
        segments.push(bigLoopSeg3);
        
        // Bezier Straightening segment
        let anchor1Straightening = anchor2BigLoopSeg3;
        let anchor2Straightening = createVector(startSeg1.x, this.gameManager.gameBoard.start.y + (this.gameManager.gameBoard.size.y/2));
        let control1Straightening = createVector(0, -(controlLength * 1.2) * 1.5).add(anchor1Straightening);
        let control2Straightening = createVector(0, (controlLength * 1.2) * 1.5).add(anchor2Straightening);
        
        let straighteningSeg = new BezierSegment([anchor1Straightening, control1Straightening, control2Straightening, anchor2Straightening]);
        segments.push(straighteningSeg);
        
        // Final Linear Segment
        let startSegFinal = anchor2Straightening;
        let endSegFinal = startSeg1;
        
        let segFinal = new LinearSegment([startSegFinal, endSegFinal]);
        segments.push(segFinal);
        
        return new MovementPath(segments);
      }
      
      // Generates the wrapping dive motion path
      generateWrappingDive()
      {
        // Create the start dive elements
        let start = this.gameManager.enemyArray.basePositions[this.enemySlot.x][this.enemySlot.y];
        let diveBuffer = createVector(0, 30);
        
        // Create the loop path segments
        let segments = [];
        // Segment 1 is linear
        let startSeg1 = start;
        let endSeg1 = p5.Vector.add(diveBuffer, start);
        
        let seg1 = new LinearSegment([startSeg1, endSeg1]);
        segments.push(seg1);
        
        // Do the iterations to move down the chain of alternating snaking points
        let lastEnd = endSeg1;
        let lastDirection = 1;
        for(let i = 0; i < this.wrappingDiveSnakingCount; i++)
          {
            // Get the side of the snaking
            let side = i % 2;
            let direction = 1;
            if(side == 0)
              {
                direction = -1;
              }
            
            let controlLength = this.wrappingDiveSnakeDistance / 2;
            
            // Create the snaking segment
            // Anchor 1
            let anchor1 = lastEnd;
            // Anchor 2
            let anchor2 = createVector(this.wrappingDiveSnakeWidth * direction, this.wrappingDiveSnakeDistance).add(anchor1);
            // Control 1
            let control1 = createVector(0, controlLength).add(anchor1);
            // Control 2
            let control2 = createVector(0, -controlLength).add(anchor2);
            
            let newSegment = new BezierSegment([anchor1, control1, control2, anchor2]);
            segments.push(newSegment);
            
            lastEnd = anchor2;
            lastDirection = direction;
          }
        
        // Generate the last segment to go out of the bottom edge
        let startSegOut = lastEnd;
        let boardEdge = this.gameManager.gameBoard.start.y + this.gameManager.gameBoard.size.y;
        let distToBoardEdge = boardEdge - startSegOut.y;
        let transitionMargin = 50;
        distToBoardEdge += transitionMargin;
        let endSegOut = p5.Vector.add(createVector(0, distToBoardEdge), startSegOut);
        
        let segOut = new LinearSegment([startSegOut, endSegOut]);
        segments.push(segOut);
        
        // Generate the top segment that goes back to the start
        // Segment 1 is linear
        let endSegIn = start;
        let boardStart = this.gameManager.gameBoard.start.y;
        let distToBoardStart = start.y - boardStart;
        distToBoardStart += transitionMargin;
        let startSegIn = p5.Vector.add(createVector(0, -distToBoardStart), endSegIn);
        
        let segIn = new LinearSegment([startSegIn, endSegIn]);
        segments.push(segIn);
        
        return new MovementPath(segments);
      }
    }

  // The Flutter Type Enemy
  class Flutter extends Enemy
  {
    constructor(gameManager, type, entryTime, entryPath, enemySlot, pointValue, displayPointValue, shootModes, shootDelay, canDive, canShootEntry)
    {
      super(gameManager, type, entryTime, entryPath, enemySlot, pointValue, displayPointValue, shootModes, shootDelay, canDive, canShootEntry);
      this.flutterFrequency = 0.5;
      
      this.flutterTimer = 0;
    }
    
    // Updates the flutterer
    update()
    {
      // Do the generic update
      super.update();
      
      this.flutter();
    }
    
    // Renders the flutterer
    render()
    {
      super.render();
    }
    
    // Pulses the open state based on the time alive
    flutter()
    {
      this.flutterTimer -= deltaTime / 1000;
      
      if(this.flutterTimer <= 0)
        {
          this.flutterTimer = this.flutterFrequency;
          this.open = !this.open;
        }
    }
    
    checkHit(position, hitbox)
    {
      return super.checkHit(position, hitbox)
    }
  }

  // The Grasshopper type enemy
  class Grasshopper extends Flutter
  {
    constructor(gameManager, entryTime, entryPath, enemySlot, shootModes, shootDelay)
    {
      super(gameManager, 'Grasshopper', entryTime, entryPath, enemySlot, 400, true, shootModes, shootDelay, false, true);
      
      this.divePath = this.generateWrappingDive();
      this.diveTime = 4;
    }
    
    // Updates the grasshopper
    update()
    {
      super.update();
    }
    
    // Renders the grasshopper
    render()
    {
      super.render();
    }
    
    checkHit(position, hitbox)
    {
      return super.checkHit(position, hitbox)
    }
  }

  // The Butterfly type enemy
  class Butterfly extends Flutter
  {
    constructor(gameManager, entryTime, entryPath, enemySlot, shootModes, shootDelay)
    {
      super(gameManager, 'Butterfly', entryTime, entryPath, enemySlot, 160, true, shootModes, shootDelay, true, false);
      
      this.divePath = this.generateWrappingDive();
      this.diveTime = 4;
    }
    
    // Updates the grasshopper
    update()
    {
      super.update();
    }
    
    // Renders the grasshopper
    render()
    {
      super.render();
    }
    
    checkHit(position, hitbox)
    {
      return super.checkHit(position, hitbox)
    }
  }

  // The Bee type enemy
  class Bee extends Flutter
  {
    constructor(gameManager, entryTime, entryPath, enemySlot, shootModes, shootDelay)
    {
      super(gameManager, 'Bee', entryTime, entryPath, enemySlot, 100, true, shootModes, shootDelay, true, true);
      
      this.divePath = this.generateLoopingDive();
    }
    
    // Updates the grasshopper
    update()
    {
      super.update();
    }
    
    // Renders the grasshopper
    render()
    {
      super.render();
    }
    
    checkHit(position, hitbox)
    {
      return super.checkHit(position, hitbox)
    }
  }

  // Generic Movement Path
  class MovementPath
    {
      constructor(pathSegments)
      {
        this.segments = pathSegments;
        this.length = 0;
        
        this.calculateLength();
      }
      
      // Calculates the total length of the movement path
      calculateLength()
      {
        // Add the lengths of each segment
        for(let i = 0; i < this.segments.length; i++)
          {
            this.length += this.segments[i].length;
          }
      }
      
      // Returns a position based on an interpolation value (between 0 and 1)
      getPointOnPath(t)
      {
        let interpolatedLength = this.length * t;
        
        // Iterate over each segment to see if the length is within that segment's path
        let searchLength = 0;
        let nextSearchLength = 0;
        let segmentIndex = 0;
        for(let i = 0; i < this.segments.length; i++)
          {
            nextSearchLength += this.segments[i].length;
            if(interpolatedLength >= searchLength && interpolatedLength <= nextSearchLength)
              {
                // This segment is where the point will be found
                segmentIndex = i;
                break;
              }
            else
              {
                this.searchLength += this.segments[i].length;
              }
          }
        
        // Get the sub interpolation value
        let subT = (interpolatedLength - this.getLengthsOfSegments(segmentIndex - 1)) / this.segments[segmentIndex].length;
        let pathPoint = this.segments[segmentIndex].getPointOnPath(subT);
        
        return pathPoint;
      }
      
      // Returns the cumulative length of a series of segments
      getLengthsOfSegments(segmentIndex)
      {
        if(segmentIndex < 0)
          {
            return 0;
          }
        else
          {
            let length = 0;
            for(let i = 0; i < segmentIndex + 1; i++)
              {
                length += this.segments[i].length;
              }
            return length;
          }
      }
      
      // Draws the path, requires that drawing styles have been set before making this call
      drawPath()
      {
        // Iterate over each segment and draw that segment
        for(let i = 0; i < this.segments.length; i++)
          {
            this.segments[i].drawPath();
          }
      }
    }

  // Bezier Movement Path Segment
  class BezierSegment
    {
      constructor(points)
      {
        this.points = points; // Anchor 1, Control 1, Control 2, Anchor 2
        this.length = 0;
        
        this.calculateLength();
      }
      
      // Calculates the length of the bezier path
      calculateLength()
      {
        // Iterate over the path with a given resolution
        let resolution = 12;
        let segmentInterpolatedInterval = 1 / resolution;
        for(let i = 0; i < resolution + 1; i++)
          {
            let pointA = this.getPointOnPath(segmentInterpolatedInterval * i);
            let pointB = this.getPointOnPath(segmentInterpolatedInterval * (i + 1));
            
            this.length += pointA.dist(pointB);
          }
      }
      
      // Returns a single point on the path
      getPointOnPath(t)
      {
        return createVector(this.getAxisOnPath(t, this.points[0].x, this.points[1].x, this.points[2].x, this.points[3].x), this.getAxisOnPath(t, this.points[0].y, this.points[1].y, this.points[2].y, this.points[3].y));
      }
      
      // Returns a single axis on the path
      getAxisOnPath(t, a, b, c, d)
      {
        let t2 = t * t;
        let t3 = t2 * t;
        return a + (-a * 3 + t * (3 * a - a * t)) * t + (3 * b + t * (-6 * b + b * 3 * t)) * t + (c * 3 - c * 3 * t) * t2 + d * t3;
      }
      
      // Draws the path, requires that drawing styles have been set before making this call
      drawPath()
      {
        noFill();
        strokeWeight(1);
        stroke(color('magenta'));
        bezier(this.points[0].x, this.points[0].y, this.points[1].x, this.points[1].y, this.points[2].x, this.points[2].y, this.points[3].x, this.points[3].y);
      }
    }

  // Linear Movement Path Segment
  class LinearSegment
    {
      constructor(points)
      {
        this.points = points; // Anchor 1, Anchor 2
        this.length = 0;
        
        this.calculateLength();
      }
      
      // Calculates the length of the linear path
      calculateLength()
      {
        this.length = p5.Vector.dist(this.points[0], this.points[1]);
      }
      
      // Returns a single point on the path
      getPointOnPath(t)
      {
        return p5.Vector.lerp(this.points[0], this.points[1], t);
      }
      
      // Draws the path, requires that drawing styles have been set before making this call
      drawPath()
      {
        noFill();
        strokeWeight(1);
        stroke(color('magenta'));
        line(this.points[0].x, this.points[0].y, this.points[1].x, this.points[1].y);
      }
    }

  // Fireable item
  class Fireable
    {
      constructor(gameManager, position, direction, speed, hitBox, sprite)
      {
        this.gameManager = gameManager;
        this.position = position;
        this.direction = direction;
        this.speed = speed;
        this.hitBox = hitBox;
        this.sprite = sprite;
        
        this.debug = false;
        this.hitboxColor = color('lime');
      }
      
      // Updates the fireable
      update()
      {
        // Move the position in a direction and speed
        this.position.add(p5.Vector.mult(this.direction, this.speed));
      }
      
      // Renders the fireable
      render()
      {
        this.drawSprite(this.position, this.sprite);
        
        // Debug
        if(this.debug)
          {
            let hitboxLocation = p5.Vector.add(this.hitBox.start, this.position);
            noFill();
            stroke(this.hitboxColor);
            strokeWeight(1);
            
            rect(hitboxLocation.x, hitboxLocation.y, this.hitBox.size.x, this.hitBox.size.y);
          }
      }
      
      // Draws the sprite at a given position scaled based on the sprite size set in the game manager
      drawSprite(position, sprite)
      {
        // Iterate over the rows of the sprite
        for(let y = 0; y < sprite.length; y++)
          {
            // Iterate over the indiviual row
            for(let x = 0; x < sprite[y].length; x++)
              {
                // Get the pixel color and position
                let pixelColor = color(sprite[y][x]);
                let pixelPosition = createVector(position.x + (x * this.gameManager.spriteSize), position.y + (y * this.gameManager.spriteSize));
                
                noStroke();
                fill(pixelColor);
                
                rect(pixelPosition.x, pixelPosition.y, this.gameManager.spriteSize + this.gameManager.spritePixelOverdraw);
              }
          }
      }
      
    }

  // Bullet Fireable
  class Bullet extends Fireable
  {
    constructor(gameManager, position)
    {
      // Retrieve the bullet sprite
      let sprite = gameManager.spriteManager.getEntitySprite('Bullet', 0);
      
      super(gameManager, position, createVector(0,1), 4.5, new Hitbox(createVector(3 * gameManager.spriteSize, 2 * gameManager.spriteSize), createVector(5 * gameManager.spriteSize, 7 * gameManager.spriteSize)), sprite);
    }
    
    // Updates the bullet
    update()
    {
      super.update();
    }

    // Renders the bullet
    render()
    {
      super.render();
    }
  }

  // Laser Fireable
  class Laser extends Fireable
  {
    constructor(gameManager, position)
    {
      // Retrieve the laser sprite
      let sprite = gameManager.spriteManager.getEntitySprite('Laser', 0);
      
      super(gameManager, position, createVector(0,-1), 6, new Hitbox(createVector(2 * gameManager.spriteSize, 1 * gameManager.spriteSize), createVector(7 * gameManager.spriteSize, 9 * gameManager.spriteSize)), sprite);
      
      // Increment the shots fired by 1
      gameManager.shotsFired++;
    }
    
    // Updates the laser
    update()
    {
      super.update();
    }

    // Renders the laser
    render()
    {
      super.render();
    }
  }

  // Generic Hitbox Data
  class Hitbox
    {
      constructor(start, size)
      {
        this.start = start;
        this.size = size;
      }
      
      // Returns a bool if this hitbox intersects with a given hitbox
      checkIntersect(thisPosition, otherPosition, hitbox)
      {
        let thisStartPosition = createVector(thisPosition.x + this.start.x, thisPosition.y + this.start.y);
        let otherStartPosition = createVector(otherPosition.x + hitbox.start.x, otherPosition.y + hitbox.start.y);
        
        // Check x and y for overlap
        if (otherStartPosition.x > this.size.x + thisStartPosition.x || thisStartPosition.x > hitbox.size.x + otherStartPosition.x || otherStartPosition.y > this.size.y + thisStartPosition.y || thisStartPosition.y > hitbox.size.y + otherStartPosition.y)
        {
          return false;
        }
        
        return true;
      }
    }

  // Spawnable Wave
  class SpawnWave
    {
      constructor(enemies, startTime)
      {
        this.start = startTime;
        this.enemies = enemies;
      }
    }

  // Spawnable Enemy
  class SpawnEnemy
    {
      constructor(enemy, startTime)
      {
        this.start = startTime;
        this.enemy = enemy;
      }
    }
  
  galaga = new Galaga(sprites, galagaHighscore);

  this.setup = function() {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
    randomSeed(year() + month() + day() + hour() + minute() + second());
  }

  this.draw = function() {
    galaga.render();
  }
}

// Electrons Scene
function Logo_Electrons()
{
  class VectorField
    {
      constructor()
      {
        this.debug = true;
        this.res = 24;
      }

      render(time)
      {
        blendMode(DARKEST);
        background(color('rgba(0,0,0,0.04)'));

        blendMode(BLEND);
        noFill();
        strokeWeight(6);

        for(let x = -(this.res/2); x < this.res/2; x++)
          {
            for(let y = -(this.res/2); y < this.res/2; y++)
              {
                let origin = createVector(x * (width / this.res),y * (height / this.res));
                let vector = this.field(origin, time).normalize().mult((Math.sin((time + (x * y)) * 0.125) * 12) * 12).add(origin);

                let offset = createVector(width/2, height/2);

                stroke(color('rgba(255,255,255, 1)'));

                point(vector.x + offset.x, vector.y + offset.y);
              }
          }
      }

      field(point, time)
      {
        let mainScale = 0.125;
        let mainSize = 100;
        // let mainNoise = createVector(Math.sin(Math.cos((point.y - (time * mainSize)) * mainScale)), Math.tan(Math.cos((point.y + point.x + (time * mainSize)) * mainScale)));
        let mainNoise = createVector(Math.sin((point.x + time) * mainScale), Math.cos((point.y - time) * mainScale));

        let scaleSub = 0.005;
        let subNoise = createVector(Math.sin((point.y + point.x) * scaleSub), Math.cos((point.y - point.x) * scaleSub));

        return mainNoise.add(subNoise);
      }
    }
  
  this.time = 0;

  this.setup = function() {
    mgr.clearFrames = false;
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
    randomSeed(year() + month() + day() + hour() + minute() + second());
    background(0);
  }

  this.draw = function() {
    // background(220);
    this.time += deltaTime / 1000;
    new VectorField().render(this.time);
    mgr.clearFrames = false;
  }
}

// Collapse Scene
function Logo_Collapse()
{
  class CollapseRenderer
    {
      constructor()
      {
        this.columns = 32;
        this.center = createVector(width/2, height/2);
        this.width = width * 16;
        this.height = height * 2;
        this.perspective = 6;
        this.squareSize = 12;
        this.trippyScale = 50;

        this.columnPoints = [];

        this.generateColumns();
      }

      generateColumns()
      {
        this.columnPoints = [];
        let columnInterval = this.width / this.columns;
        for(let x = -this.columns/2; x < this.columns/2; x++)
          {
            // Top Column
            let startTop = createVector((x * columnInterval) + (columnInterval/2), -this.height/2, 1);
            let endTop = createVector((x * columnInterval) + (columnInterval/2), 0, this.perspective);

            // Bottom Column
            let startBottom = createVector((x * columnInterval) + (columnInterval/2), this.height/2, 1);
            let endBottom = createVector((x * columnInterval) + (columnInterval/2), 0, this.perspective);

            this.columnPoints.push([[startTop, endTop], [startBottom, endBottom]]);
          }
      }

      render(time)
      {
        // this.columns = round(64 + (TriangleWave(1, 0.25, time) * 64) + 64);
        this.generateColumns();

        // print(this.columnPoints.length)
        for(let i = 0; i < this.columnPoints.length; i++)
          {
            let top = this.columnPoints[i][0];
            let bottom = this.columnPoints[i][1];

            for(let q = 0; q < this.squareSize; q++)
              {
                for(let s = 0; s < 2; s++)
                  {
                    let square = this.generateSquare(((q/this.squareSize) + time) % 1, i, s);
                    let distToCenter = map(p5.Vector.dist(square[4], this.center), 0, width, 0, 255);

                    // let fillColor = color('black');
                    // if((i + q) % 2 == 0)
                    //   {
                    //     fillColor = color('white');
                    //   }
                    let fillColor = color([(Math.cos((distToCenter + time)/this.trippyScale) + 1) * 128, distToCenter, (Math.sin((distToCenter - time)/this.trippyScale) + 1) * 128]);

                    // Hue shift fill color
                    let hU = (round(hue(fillColor)) + round(time * 90)) % 360;
                    let sA = round(saturation(fillColor)) - 12;
                    let bR = round(brightness(fillColor));

                    // print(hU);

                    fillColor = color('hsb(' + hU + ', ' + sA + '%, ' + bR + '%)');

                    noStroke();
                    fill(fillColor);

                    beginShape();
                    vertex(square[0].x, square[0].y);
                    vertex(square[1].x, square[1].y);
                    vertex(square[3].x, square[3].y);
                    vertex(square[2].x, square[2].y);
                    endShape();
                  }
              }
          }
      }

      generateSquare(t, i, s)
      {
        let column = this.columnPoints[i][s];
        let columnSize = this.width / this.columns;

        let tCenter = Clamp(t,0,1);

        let center = p5.Vector.lerp(column[0], column[1], tCenter);
        let top = p5.Vector.lerp(column[0], column[1], Clamp(tCenter - (1 / this.squareSize),0,1));
        let bottom = p5.Vector.lerp(column[0], column[1], Clamp(tCenter + (1 / this.squareSize),0,1));

        let bottomL = createVector(-columnSize/2, 0).add(bottom);
        let bottomR = createVector(columnSize/2, 0).add(bottom);
        let topL = createVector(-columnSize/2, 0).add(top);
        let topR = createVector(columnSize/2, 0).add(top);

        return [this.getPerspectiveProjection(bottomL).add(this.center), this.getPerspectiveProjection(bottomR).add(this.center), this.getPerspectiveProjection(topL).add(this.center), this.getPerspectiveProjection(topR).add(this.center), this.getPerspectiveProjection(center).add(this.center)];
        // return [top, center, bottom];
      }

      getPerspectiveProjection(point)
      {
        return point.div(point.z);
      }
    }
  
  this.collapseRenderer = new CollapseRenderer();
  this.time = 0;

  this.setup = function() {
    createCanvas(mgr.canvasSize.x, mgr.canvasSize.y);
    randomSeed(year() + month() + day() + hour() + minute() + second());
  }

  this.draw = function() {
    background(220);
    this.time += (deltaTime / 1000) / 8;
    this.collapseRenderer.render(this.time);
  }

  
}