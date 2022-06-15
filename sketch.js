let maskEditor;

function setup() {
  createCanvas(800, 800);
  maskEditor = new MaskEditor();
}

function draw() {
  background(220);
  maskEditor.drawMask();
  
  if(keyIsPressed === true)
    {
      maskEditor.printMaskPoints();
    }
}

class MaskEditor
  {
    constructor()
    {
      this.configureMode = true;
      
      this.masks = [];
      
      this.handleSize = 12;
      
      this.generateMaskPoints();
    }
    
    generateMaskPoints()
    {
      this.masks.push(new Mask(createVector(width/2, height), createVector(0,0), [
        new MaskPoint(0, createVector(100,100), 'vertex'),
        new MaskPoint(1, createVector(100,500), 'vertex'),
        new MaskPoint(2, createVector(100,600), 'quadratic', createVector(100,500)),
        new MaskPoint(3, createVector(100,600), 'quadratic', createVector(200,600)),
        new MaskPoint(4, createVector(200,600), 'vertex'),
        new MaskPoint(5, createVector(200,100), 'vertex')
      ]));
      
      this.masks.push(new Mask(createVector(width/2, height), createVector(width/2,0), [
        new MaskPoint(0, createVector(400,100), 'vertex'),
        new MaskPoint(1, createVector(400,600), 'vertex'),
        new MaskPoint(2, createVector(500,600), 'vertex'),
        new MaskPoint(3, createVector(500,100), 'vertex')
      ]));
      
      this.linkEditor()
      
      for(let m = 0; m < this.masks.length; m++)
        {
          this.masks[m].linkMask();
        }
    }
    
    printMaskPoints()
    {
      let mask = [];
      for(let m = 0; m < this.masks.length; m++)
        {
          let maskObject = this.masks[m].getMask();
          mask.push(maskObject);
        }
      
      print(JSON.stringify(mask));
    }
    
    drawMask()
    {
      this.checkInteraction();
      
      for(let s = 0; s < this.masks.length; s++)
        {
          this.masks[s].drawMask();
        }
      
      if(this.configureMode)
        {
          this.drawHandles();
        }
    }
    
    drawHandles()
    {
      for(let s = 0; s < this.masks.length; s++)
        {
          this.masks[s].renderHandles();
        }
    }
    
    checkInteraction()
    {
      let mousePosition = createVector(mouseX, mouseY);
      
      // Iterate over all interaction points
      for(let s = 0; s < this.masks.length; s++)
        {
          this.masks[s].checkInteraction(mousePosition);
        }
    }
    
    linkEditor()
    {
       for(let m = 0; m < this.masks.length; m++)
        {
          this.masks[m].editor = this;
        }
    }
  }

class Mask
  {
    constructor(size, position, cutout)
    {
      this.editor = null;
      this.size = size;
      this.position = position;
      this.cutout = cutout;
      this.maskColor = color('black');
      
      this.pointDraggingIndex = -1;
    }
    
    getMask()
    {
      return {
        size: this.size.toString(),
        position: this.position.toString(),
        cutout: this.getPoints()
      };
    }
    
    checkInteraction(mousePosition)
    {
      // Iterate over all interaction points
      for(let p = 0; p < this.cutout.length; p++)
        {
          this.cutout[p].checkInteraction(mousePosition);
        }
    }
    
    drawMask()
    {
      // Fill the mask with the mask color
      noStroke();
      fill(this.maskColor);
      
      // Create the base mask shape
      beginShape();
      vertex(this.position.x, this.position.y);
      vertex(this.position.x + this.size.x, this.position.y);
      vertex(this.position.x + this.size.x, this.position.y + this.size.y);
      vertex(this.position.x, this.position.y + this.size.y);
      
      // Iterate over the cutout points
      beginContour();
      for(let p = 0; p < this.cutout.length; p++)
        {
          let cutoutPoint = this.cutout[p];
          if(cutoutPoint.type == 'vertex')
            {
              vertex(cutoutPoint.position.x, cutoutPoint.position.y);
            }
          else
            {
              quadraticVertex(cutoutPoint.position.x, cutoutPoint.position.y, cutoutPoint.control.x, cutoutPoint.control.y);
            }
        }
      endContour();
      endShape();
    }
    
    renderHandles()
    {
      for(let p = 0; p < this.cutout.length; p++)
        {
          let cutoutPoint = this.cutout[p];
          if(cutoutPoint.type == 'vertex')
            {
              noFill();
              stroke(color('pink'));
              if(cutoutPoint.isDragging)
                {
                  stroke(color('magenta'));
                }
              strokeWeight(this.editor.handleSize);
              
              point(cutoutPoint.position.x, cutoutPoint.position.y);
              
              noStroke();
              fill(color('white'));
              textSize(16);
              textAlign(LEFT);
              
              text(cutoutPoint.index, cutoutPoint.position.x, cutoutPoint.position.y);
            }
          else
            {
              noFill();
              stroke(color('yellow'));
              strokeWeight(1);
              
              line(cutoutPoint.position.x, cutoutPoint.position.y, cutoutPoint.control.x, cutoutPoint.control.y);
              
              noFill();
              stroke(color('pink'));
              if(cutoutPoint.isDragging)
                {
                  stroke(color('magenta'));
                }
              strokeWeight(this.editor.handleSize);
              
              point(cutoutPoint.position.x, cutoutPoint.position.y);
              
              noFill();
              stroke(color('cyan'));
              if(cutoutPoint.isDraggingControl)
                {
                  stroke(color('blue'));
                }
              strokeWeight(this.editor.handleSize);
              
              point(cutoutPoint.control.x, cutoutPoint.control.y);
              
              noStroke();
              fill(color('white'));
              textSize(16);
              textAlign(LEFT);
              
              text(cutoutPoint.index, cutoutPoint.position.x, cutoutPoint.position.y);
              
              noStroke();
              fill(color('white'));
              textSize(16);
              textAlign(LEFT);
              
              text(cutoutPoint.index, cutoutPoint.control.x, cutoutPoint.control.y);
            }
        }
    }
    
    linkMask()
    {
       for(let p = 0; p < this.cutout.length; p++)
        {
          this.cutout[p].mask = this;
        }
    }
    
    getPoints()
    {
      let points = [];
      for(let p = 0; p < this.cutout.length; p++)
        {
          points.push(this.cutout[p].getPoint());
        }
      
      return points;
    }
  }

class MaskPoint
  {
    constructor(index, position, type, control)
    {
      this.index = index;
      this.position = position;
      this.control = control;
      if(control === undefined)
        {
          this.control = null;
        }
      this.type = type;
      this.isDragging = false;
      this.isDraggingControl = false;
      this.mask = null;
    }
    
    renderPoint()
    {
      let isHoveringControl = this.isMouseOnControlPoint(createVector(mouseX, mouseY), this.control);
      let isHoveringPoint = this.isMouseOnPoint(createVector(mouseX, mouseY), this.position);
      
      if(this.type == 'vertex')
        {
          noFill();
          stroke(color('cyan'));
          if(isHoveringPoint)
            {
              stroke(color('magenta'));
            }
          strokeWeight(8);
          
          point(this.position.x, this.position.y);
        }
      else
        {
          noFill();
          stroke(color('yellow'));
          if(isHoveringPoint || isHoveringControl)
            {
              stroke(color('orange'));
            }
          strokeWeight(1);
          
          line(this.position.x, this.position.y, this.control.x, this.control.y);
          
          noFill();
          stroke(color('cyan'));
          if(isHoveringPoint)
            {
              stroke(color('magenta'));
            }
          strokeWeight(8);
          
          point(this.position.x, this.position.y);
          
          noFill();
          stroke(color('cyan'));
          if(isHoveringControl)
            {
              stroke(color('magenta'));
            }
          strokeWeight(8);
          
          point(this.control.x, this.control.y);
        }
    }
    
    checkInteraction(mousePosition, pointsDragging)
    {
      if(this.isDragging)
        {
          // The mouse is dragging this point
          // Move the point to where the mouse is
          this.position = mousePosition;
          if(!mouseIsPressed)
            {
              // The mouse has let go of the point
              // Drop the point where the mouse is
              this.isDragging = false;
              this.mask.pointDraggingIndex = -1;
            }
        }
      
      if(!this.isDragging && mouseIsPressed && this.isMouseOnPoint(mousePosition, this.position))
        {
          // The mouse is over the point
          // Check if the mouse is already dragging another point
          if(!pointsDragging)
            {
              // The mouse has picked up the point
              this.position = mousePosition;
              this.isDragging = true;
              this.mask.pointDraggingIndex = this.index;
            }
        }
      
      // Control
      if(this.control != null)
        {
          if(this.isDraggingControl)
            {
              // The mouse is dragging this point
              // Move the point to where the mouse is
              this.control = mousePosition;
              if(!mouseIsPressed)
                {
                  // The mouse has let go of the point
                  // Drop the point where the mouse is
                  this.isDraggingControl = false;
                  this.mask.pointDraggingIndex = -1;
                }
            }

          if(!this.isDraggingControl && mouseIsPressed && this.isMouseOnPoint(mousePosition, this.control))
            {
              // The mouse is over the point
              // Check if the mouse is already dragging another point
              if(!pointsDragging)
                {
                  // The mouse has picked up the point
                  this.control = mousePosition;
                  this.isDraggingControl = true;
                  this.mask.pointDraggingIndex = this.index;
                }
            }
        }
    }
    
    // Is the mouse on the point
    isMouseOnPoint(mousePosition, position)
    {
      if(dist(position.x, position.y, mousePosition.x, mousePosition.y) <= this.mask.editor.handleSize)
        {
          return true;
        }
      else
        {
          return false;
        }
    }
    
    getPoint()
    {
      let control = null;
      if(this.control != null)
        {
          control = this.control.toString();
        }
      
      return {
        index: this.index,
        position: this.position.toString(),
        type: this.type,
        control: control
      }
    }
  }