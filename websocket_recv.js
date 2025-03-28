let isPlaying = false;
let startTime = 0;
let elapsedTime = 0;
let totalDuration = 0;
let timerInterval;

const socket = new WebSocket("ws://141.147.114.232:8765");
const listeningTimeElement = document.getElementById("listening-time");
const songDurationElement = document.getElementById("song-duration");
const plackbackBarElement = document.getElementById("duration-bar");
socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    
    const isPlayingNow = message.playing;
    const currentPosition = parseInt(message.position, 10);
    const totalTrackDuration = parseInt(message.duration, 10);

    if (totalDuration !== totalTrackDuration) {
        totalDuration = totalTrackDuration;
    }

    if (isPlayingNow) {
        if (!isPlaying) {
            startTime = Date.now() - currentPosition;
            timerInterval = setInterval(updateTimer, 1000);
            isPlaying = true;
        }
    } else {
        if (isPlaying) {
            clearInterval(timerInterval);
            elapsedTime = Date.now() - startTime;
            isPlaying = false;
        }
    }
    if (isPlayingNow) {
        elapsedTime = Date.now() - startTime;
        displayElapsedTime(elapsedTime, totalDuration);
    }
};

function displayElapsedTime(time, totalDuration) {
    const elapsedSeconds = Math.floor(time / 1000);
    const minutes = Math.floor(elapsedSeconds / 60);
    const remainingSeconds = elapsedSeconds % 60;

    const totalSeconds = Math.floor(totalDuration / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const remainingTotalSeconds = totalSeconds % 60;

    listeningTimeElement.textContent = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    songDurationElement.textContent = `${totalMinutes}:${remainingTotalSeconds < 10 ? '0' : ''}${remainingTotalSeconds}`;
    plackbackBarElement.style.width = `${(elapsedSeconds / totalSeconds) * 100}%`;
}


socket.addEventListener("close", () => {
    console.warn("WebSocket closed.");
    clearInterval(timer);
    location.reload();
});