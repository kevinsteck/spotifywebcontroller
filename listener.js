var SpotifyController = {
  play_pause: function() {
    var button = document.getElementById('play-pause');
    button.click();
  },

  is_playing: function() {
    var button = document.getElementById('play-pause');
    return button.className;
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
  var player = document.getElementById('player');
  player.addEventListener('change:playing', function() {
    port.postMessage({state: SpotifyController.is_playing()});
  });
  port.onMessage.addListener(function(msg) {
    switch (msg.action) {
      case 'play_pause':
        SpotifyController.play_pause();
        // setTimeout(function() {port.postMessage({state: SpotifyController.is_playing()}); }, 1000);
        break;
      case 'next':
        SpotifyController.next();
        break;
      case 'previous':
        SpotifyController.previous();
        break;
      case 'track_details':
        port.postMessage(SpotifyController.track_details());
        break;
    }

    if (msg.action != 'track_details') port.postMessage({change: true});
  });
});