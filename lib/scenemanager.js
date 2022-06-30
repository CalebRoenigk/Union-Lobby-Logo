//
// p5 SceneManager helps you create p5.js sketches with multiple states / scenes
// Each scene is a like a sketch within the main sketch. You focus on creating
// the scene like a regular sketch and SceneManager ensure scene switching
// routing the main setup(), draw(), mousePressed(), etc. events to the 
// appropriate current scene.
//
// Author: Marian Veteanu
// http://github.com/mveteanu
//

// Additional Scene Manager Extension
// Create Scene Manager Modes for display
const RANDOM = 'random'; // Randomly chooses scenes
const SINGLE = 'single'; // A single scene is played forever
const CYCLE = 'cycle'; // Scenes are played in the order they were added to the scene manager scene list
const ALTERNATING = 'alternating'; // Alternates between a set scene and the cycle of scenes


function SceneManager(p)
{
    this.scenes = [];
    this.scene = null;
    // Additional Scene Manager Extension
    // This extension allows for the scene manager to automatically cycle the scenes based on the time
    this.sceneManagerTime = 0; // Stores the time the manager started playing
    this.sceneDuration = 5; // The length of each scene
    this.sceneTransitionTime = 1.5; // Scene transition time in seconds
    this.debug = true;
    this.currentSceneTime = 0;
    this.canvasSize = createVector(800,800);
    this.sceneMode = CYCLE;
    this.setScene = 0; // The scene that is played when the mode is single or alternating
    this.sceneIndex = 0; // Only used when alternating mode is set
    this.clearFrames = true; // If the canvas will be cleared each time the draw method is called
    
    // Wire relevant p5.js events, except setup()
    // If you don't call this method, you need to manually wire events
    this.wire = function()
    {
        const P5Events = [ "mouseClicked", 
                "mousePressed", 
                "mouseReleased", 
                "mouseMoved", 
                "mouseDragged", 
                "doubleClicked", 
                "mouseWheel", 
                "keyPressed", 
                "keyReleased", 
                "keyTyped", 
                "touchStarted", 
                "touchMoved", 
                "touchEnded", 
                "deviceMoved", 
                "deviceTurned", 
                "deviceShaken" ];

        var me = this;
        var o = p != null ? p : window;

        // Wire draw manually for speed reasons...
        o.draw = function(){ me.draw(); };

        // This loop will wire automatically all P5 events to each scene like this:
        // o.mouseClicked = function() { me.handleEvent("mouseClicked"); }
        for(var i = 0; i < P5Events.length; i++)
        {
            let sEvent = P5Events[i]; // let is necesary to set the scope at the level of for
            o[sEvent] = function() { me.handleEvent(sEvent) };
        }
        
        return me;
    }


    // Add a scene to the collection
    // You need to add all the scenes if intend to call .showNextScene()
    this.addScene = function( fnScene )
    {
        var oScene = new fnScene(p);

        // inject p as a property of the scene
        this.p = p;
        
        // inject sceneManager as a property of the scene
        oScene.sceneManager = this;

        var o = {   fnScene: fnScene, 
                    oScene: oScene,
                    hasSetup : "setup" in oScene,
                    hasEnter : "enter" in oScene,
                    hasDraw : "draw" in oScene,
                    setupExecuted : false,
                    enterExecuted : false };

        this.scenes.push(o);
        return o;
    }

    // Return the index of a scene in the internal collection
    this.findSceneIndex = function( fnScene )
    {
        for(var i = 0; i < this.scenes.length; i++)
        {
            var o = this.scenes[i]; 
            if ( o.fnScene == fnScene )
                return i;
        }

        return -1;
    }

    // Return a scene object wrapper
    this.findScene = function( fnScene )
    {
        var i = this.findSceneIndex( fnScene );
        return i >= 0 ? this.scenes[i] : null;
    }

    // Returns true if the current displayed scene is fnScene
    this.isCurrent = function ( fnScene )
    {
        if ( this.scene == null )
            return false;

        return this.scene.fnScene == fnScene;
    }

    // Show a scene based on the function name
    // Optionally you can send arguments to the scene
    // Arguments will be retrieved in the scene via .sceneArgs property
    this.showScene = function( fnScene, sceneArgs )
    {
        var o = this.findScene( fnScene );

        if ( o == null )
            o = this.addScene( fnScene );
        
        // Re-arm the enter function at each show of the scene
        o.enterExecuted = false;

        this.scene = o;

        // inject sceneArgs as a property of the scene
        o.oScene.sceneArgs = sceneArgs;
    }

    // Show the next scene in the collection
    // Useful if implementing demo applications 
    // where you want to advance scenes automatically
    this.showNextScene = function( sceneArgs )
    {
        if ( this.scenes.length == 0 )
            {
                return;
            }

        // Determine the index of the next scene from the scene mode
        let nextSceneIndex = 0;
        switch(this.sceneMode)
        {
            // Cycle and Default
            case CYCLE:
            default:
                if ( this.scene != null )
                {
                    // search current scene... 
                    // can be optimized to avoid searching current scene...
                    let i = this.findSceneIndex( this.scene.fnScene );
                    nextSceneIndex = i < this.scenes.length - 1 ? i + 1 : 0;
                }
                break;
            // Alternating
            case ALTERNATING:
                if ( this.scene == null )
                {
                    nextSceneIndex = this.setScene;
                    break;
                }
                
                if(this.findSceneIndex( this.scene.fnScene ) == this.setScene)
                {
                    // Cycle if the current scene is the set scene
                    if ( this.scene != null )
                    {
                        nextSceneIndex = this.sceneIndex < this.scenes.length - 1 ? this.sceneIndex + 1 : 0;
                        this.sceneIndex = nextSceneIndex;
                    }
                }
                else
                {
                    nextSceneIndex = this.setScene;
                }
                break;
            // Single
            case SINGLE:
                nextSceneIndex = this.setScene;
                break;
            // Random
            case RANDOM:
                let randomIndex = round(random(0, this.scenes.length - 1));
                nextSceneIndex = randomIndex;
                break;
        }

        let nextScene = this.scenes[nextSceneIndex];
        this.showScene( nextScene.fnScene, sceneArgs );
        this.clearFrames = true; // Resets the clear frames to true always, can be overridden by the next scene
        
      // Clear Props from Last Scene
        noFill();
        noStroke();
        strokeWeight(0);
        drawingContext.setLineDash([0, 0]);
        angleMode(DEGREES);
    }
    
    // This is the SceneManager .draw() method
    // This will dispatch the main draw() to the 
    // current scene draw() method
    this.draw = function()
    {
        // SCENE MANAGER EXTENSION
        this.sceneManagerTime += deltaTime / 1000;
        // Check if the transition to a new scene is in order
        if(floor(this.sceneManagerTime / this.sceneDuration) != this.currentSceneTime)
          {
            this.showNextScene();
          }
      
        let sceneCompleted = (this.sceneManagerTime % this.sceneDuration) / this.sceneDuration;
        if(this.clearFrames)
        {
            clear();
        }
        
      
        // take the current scene in a variable to protect it in case
        // it gets changed by the user code in the events such as setup()...
        var currScene = this.scene;
        
        if ( currScene == null )
            return;

        if ( currScene.hasSetup && !currScene.setupExecuted  )
        {
            currScene.oScene.setup();
            currScene.setupExecuted = true;
        }

        if ( currScene.hasEnter && !currScene.enterExecuted  )
        {
            currScene.oScene.enter();
            currScene.enterExecuted = true;
        }

        if ( currScene.hasDraw )
        {
            currScene.oScene.draw();
        }
      
        // SCENE MANAGER EXTENSION
        blendMode(BLEND);
        let transitionSegement = this.sceneTransitionTime / this.sceneDuration;
      
        let transitionStartCompleted = Clamp(sceneCompleted, 0, transitionSegement);
        let transitionEndCompleted = Clamp(sceneCompleted - (1 - (transitionSegement)), 0, transitionSegement);
      
        let sceneTransitionInterpolater = max((1 - (transitionStartCompleted / transitionSegement)), transitionEndCompleted / transitionSegement);
      
        // Draw the scene transition over top of everything else
        noStroke();
        fill(lerpColor(color('rgba(0,0,0,0)'), color('rgba(0,0,0,1)'), easeInOutCubic(sceneTransitionInterpolater)));
        rect(0,0, width, height);
      
        // Draw play bar if debug is on
        if(this.debug)
          {
            // Draw Scene Play Time
            noStroke();
            fill(color('red'));

            rect(0, height - 5, width * sceneCompleted, 5);

            // Draw Start Transtion
            noStroke();
            fill(color('cyan'));

            rect(0, height - 5, width * transitionStartCompleted, 5);

            // Draw End Transtion
            noStroke();
            fill(color('cyan'));

            rect(width - (width * (this.sceneTransitionTime / this.sceneDuration)), height - 5, width * transitionEndCompleted, 5);
          }
        
        // Set the current scene based on the time
        this.currentSceneTime = floor(this.sceneManagerTime / this.sceneDuration);
    }


    // Handle a certain event for a scene... 
    // It is used by the anonymous functions from the wire() function
    this.handleEvent = function(sEvent)
    {
        if ( this.scene == null || this.scene.oScene == null )
            return;

        var fnSceneEvent = this.scene.oScene[sEvent];
        if (fnSceneEvent)
            fnSceneEvent.call(this.scene.oScene);
    }

    // Legacy method... preserved for maintaining compatibility
    this.mousePressed = function()
    {
        this.handleEvent("mousePressed");
    }

    // Legacy method... preserved for maintaining compatibility
    this.keyPressed = function()
    {
        this.handleEvent("keyPressed");
    }

}