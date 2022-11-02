// Global Data
sceneList = [{name: 'Logo', options: {enabled: true, values: ['Union', 'NRG', 'NGC','Diversey']}}, {name: 'Water', options: {enabled: false, values: []}}, {name: 'Air', options: {enabled: false, values: []}}, {name: 'Life', options: {enabled: false, values: []}}];
editorSettings = {};
editorState = false;

// Startup function
function startup() {
  // Set up editor toggle
  document.keydown = function (event) {
    let keycode = event.key;
    console.log(keycode);
      // e = e || window.event;
      // if(e.keyCode == 96 || 126) {
      //   editorState = !editorState;
      //   updateEditorState();
      // }
  };
  
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

// Updates the position of the canvas marker
function updateCanvasPositionMarker() {
  let x = document.getElementById('editor-canvas-x').value;
  let y = document.getElementById('editor-canvas-y').value;
  
  let marker = document.getElementById('canvas-position-marker');
  
  marker.setAttribute('style', '--top: ' + y + 'px;' + '--left: ' + x + 'px;');
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

    updateCanvasPositionMarker();

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

startup();