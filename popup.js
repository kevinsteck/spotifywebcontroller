function play_pause() {
  sendMessage('play_pause');
}

function next() {
  sendMessage('next');
}

function previous() {
  sendMessage('previous');
}

function sendMessage(msg) {
  chrome.tabs.query({url: 'https://play.spotify.com/*'}, function(tabs) {
    var port = chrome.tabs.connect(tabs[0].id);
    port.postMessage({action: msg});
    port.onMessage.addListener(function getResp(response) {
      if (response.change) {
        // setTimeout(function() { port.postMessage({action: 'track_details'}); }, 1000);
      } else if (response.album_art && response.track_name && response.artist_name) {
        document.getElementById('album_art').innerHTML = response.album_art;
        document.getElementById('track_name').innerHTML = response.track_name;
        document.getElementById('artist_name').innerHTML = response.artist_name;
      } else if (typeof response.state !== "undefined") {
        document.querySelector('#play-pause').className = response.state;
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('#previous').addEventListener('click', previous);
  document.querySelector('#play-pause').addEventListener('click', play_pause);
  document.querySelector('#next').addEventListener('click', next);
});