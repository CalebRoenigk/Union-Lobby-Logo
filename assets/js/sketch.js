// P5JS Launch Points
function preload() {
  startup();

  // Create the scene manager
  sceneManager = new SceneManager();

  // TODO: ADD SCENES TO THE SCENE MANAGER
  sceneManager.scenes.push(new LogoScene());
  SceneManager.scenes.push(new FunfettiScene());

  // Run the scene manager preload operation
  // TODO: Remove this cheeky ass solution to preventing CORS from erroring out the JS when testing in local
  if(window.location.href === 'https://calebroenigk.github.io/Union-Lobby-Logo/') {
    sceneManager.preload();
  }
}

function setup() {
  // Force the canvas to be the scene size
  pixelDensity(1);
  
  // Create the canvas
  createCanvas(800,800);

  // Get the scene list (from the sketch)
  sceneList = sceneManager.getAllScenes();

  // Playlist
  generatePlaylist(sceneList);

  // Load Settings
  loadSettings();

  // Force the scene manager to load the first scene
  sceneManager.playNext();
}

function draw() {
  sceneManager.draw();
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
  clamp(value, minimum, maximum) {
    return min(max(value,minimum), maximum);
  }
  
  // Normalizes a value within a min and max range, option to clamp the value that defaults to false
  normalize(value, minimum, maximum, clamp = false) {
    let normalized = (value - minimum) / (maximum - minimum);
    
    if(clamp) {
      normalized = this.clamp(normalized, 0, 1);
    }
    
    return normalized;
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

// P5JS Utilities
class P5Util {
  constructor() {}
  
  stringToVector(string) {
    let vector = string.replace(/[{()}]/g, '').split(',');
    vector = createVector(Number(vector[0]), Number(vector[1]));
    
    return vector;
  }
  
  truncatedVectorString(vector) {
    // console.log('vector', vector, ('(' + [vector.x,vector.y].join(',') + ')'));
    return '(' + [vector.x,vector.y].join(',') + ')';
  }
}

// Global Data
let sceneList = [];// [{name: 'Logo', options: {enabled: true, values: ['Union', 'NRG', 'NGC','Diversey']}}, {name: 'Water', options: {enabled: false, values: []}}, {name: 'Air', options: {enabled: false, values: []}}, {name: 'Life', options: {enabled: false, values: []}}]
let editorSettings = {};
let editorState = false;
let mathUtil = new MathUtil();
let easeUtil = new EaseUtil();
let p5Util = new P5Util();
let sceneManager;
let localStorageSettingsKey = 'p5jsLobbySettings';
let clearSettingState = 0;

// TODO: Refactor to remove any remaining warnings in Rider
// TODO: Check that options saving works
// TODO: POTENTIALLY SCALE THE CANVAS UP TO 900px Square, or even 1000px, the machine can probs handle it

// Startup function
function startup() {
  // Set up editor toggle
  document.addEventListener('keydown', (event) => {
    let keycode = event.key;
    if(keycode === '`' || keycode === '~') {
      editorState = !editorState;
      updateEditorState();
    }
  });

  // Update state of editor
  updateEditorState();

  // Timers and Clocks
  updateEditor();
  setInterval(updateEditor, 10000);

  // Event Listeners
  document.querySelectorAll('input').forEach(element => {
    if(element.id !== 'editor-force-clear-settings' && element.id !== 'editor-force-null-grid') {
      element.addEventListener('input', saveSettings);
    }
  });
  document.getElementById('editor-scenetime').addEventListener('change', validateSceneDuration);
  
  document.querySelectorAll('select').forEach(element => {
    element.addEventListener('input', saveSettings);
    element.addEventListener('input', setSelection);
    element.addEventListener('change', saveSettings);
    element.addEventListener('change', setSelection);
  });
  
  // Special case for disabling confirm clear settings when force null is interacted with
  document.getElementById('editor-force-null-grid-label').addEventListener('click', () => {
    clearSettingState = -1;
    clearEditorSettings();
  });
}

function updateEditorState() {
  // Regardless of the editor state toggling the state will reset the clear settings counter
  clearSettingState = -1;
  clearEditorSettings();
  
  if(editorState) {
    // Open Editor
    document.getElementById('editor-panel').classList.remove('editor-collapsed');
    document.getElementById('canvas-position-marker').classList.remove('canvas-position-marker-hidden');
    if(document.querySelector('canvas') !== null) {
      document.querySelector('canvas').classList.add('canvas-indicator-visible');
    }
    document.querySelector('body').classList.remove('hide-cursor');
  } else {
    // Close Editor
    document.getElementById('editor-panel').classList.add('editor-collapsed');
    document.getElementById('canvas-position-marker').classList.add('canvas-position-marker-hidden');
    if(document.querySelector('canvas') !== null) {
      document.querySelector('canvas').classList.remove('canvas-indicator-visible');
    }
    document.querySelector('body').classList.add('hide-cursor');
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
  return hours + ':' + minutes + ' ' + ampm; // The time as a string
}

// Updates the scene manager with setting from the editor on the force null grid
function updateForceNullGrid() {
  let forceNullGrid = document.getElementById('editor-force-null-grid').checked;
  
  if(forceNullGrid) {
    document.querySelector('label[for="editor-force-null-grid"]').classList.add('selectable-setting-selected');
  } else {
    document.querySelector('label[for="editor-force-null-grid"]').classList.remove('selectable-setting-selected');
  }
  
  sceneManager.forceNullGrid(forceNullGrid);
}

// Attempts to clear the editor settings
function clearEditorSettings() {
  clearSettingState++;
  let clearSettingsButton = document.getElementById('editor-force-clear-settings');
  
  if(clearSettingState > 1) {
    // Clear settings has been confirmed, clear and reload the page
    factoryResetSettings(true);
  } else if(clearSettingState <= 0) {
    // The settings should be reset to the default value
    clearSettingsButton.classList.add('button');
    clearSettingsButton.classList.remove('danger-button');
    clearSettingsButton.value = "Force Clear Settings";
  } else {
    // Clear settings must be confirmed, style the button
    clearSettingsButton.classList.remove('button');
    clearSettingsButton.classList.add('danger-button');
    clearSettingsButton.value = "Confirm Force Clear Settings";
  }
}

// Clears the settings, has an option to force reload (true by default)
function factoryResetSettings(forceWindowReload = true) {
  editorSettings = null;
  localStorage.removeItem(localStorageSettingsKey);
  
  if(forceWindowReload) {
    forceReload();
  }
}

// Force Reloads the page
function forceReload() {
  window.location.reload();
}

// Stores the settings in local storage, can be forced to skip pulling values from the editor panel, pulls values by default
function saveSettings(forceUpdateSettings = true) {
  // When saving settings, reset the clear settings counter, because this implies that another button has been changed outside of a confirmation
  console.log('saving settings');
  clearSettingState = -1;
  clearEditorSettings();
  
  // Storage name
  let name = localStorageSettingsKey;

  // Storage Data
  let sceneDuration = editorSettings.sceneDuration;
  let playlistItems = editorSettings.playlistItems;
  let canvasPosition = editorSettings.canvasPosition;
  let maskSettings = editorSettings.maskSettings;
  
  // Update the settings only if force update is true
  if(forceUpdateSettings) {
    sceneDuration = Number(document.getElementById('editor-scenetime').value);
    playlistItems = getPlaylistSettings();
    canvasPosition = [Number(document.getElementById('editor-canvas-x').value), Number(document.getElementById('editor-canvas-y').value)];
    maskSettings = sceneManager.maskEditor.getMaskSettings();
  }

  // Validate data
  if(typeof sceneDuration !== 'number' || sceneDuration <= 0) {
    sceneDuration = 60;
    document.getElementById('editor-scenetime').value = sceneDuration;
  }
  document.getElementById('editor-canvas-x').value = canvasPosition[0];
  document.getElementById('editor-canvas-y').value = canvasPosition[1];


  let settings = {sceneDuration: sceneDuration, playlistItems: playlistItems, canvasPosition: canvasPosition, maskSettings: maskSettings};
  
  // Store the updated settings only if force update is true
  if(forceUpdateSettings) {
    editorSettings = settings;
  }
  
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
  let name = localStorageSettingsKey;

  // Load the settings
  let settings;
  if(localStorage.getItem(name) == null) {
    sceneManager.maskEditor.setMaskSettings(null);
    settings = {
      "sceneDuration":60,
      "playlistItems":getPlaylistSettings(),
      "canvasPosition":[
        200,
        200
      ],
      "maskSettings": sceneManager.maskEditor.getMaskSettings()
    };
  } else {
    settings = JSON.parse(localStorage.getItem(name));

    // Load in the scene duration and canvas position
    document.getElementById('editor-scenetime').value = Math.max(settings.sceneDuration, sceneManager.getMinimumSceneDuration()); // Does a safety check in case scene duration did not get validation before saving, prevents scene duration from bugging out and being set to less than the transition time (this prevents issue of black screening/flickering)
    document.getElementById('editor-canvas-x').value = settings.canvasPosition[0];
    document.getElementById('editor-canvas-y').value = settings.canvasPosition[1];

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
    
    sceneManager.maskEditor.setMaskSettings(settings.maskSettings);
    sceneManager.setDuration(settings.sceneDuration);
  }
  editorSettings = settings;
  
  // Force a settings save based on the currently pulled settings (does not require an update check)
  saveSettings(false);
  
  // Update the document state
  updateCanvasPosition();
}

// Sets the selected option for a scene
function setSelection(event) {
  let sceneSelected = event.currentTarget.getAttribute('data-playlist-type');
  let optionSelected = event.currentTarget.options[event.currentTarget.selectedIndex].text;
  
  var scene = sceneManager.getScene(sceneSelected);
  if(scene !== null) {
    scene.options.setSelected(optionSelected);
  }
}

// Validates data for the scene duration input and then updates the scene manager
function validateSceneDuration() {
  let sceneDurationInput = document.getElementById('editor-scenetime');
  let minimumSceneDuration = sceneManager.getMinimumSceneDuration();
  if(Number(sceneDurationInput.value) < minimumSceneDuration) {
    sceneDurationInput.value = minimumSceneDuration;
  }

  sceneManager.setDuration(Number(sceneDurationInput.value));
}

// Mask Editor Dragging dectections
function mousePressed() {
  if(editorState) {
    sceneManager.maskEditor.checkDrag();
  }
}

function mouseDragged() {
  if(editorState) {
    sceneManager.maskEditor.drag();
  }
}

function mouseReleased() {
  if(editorState) {
    sceneManager.maskEditor.drop();
  }
}


class SceneManager {
  constructor(scenes = [], duration= 60, size = 800) {
    this.scenes = scenes;
    this.duration = duration;
    this.size = createVector(size,size);

    this.activeScene = null;
    this.sceneTimer = duration;
    
    // Debug/Editor
    this.forceNullGridDisplay = false;

    // Null Scene
    this.nullScene = new NullScene();
    
    // Mask Editor
    this.maskEditor = new MaskEditor();
    
    // Private Settings
    this.minimumTransitionTime = 1.5; // 1.5s minimum transition time
    this.preloadComplete = false;
    this.firstDrawComplete = false;
    this.transitionSettings = new TransitionSettings(this.calculateTransitionTime(), this.duration);
  }

  // Acts like the standard sketch preload function
  preload() {
    // Iterate over each scene and run its preload function
    for(let i=0; i < this.scenes.length; i++) {
      console.log('preloading scene: ' + i + ' scene name: ' + this.scenes[i].name);
      this.scenes[i].preload();
    }

    this.preloadComplete = true;
  }

  // Acts like the standard sketch draw function
  draw() {
    // Mark first draw
    if(!this.firstDrawComplete) {
      this.firstDrawComplete = true;
      this.updateEditorPanel();
    }
    
    // Only run scene timer and transitions if not forcing null grid display
    if(!this.forceNullGridDisplay) {
      // Scene timer
      this.sceneTimer -= (deltaTime/1000);

      if(this.sceneTimer <= 0) {
        this.sceneTimer = this.duration;
        this.updateSceneSettings();
        this.playNext();
        this.updateEditorPanel();
        this.resetModes();
      }

      if(this.activeScene == null) {
        this.#drawNull();
      } else {
        if(!this.activeScene.startupExectued) {
          this.activeScene.setup();
        }
        this.activeScene.draw();
      }
      
      // Draw Transition
      let timeInScene = this.duration - this.sceneTimer;
      let transitionRange = this.transitionSettings.timeWithinRange(timeInScene);
      let transitionValue = 1;
      if(transitionRange !== null && transitionRange !== undefined) {
        // The scene is within a transition
        transitionValue = this.transitionSettings.getNormalizedTransitionTime(timeInScene, transitionRange);
      }

      this.transition(transitionValue);
    } else {
      // Force a display the null grid
      this.#drawNull();
    }

    // Draw the mask
    this.maskEditor.draw();
    
    // Update the editor timeline
    document.getElementById('editor-playback-timeline').setAttribute('style', '--playback-scale: ' + this.getPlaybackPercent() + '%;');
  }
  
  // Returns the playback time as a percentage
  getPlaybackPercent() {
    return 100 - (round(((this.sceneTimer / this.duration) * 100)*10)/10);
  }

  // Plays the next enabled scene
  playNext() {
    console.log('play next!'); // TODO: REMOVE THIS PRINT WHEN SCENE MANAGER IS CONSIDERED FINISHED
    // Set the current active scene to startup not executed
    if(this.activeScene !== null && this.activeScene !== undefined) {
      this.activeScene.startupExectued = false;
    }
    
    // Get an array of enabled playlist scenes
    let activeScenes = this.getActiveScenes();

    // CONDITION A: The playlist has no enabled scenes
    // Force Break and play the null scene
    if(activeScenes.length === 0 || this.scenes.length === 0) {
      this.activeScene = null; // Forces the scene to be the null state scene
      return null;
    }
    
    // CONDITION B: The playlist has only 1 enabled scene
    // Play the first enabled scene
    if(activeScenes.length === 1) {
      this.activeScene = activeScenes[0]; // Forces the scene to be the null state scene
    } else {
      // CONDITION C: The playlist has more than 1 enabled scene
      // If the active scene is null, force the first enabled scene as the active scene
      if(this.activeScene === null) {
        this.activeScene = this.activeScene = activeScenes[0];
        return this.activeScene;
      }
      // Get the index of the currently enabled scene in the active scenes list
      let currentlyActiveSceneIndex = activeScenes.findIndex(scene => scene.name === this.activeScene.name);
      // If the currently active scene is not present in this array, play the first enabled scene
      if(currentlyActiveSceneIndex === -1) {
        this.activeScene = this.activeScene = activeScenes[0];
        return this.activeScene;
      }
      
      // If the currently enabled scene index is the length of the enabled scenes array minus 1, then play the first enabled scene
      if(currentlyActiveSceneIndex === activeScenes.length - 1) {
        this.activeScene = this.activeScene = activeScenes[0];
        return this.activeScene;
      }
      
      // Else, set the next enabled scene as the active scene, set the active scene
      this.activeScene = activeScenes[currentlyActiveSceneIndex+1];
    }

    return this.activeScene;
  }

  // Returns the index of the passed scene
  findSceneIndex(scene) {
    if(scene === null) {
      return -1;
    }
    
    for(let i=0; i < this.scenes.length; i++) {
      if(this.scenes[i].name === scene.name) {
        return i;
      }
    }
    return -1;
  }
  
  // Returns an array of all the active scenes
  getActiveScenes() {
    let activeScenes = [];
    this.scenes.forEach(scene => {
      if(scene.enabled) {
        activeScenes.push(scene);
      }
    });
    
    return activeScenes;
  }

  // Draws a 'null' scene
  #drawNull() {
    this.nullScene.draw();
  }

  // Draws the transition
  transition(completion) {
    let transitionColor = color(0,0,0);
    let transitionCompletion = 1 - mathUtil.clamp(easeUtil.easeOutQuad(completion), 0, 1);

    transitionColor.setAlpha(transitionCompletion * 255);

    fill(transitionColor);
    noStroke();

    rect(0,0, width, height);
  }

  // Resets the P5JS modes to their defaults between scenes
  resetModes() {
    colorMode(RGB, 255); // Color Mode
    imageMode(CORNER); // Image Draw Mode
    angleMode(RADIANS); // Angle Interpretation Mode
    drawingContext.fillStyle = null; // Drawing Context Fill
    drawingContext.strokeStyle = null; // Drawing Context Stroke
    ellipseMode(CENTER); // Ellipse Drawing Mode
  }
  
  // Returns a scene based on its name
  getScene(name) {
    let sceneIndex = this.scenes.findIndex(scene => scene.name === name);
    
    if(sceneIndex === -1) {
      return null;
    } else {
      return this.scenes[sceneIndex];
    }
  }
  
  // Returns a scene list of all scenes in the manager
  getAllScenes() {
    // {name: 'Logo', options: {enabled: true, values: ['Union', 'NRG', 'NGC','Diversey']}}, {name: 'Water', options: {enabled: false, values: []}}
    let scenes = [];
    this.scenes.forEach(scene => {
      let sceneObject = {};
      sceneObject.name = scene.name;
      sceneObject.options = {};

      sceneObject.options.enabled = scene.options.enabled;
      sceneObject.options.values = [];
      if(sceneObject.options.enabled) {
        sceneObject.options.values = scene.options.values;
      }
      
      scenes.push(sceneObject);
    });
    
    return scenes;
  }
  
  // Updates the scene duration and playlist options (done at the end of a scene)
  updateSceneSettings() {
    this.duration = document.getElementById('editor-scenetime').value;
    
    // Update which scenes are marked enabled
    // {name: 'Logo', options: {enabled: true, selected: 'Union'}, enabled: true}
    let playlistSettings = getPlaylistSettings();
    
    playlistSettings.forEach(scene => {
      let sceneIndex = this.scenes.findIndex(s => s.name === scene.name);
      if(sceneIndex !== -1) {
        this.scenes[sceneIndex].enabled = scene.enabled;
        if(scene.options.enabled) {
          this.scenes[sceneIndex].options.setSelected(scene.options.selected);
        }
      }
    });
  }
  
  // Sets the duration to a value and recalculates all settings reliant on this value
  setDuration(duration) {
    duration = Math.max(this.getMinimumSceneDuration(), duration); // The duration cannot be less than twice the minimum transition time + 1 second
    this.duration = duration;
    this.sceneTimer = duration;
    this.transitionSettings.recalculateTransitions(this.calculateTransitionTime(), this.duration);
    let transitionPercentage = this.transitionSettings.getTransitionDurationPercentage();
    document.getElementById('editor-playback-timeline-transition-markers').setAttribute('style', '--transitionLength: ' + transitionPercentage + '%');
  }
  
  // Calculates the transition duration from the duration
  calculateTransitionTime() {
    let transitionTime = this.duration / 20; // A tenth of the total duration on either end of each scene
    transitionTime = Math.max(transitionTime, this.minimumTransitionTime); // The transition time can be no less than the minimum transition time
    
    return transitionTime;
  }
  
  // Returns the minimum scene duration time
  getMinimumSceneDuration() {
    return this.minimumTransitionTime * 2 + 1;
  }
  
  // Updates the editor panel
  updateEditorPanel() {
    // Update the scene title
    let sceneName;
    if(this.activeScene === null || this.activeScene === undefined) {
      sceneName = 'Null Grid';
    } else {
      sceneName = this.activeScene.name;
    }
    
    document.getElementById('editor-scene-title').textContent = sceneName;
  }
  
  // Updates the state of the scene manager, toggling the force null grid option
  forceNullGrid(state) {
    this.forceNullGridDisplay = state;
  }
}

class LobbyScene {
  constructor(name, options = new SceneOptions(), enabled = false) {
    this.name = name;
    this.options = options;
    this.enabled = enabled;

    // Runtime
    this.startupExectued = false;
  }

  // Acts like the standard sketch preload function
  preload() {

  }

  // Acts like the standard sketch setup function
  setup() {
    this.startupExectued = true;
  }

  // Acts like the standard sketch draw function
  draw() {

  }
}

// Options for a scene
class SceneOptions {
  constructor(enabled = false, values = [], selected = 0) {
    this.enabled = enabled;
    this.values = values;
    this.selected = selected;
  }

  // Sets the selected option
  setSelected(value) {
    if(typeof value === 'number') {
      if(value <= this.values.length - 1) {
        this.selected = this.values[value];
      } else {
        this.selected = this.values[0];
      }
    } else {
      if(this.values.find(val => val === value)) {
        this.selected = this.values.findIndex(val => val === value);
      } else {
        this.selected = this.values[0];
      }
    }
  }
  
  // Returns the selected scene's index
  getSelectedIndex() {
    if(typeof this.selected === 'number') {
      return this.selected;
    }

    return this.values.findIndex(this.selected);
  }
}

// Settings for the transition
class TransitionSettings {
  constructor(transitionDuration, duration) {
    this.duration = duration; // Duration of the scene
    this.transitionDuration = transitionDuration;

    this.inStart = 0; // When the transition into a scene starts
    this.inEnd = 0; // When the transition into a scene ends
    this.outStart = 0; // When the transition out of a scene starts
    this.outEnd = 0; // When the transition out of a scene ends
    
    this.calculateInOut();
  }
  
  // Calculates the start and ends for the in and out transitions
  calculateInOut() {
    // Transition In
    this.inStart = 0;
    this.inEnd = this.transitionDuration;

    // Transition Out
    this.outStart = this.duration - this.transitionDuration;
    this.outEnd = this.duration;
  }
  
  // Returns true if the passed time is within the in transition (inclusive of start and end times)
  #withinInRange(time) {
    return time <= this.inEnd; // Any time less than inEnd is within the in transition (this accounts for possible negative numbers passed in)
  }

  // Returns true if the passed time is within the out transition (inclusive of start and end times)
  #withinOutRange(time) {
    return time >= this.outStart; // Any time greater than outStart is within the out transition (this accounts for possible numbers larger than the transition out end)
  }
  
  // Returns the range the time is within, null if it is not within a transition range
  timeWithinRange(time) {
    if(this.#withinInRange(time)) {
      return 'IN';
    } else {
      if(this.#withinOutRange(time)) {
        return 'OUT';
      } else {
        return null;
      }
    }
  }
  
  // Returns a value from 0 to 1 that represents how far along a transition is given the current time and scene range selection
  getNormalizedTransitionTime(time, range) {
    // In Transition
    if(range === 'IN') {
      return mathUtil.normalize(time, this.inStart, this.inEnd, true);
    }
    
    // Out Transition
    if(range === 'OUT') {
      return 1-mathUtil.normalize(time, this.outStart, this.outEnd, true);
    }

    // No Transition
    return -1;
  }
  
  // Updates the transitions with new values
  recalculateTransitions(transitionDuration, duration) {
    this.duration = duration; // Duration of the scene
    this.transitionDuration = transitionDuration;

    this.calculateInOut();
  }
  
  // Returns the transition duration as a percentage of the overall scene duration, rounded to the nearest tenth
  getTransitionDurationPercentage() {
    return (round((this.transitionDuration/this.duration)*10)/10)*100;
  }
}

// The mask render that renders the U Cutout of black
class MaskEditor {
  constructor(masks = []) {
    this.masks = masks;
    
    if(masks.length === 0 || !Array.isArray(this.masks)) {
      this.defaultMasks();
    }
  }

  // Draws the masks
  draw() {
    this.masks.forEach(mask => {
      mask.draw();
    })
    
    // Draw the handles if the editor is open
    if(editorState) {
      this.drawHandles();
    }
  }
  
  // Draws the mask points for editing
  drawHandles() {
    this.masks.forEach(mask => {
      mask.drawHandles();
    })
  }

  // Checks if any mask point can be dragged
  checkDrag() {
    this.masks.forEach(mask => {
      mask.checkDrag();
    })
  }

  // Attempts to drag any of the mask points
  drag() {
    this.masks.forEach(mask => {
      mask.drag();
    })
  }
  
  // Drops all mask points
  drop() {
    let modifiedMaskEditor = false;
    this.masks.forEach(mask => {
      let modifiedMask = mask.drop();
      if(modifiedMask) {
        modifiedMaskEditor = true;
      }
    })
    
    // Save the settings if the mask has been modified
    if(modifiedMaskEditor) {
      saveSettings();
    }
  }
  
  // Returns the mask settings for all masks
  getMaskSettings() {
    // {masks: [{points: [{type: 'V', position: (x,y)}, {type: 'C', start: (x,y), startControl: (x,y), endControl: (x,y), end: (x,y)}], position: (x,y), size: (x,y)}]}
    let masks = [];
    
    this.masks.forEach(mask => {
      let points = [];
      mask.points.forEach(point => {
        let p = {};
        if(point.constructor.name === 'MaskVertex') {
          p.type = 'V';
          p.position = p5Util.truncatedVectorString(point.position);
        } else {
          p.type = 'C';
          p.start = p5Util.truncatedVectorString(point.start);
          p.startControl = p5Util.truncatedVectorString(point.startControl);
          p.endControl = p5Util.truncatedVectorString(point.endControl);
          p.end = p5Util.truncatedVectorString(point.end);
        }

        points.push(p);
      });

      masks.push({points: points, position: p5Util.truncatedVectorString(mask.position), size: p5Util.truncatedVectorString(mask.size)});
    });
    
    return {masks: masks};
  }
  
  // Deserializes mask settings and applies them to the masks
  setMaskSettings(maskSettings) {
    if(maskSettings === null || maskSettings === undefined) {
      this.defaultMasks();
    } else {
      let masks = [];
      maskSettings.masks.forEach(mask => {
        let points = [];
        mask.points.forEach(point => {
          let p;
          if(point.type === 'V') {
            // Vertex
            p = new MaskVertex(p5Util.stringToVector(point.position));
          } else {
            // Curve
            p = new MaskCurve(p5Util.stringToVector(point.start), p5Util.stringToVector(point.startControl), p5Util.stringToVector(point.endControl), p5Util.stringToVector(point.end));
          }

          points.push(p);
        });

        let position = p5Util.stringToVector(mask.position);
        let size = p5Util.stringToVector(mask.size);
        
        masks.push(new Mask(points, position, size));
      });

      this.masks = masks;
    }
  }
  
  // Sets the default mask settings
  defaultMasks() {
    this.masks = [new Mask([new MaskVertex(createVector(100,50)), new MaskCurve(createVector(100,150), createVector(100,200), createVector(125,200), createVector(200,200)), new MaskVertex(createVector(200,50))], createVector(0,0), createVector(width/2, height)), new Mask([new MaskVertex(createVector(300,50)), new MaskVertex(createVector(300,150)), new MaskVertex(createVector(400,150)), new MaskVertex(createVector(400,50))], createVector(width/2,0), createVector(width/2, height))];
  }
}

// A mask used to cut out of a black background
class Mask {
  constructor(points, position, size) {
    this.points = points;
    this.position = position;
    this.size = size;
  }
  
  draw() {
    // Fill the mask with the mask color
    noStroke();
    fill(color('black'));

    // Create the base mask shape
    beginShape();
    vertex(this.position.x, this.position.y);
    vertex(this.position.x + this.size.x, this.position.y);
    vertex(this.position.x + this.size.x, this.position.y + this.size.y);
    vertex(this.position.x, this.position.y + this.size.y);

    // Iterate over the cutout points
    beginContour();
    for (let p = 0; p < this.points.length; p++) {
      let maskPoint = this.points[p];
      if (maskPoint.constructor.name === 'MaskVertex') {
        vertex(maskPoint.position.x, maskPoint.position.y);
      } else {
        vertex(maskPoint.start.x, maskPoint.start.y);
        bezierVertex(maskPoint.startControl.x, maskPoint.startControl.y, maskPoint.endControl.x, maskPoint.endControl.y, maskPoint.end.x, maskPoint.end.y);
      }
    }
    endContour();
    
    endShape();
  }

  drawHandles() {
    for(let i=0; i < this.points.length; i++) {
      this.points[i].draw();
    }
  }
  
  // Checks if any points can be dragged
  checkDrag() {
    for(let i=0; i < this.points.length; i++) {
      if(this.points[i].mouseInRange()) {
        this.points[i].setDrag(true);
        return;
      }
    }
  }
  
  // Attempts to drag any of the mask points
  drag() {
    for(let i=0; i < this.points.length; i++) {
      this.points[i].drag();
    }
  }
  
  // Drops any dragging points
  drop() {
    let modifiedMask = false;
    for(let i=0; i < this.points.length; i++) {
      let modifiedPoint = this.points[i].setDrag(false);
      
      if(modifiedPoint) {
        modifiedMask = true;
      }
    }
    
    return modifiedMask;
  }
}

// A point in a cutout mask
class MaskPoint {
  constructor(position) {
    this.position = position;
    
    this.size = 12;
    this.strokeColor = 'magenta';
    this.isDragging = false;
  }
  
  draw() {
    noFill();
    stroke(this.strokeColor);
    strokeWeight(this.size);
    
    point(this.position.x, this.position.y);
  }
  
  drag() {
    if(this.isDragging) {
      // The mouse is within the dragging area
      this.position = createVector(mouseX, mouseY);
      
      // Clamp the position of the mask point to within the canvas
      this.clampPosition();
    } else {
      return null;
    }
  }
  
  mouseInRange() {
    let mousePosition = createVector(mouseX, mouseY);
    return p5.Vector.dist(mousePosition, this.position) <= this.size;
  }
  
  // Sets the dragging state
  setDrag(state) {
    // Store a true return value if the point was being dragged (modified)
    let wasModified = this.isDragging;
    this.isDragging = state;

    // Clamp the position of the mask point to within the canvas
    this.clampPosition();
    
    return wasModified;
  }
  
  // Clamps the position of point to within the canvas
  clampPosition() {
    // Primary Position
    let posX = mathUtil.clamp(this.position.x, 0, width);
    let posY = mathUtil.clamp(this.position.y, 0, height);
    
    this.position = createVector(posX, posY);
  }
}

// Flat Vertex mask point
class MaskVertex extends MaskPoint {
  constructor(position) {
    super(position);
  }
  
  draw() {
    super.draw();
  }
}

// Bezier curve mask section
class MaskCurve extends MaskPoint {
  constructor(start, startControl, endControl, end) {
    super(start);
    this.start = start;
    this.startControl = startControl;
    this.endControl = endControl;
    this.end = end;
    
    this.draggingIndex = -1;
  }
  
  draw() {
    // Draw the handle lines
    noFill();
    stroke('yellow');
    strokeWeight(2);
    
    line(this.start.x, this.start.y, this.startControl.x, this.startControl.y);
    line(this.end.x, this.end.y, this.endControl.x, this.endControl.y);

    // Draw the four points
    noFill();
    stroke(this.strokeColor);
    strokeWeight(this.size);
    
    point(this.start.x, this.start.y);
    point(this.startControl.x, this.startControl.y);
    point(this.endControl.x, this.endControl.y);
    point(this.end.x, this.end.y);
  }

  drag() {
    if(this.draggingIndex !== -1) {
      let mousePosition = createVector(mouseX, mouseY);
      // The mouse is within the dragging area for one of the point handles
      switch(this.draggingIndex) {
        case 0:
          // Start
          this.start = mousePosition;
          break;
        case 1:
          // Start Control
          this.startControl = mousePosition;
          break;
        case 2:
          // End Control
          this.endControl = mousePosition;
          break;
        case 3:
          // End
          this.end = mousePosition;
          break;
        default:
          break;
      }
      this.position = createVector(mouseX, mouseY);

      // Clamp the position of the mask point to within the canvas
      this.clampPosition();
    } else {
      return null;
    }
  }

  // Tests if any of the points are in the mouse range
  mouseInRange() {
    let mousePosition = createVector(mouseX, mouseY);
    let pointArray = [this.start, this.startControl, this.endControl, this.end];
    
    for(let i=0; i < pointArray.length; i++) {
      let pointPosition = pointArray[i];
      
      if(p5.Vector.dist(mousePosition, pointPosition) <= this.size) {
        this.draggingIndex = i;
        return true;
      }
    }
    
    return false;
  }

  // Sets the dragging state
  setDrag(state) {
    super.setDrag(state);
    this.draggingIndex = state?this.draggingIndex:-1;

    // Clamp the position of the mask point to within the canvas
    this.clampPosition();
  }

  // Clamps the position of point to within the canvas
  clampPosition() {
    // Primary Position
    let posX = mathUtil.clamp(this.position.x, 0, width);
    let posY = mathUtil.clamp(this.position.y, 0, height);

    this.position = createVector(posX, posY);
    
    // All sub points
    // Start
    let startX = mathUtil.clamp(this.start.x, 0, width);
    let startY = mathUtil.clamp(this.start.y, 0, height);

    this.start = createVector(startX, startY);
    
    // Start Control
    let startControlX = mathUtil.clamp(this.startControl.x, 0, width);
    let startControlY = mathUtil.clamp(this.startControl.y, 0, height);

    this.startControl = createVector(startControlX, startControlY);

    // End Control
    let endControlX = mathUtil.clamp(this.endControl.x, 0, width);
    let endControlY = mathUtil.clamp(this.endControl.y, 0, height);

    this.endControl = createVector(endControlX, endControlY);
    
    // End
    let endX = mathUtil.clamp(this.end.x, 0, width);
    let endY = mathUtil.clamp(this.end.y, 0, height);

    this.end = createVector(endX, endY);
  }
}

// Draws a null grid
class NullScene extends LobbyScene {
  constructor() {
    super('NullScene', new SceneOptions());

    this.spacing = 50;
    this.letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  }

  // Acts like the standard sketch draw function
  draw() {
    background(255);
    let gridSize = createVector(ceil(width/this.spacing), ceil(height/this.spacing));
    for(let x=0; x < gridSize.x; x++) {
      for(let y=0; y < gridSize.y; y++) {
        let corner = createVector(x*this.spacing, y*this.spacing);

        if(mathUtil.isEven(x + y)) {
          colorMode(RGB, 100);
          fill((x / gridSize.x) * 100, (y / gridSize.y) * 100, 100 - ((x+y*gridSize.x)/(gridSize.x * gridSize.y) * 100));
          noStroke();

          rect(corner.x, corner.y, this.spacing, this.spacing);

          let label = this.getCellLabel(x, y);

          fill('white');
          textAlign(CENTER, CENTER);

          text(label, corner.x, corner.y, this.spacing, this.spacing)
        }
      }
    }
  }

  // Returns a cell label given an x and y
  getCellLabel(x, y) {
    return this.getCellLetter(x) + y.toString();
  }

  // Returns a cell letter given an x
  getCellLetter(x) {
    let index = x % this.letters.length;
    let count = floor(x/this.letters.length) + 1;

    return this.letters[index].repeat(count);
  }
}

// SCENES

// Logo Scene
class LogoScene extends LobbyScene {
  constructor() {
    super('Logo', new SceneOptions(true, ['Union', 'NGC', 'NRG', 'Diversey', 'Fox'], 0));
    this.logos = [];
    this.amount = 5;
    this.animationLength = 3.5;
    this.animationGap = 0.5;
  }
  
  preload() {
    let logos = [];
    this.options.values.forEach(logo => {
      let img = loadImage('assets/img/logo/' + logo + '.png');
      logos.push(img);
    });
    this.logos = logos;
  }
  
  draw() {
    background('black');
    let spacing = width/this.amount;
    // master timer loop to duration
    let masterTimer = ((millis() / 1000) % this.animationLength)/this.animationLength;
    let gapDuration = this.animationGap / this.animationLength;

    let xOffset = 0;
    let yOffset = 0;

    let transitionDuration = 0.5 - (gapDuration/2);
    let alterRows = false;

    // When the timer is less than 0.5 - gapDuration/2 > offset the X 
    if(masterTimer <= (0.5 - (gapDuration/2))) {
      // Offset X
      xOffset = easeUtil.easeInOutCubic(masterTimer / transitionDuration) * -spacing;
      alterRows = true;
    } else if(masterTimer <= (0.5 + (gapDuration/2))) {
      // No Movement
      // Do Nothing
    } else {
      // Offset Y
      yOffset = easeUtil.easeInOutCubic((masterTimer - (transitionDuration + gapDuration)) / transitionDuration) * -spacing;
    }

    for(let x = 0; x < this.amount+2; x++) {
      for(let y = 0; y < this.amount+2; y++) {
        let pos = createVector(x * spacing, y * spacing);
        if(alterRows && mathUtil.isEven(y) || !alterRows && mathUtil.isEven(x)) {
          pos = createVector(x * spacing + xOffset, y * spacing + yOffset);
        }

        point(pos.x, pos.y);
        imageMode(CENTER);
        image(this.logos[this.options.getSelectedIndex()], pos.x, pos.y, spacing/2, spacing/2);
      }
    }
  }
}

// Funfetti Scene
class FunfettiScene extends LobbyScene {
  constructor() {
    super('Funfetti', new SceneOptions(false, [], 0));
    this.particleCount = 128;
    this.funfettiSystem = new FunfettiSystem(this.particleCount);
  }
  
  setup() {
    background(255);
    this.funfettiSystem = new FunfettiSystem(this.particleCount);
  }

  draw() {
    this.funfettiSystem.draw();
  }
}

class FunfettiSystem {
  constructor(count) {
    this.count = count;

    this.funfetti = [];

    // Settings
    this.funfettiSizeRange = createVector(2, 48);
    this.funfettiSpeedRange = createVector(64, 768);

    this.boundaryMargin = 128;
  }

  // Spawns a Funfetti
  spawnFunfetti() {
    let position = this.getRandomCanvasPoint();
    let color = this.getFunfettiColor();
    let size = this.getFunfettiSize();
    let direction = this.getFunfettiDirection();
    let speed = this.getFunfettiSpeed();

    let funfettiType = round(random(0,2));
    let funfetti;
    switch(funfettiType) {
      case 0:
      default:
        funfetti = new SquareFunfetti(position, color, size, direction, speed);
        break;
      case 1:
        funfetti = new TriangleFunfetti(position, color, size, direction, speed);
        break;
      case 2:
        funfetti = new CircleFunfetti(position, color, size, direction, speed);
        break;
    }

    this.funfetti.push(funfetti);
  }

  // Returns a random point within the canvas
  getRandomCanvasPoint() {
    return createVector(random(0, width), random(0, height));
  }

  // Returns a random color
  getFunfettiColor() {
    colorMode(RGB);
    let colors = [color(70,38,173), color(249,94,114), color(255,167,199), color(0,76,240), color(52,202,159), color(255,208,0), color(255,255,255), color(0,0,0), color(240,30,100), color(125,190,255)];

    return colors[round(random(0, colors.length-1))];
  }

  // Returns a random size
  getFunfettiSize() {
    return random(this.funfettiSizeRange.x, this.funfettiSizeRange.y);
  }

  // Returns a random directional vector
  getFunfettiDirection() {
    return createVector(random(-1, 1), random(-1, 1));
  }

  // Returns a random speed
  getFunfettiSpeed() {
    return random(this.funfettiSpeedRange.x, this.funfettiSpeedRange.y);
  }

  // Returns true if the position is within the bounds
  withinBounds(position) {
    return position.x > -this.boundaryMargin && position.x < width + this.boundaryMargin && position.y > -this.boundaryMargin && position.y < height + this.boundaryMargin;
  }

  simulate() {
    for(let i=0; i < this.particles.length; i++) {
      this.funfetti[i].draw();
    }

    for(let i=this.funfetti.length-1; i > -1; i--) {
      if(!this.withinBounds(this.funfetti[i].position)) {
        this.funfetti.splice(i, 1);
      }
    }

    if(this.funfetti.length < this.count) {
      let funfettiSpawnCount = random(0, this.count - this.funfetti.length);
      for(let j=0; j < funfettiSpawnCount; j++) {
        this.spawnFunfetti();
      }
    }
  }

  draw() {
    this.simulate();
  }
}

class Funfetti {
  constructor(position, color, size, direction, speed) {
    this.position = position;
    this.fill = color;
    this.strokeDarken = random(0,40);
    this.stroke = this.getStroke();
    this.drawMode = max(min(round(randomGaussian(1,1)), 2),0);
    this.size = size;
    this.direction = direction.normalize();
    this.speed = speed;

    this.randomWander = 0.5;
    this.maxWanderDeviation = 32;
    this.strokeWeight = 2;
  }

  // Returns the stroke color
  getStroke() {
    colorMode(HSB);
    return color(hue(this.fill), saturation(this.fill), brightness(this.fill) - this.strokeDarken);
  }

  simulate() {
    let velocity = createVector(this.direction.x, this.direction.y).setMag((this.speed*(deltaTime/1000)));
    this.position.add(velocity);

    // Random chance to turn
    if(random(0,1) > 1 - this.randomWander) {
      let randomAngle = (noise(this.position.x, this.position.y, (millis()/1000) * this.speed) * this.maxWanderDeviation * 2) - this.maxWanderDeviation;
      angleMode(DEGREES);
      this.direction.rotate(randomAngle);
    }
  }

  // Restricts drawing methods of the funfetti
  setDrawMode() {
    switch(this.drawMode) {
      case 1:
      default:
        break;
      case 0:
        noFill();
        break;
      case 2:
        noStroke();
        break;
    }
  }

  draw() {
    this.simulate();
  }
}

class CircleFunfetti extends Funfetti {
  constructor(position, color, size, direction, speed) {
    super(position, color, size, direction, speed);
  }

  draw() {
    super.draw();

    ellipseMode(CENTER);
    stroke(this.stroke);
    strokeWeight(this.strokeWeight);
    fill(this.fill);
    this.setDrawMode();

    circle(this.position.x, this.position.y, this.size);
  }
}

class TriangleFunfetti extends Funfetti {
  constructor(position, color, size, direction, speed) {
    super(position, color, size, direction, speed);
  }

  // Returns the points of the triangle
  getPoints() {
    let points = [];

    for(let i=0; i < 3; i++) {
      let pointVector = createVector(this.size/2, 0).setHeading((120 * i)+ this.direction.heading()).add(this.position);
      points.push(pointVector);
    }

    return points;
  }

  draw() {
    super.draw();

    let points = this.getPoints();
    ellipseMode(CENTER);
    stroke(this.stroke);
    strokeWeight(this.strokeWeight);
    fill(this.fill);
    this.setDrawMode();

    triangle(points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y);
  }
}

class SquareFunfetti extends Funfetti {
  constructor(position, color, size, direction, speed) {
    super(position, color, size, direction, speed);
  }

  draw() {
    super.draw();

    push();
    translate(this.position.x, this.position.y);
    rotate(this.direction.heading());
    translate(-this.position.x, -this.position.y);
    rectMode(CENTER);
    stroke(this.stroke);
    strokeWeight(this.strokeWeight);
    fill(this.fill);
    this.setDrawMode();

    square(this.position.x, this.position.y, this.size);
    pop();
  }
}