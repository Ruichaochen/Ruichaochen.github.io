let isPlaying = false;
let startTime = 0;
let elapsedTime = 0;
let totalDuration = 0;
let timerInterval;
let playing_uri;

function websocket_listen() {
    const socket = new WebSocket("wss://ws.ruichao.software");

    const listeningTimeElement = document.getElementById("listening-time");
    const songDurationElement = document.getElementById("song-duration");
    const plackbackBarElement = document.getElementById("duration-bar");
    const songTitleElement = document.getElementById("song-title");
    const songArtistsHolderElement = document.getElementById("song-artists");
    const albumCoverElement = document.getElementById("album-cover");
    const albumLinkElement = document.getElementById("album-link");

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const uri = message["track_uri"]
        const isPlayingNow = message.playing;
        const currentPosition = parseInt(message.position, 10);
        const totalDuration = parseInt(message.duration, 10);
        songTitleElement.setAttribute("href", "https://open.spotify.com/track/" + uri.split(":")[2]);
        if (uri !== playing_uri) {
            if (timerInterval) {
                clearInterval(timerInterval);
                if (isPlaying) {
                    timerInterval = setInterval(() => displayElapsedTime(Date.now() - startTime, totalDuration), 1000, );
                }
            }
            if ("startTime" in message) {
                startTime = message["startTime"];
            } else {
                startTime = Date.now() - currentPosition;
            }
            playing_uri = uri
            songTitleElement.textContent = message["metadata"]["title"];
            songArtistsHolderElement.innerHTML = "";
            message["metadata"]["artists"].forEach(artist => {
                const artistLink = document.createElement("a");
                const separator = document.createElement("span");
                separator.textContent = ", ";
                artistLink.target = "_blank";
                artistLink.setAttribute("href", "https://open.spotify.com/artist/" + artist[1].split(":")[2]);
                artistLink.id = "song-artist";
                artistLink.textContent = artist[0];
                songArtistsHolderElement.appendChild(artistLink);
                songArtistsHolderElement.appendChild(separator);
            });
            songArtistsHolderElement.lastChild.remove();
            albumCoverElement.src = "https://i.scdn.co/image/" + message["metadata"]["image_url"].split(":")[2];
            albumLinkElement.setAttribute("href", "https://open.spotify.com/album/" + message["metadata"]["album_uri"].split(":")[2]);
            displayElapsedTime(message["position"], totalDuration);
        }
        
        if (isPlayingNow) {
            if (!isPlaying) {
                startTime = Date.now() - currentPosition;
                timerInterval = setInterval(() => displayElapsedTime(Date.now() - startTime, totalDuration), 1000);
                isPlaying = true;
            }
        } else {
            if (isPlaying) {
                clearInterval(timerInterval);
                elapsedTime = Date.now() - startTime;
                isPlaying = false;
            }
        }
        displayElapsedTime(currentPosition, totalDuration);
    };

    function displayElapsedTime(time, totalDuration) {
        if (time > totalDuration) {
            time = totalDuration
        }
        console.log(`Elapsed Time: ${time}, Total Duration: ${totalDuration}`);
        elapsedSeconds = Math.floor(time / 1000);
        minutes = Math.floor(elapsedSeconds / 60);
        remainingSeconds = elapsedSeconds % 60;

        totalSeconds = Math.floor(totalDuration / 1000);
        totalMinutes = Math.floor(totalSeconds / 60);
        remainingTotalSeconds = totalSeconds % 60;

        listeningTimeElement.textContent = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
        songDurationElement.textContent = `${totalMinutes}:${remainingTotalSeconds < 10 ? '0' : ''}${remainingTotalSeconds}`;
        plackbackBarElement.style.setProperty('--progress-width',`${(elapsedSeconds / totalSeconds) * 100}%`);
    }


    socket.addEventListener("close", () => {
        clearInterval(timerInterval);
        setTimeout(websocket_listen, 5000)
    })
}

window.onload = function() {
    websocket_listen();
}
