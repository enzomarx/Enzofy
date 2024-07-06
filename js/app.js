// app.js

var recentSearches = [];
var spotifyToken = '';

// Função para buscar o token de acesso do Spotify
function fetchSpotifyToken() {
    var clientId = '731cb7c6639a4e779dd47f7368c8d5f9';
    var clientSecret = 'd2d3772e36054521b7cef082bae3ff8d';

    var tokenUrl = 'https://accounts.spotify.com/api/token';
    var basicAuth = btoa(clientId + ':' + clientSecret);

    fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + basicAuth,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    })
    .then(response => response.json())
    .then(data => {
        spotifyToken = data.access_token;
        console.log('Spotify token:', spotifyToken);
        // Após obter o token, você pode realizar outras operações que dependem do token
    })
    .catch(error => {
        console.error('Error fetching Spotify token:', error);
    });
}

// Função para buscar as músicas populares de um artista
function fetchTopSongs(artist) {
    var apiKey = "9e06728c486bda235dbc686173e8b6c3";
    var url = "https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=" + encodeURIComponent(artist) + "&api_key=" + apiKey + "&format=json";

    fetch(url)
    .then(response => response.json())
    .then(data => {
        var topTracks = data.toptracks.track;
        var topSongsDiv = document.getElementById('topSongs');
        topSongsDiv.innerHTML = "<h2>Most popular songs by " + artist + ":</h2>";

        topTracks.forEach(function(track, index) {
            var trackName = track.name;
            var artistName = track.artist.name;

            var trackInfoElement = document.createElement('div');
            trackInfoElement.classList.add('track-info');
            if (index < 3) {
                var medalEmoji;
                if (index === 0) {
                    medalEmoji = "🥇";
                } else if (index === 1) {
                    medalEmoji = "🥈";
                } else {
                    medalEmoji = "🥉";
                }
                trackInfoElement.innerHTML = "<p>" + medalEmoji + "</p>";
            }
            trackInfoElement.innerHTML += "<p>" + (index + 1) + ". " + trackName + " - " + artistName + ":</p>";

            fetchSpotifyPreview(trackName, artistName, trackInfoElement);

            topSongsDiv.appendChild(trackInfoElement);
        });
    })
    .catch(error => {
        console.error('Error fetching songs:', error);
    });
}

// Função para buscar a prévia do Spotify de uma música
function fetchSpotifyPreview(trackName, artistName, trackInfoElement) {
    var searchUrl = "https://api.spotify.com/v1/search?q=track:" + encodeURIComponent(trackName) + "%20artist:" + encodeURIComponent(artistName) + "&type=track&limit=1";

    fetch(searchUrl, {
        headers: {
            'Authorization': 'Bearer ' + spotifyToken
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("Spotify API response:", data);
        if (data.tracks.items.length > 0) {
            var previewUrl = data.tracks.items[0].preview_url;
            if (previewUrl) {
                console.log("Preview URL found:", previewUrl);
                var audioPlayerElement = document.createElement('audio');
                audioPlayerElement.controls = true;
                audioPlayerElement.src = previewUrl;
                trackInfoElement.appendChild(audioPlayerElement);
            } else {
                console.log("No preview available for track:", trackName);
                var noPreviewElement = document.createElement('p');
                noPreviewElement.innerHTML = "No preview available";
                trackInfoElement.appendChild(noPreviewElement);
            }
        } else {
            console.log("No tracks found for:", trackName);
        }
    })
    .catch(error => {
        console.error('Error fetching Spotify preview:', error);
    });
}

// Evento de clique para começar a buscar músicas
document.getElementById('startButton').addEventListener('click', function() {
    var artistName = prompt("Enter artist or band name:");
    if (artistName) {
        recentSearches.push(artistName);
        if (recentSearches.length > 10) {
            recentSearches.shift();
        }
        fetchTopSongs(artistName);
    }
});

// Evento de clique para limpar as pesquisas recentes
document.getElementById('clearButton').addEventListener('click', function() {
    recentSearches = [];
    alert("Recent searches cleared.");
});

// Evento de clique para embaralhar as músicas
document.getElementById('shuffleButton').addEventListener('click', function() {
    alert("Shuffling songs...");
    var topSongsDiv = document.getElementById('topSongs');
    var tracks = topSongsDiv.querySelectorAll('.track-info');
    shuffle(tracks);
    topSongsDiv.innerHTML = '';
    tracks.forEach(function(track, index) {
        topSongsDiv.appendChild(track);
    });
});

// Função para embaralhar uma lista de elementos
function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

// Evento de tecla para mostrar as pesquisas recentes
window.addEventListener('keyup', function(event) {
    if (event.key === "Enter") {
        var input = prompt("Type 'enzofy curation' to see your recent searches:");
        if (input && input.toLowerCase() === "enzofy curation") {
            showRecentSearches();
        }
    }
});

// Função para mostrar as pesquisas recentes
function showRecentSearches() {
    var recentList = recentSearches.slice(-10);
    alert("Your recent searches:\n" + recentList.join("\n"));
}

// Inicializa a busca do token de acesso ao carregar a página
fetchSpotifyToken();
