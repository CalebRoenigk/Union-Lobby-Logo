// P5JS Launch Points
function preload() {
  console.log("preloading");
  startup();
}

function setup() {
  console.log("setup");
  // Create the scene manager
  // sceneManager = new SceneManager();
  
  // TODO: ADD SCENES TO THE SCENE MANAGER
  // sceneManager.scenes.push();
  
  // Run the scene manager preload operation
  // sceneManager.preload();
  
  // Create the canvas
  createCanvas(400,400);
}

function draw() {
  // sceneManager.draw();
}

// Utilities
// Math Utilities
class MathUtil {
  constructor() {}

  // Is the value even
  isEven(value) {
    return value % 2 === 0;
  }

  // Is the value odd
  isOdd(value) {
    return !isEven(value);
  }

  // Clamp the value within a min and max range
  clamp(value, min, max) {
    return min(max(value,min), max);
  }
}

// Easing Utilities
class EaseUtil {
  constructor() {}

  // Sine
  easeInSine(x) {
    return 1 - Math.cos((x * PI) / 2);
  }
  easeOutSine(x) {
    return Math.sin((x * PI) / 2);
  }
  easeInOutSine(x) {
    return -(Math.cos(PI * x) - 1) / 2;
  }

  // Quad
  easeInQuad(x) {
    return x * x;
  }
  easeOutQuad(x) {
    return 1 - (1 - x) * (1 - x);
  }
  easeInOutQuad(x) {
    return x < 0.5 ? 2 * x * x : 1 - pow(-2 * x + 2, 2) / 2;
  }

  // Cubic
  easeInCubic(x) {
    return x * x * x;
  }
  easeOutCubic(x) {
    return 1 - pow(1 - x, 3);
  }
  easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - pow(-2 * x + 2, 3) / 2;
  }

  // Quart
  easeInQuart(x) {
    return x * x * x * x;
  }
  easeOutQuart(x) {
    return 1 - pow(1 - x, 4);
  }
  easeInOutQuart(x) {
    return x < 0.5 ? 8 * x * x * x * x : 1 - pow(-2 * x + 2, 4) / 2;
  }

  // Quint
  easeInQuint(x) {
    return x * x * x * x * x;
  }
  easeOutQuint(x) {
    return 1 - pow(1 - x, 5);
  }
  easeInOutQuint(x) {
    return x < 0.5 ? 16 * x * x * x * x * x : 1 - pow(-2 * x + 2, 5) / 2;
  }

  // Expo
  easeInExpo(x) {
    return x === 0 ? 0 : pow(2, 10 * x - 10);
  }
  easeOutExpo(x) {
    return x === 1 ? 1 : 1 - pow(2, -10 * x);
  }
  easeInOutExpo(x) {
    return x === 0
        ? 0
        : x === 1
            ? 1
            : x < 0.5 ? pow(2, 20 * x - 10) / 2
                : (2 - pow(2, -20 * x + 10)) / 2;
  }

  // Circ
  easeInCirc(x) {
    return 1 - sqrt(1 - pow(x, 2));
  }
  easeOutCirc(x) {
    return sqrt(1 - pow(x - 1, 2));
  }
  easeInOutCirc(x) {
    return x < 0.5
        ? (1 - sqrt(1 - pow(2 * x, 2))) / 2
        : (sqrt(1 - pow(-2 * x + 2, 2)) + 1) / 2;
  }

  // Back
  easeInBack(x) {
    const c1 = 1.70158;
    const c3 = c1 + 1;

    return c3 * x * x * x - c1 * x * x;
  }
  easeOutBack(x) {
    const c1 = 1.70158;
    const c3 = c1 + 1;

    return 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2);
  }
  easeInOutBack(x) {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;

    return x < 0.5
        ? (pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
        : (pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
  }

  // Elastic
  easeInElastic(x) {
    const c4 = (2 * PI) / 3;

    return x === 0
        ? 0
        : x === 1
            ? 1
            : -pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
  }
  easeOutElastic(x) {
    const c4 = (2 * PI) / 3;

    return x === 0
        ? 0
        : x === 1
            ? 1
            : pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  }
  easeInOutElastic(x) {
    const c5 = (2 * PI) / 4.5;

    return x === 0
        ? 0
        : x === 1
            ? 1
            : x < 0.5
                ? -(pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
                : (pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
  }

  // Bounce
  easeInBounce(x) {
    return 1 - this.easeOutBounce(1 - x);
  }
  easeOutBounce(x) {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (x < 1 / d1) {
      return n1 * x * x;
    } else if (x < 2 / d1) {
      return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
      return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
      return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
  }
  easeInOutBounce(x) {
    return x < 0.5
        ? (1 - this.easeOutBounce(1 - 2 * x)) / 2
        : (1 + this.easeOutBounce(2 * x - 1)) / 2;
  }
}

// Global Data
let sceneList = [{name: 'Logo', options: {enabled: true, values: ['Union', 'NRG', 'NGC','Diversey']}}, {name: 'Water', options: {enabled: false, values: []}}, {name: 'Air', options: {enabled: false, values: []}}, {name: 'Life', options: {enabled: false, values: []}}];
let editorSettings = {};
let editorState = false;
let mathUtil = new MathUtil();
let easeUtil = new EaseUtil();
let sceneManager;

// // TODO: Reimplement scene manager and p5js
// // TODO: Scene manager should submit a scene list when it runs the start function
// // TODO: Scene manager should constantly update the scene timeline
// // TODO: Scene manager to update scene duration every time it switches scenes
// // TODO: Scene manager to update the play queue every time it switches scenes
// // TODO: Scene list should include scene function name as well, and the option should be passed in as an arg of that function ex: logo('union)
// // TODO: Add ability to mask the scene to the U
//
//
//
//
// Startup function
function startup() {
  // Set up editor toggle
  document.addEventListener('keydown', (event) => {
    let keycode = event.key;
    if(keycode == '`' || keycode == '~') {
      editorState = !editorState;
      updateEditorState();
    }
  });

  // Update state of editor
  updateEditorState();

  // TODO: Get the scene list (from the sketch)

  // Playlist
  generatePlaylist(sceneList);

  // Timers and Clocks
  updateEditor();
  setInterval(updateEditor, 10000);
  setInterval(updateEditorPlayback, 1000);

  // Event Listeners
  document.querySelectorAll('input').forEach(element => {
    element.addEventListener('input', saveSettings);
  });
  document.querySelectorAll('select').forEach(element => {
    element.addEventListener('input', saveSettings);
  }); 

  // Load Settings
  loadSettings(); 
}

function updateEditorState() {
    if(editorState) {
      // Open Editor
      document.getElementById('editor-panel').classList.remove('editor-collapsed');
      document.getElementById('canvas-position-marker').classList.remove('canvas-position-marker-hidden');
    } else {
      // Close Editor
      document.getElementById('editor-panel').classList.add('editor-collapsed');
      document.getElementById('canvas-position-marker').classList.add('canvas-position-marker-hidden');
    }
 }

// Generates the playlist for all scenes in the p5js sketch
function generatePlaylist(scenes) {
  scenes.forEach(element => generatePlaylistItem(element));
}

// Generates a playlist entry given a playlist object
function generatePlaylistItem(playlistScene) {
  let playlist = document.getElementById('editor-playlist-list');

  // Create the label
  let label =  document.createElement('label');
  label.setAttribute('for', 'playlist-' + playlistScene.name);

  // Create the title and add it to the label
  let title = document.createElement('h3');
  title.setAttribute('data-playlist-type', playlistScene.name);
  title.textContent = playlistScene.name;

  label.appendChild(title);

  // Create the options and add them to the label
  if(playlistScene.options.enabled) {
    let select = document.createElement('select');
    select.setAttribute('name', 'playlist-' + playlistScene.name + '-options');
    select.id = 'playlist-' + playlistScene.name + '-options';
    select.setAttribute('data-playlist-type', playlistScene.name);

    playlistScene.options.values.forEach(element => {
      let option = document.createElement('option');
      option.value = element;
      option.textContent = element;
      select.appendChild(option);
    });

    label.appendChild(select);
  }

  // Create the checkbox and add it to the label
  let checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('name', 'playlist-items');
  checkbox.id = 'playlist-' + playlistScene.name;
  checkbox.setAttribute('onchange', "playlistItemChanged('" + playlistScene.name + "')");

  label.appendChild(checkbox);

  // Create the styled checkbox and add it to the label
  let checkboxStyled = document.createElement('span');
  checkboxStyled.setAttribute('class', 'playlist-checkbox');
  let checkboxStyledDiv = document.createElement('div');
  checkboxStyled.appendChild(checkboxStyledDiv);

  label.appendChild(checkboxStyled);

  // Create the list item and add the label to it
  let listItem = document.createElement('li');
  listItem.appendChild(label);

  // Add the item to the playlist list
  playlist.appendChild(listItem);
}

// Changes the selection styles of a playlist item
function playlistItemChanged(item) {
  let selectionValue = document.getElementById('playlist-' + item);
  let selectionItems = document.querySelectorAll('[data-playlist-type="' + item + '"]');

  selectionItems.forEach(element => {
    if(selectionValue.checked) {
      element.setAttribute('style', 'color: white; border-color: white;');
    } else {
      element.setAttribute('style', 'color: inherit; border-color: inherit;');
    }
  });
}

// Updates the position of the canvas and marker
function updateCanvasPosition() {
  let x = document.getElementById('editor-canvas-x').value;
  let y = document.getElementById('editor-canvas-y').value;

  let marker = document.getElementById('canvas-position-marker');

  marker.setAttribute('style', '--top: ' + y + 'px;' + '--left: ' + x + 'px;');

  document.querySelector('canvas').setAttribute('style', '--top: ' + y + 'px;' + '--left: ' + x + 'px;');
}

// Updates the playhead of the timeline
function updateEditorPlayback() {
  let date = new Date();

  let complete = Math.round((date.getSeconds() / 60) * 100);

  let editorTimelineNode = document.getElementById('editor-playback-timeline');
  editorTimelineNode.setAttribute('style', '--playback-scale: ' + complete + '%;');
}

// Updates all the clocks and timers in the editor panel
function updateEditor() {
  let date = new Date();
  updateEditorReloadTimer(date);
  updateEditorClock(date);
}

// Updates the time to page reload counter
function updateEditorReloadTimer(date) {
  let editorRefreshTimerNode = document.getElementById('editor-reload-timer');
   editorRefreshTimerNode.textContent = timeUntilMidnight(date);
}

// Returns the hours and minutes til midnight
function timeUntilMidnight(date) {
    var midnight = new Date();
    midnight.setHours( 24 );
    midnight.setMinutes( 0 );
    midnight.setSeconds( 0 );
    midnight.setMilliseconds( 0 );
    let timeLeft = ( midnight.getTime() - date.getTime() ) / 1000 / 60;

  let hoursLeft = Math.floor(timeLeft / 60);
  let minutesLeft = Math.ceil(timeLeft - (hoursLeft * 60));

  let timeString = hoursLeft > 1 ? hoursLeft + "hrs" : hoursLeft + "hr";
  timeString = timeString + " ";
  timeString = timeString + (minutesLeft > 1 ? minutesLeft + "mins" : minutesLeft + "min");

  return timeString;
}

// Updates the clock at the bottom of the editor panel
function updateEditorClock(date) {
  let editorClockNode = document.getElementById('editor-clock');

  editorClockNode.textContent = formatTimeAMPM(date);
}

// Returns the date in a 12 hour format
function formatTimeAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

// Force Reloads the page
function forceReload() {
  window.location.reload();
}

// Stores the settings in local storage
function saveSettings() {
  // Storage name
  let name = 'p5jsLobbySettings';

  // Storage Data
  let sceneDuration = Number(document.getElementById('editor-scenetime').value);
  let playlistItems = getPlaylistSettings();
  let canvasPosition = [Number(document.getElementById('editor-canvas-x').value), Number(document.getElementById('editor-canvas-y').value)];

  // Validate data
  if(typeof sceneDuration !== 'number' || sceneDuration <= 0) {
    sceneDuration = 60;
    document.getElementById('editor-scenetime').value = sceneDuration;
  }
  document.getElementById('editor-canvas-x').value = canvasPosition[0];
  document.getElementById('editor-canvas-y').value = canvasPosition[1];


  let settings = {sceneDuration: sceneDuration, playlistItems: playlistItems, canvasPosition: canvasPosition};
  editorSettings = settings;
  let value = JSON.stringify(settings);

  localStorage.setItem(name, value);
}

// Returns the playlist settings as they are currently configured
function getPlaylistSettings() {
  // {name: 'Logo', options: {enabled: true, selected: 'Union'}, enabled: true}
  let playlistItems = [];
  document.querySelectorAll('input[name="playlist-items"]').forEach(element => {
    // Get the name
    let name = element.id.split('-')[1];

    // Check for options
    let options = {enabled: false, selected: ''};
    if(document.getElementById('playlist-' + name + 'options') != null) {
      let select = document.getElementById('playlist-' + name + 'options');
      let selected = select.options[select.selectedIndex].text;
      options.enabled = true;
      options.selected = selected;
    }

    let enabled = element.checked;

    let playlistItem = {name: name, options: options, enabled: enabled};
    playlistItems.push(playlistItem);
  });

  return playlistItems;
}

// Loads the settings from local storage and updates the editor panel to reflect them
function loadSettings() {
  // Storage name
  let name = 'p5jsLobbySettings';

  // Load the settings
  let settings = {};
  if(localStorage.getItem(name) == null) {
    settings = {
      "sceneDuration":60,
      "playlistItems":getPlaylistSettings(),
      "canvasPosition":[
        200,
        200
      ]
    };
  } else {
    settings = JSON.parse(localStorage.getItem(name));

    // Load in the scene duration and canvas position
    document.getElementById('editor-scenetime').value = settings.sceneDuration;
    document.getElementById('editor-canvas-x').value = settings.canvasPosition[0];
    document.getElementById('editor-canvas-y').value = settings.canvasPosition[1];

    updateCanvasPosition();

    settings.playlistItems.forEach(element => {
      let label = document.querySelector('[for="playlist-' + element.name + '"]')
      if(label != null) {
        // The scene exists
        // {name: 'Logo', options: {enabled: true, selected: 'Union'}, enabled: true}
        document.getElementById('playlist-' + element.name).checked = element.enabled;
        if(element.options.enabled) {
          // Set the selected option
          let select = document.getElementById('playlist-' + element.name + '-options');
          let found = false;
          for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].text === element.options.selected) {
              select.selectedIndex = i;
              found = true;
              break;
            }
          }

          if(!found) {
            select.selectedIndex = 0;
          }
        }
        playlistItemChanged(element.name);
      }
    });
  }
  editorSettings = settings;
}

//
// class SceneManager {
//   constructor(scenes = [], duration= 60, size = 800) {
//     this.scenes = scenes;
//     this.duration = duration;
//     this.size = createVector(size,size);
//    
//     this.activeScene = scenes[0];
//     this.sceneTimer = duration;
//     this.transitionDuration = this.duration / 20; // A tenth of the total duration on either end of each scene
//    
//     // Null Scene
//     this.nullScene = new NullScene();
//   }
//
//   // Acts like the standard sketch preload function
//   preload() {
//     // Iterate over each scene and run its preload function
//     for(let i=0; i < this.scenes.length; i++) {
//       this.scenes[i].preload();
//     }
//   }
//
//   // Acts like the standard sketch draw function
//   draw() {
//     // Scene timer
//     this.sceneTimer -= deltaTime;
//    
//     if(this.sceneTimer <= 0) {
//       this.sceneTimer = this.duration;
//       this.playNext();
//       this.resetModes();
//     }
//    
//     if(this.activeScene == null) {
//      
//     } else {
//       if(!this.activeScene.startupExectued) {
//         this.activeScene.setup();
//       }
//       this.activeScene.draw();
//     }
//    
//     // Draw Transitions
//     if(this.sceneTimer >= this.duration - this.transitionDuration || this.sceneTimer <= this.transitionDuration) {
//       let transitionCompletion = 0;
//       if(this.sceneTimer >= this.duration - this.transitionDuration) {
//         // Opening transition in
//         transitionCompletion = 1 - ((this.sceneTimer - (this.duration - this.transitionDuration)) / this.transitionDuration);
//       } else {
//         // Closing transition out
//         transitionCompletion = this.sceneTimer / this.transitionDuration;
//       }
//      
//       this.transition(transitionCompletion);
//     }
//   }
//  
//   // Plays the next enabled scene
//   playNext() {
//     // Get the scene index of the active scene
//     let activeIndex = this.findSceneIndex(this.activeScene);
//     this.activeScene.startupExectued = false;
//    
//     if(activeIndex == -1) {
//       this.activeScene = null;
//       console.log('Active Scene not found...');
//       return null;
//     }
//    
//     if(activeIndex >= this.scenes.length) {
//       activeIndex = 0;
//     } else {
//       activeIndex++;
//     }
//    
//     for(let i=activeIndex; i < this.scenes.length; i++) {
//       // Find the first scene that is enabled
//       if(this.scenes[i].enabled) {
//         this.activeScene = this.scenes[i];
//         this.activeScene.startupExectued = false;
//         return i;
//       }
//     }
//
//     this.activeScene = null;
//     console.log('Active Scene not selectable...');
//     return null;
//   }
//  
//   // Returns the index of the passed scene
//   findSceneIndex(scene) {
//     for(let i=0; i < this.scenes.length; i++) {
//       if(this.scenes[i].name == scene.name) {
//         return i;
//       }
//     }
//     return -1;
//   }
//  
//   // Draws a 'null' scene
//   drawNull() {
//     this.nullScene.draw();
//   }
//  
//   // Draws the transition
//   transition(completion) {
//     let transitionColor = color(0,0,0);
//     let transitionCompletion = mathUtil.clamp(easeUtil.easeOutQuad(completion), 0, 1);
//
//     transitionColor.setAlpha(transitionCompletion * 255);
//    
//     fill(transitionColor);
//     noStroke();
//    
//     rect(0,0, width, height);
//   }
//  
//   // Resets the P5JS modes to their defaults between scenes
//   resetModes() {
//     colorMode(RGB, 255); // Color Mode
//   }
// }
//
// class LobbyScene {
//   constructor(name, options = new SceneOptions(), enabled = false) {
//     this.name = name;
//     this.options = options;
//     this.enabled = enabled;
//    
//     // Runtime
//     this.startupExectued = false;
//   }
//
//   // Acts like the standard sketch preload function
//   preload() {
//    
//   }
//  
//   // Acts like the standard sketch setup function
//   setup() {
//     this.startupExectued = true;
//   }
//  
//   // Acts like the standard sketch draw function
//   draw() {
//    
//   }
// }
//
// // Options for a scene
// class SceneOptions {
//   constructor(enabled = false, values = [], selected = 0) {
//     this.enabled = enabled;
//     this.values = values;
//     this.selected = selected;
//   }
//
//   // Sets the selected option
//   setSelected(value) {
//     if(typeof value === 'number') {
//       if(value <= this.values.length - 1) {
//         this.selected = this.values[value];
//       } else {
//         this.selected = this.values[0];
//       }
//     } else {
//       if(this.values.findIndex(value) !== -1) {
//         this.selected = this.values[this.values.findIndex(value)];
//       } else {
//         this.selected = this.values[0];
//       }
//     }
//   }
// }
//
// // Draws a null grid
// class NullScene extends LobbyScene {
//   constructor() {
//     super('NullScene', options = new SceneOptions());
//
//     this.spacing = 50;
//     this.letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
//   }
//
//   // Acts like the standard sketch draw function
//   draw() {
//     background(255);
//     let gridSize = createVector(ceil(width/this.spacing), ceil(height/this.spacing));
//     for(let x=0; x < gridSize.x; x++) {
//       for(let y=0; y < gridSize.y; y++) {
//         let corner = createVector(x*this.spacing, y*this.spacing);
//
//         if(isEven(x + y)) {
//           colorMode(RGB, 100);
//           fill((x / gridSize.x) * 100, (y / gridSize.y) * 100, 100 - ((x+y*gridSize.x)/(gridSize.x * gridSize.y) * 100));
//           noStroke();
//
//           rect(corner.x, corner.y, this.spacing, this.spacing);
//
//           let label = this.getCellLabel(x, y);
//
//           fill('white');
//           textAlign(CENTER, CENTER);
//
//           text(label, corner.x, corner.y, this.spacing, this.spacing)
//         }
//       }
//     }
//   }
//
//   // Returns a cell label given an x and y
//   getCellLabel(x, y) {
//     return this.getCellLetter(x) + y.toString();
//   }
//
//   // Returns a cell letter given an x
//   getCellLetter(x) {
//     let index = x % this.letters.length;
//     let count = floor(x/this.letters.length) + 1;
//
//     return this.letters[index].repeat(count);
//   }
// }