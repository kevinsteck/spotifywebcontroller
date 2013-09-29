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
    track_details.track_name = document.getElementById('track-name').firstChild.innerHTML;
    track_details.artist_name = document.getElementById('track-artist').firstChild.innerHTML;
    track_details.album_art = document.getElementsByClassName('sp-image-img')[0].style.backgroundImage;
    return track_details;
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

  // player events
  document.documentElement.addEventListener("spotify_playing", playing, false);
  document.documentElement.addEventListener("spotify_paused", paused, false);

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
        var evnt = document.createEvent("Event");
        evnt.initEvent("get_status", false, false);
        document.documentElement.dispatchEvent(evnt);
        break;
      case 'track_details':
        port.postMessage(SpotifyController.track_details());
        break;
    }
    // if (msg.action != 'track_details') port.postMessage({change: true});
  });

  port.onDisconnect.addListener(function() {
      document.documentElement.removeEventListener("spotify_playing", playing, false);
      document.documentElement.removeEventListener("spotify_paused", paused, false);
      port = null;
  });
});

var script_function = function attach_to_spotify() {
  // for initial status
  document.documentElement.addEventListener("get_status", function() {
    var player = this.SpotifyApi.api._modules['$api/scripts/models'];
    if (player) {
      if (player.player.playing) {
        var evnt = document.createEvent("Event");
        evnt.initEvent("spotify_playing", false, false);
        document.documentElement.dispatchEvent(evnt);
      } else {
        var evnt = document.createEvent("Event");
        evnt.initEvent("spotify_paused", false, false);
        document.documentElement.dispatchEvent(evnt);
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
            // attach to pause
            var paused = this.SpotifyApi.api._modules['$api/scripts/models'].player.pause;
            this.SpotifyApi.api._modules['$api/scripts/models'].player.pause = function() {
              var evnt = document.createEvent("Event");
              evnt.initEvent("spotify_paused", false, false);
              document.documentElement.dispatchEvent(evnt);
              paused.bind(this)();
            }

            // attach to play
            var play = this.SpotifyApi.api._modules['$api/scripts/models'].player.play;
            this.SpotifyApi.api._modules['$api/scripts/models'].player.play = function() {
              var evnt = document.createEvent("Event");
              evnt.initEvent("spotify_playing", false, false);
              document.documentElement.dispatchEvent(evnt);
              play.bind(this)();
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