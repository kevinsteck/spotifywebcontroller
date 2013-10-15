var SpotifyController = {
  play_pause: function(t) {
    var button = document.getElementById('play-pause');
    button.click();
  },

  previous: function() {
    var button = document.getElementById('previous');
    button.click();
  },

  next: function() {
    var button = document.getElementById('next');
    button.click();
  },

  track_details: function() {
    var track_details = {};
    if (document.getElementById('track-name')) {
      track_details.track_name = document.getElementById('track-name').firstChild.innerHTML;
      track_details.artist_name = document.getElementById('track-artist').firstChild.innerHTML;
      track_details.album_art = document.getElementsByClassName('sp-image-img')[0].style.backgroundImage;
      return track_details;
    }
  }
};

chrome.runtime.onConnect.addListener(function(port) {
  // state changes
  var playing = function(e) {
    port.postMessage({state: 'playing'});
  };
  var paused = function(e) {
    port.postMessage({state: 'paused'});
  };
  var spotify_track_change = function(e) {
    port.postMessage(SpotifyController.track_details());
  }
  var get_status = function() {
    var evnt = document.createEvent("Event");
    evnt.initEvent("get_status", false, false);
    document.documentElement.dispatchEvent(evnt);
  }

  // player events
  document.documentElement.addEventListener("spotify_playing", playing, false);
  document.documentElement.addEventListener("spotify_paused", paused, false);
  document.documentElement.addEventListener("spotify_track_change", spotify_track_change, false);

  port.onMessage.addListener(function(msg) {
    switch (msg.action) {
      case 'play_pause':
        SpotifyController.play_pause(this);
        break;
      case 'next':
        SpotifyController.next();
        break;
      case 'previous':
        SpotifyController.previous();
        break;
      case 'status':
        // get initial status
        get_status();
        break;
      case 'track_details':
        port.postMessage(SpotifyController.track_details());
        break;
    }
  });

  port.onDisconnect.addListener(function() {
      document.documentElement.removeEventListener("spotify_playing", playing, false);
      document.documentElement.removeEventListener("spotify_paused", paused, false);
      document.documentElement.removeEventListener("spotify_track_change", spotify_track_change, false);
      port = null;
  });
});

var script_function = function attach_to_spotify() {
  var send_event = function(event_name) {
    var evnt = document.createEvent("Event");
    evnt.initEvent(event_name, false, false);
    document.documentElement.dispatchEvent(evnt);
  };
  // for initial status
  document.documentElement.addEventListener("get_status", function() {
    var player = this.SpotifyApi.api._modules['$api/scripts/models'];
    if (player) {
      if (player.player.playing) {
        send_event("spotify_playing");
      } else {
        send_event("spotify_paused");
      }
    }
  }.bind(this), false);

  if(this.SpotifyApi) {
    window.addEventListener('load', function() {
      // a bit hacky but the loading of the playpausebutton dom is delayed
      // I could probably bind the function that loads it but this works
      setTimeout(function() {
        if (this.SpotifyApi) {
          if (this.SpotifyApi.api._modules['$api/scripts/models']) {
            // attach to dispatch
            var dispatch = this.SpotifyApi.api._modules['$api/scripts/models'].player.dispatchEvent;
            this.SpotifyApi.api._modules['$api/scripts/models'].player.dispatchEvent = function(e) {
              if (e.type && e.type == 'change:playing') {
                if (!e.oldValue) {
                  send_event("spotify_playing");
                } else {
                  send_event("spotify_paused");
                }
              } else if (e.type && e.type == 'change:duration') {
                send_event("spotify_track_change");
              }
              dispatch.bind(this)(e);
            }
          }
        }
      }, 5000);
    }, false);
  }
};

var s = document.createElement("script");
s.textContent = script_function.toString() + 'attach_to_spotify();';
document.body.appendChild(s);