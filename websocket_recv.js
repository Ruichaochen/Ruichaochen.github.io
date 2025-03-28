let isPlaying = false;
let startTime = 0;
let elapsedTime = 0;
let totalDuration = 0;
let timerInterval;
let playing_uri;
window.onload = function() {
    const socket = new WebSocket("ws://141.147.114.232:8765");

    const listeningTimeElement = document.getElementById("listening-time");
    const songDurationElement = document.getElementById("song-duration");
    const plackbackBarElement = document.getElementById("duration-bar");
    const songTitleElement = document.getElementById("song-title");
    const songArtistsElement = document.getElementById("song-artists");
    const albumCoverElement = document.getElementById("album-cover");
    
    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const uri = message["track_uri"]
        const isPlayingNow = !message.playing;
        const currentPosition = parseInt(message.position, 10);
        const totalDuration = parseInt(message.duration, 10);
        if (uri !== playing_uri) {
            startTime = Date.now() - currentPosition;
            songTitleElement.textContent = message["metadata"]["title"];
            albumCoverElement.src = "https://i.scdn.co/image/" + message["metadata"]["image_url"].split(":")[2];
            displayElapsedTime(Date.now() - startTime, totalDuration);
        }    
        if (isPlayingNow) {
            if (!isPlaying) {
                startTime = Date.now() - currentPosition;
                timerInterval = setInterval(() => displayElapsedTime(Date.now() - startTime, totalDuration), 1000, );
                isPlaying = true;
            }
        } else {
            if (isPlaying) {
                displayElapsedTime(Date.now() - startTime, totalDuration);
                clearInterval(timerInterval);
                elapsedTime = Date.now() - startTime;
                isPlaying = false;
            }
        }
        if (isPlayingNow) {
            displayElapsedTime(Date.now() - startTime, totalDuration);
        }
    };

    function displayElapsedTime(time, totalDuration) {
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
        console.warn("WebSocket closed.");
        clearInterval(timer);
        location.reload();
    })
}