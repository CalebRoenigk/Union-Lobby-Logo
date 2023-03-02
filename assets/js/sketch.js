// P5JS Launch Points
function preload() {
  startup();

  // Create the scene manager
  sceneManager = new SceneManager();

  // TODO: ADD SCENES TO THE SCENE MANAGER
  sceneManager.scenes.push(new LogoScene());
  sceneManager.scenes.push(new FunfettiScene());
  sceneManager.scenes.push(new WebdingScene());
  sceneManager.scenes.push(new PictogramMorpherScene());
  sceneManager.scenes.push(new PepsiBubblerScene());
  sceneManager.scenes.push(new WordClockScene());
  sceneManager.scenes.push(new PepsiFullBleedScene());
  sceneManager.scenes.push(new PolkaWaveScene());
  sceneManager.scenes.push(new PondScene());
  sceneManager.scenes.push(new BoxOfSpringsScene());
  sceneManager.scenes.push(new QuadTreeScene());
  
  // Run the scene manager preload operation
  // TODO: Add option to play video
  // TODO: Test Webding scene

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
  
  // Returns a sine calculation from given values
  sine(value, frequency, amplitude, phase, verticalOffset) {
    return  amplitude * sin((value + phase) * frequency) + verticalOffset;
  }

  // Returns a cosine calculation from given values
  cosine(value, frequency, amplitude, phase, verticalOffset) {
    return  amplitude * cos((value + phase) * frequency) + verticalOffset;
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

  // Returns a sampled sine wave value with additional parameters compared to mathUtil sine
  sineWave(amplitude, frequency, phase, verticalOffset, speed, time) {
    let waveTime = time * speed;
    return amplitude * Math.sin((waveTime + phase) * frequency) + verticalOffset;
  }
}

// Custom Data Constructs
// Range
class Range {
  constructor(min,max) {
    this.min = min;
    this.max = max;
  }
  
  // Tests if a value is within the range
  inRange(value) {
    return value >= this.min && value <= this.max;
  }
  
  // Clamps the value within the range
  clampValue(value) {
    return mathUtil(value, this.min, this.max);
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
// TODO: Add ability to force DEBUG on when editor is open (right now the debug is always on when editor is open
// TODO: Fix site so that it can never be taller than the window, right now when the playlist is long enough the window gets longer

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

  // Set the debug state
  sceneManager.showDebug = editorState;
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
  
  // Save the settings
  saveSettings();
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
  console.log('loading settings');
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
    sceneManager.updateSceneSettings();
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
    this.showDebug = {
      // data property
      #state: true,

      // accessor property(getter)
      get getDebug() {
        return this.#state;
      },

      //accessor property(setter)
      set changeDebug(state) {
        this.#state = state;
        this.updateDebug(state);
      }
    };

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
    if(this.showDebug) {
      console.log('play next!');
      console.log(this.scenes, this.scenes.filter(scene => scene.enabled));
    }
    
    // Set the current active scene to startup not executed
    if(this.activeScene !== null && this.activeScene !== undefined) {
      this.activeScene.startupExectued = false;
    }

    // Force an update of the debug of all scenes, this is just in case and should under normal conditions not actually change anything
    this.updateDebug();
    
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
    return this.scenes.filter(scene => scene.enabled);
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
    colorMode(RGB, 255, 255, 255, 1); // Color Mode
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
  
  // Updates all scenes debug states
  updateDebug() {
    // Iterate over all scenes and set their debug state
    this.scenes.forEach(scene => scene.updateDebug(this.showDebug))
  }
}

class LobbyScene {
  constructor(name, options = new SceneOptions(), enabled = false) {
    this.name = name;
    this.options = options;
    this.enabled = enabled;

    // Runtime
    this.startupExectued = false;
    this.debug = false;
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

  // Updates the debug state of the scene
  updateDebug(state) {
    this.debug = state;
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
    super('Logo', new SceneOptions(true, ['Union', 'NGC', 'NRG', 'Diversey', 'Fox', 'BITC'], 0));
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
    this.funfettiSystem = new FunfettiSystem(this.particleCount);
    background(255);
    super.setup();
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
    for(let i=0; i < this.funfetti.length; i++) {
      this.funfetti[i].draw();
    }

    for(let i=this.funfetti.length-1; i > -1; i--) {
      if(!this.withinBounds(this.funfetti[i].position)) {
        this.funfetti.splice(i, 1);
      }
    }

    if(this.funfetti.length < this.count) {
      let funfettiSpawnCount = random(0, this.count - this.funfetti.length);
      for(let i=0; i < funfettiSpawnCount; i++) {
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

// Webding Scene
// TODO: Currently completely broken
class WebdingScene extends LobbyScene {
  constructor() {
    super('Webdings');
    this.gridSize = 36; // How many cells in the grid
    this.webdings = [];

    this.generateGrid();
  }

  setup() {
    this.webdings = [];
    this.generateGrid();
    background(255);
    super.setup();
  }

  draw() {
    background(220);
    // Draw all webdings in the grid
    for(let x=0; x < this.webdings.length; x++) {
      for(let y=0; y < this.webdings[x].length; y++) {
        this.webdings[x][y].draw();
      }
    }
  }

  generateGrid() {
    let webdingSize = width / this.gridSize;
    let webdingCount = createVector(this.gridSize, height / webdingSize);

    // Iterate over the grid
    let randomWebdingIndex = 0;
    let randomWebdingCount = 0;
    for (let x = 0; x < webdingCount.x; x++) {
      let webdingRow = [];
      for (let y = 0; y < webdingCount.y; y++) {
        if (randomWebdingCount <= 0) {
          randomWebdingIndex = Math.round(random(0, 6));
          randomWebdingCount = Math.round(random(3, 12)); // The number of webdings to do before choosing a new webding
        }

        let webding;
        let webdingPosition = createVector(x * webdingSize + (webdingSize / 2), y * webdingSize + (webdingSize / 2));

        switch (randomWebdingIndex) {
          case 0:
          case 1:
            // 0,1: Moon Webding
            webding = new MoonWebding(webdingPosition, webdingSize, random(0.1, 3), Math.round(random(1, 3)) / 4, random(8, 20), random(-1, 1));
            break;
          case 2:
            // 2: Wave Webding
            webding = new WaveWebding(webdingPosition, webdingSize, random(0.1, 3), random(2, 9), random(-1, 1));
            break;
          case 3:
            // 3: Diagonal Webding
            webding = new DiagonalWebding(webdingPosition, webdingSize, random(0.1, 3), random(2, 9), random(-1, 1));
            break;
          case 4:
            // 4: Grid Webding
            webding = new GridWebding(webdingPosition, webdingSize, random(0.1, 3), random(2, 9), random(-1, 1));
            break;
          case 5:
          case 6:
            // 5,6: Checkers Webding
            webding = new CheckersWebding(webdingPosition, webdingSize, random(0.1, 3), random(2, 6), Math.round(random(2, 6)));
            break;
          default:
            // Default: No Webding (Blank Webding)
            webding = new Webding(webdingPosition, webdingSize, random(0.1, 3));
            break;
        }

        webdingRow.push(webding);

        randomWebdingCount--;
      }

      this.webdings.push(webdingRow);
      randomWebdingCount--;
    }
  }
}

class Webding {
  constructor(position, size, speed) {
    this.position = position;
    this.size = size;
    this.speed = speed;
    this.strokeWeight = Math.max(this.size/16, 2);
  }

  draw() {
    noFill();
    stroke('black');
    strokeWeight(this.strokeWeight);

    rectMode(CENTER);

    square(this.position.x, this.position.y, this.size);
  }
}

class MoonWebding extends Webding {
  constructor(position, size, speed, fill, duration, direction=0) {
    super(position, size, speed);
    this.angle = 0;
    this.direction = direction >= 0 ? 1 : -1;
    this.startTime = millis();
    this.fill = fill;
    this.cycleDuration = duration / this.speed; // In Seconds
  }

  drawMoon() {
    // Draw Background Fill
    noStroke();
    fill('white');

    circle(this.position.x, this.position.y, this.size-(this.strokeWeight*2));

    let cycleLength = (this.cycleDuration*1000);
    let segmentDuration = cycleLength / 4;
    let animationTime = (millis() - this.startTime)%cycleLength;
    let cycleTime = animationTime % segmentDuration;
    let subsegmentDuration = segmentDuration * 0.75; // 3 on 1 off per segment, 4 segments total
    let cyclePosition = cycleTime / subsegmentDuration;
    cyclePosition = cyclePosition >= 1 ? 1 : cyclePosition;
    let angleBase = (this.direction*HALF_PI) * Math.floor(animationTime/segmentDuration);
    this.angle = angleBase + (this.easeCubicInOut(cyclePosition) * (this.direction*HALF_PI));

    // Draw Fill
    push();
    translate(this.position.x, this.position.y);
    rotate(this.angle);
    translate(-this.position.x, -this.position.y);
    noStroke();
    fill('black');

    arc(this.position.x, this.position.y, this.size-(this.strokeWeight*2), this.size-(this.strokeWeight*2), 0, this.fill*TWO_PI, PIE);
    pop();

    // Draw Outline
    noFill();
    stroke('black');
    strokeWeight(this.strokeWeight);

    circle(this.position.x, this.position.y, this.size-(this.strokeWeight*2));
  }

  draw() {
    this.drawMoon();

    super.draw();
  }

  easeCubicInOut(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }
}

class WaveWebding extends Webding {
  constructor(position, size, speed, frequency, direction=0) {
    super(position, size, speed);
    this.waveCount = 0;
    this.resolution = 6;
    this.amplitude = (this.size/(this.waveCount+2))/2;
    this.offset = random(1000);
    this.direction = direction >= 0 ? 1 : -1;
    this.frequency = frequency;
  }

  drawWaves() {
    // Iterate over the Y
    let yInterval = this.size/(this.waveCount+2);
    let waveStart = createVector(this.position.x-this.size/2, this.position.y-this.size/2);
    for(let y=0; y < this.waveCount + 3; y++) {
      // Draw a wave across the webding
      let xInterval = this.size/(this.resolution+1);
      noFill();
      stroke('black');
      strokeWeight(this.strokeWeight);

      beginShape();
      for(let x=0; x < this.resolution + 2; x++) {
        let wavePoint = createVector(x * xInterval, yInterval*y).add(waveStart);
        let sineOffset = this.amplitude*Math.sin(((wavePoint.x/this.size) * this.frequency + (millis()/1000)*this.speed)+this.offset);
        wavePoint.y += sineOffset;

        // Clamp the y to the webding
        wavePoint.y = Math.max(Math.min(this.size/2 + this.position.y, wavePoint.y), this.position.y - this.size/2)

        vertex(wavePoint.x, wavePoint.y);
      }
      endShape();
    }
  }

  draw() {
    this.drawWaves();

    super.draw();
  }
}

class DiagonalWebding extends Webding {
  constructor(position, size, speed, duration, direction=0) {
    super(position, size, speed);
    this.resolution = 2;
    this.duration = duration;
    this.direction = direction >= 0 ? 1 : -1;
  }

  drawDiagonals() {
    // Create the points for each
    let lineSpacing = this.size/this.resolution;
    let lineStart = createVector(-this.size*1.5 + (this.position.x-this.size/2), this.position.y-this.size/2);
    if(this.direction === -1) {
      lineStart = createVector(-this.size*1 + (this.position.x-this.size/2), this.position.y-this.size/2);
    }

    let xRange = createVector(this.position.x-this.size/2, this.position.x+this.size/2);
    for(let x=0; x < this.resolution*3; x++) {
      let xOffset = (((millis()*this.speed) % (this.duration*1000)))/(this.duration*1000)*this.size*this.direction;

      // Create the two line points
      let startPoint = createVector(x*lineSpacing+xOffset, 0).add(lineStart);
      let endPoint = createVector(this.size, this.size).add(startPoint);

      // Draw the line only if it is within the bounds of the webding
      if(!(endPoint.x <= xRange.x || startPoint.x >= xRange.y)) {
        // Clamp the start and end points to within the webding bounds if they are outside of it
        if(startPoint.x < xRange.x) {
          // Use the distance from the endpoint to the left edge of the webding
          let xDistance = endPoint.x - xRange.x;
          startPoint.x = endPoint.x - xDistance;
          startPoint.y = endPoint.y - xDistance;
        }
        if(endPoint.x > xRange.y) {
          // Use the distance from the startpoint to the right edge of the webding
          let xDistance = xRange.y - startPoint.x;
          endPoint.x = startPoint.x + xDistance;
          endPoint.y = startPoint.y + xDistance;
        }

        noFill();
        stroke('black');
        strokeWeight(this.strokeWeight);

        line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
      }
    }
  }

  draw() {
    this.drawDiagonals();

    super.draw();
  }
}

class GridWebding extends Webding {
  constructor(position, size, speed, duration, direction=0) {
    super(position, size, speed);
    this.resolution = createVector(2, 5);
    this.duration = duration;
    this.direction = direction >= 0 ? 1 : -1;
  }

  drawGrid() {
    let gridResolutionSize = this.resolution.y - this.resolution.x
    let gridMiddleResolution = Math.floor(gridResolutionSize/2 + this.resolution.x);
    let gridTime = (millis()*this.speed) % (this.duration*1000)/1000;
    let gridResolution = Math.round((gridResolutionSize/2) * Math.sin(gridTime) + gridMiddleResolution);

    let gridStart = createVector(this.position.x-this.size/2, this.position.y-this.size/2);
    let gridSpacing = this.size/gridResolution;
    for(let x=0; x < gridResolution+1; x++) {
      // Draw the Column Line
      let startPoint = createVector(gridSpacing*x, 0).add(gridStart);
      let endPoint = createVector(0, this.size).add(startPoint);

      noFill();
      stroke('black');
      strokeWeight(this.strokeWeight);

      line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
    }

    for(let y=0; y < gridResolution+1; y++) {
      // Draw the Row Line
      let startPoint = createVector(0, gridSpacing*y).add(gridStart);
      let endPoint = createVector(this.size, 0).add(startPoint);

      noFill();
      stroke('black');
      strokeWeight(this.strokeWeight);

      line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
    }

    // console.log(gridTime)
  }

  draw() {
    this.drawGrid();

    super.draw();
  }
}

class CheckersWebding extends Webding {
  constructor(position, size, speed, duration, resolution, direction=0) {
    super(position, size, speed);
    this.resolution = resolution;
    this.duration = duration;
    this.direction = direction >= 0 ? 1 : -1;
  }

  drawCheckers() {
    // Draw the checkers
    let cellSize = this.size/this.resolution;
    let gridStart = createVector(this.position.x - this.size/2, this.position.y - this.size/2).add(createVector(cellSize/2, cellSize/2));
    let gridTime = ((millis())%(this.duration*1000))/(this.duration*1000) > 0.5 ? 1 : 0;
    for(let x=0; x < this.resolution; x++) {
      for(let y=0; y < this.resolution; y++) {
        let index = (x * this.resolution) + y;
        let cellPosition = createVector(cellSize*x, cellSize*y).add(gridStart);

        noStroke();
        fill('black');
        if((index + gridTime)%2 === 0) {
          fill('white');
        }

        rectMode(CENTER);

        square(cellPosition.x, cellPosition.y, cellSize);
      }
    }
  }

  draw() {
    this.drawCheckers();

    super.draw();
  }
}

// Icon Morpher Scene
class PictogramMorpherScene extends LobbyScene {
  constructor() {
    super('Pictogram Morpher');
    this.iconMorpherGrid = new IconGrid(64);
  }

  // Acts like the standard sketch setup function
  setup() {
    this.iconMorpherGrid.setup();
    super.setup();
  }

  draw() {
    this.iconMorpherGrid.draw();
  }
}

class ColorGroup {
  constructor(color1, color2, color3, color4, color5) {
    this.color1 = color1;
    this.color2 = color2;
    this.color3 = color3;
    this.color4 = color4;
    this.color5 = color5;

    this.colors = [color1, color2, color3, color4, color5];
  }

  getRandomColor(excludeColor1 = false) {
    let minColorIndex = excludeColor1 ? 1 : 0;

    return this.colors[Math.round(random(minColorIndex, this.colors.length-1))];
  }
}

class IconForm {
  constructor(pointA, pointB, pointC) {
    this.pointA = pointA;
    this.pointB = pointB;
    this.pointC = pointC;
  }

  getShape() {
    let pointD = createVector(this.pointB.y, this.pointB.x);
    let pointE = createVector(this.pointA.y, this.pointA.x);
    return [this.pointA, this.pointB, this.pointC, pointD, pointE];
  }
}

class IconMorpher {
  constructor(position, size, duration, color) {
    this.shapes = [new IconForm(createVector(0.5,1), createVector(0.75,1), createVector(1,1)), new IconForm(createVector(0.4765625,0.9765625), createVector(0.6015625,0.8515625), createVector(0.7265625,0.7265625)), new IconForm(createVector(0.7265625,0.9765625), createVector(0.4765625,0.7265625), createVector(0.4765625,0.4765625)), new IconForm(createVector(0.8515625,0.8515625), createVector(0.4765625,0.8515625), createVector(0.4765625,0.4765625))];
    this.activeShape = this.shapes[Math.round(random(0, this.shapes.length-1))];
    this.nextShape = this.shapes[Math.round(random(0, this.shapes.length-1))];
    this.duration = duration;
    this.timer = duration;
    this.tweenDuration = 1.5;
    this.position = position;
    this.size = size;
    this.color = color;
  }

  draw() {
    this.timer -= deltaTime/1000;

    if(this.timer <= 0) {
      this.selectTween();
      this.timer = this.duration;
    }

    this.calculateTween();
  }

  selectTween() {
    this.activeShape = this.nextShape;
    this.nextShape = this.shapes[Math.round(random(0, this.shapes.length-1))];
  }

  calculateTween() {
    let activeShape = this.activeShape.getShape();
    let nextShape = this.nextShape.getShape();
    let tweenTime = max(0,min(1,(1 - (this.timer - this.tweenDuration)) / this.tweenDuration));
    tweenTime = this.easeOutElastic(tweenTime);

    this.drawIcon(activeShape, nextShape, tweenTime);
  }

  drawIcon(shapeA, shapeB, tweenTime) {
    let shape = [];
    for(let i=0; i < shapeA.length; i++) {
      let point = this.tweenPoint(shapeA[i], shapeB[i], tweenTime);
      shape.push(point);
    }

    shape = this.flipX(shape);
    shape = this.flipY(shape);

    noFill();
    strokeWeight(5);
    stroke(this.color);
    strokeCap(ROUND);
    strokeJoin(ROUND);

    let shapeKeys = Object.keys(shape);
    for(let i=0; i < shapeKeys.length; i++) {
      let shapeKey = shapeKeys[i];

      beginShape();
      for(let j=0; j < shape[shapeKey].length; j++) {
        let point = this.getWorldPoint(shape[shapeKey][j]);
        vertex(point.x, point.y);
      }
      endShape();

    }
  }

  tweenPoint(pointA, pointB, tweenTime) {
    return p5.Vector.lerp(pointA, pointB, tweenTime)
  }

  getWorldPoint(point) {
    let scaledPoint = p5.Vector.mult(point, this.size/2);
    let positionedPoint = p5.Vector.add(p5.Vector.sub(this.position, createVector(this.size/2, this.size/2)), scaledPoint);

    return positionedPoint;
  }

  flipX(shape) {
    let flipped = [];
    for(let i=shape.length-1; i >= 0; i--) {
      let point = shape[i];
      let xDistance = 1+(1 - point.x);
      flipped.push(createVector(xDistance, point.y));
    }

    let newShape = {q0: shape, q1: flipped};
    return newShape;
  }

  flipY(shape) {
    let flipA = [];
    let flipB = [];

    for(let i=shape.q0.length-1; i >= 0; i--) {
      let pointA = shape.q0[i];
      let pointB = shape.q1[i];

      let yADistance = 1+(1 - pointA.y);
      let yBDistance = 1+(1 - pointB.y);
      flipA.push(createVector(pointA.x, yADistance));
      flipB.push(createVector(pointB.x, yBDistance));
    }

    shape.q2 = flipB;
    shape.q3 = flipA;

    return shape;
  }

  easeOutElastic(x) {
    const c4 = (2 * PI) / 3;

    return x === 0 ? 0 : x === 1 ? 1 : pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  }
}

class IconGrid {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.cellCount = null;
    this.margin = cellSize/2;
    this.iconMorphers = null;
    this.colorGroups = [new ColorGroup('#6C4AB6', '#8D72E1', '#8D9EFF', '#B9E0FF', '#FFFFFF'), new ColorGroup('#001253', '#E14D2A', '#FD841F', '#3E6D9C', '#B9E0FF'), new ColorGroup('#7A4069', '#CD104D', '#E14D2A', '#FD841F', '#FFD384'), new ColorGroup('#100720', '#F94892', '#FF7F3F', '#FBDF07', '#89CFFD'), new ColorGroup('#F5E8C7', '#293462', '#D61C4E', '#FEB139', '#AC7088')];
    this.activeGroup = null;
  }

  setup() {
    this.activeGroup = null;
    this.getRandomColor();
    if(this.cellCount === null) {
      this.getCellCount();
    }
    
    this.generateIconGrid();
  }

  getCellCount() {
    // Total width
    let tWidth = width - (this.margin*2);
    // Total height
    let tHeight = height - (this.margin*2);

    // Total Cell Count
    let xCount = Math.round(tWidth / this.cellSize);
    let yCount = Math.round(tHeight / this.cellSize);

    this.cellCount = createVector(xCount, yCount);

    // Modified Cell Size
    this.cellSize = createVector(tWidth/this.cellCount.x, tHeight/this.cellCount.y);
  }

  generateIconGrid() {
    let iconGrid = [];
    for(let x=0; x < this.cellCount.x; x++) {
      let iconRow = [];
      for(let y=0; y < this.cellCount.y; y++) {
        let position = createVector(x*this.cellSize.x+this.margin+this.cellSize.x/2,y*this.cellSize.y+this.margin+this.cellSize.y/2);
        iconRow.push(new IconMorpher(position, min(this.cellSize.x, this.cellSize.y), random(2,5), this.getRandomColor()));
      }

      iconGrid.push(iconRow);
    }

    this.iconMorphers = iconGrid;
  }

  draw() {
    background(this.activeGroup.color1);

    for(let x=0; x < this.cellCount.x; x++) {
      for(let y=0; y < this.cellCount.y; y++) {
        this.iconMorphers[x][y].draw();
      }
    }
  }

  getRandomColor() {
    if(this.activeGroup === undefined || this.activeGroup === null) {
      this.activeGroup = this.colorGroups[Math.round(random(0, this.colorGroups.length-1))];
    }

    return this.activeGroup.getRandomColor(true);
  }
}

// Pepsi Bubbler Scene
class PepsiBubblerScene extends LobbyScene {
  constructor() {
    super('Pepsi Bubbles', new SceneOptions(false, [], 0));
    this.bubbleCount = 24;
    this.pepsiBubbler = new PepsiBubblerSystem(this.bubbleCount);
  }

  setup() {
    this.pepsiBubbler = new PepsiBubblerSystem(this.bubbleCount);
    background(255);
    super.setup();
  }

  draw() {
    this.pepsiBubbler.draw();
  }
}

class PepsiBubblerSystem {
  constructor(bubbleCount) {
    this.bubbleCount = bubbleCount;
    this.bubbles = [];
    this.velocityXRange = 0.5;
    this.velocityYRange = new Range(-2, -6);
    this.sizeRange = new Range(3, 64);
    this.bubbleColors = [color('#000000'), color('#FFFFFF')];
    this.frequencyRange = new Range(0.5, 4);
    this.amplitudeRange = new Range(1, 4);
    this.fadeDuration = new Range(3.5, 7);
    this.spawnRate = 0.25;
    this.spawnTimer = 0;
    this.spawnMax = 3;
  }

  update() {
    // Update the bubbles
    for(let i=0; i < this.bubbles.length; i++) {
      let bubble = this.bubbles[i];

      bubble.draw();

      // Check if the bubble is of size 0
      if(bubble.getBubbleSize() === 0) {
        this.bubbles[i] = null;
      }

      // Check if the bubble is outside of view
      if(bubble.position.y < 0 - bubble.getBubbleSize() || (bubble.position.x < 0 - bubble.getBubbleSize() || bubble.position.x > width + bubble.getBubbleSize())) {
        this.bubbles[i] = null;
      }
    }

    // Remove all nulls from the bubbles array
    this.bubbles = this.bubbles.filter(bubble => bubble !== null);

    // Add bubbles if needed
    if(this.bubbles.length < this.bubbleCount) {
      this.spawnTimer -= deltaTime/1000;
      if(this.spawnTimer <= 0) {
        // Can spawn up to spawnMax bubbles
        for(let i=0; i < min(this.bubbleCount - this.bubbles.length, this.spawnMax); i++) {
          this.spawnBubble();
        }
        this.spawnTimer = this.spawnRate;
      }
    }
  }

  draw() {
    // Draw the background first
    this.drawBackground();

    this.update();
  }

  // Draws the flat background
  drawBackground() {
    noStroke();
    fill('#214ade');

    rect(0,0,width,height);
  }

  // Spawns a bubble
  spawnBubble() {
    let position = createVector(random(0,width), height + 50);
    let velocity = createVector(random(-this.velocityXRange, this.velocityXRange), random(this.velocityYRange.min, this.velocityYRange.max));
    let size = random(this.sizeRange.min, this.sizeRange.max);
    let color = this.bubbleColors[round(random(0, this.bubbleColors.length-1))];
    let frequency = random(this.frequencyRange.min, this.frequencyRange.max);
    let amplitude = random(this.amplitudeRange.min, this.amplitudeRange.max);
    let fadeDuration = random(this.fadeDuration.min, this.fadeDuration.max);

    this.bubbles.push(new PepsiBubble(position, velocity, size, color, frequency, amplitude, fadeDuration));
  }
}

class PepsiBubble {
  constructor(position, velocity, size, color, frequency, amplitude, fadeDuration) {
    this.position = position;
    this.velocity = velocity;
    this.size = size;
    this.color = color;
    this.frequency = frequency;
    this.amplitude = amplitude;
    this.phase = random(0,PI);
    this.bubbleTime = 0;
    this.fadeDuration = fadeDuration;
  }

  update() {
    // Update the timer on the bubble
    this.bubbleTime += deltaTime/1000;

    // Move the bubble based on the velocity and sine wave
    let bubbleMovement = createVector(this.velocity.x, this.velocity.y);

    // Calculate the X movement from a sine wave
    let xOffset = mathUtil.sine(this.bubbleTime, this.frequency, this.amplitude, this.phase, 0);

    // Add the sine to the velocity offset
    bubbleMovement.x += xOffset;

    // Update the position
    this.position.add(bubbleMovement);
  }

  draw() {
    this.update();

    noStroke();
    fill(this.color);

    circle(this.position.x, this.position.y, round(this.getBubbleSize()));
  }

  // Calculates the current size of the bubble based on the fade duration
  getBubbleSize() {
    let bubbleDuration = mathUtil.clamp(this.fadeDuration - this.bubbleTime, 0, this.fadeDuration);

    return (bubbleDuration/this.fadeDuration) * this.size;
  }
}

// Clock Scene
// TODO: Currently broken, noticed issues: "It is" does not appear at 10am, "eleven" does not appear during "half past eleven"
class WordClockScene extends LobbyScene {
  constructor() {
    super('Word Clock', new SceneOptions(false, [], 0));
    this.wordClock = new WordClock();
  }

  setup() {
    this.wordClock = new WordClock();
    background(255);
    super.setup();
  }

  draw() {
    background(0);
    this.wordClock.draw();
  }

  // Updates the debug state of the scene
  updateDebug(state) {
    super.updateDebug(state);
    // Toggle the debug on the clock renderer
    this.wordClock.renderDebug = state;
  }
}

class WordClock {
  constructor() {
    this.renderDebug = false;

    // Guides
    this.marginTop = 35;
    this.marginLeft = 52;
    this.marginRight = 48;
    this.marginBottom = 50;
    this.colWidth = 257;
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
    this.textInactiveColor = color("rgba(33,74,222,0.5)"); // rgba(255,255,255,0.25) // TODO: CHANGE THIS BACK AFTER 03/08/2023
    this.textSize = 50;
    this.textRowHeight = min(
        (height - (this.marginTop + this.marginBottom)) /
        this.textDisplay.length,
        this.textSize * 1.5
    );
  }

  draw() {
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

// Pepsi Full Bleed Scene
class PepsiFullBleedScene extends LobbyScene {
  constructor() {
    super('Pepsi Full Bleed', new SceneOptions(false, [], 0));
    this.waveHandler = new WaveHandler();
  }

  setup() {
    this.waveHandler = new WaveHandler();
    background(255);
    super.setup();
  }

  draw() {
    this.waveHandler.draw();
  }
}

class WaveHandler {
  constructor() {
    this.waves = [];
    this.timer = 0;
    this.generateWaves();
  }

  draw() {
    this.timer += deltaTime/1000;

    this.waves.forEach(wave => wave.draw());
  }

  // Generate the waves
  generateWaves() {
    let colors = [color('#eb1933'), color('white'), color('#004B93')];
    let verticals = [-100, round(height* (0.4)), round(height * (0.6))];
    for(let i=0; i < colors.length; i++) {
      this.waves.push(new WaveRenderer(createVector(random(0.5, 3), random(-3, -5)), createVector(random(22, 60), random(8, 16)), createVector(random(0, PI), random(0, PI)), verticals[i], colors[i], this));
    }
  }
}

class WaveRenderer {
  constructor(frequency, amplitude, phase, verticalOffset, color, handler) {
    this.frequency = frequency;
    this.amplitude = amplitude;
    this.phase = phase;
    this.verticalOffset = verticalOffset;
    this.color = color;
    this.handler = handler;
    this.resolution = 32;
    this.points = [];
    this.offsets = [];

    this.generatePoints();
  }

  draw() {
    noStroke();
    fill(this.color);

    beginShape();
    vertex(0, height);

    this.points.forEach(point => {
      let sine1 = mathUtil.sine(this.handler.timer, this.frequency.x, this.amplitude.x, this.phase.x + point.x/width, 0);
      let sine2 = mathUtil.sine(this.handler.timer, this.frequency.y, this.amplitude.y, this.phase.y + point.x/width, 0);

      vertex(point.x, point.y + (sine1 + sine2));
    });

    vertex(width, height);
    endShape(CLOSE);
  }

  // Generate the points
  generatePoints() {
    let xSpacing = round(width/(this.resolution - 1));
    for(let i=0; i < this.resolution; i++) {
      this.points.push(createVector(xSpacing * i, this.verticalOffset));

    }
  }
}

// Polka Wave Scene
class PolkaWaveScene extends LobbyScene {
  constructor() {
    super('Polka Wave', new SceneOptions(false, [], 0));
    this.wavyDots = new WavyDots();
  }

  setup() {
    this.wavyDots = new WavyDots();
    background(255);
    super.setup();
  }

  draw() {
    this.wavyDots.draw();
  }
}

class WavyDots {
  constructor() {
    this.resoultion = 16;
    this.time = 0;
  }

  draw() {
    background(22);
    this.time += deltaTime/1000;

    let spacing = width/(this.resoultion-1);
    let modulating = 1*Math.cos((this.time+2.124)*0.25)+1;
    let vibrating = 2*Math.sin((this.time+0.34)*0.1);
    let sinulating = 2*Math.cos(this.time*0.12)+4;

    for(let x=0; x < this.resoultion; x++) {
      for(let y=0; y < this.resoultion; y++) {
        let r = 127.5 + 127.5 * Math.sin(y + x + this.time);
        let g = 80 - 127.5 * Math.cos(y*0.75 + x  + this.time);
        let b = (127.5 + 127.5 * Math.cos(y*0.15 + x  - this.time));

        let position = createVector(x * spacing, y * spacing);
        let ySize = ((Math.sin(this.time+y+0*0.25)+0)+1)/2;
        let xSize = ((Math.sin(this.time+((x + vibrating*sinulating)*modulating)+y+0)+0)+1)/2;
        let size = (ySize+xSize)/2;

        noFill();
        stroke('rgb('+ [abs(round(r)),abs(round(g)),abs(round(b))].join(', ') + ')');
        strokeWeight(spacing*1.25*size);

        point(position.x, position.y);
      }
    }
  }
}

// Pond Scene
class PondScene extends LobbyScene {
  constructor() {
    super('Pond', new SceneOptions(false, [], 0));
    this.pondRenderer = new PondRenderer();
  }

  setup() {
    this.pondRenderer = new PondRenderer();
    this.pondRenderer.setup();
    background(255);
    super.setup();
  }

  draw() {
    this.pondRenderer.draw();
  }

  // Updates the debug state of the scene
  updateDebug(state) {
    super.updateDebug(state);
    // Toggle the debug on the pond renderer
    this.pondRenderer.debug = state;
    // TODO: Remove this code if referncing works like it is suppose to
    // // Iterate over all fish and lilly pads in the pond and update their debug states
    // this.pondRenderer.fish.forEach(fish => fish.debug = state);
    // this.pondRenderer.lillyPads.forEach(lillyPad => lillyPad.debug = state);
  }
}

class PondRenderer {
  constructor() {
    this.fish = [];
    this.fishCount = 6;
    this.lillyPads = [];
    this.lillyPadCount = 24;
    this.lillyPadMinSize = 30;
    this.lillyPadMaxSize = 72;
    this.lillyPadPadding = 100;
    this.debug = false;
    this.time = 0;
  }

  setup() {
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
  }

  draw() {
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

class Fish {
  constructor(index,position, debug, bodyColor) {
    this.index = index;
    this.position = position;
    this.resolution = mathUtil.clamp(5, 3, 100);
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
    let newBrightness = round(mathUtil.clamp(brightness(bodyColor) - 18, 0, 100));

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
      this.target.x = mathUtil.clamp(this.target.x, this.targetMargin, width - this.targetMargin);
      this.target.y = mathUtil.clamp(this.target.y, this.targetMargin, height - this.targetMargin);
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
    this.position = p5.Vector.lerp(this.position, this.target, easeUtil.easeInOutSine(interpolationValue));

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

    let finInterval = mathUtil.clamp(ceil((this.spineBodyPoints.length - 1) / this.finCount), 1, 100);
    for(let i = 0; i < mathUtil.clamp(this.finCount, 0, this.spineBodyPoints.length - 1); i++)
    {
      // Get the fin anchors
      let finAnchors = i * finInterval;
      finAnchors = mathUtil.clamp(finAnchors + this.finAnchorOffset, 0, this.spineBodyPoints.length - 1);
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
      let sineOffset = p5Util.sineWave(this.spineAmp + (this.sineSpeedAmpOffset * this.speed), this.spineFreq, this.spinePhase + currentDistanceToTarget, this.spineVertOffset, this.spineSpeed, time) * (i / this.spine.length);
      let offsetVector = p5.Vector.rotate(this.facing, HALF_PI).normalize().mult(sineOffset);

      this.spine[i].add(offsetVector);
    }
  }
}

class LillyPad {
  constructor(position, size, debug, lillyPadMinSize, lillyPadMaxSize) {
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
      let creaseRotation = mathUtil.clamp(((creaseRotationInterval * i) + offsetDisplacement) * (PI / 180), 0, 360 - (this.cutAngle * 2));
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

// Box Of Springs Scene
class BoxOfSpringsScene extends LobbyScene {
  constructor() {
    super('Box Of Springs', new SceneOptions(false, [], 0));
    this.springBox = new SpringBox();
  }

  setup() {
    this.springBox = new SpringBox();
    background(255);
    super.setup();
  }

  draw() {
    this.springBox.draw();
  }

  // Updates the debug state of the scene
  updateDebug(state) {
    super.updateDebug(state);
    // Toggle the debug on the spring box renderer
    this.springBox.debug = state;
    // Iterate over all springs in the spring box and toggle their debug as well
    this.springBox.springs.forEach(spring => spring.debug = state);
  }
}

class SpringBox {
  constructor(count = 24) {
    this.count = count;
    this.springs = [];

    // Spring Settings
    this.springMass = 0.4;
    this.springDamp = 0.92;
    this.palette = ["#abcd5e", "#29ac9f", "#14976b", "#b3dce0", "#62b6de", "#2b67af", "#ffd400", "#f589a3", "#f0502a", "#fc8405"];

    // Avoider
    this.avoiders = [createVector(width/2, height/2), createVector(width/2, height/2), createVector(width/2, height/2)];
    this.avoidRadii = [75,75];
    this.time = 0;
    this.noiseFrequency = 0.25;

    this.debug = false;

    this.generateSprings();
  }

  update() {
    this.time += deltaTime/1000;

    // Update the avoider positions
    let noiseTime = this.noiseFrequency * this.time;
    let avoiderSpacing = 109;
    for(let i=0; i < this.avoiders.length; i++) {
      let x = (noise(noiseTime+width+(avoiderSpacing*i))*2)-1;
      let y = (noise(noiseTime-height+(avoiderSpacing*i))*2)-1;

      this.avoiders[i] = createVector(width/2, height/2).add(createVector(x,y).mult(min(width, height)));
      let baseRadius = 75;
      this.avoidRadii[i] = round(baseRadius * sin(((noiseTime+(avoiderSpacing*i)) + 0.318) * 0.971) + (baseRadius*2));
    }
  }

  draw() {
    this.update();

    background(0);

    if(this.debug) {
      let avoiderIndex = 0;
      this.avoiders.forEach(avoider => {
        // Avoider
        stroke('magenta');
        strokeWeight(2);

        point(avoider.x, avoider.y);

        // Avoider Radius
        strokeWeight(1);

        circle(avoider.x, avoider.y, this.avoidRadii[avoiderIndex]);

        avoiderIndex++;
      })
    }

    this.springs.forEach(spring => spring.draw());
  }

  // Create the base springs on the canvas
  generateSprings() {
    let spacing = createVector(width/(this.count-1), height/(this.count-1));
    for(let x=0; x < this.count; x++) {
      for(let y=0; y < this.count; y++) {
        let baseColor = color(this.palette[round(random(0,this.palette.length-1))]);
        let highlightColor = color('#fffbe6');

        this.springs.push(new SpringParticle(this, createVector(spacing.x * x, spacing.y * y), createVector(spacing.x * x, spacing.y * y), this.springMass, this.springDamp, baseColor, highlightColor));
      }
    }
  }

  // Returns the maximum avoidance radius
  getMaxAvoidRadius() {
    let maxRadius = this.avoidRadii[0];
    this.avoidRadii.forEach(radius => {
      maxRadius = min(radius, maxRadius);
    })
    return maxRadius;
  }
}

class SpringParticle {
  constructor(box, position, target, mass, damp, baseColor, highlightColor, k = 0.2) {
    this.box = box;
    this.position = position;
    this.target = target;
    this.velocity = createVector(0,0);

    // Spring Properties
    this.mass = mass;  // Mass
    this.k = k;  // Spring constant
    this.damp = damp;  // Damping

    // Spring simulation variables
    this.acceleration = 0;  // Acceleration
    this.force = 0;  // Force

    this.baseColor = baseColor;
    this.highlightColor = highlightColor;

    // Trail
    this.trailInterval = 0.03;
    this.trailTimer = 0;
    this.trailSamples = 12;
    this.trailBase = [];
    this.trailSmoothed = [];

    this.debug = false;
  }

  update() {
    // Get the vector towards the target
    let targetVector = p5.Vector.sub(this.target, this.position);

    // Get the avoidance vector
    let avoidanceVector = this.getAvoidiance();

    // Interpolate between the two vectors based on the length of the avoidance vector
    let movementVector = p5.Vector.lerp(targetVector, avoidanceVector, avoidanceVector.mag()/this.box.getMaxAvoidRadius());

    let targetForce = p5.Vector.add(movementVector.mult(deltaTime/1000), this.position);

    this.force = -this.k * (this.position.y - targetForce.y);  // f=-ky
    this.acceleration = this.force / this.mass;  // Set the acceleration, f=ma == a=f/m
    let velY = this.damp * (this.velocity.y + this.acceleration);  // Calculate the velocity on the Y

    this.force = -this.k * (this.position.x - targetForce.x);  // f=-ky
    this.acceleration = this.force / this.mass;  // Set the acceleration, f=ma == a=f/m
    let velX = this.damp * (this.velocity.x + this.acceleration);  // Calculate the velocity on the X

    // Update the velocity and position
    this.velocity = createVector(velX, velY);
    this.position.add(this.velocity);

    this.trailTimer -= deltaTime/1000;

    if(this.trailTimer <= 0) {
      this.trailTimer = this.trailInterval;
      this.trailBase.push(createVector(this.position.x, this.position.y));

      if(this.trailBase.length > this.trailSamples) {
        this.trailBase.shift();
      }
    }

    // Smooth the trail
    this.trailSmoothed = [];
    for(let i=0; i < this.trailBase.length; i++) {
      this.trailSmoothed.push(createVector(this.trailBase[i].x, this.trailBase[i].y).lerp(this.target, ((this.trailSamples - i)/2)/this.trailSamples));
    }
  }

  draw() {
    this.update();

    // Debug
    if(this.debug) {
      // Target
      noFill();
      stroke('red');
      strokeWeight(4);

      point(this.target.x, this.target.y);

      // Velocity
      stroke('blue');
      strokeWeight(1);

      line(this.position.x, this.position.y, this.position.x + this.velocity.x, this.position.y + this.velocity.y);

      // Avoidance
      let avoidance = this.getAvoidiance();
      let newPos = p5.Vector.add(this.position, avoidance);
      stroke('cyan');
      strokeWeight(1);

      line(this.position.x, this.position.y, newPos.x, newPos.y);

      // Samples
      stroke('yellow');
      strokeWeight(1);

      beginShape();
      this.trailBase.forEach(vert => vertex(vert.x, vert.y));
      endShape();

      stroke('lime');
      strokeWeight(1);

      beginShape();
      this.trailSmoothed.forEach(vert => vertex(vert.x, vert.y));
      endShape();
    }

    // Point
    noFill();
    stroke(this.getColorFromRest());
    strokeWeight(8);

    point(this.position.x, this.position.y);

    stroke(this.baseColor);
    strokeWeight(2);
    strokeCap(ROUND);

    beginShape();
    this.trailSmoothed.forEach(vert => vertex(vert.x, vert.y));
    endShape();
  }

  getAvoidiance() {
    // Iterate over all avoiders and collect them
    let avoidanceVectors = [];
    for(let i=0; i < this.box.avoiders.length; i++) {
      let avoiderPosition = createVector(this.box.avoiders[i].x, this.box.avoiders[i].y);
      let avoiderDistance = p5.Vector.dist(avoiderPosition, this.position);

      // Get the vector away from the avoider
      let avoidanceVector = p5.Vector.sub(this.position, avoiderPosition).setMag(this.box.avoidRadii[i]);
      // Scale the vector based on the distance
      let vectorScale = min(max(1-(avoiderDistance/this.box.avoidRadii[i]), 0), 2);
      avoidanceVector.mult(easeUtil.easeInOutCubic(vectorScale));

      avoidanceVectors.push(avoidanceVector);
    }

    // Average the avoider vectors
    let avoidanceVector = createVector(0,0);
    avoidanceVectors.forEach(vector => avoidanceVector.add(vector));
    avoidanceVector.div(avoidanceVectors.length);

    return avoidanceVector.mult(2);
  }

  // Returns the color given the distance from the rest position
  getColorFromRest() {
    let distanceFromRest = p5.Vector.dist(this.position, this.target);
    return lerpColor(this.baseColor, this.highlightColor, easeUtil.easeOutCubic(distanceFromRest/this.box.getMaxAvoidRadius()));
  }
}

// Quad Tree Scene
class QuadTreeScene extends LobbyScene {
  constructor() {
    super('Noisy QuadTree', new SceneOptions(false, [], 0));
    this.quadTree = new QuadTreeNoiseRenderer();
  }

  setup() {
    this.quadTree = new QuadTreeNoiseRenderer(random(0,1000000));
    background(255);
    super.setup();
  }

  draw() {
    this.quadTree.draw();
  }
}

class QuadTreeNoiseRenderer {
  constructor(variation = 0, stackDepth = 9, speed = 0.5) {
    this.palette = ["#abcd5e", "#29ac9f", "#14976b", "#b3dce0", "#62b6de", "#2b67af", "#ffd400", "#f589a3", "#f0502a", "#fc8405"];
    this.variation = variation;
    this.minRectSize = 0;
    this.maxRectSize = 0;
    this.position = createVector(random(-100000, 100000), random(-100000, 100000));
    this.stackDepth = stackDepth;
    this.speed = speed;

    this.setup();
  }

  setup() {
    this.maxRectSize = max(width, height);
    this.minRectSize = max(this.maxRectSize / (2 ** this.stackDepth),4);

    // Randomly shift the array order
    let randomShift = round(random(0, this.palette.length-1));

    for(let i=0; i < randomShift; i++) {
      let lastColor = this.palette.shift();
      this.palette.push(lastColor);
    }
  }

  draw() {
    rectMode(CENTER);
    stroke("black");
    noFill();
    background(this.palette[this.palette.length-1]);
    this.variation += 0.003 * this.speed;
    this.quadTree(width / 2, height / 2, this.maxRectSize, 0);
  }

  quadTree(x, y, size, iteration) {
    if (size < this.minRectSize) return;
    const n = noise((x + this.position.x) * 0.001, (y + this.position.y) * 0.001, this.variation);
    if (abs(n - 0.45) > size / this.maxRectSize) {
      fill(color(this.palette[min(iteration, this.palette.length-1)]));
      rect(x, y, size);
    } else {
      size /= 2;
      const d = size / 2;
      this.quadTree(x + d, y + d, size, iteration+1);
      this.quadTree(x + d, y - d, size, iteration+1);
      this.quadTree(x - d, y + d, size, iteration+1);
      this.quadTree(x - d, y - d, size, iteration+1);
    }
  };
}