// To Fetch the songs : 
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;

    let a = await fetch(`/${folder}/`)
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]) // Here whatever comes before /songs/ will be chopped off
            // If used [0] instead of [1], whatever comes after /songs/ will be chopped off
        }
    }

    // Show all the songs in the PlayList :
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0] // Here if [0] is not used, only <ul> will be selected and not </ul>
    songUL.innerHTML = " ";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img src="CardImages/music.svg" alt="">
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div></div>
        </div>
        <div class="playNow">
            <span>Play Now</span>
            <img class="invert" src="CardImages/play.svg" alt="">
        </div></li>`;
    }

    // Attach an event listner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => { 
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "CardImages/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let a = await fetch(`/Songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/Songs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-1)[0]  // (-2)[1]  or (-1)[0]
            // Get the meta data of the folder
            let a = await fetch(`/Songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="black" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>
            <img src="/Songs/${folder}/cover.jpg" alt="">
            <h4>${response.title}</h4>
            <p>${response.description}</p>
        </div>`
        }
    }

    // Load the plalist whenevr the card is clicked 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            document.querySelector(".left").style.left = "0"; // Added by me
            playMusic(songs[0])
        })
    })
}

async function main() {

    // Get the list of all the songs
    await getSongs("Songs/Today'sTopHits");
    playMusic(songs[0], true)

    // Display all the albums on the page
    displayAlbums()

    // Attach an event listner to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "CardImages/pause.svg"
        } else {
            currentSong.pause()
            play.src = "CardImages/play.svg"
        }
    })

    // Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.duration)} / ${secondsToMinutesSeconds(currentSong.currentTime)}`;

        // For seek bar controlls :
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listner to the seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    // To close the Hamburger Menu :
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    // Add an event Listener to previous
    previous.addEventListener("click", () => {
        // currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event Listener to next
    next.addEventListener("click", () => {
        // currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e, e.target, e.target.value)
        console.log("Setting Volume to ", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100;
        if(currentSong.volume > 0){
             document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    // Add the event Listener to mute the audio
    document.querySelector(".volume>img").addEventListener("click", e => {
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = 1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 1;
        }
    })
}

main();




// Notes :

// 1) Next and Previous Process

// console.log("Next clicked")
// console.log(currentSong.src)
// console.log(songs)
// console.log(currentSong.src.split("/Songs/")[1])
// let index = songs.indexOf(currentSong.src.split("/Songs/")[1])
// console.log(index)
// playMusic(songs[index + 1])


// 2) The volume value is between 0 and 1:

//     => 1.0 means highest volume (100%. This is default)
//     => 0.0 means silent (like as mute)
