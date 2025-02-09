let planets = []
const earthCoor = {
    x: 50,
    y: 6
}
const url = 'http://127.0.0.1:8000/';
let vocabulary = [];
const vowels = ['a', 'e', 'i', 'o', 'u'];
const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];
const planetNames = ['planet1.png', 'planet2.png', 'planet3.png', 'planet4.png', 'planet5.png', 'planet6.png', 'planet7.png', 'moon.png']

let selectedWord = '';
let selectedPlanet = null;
let expectedLetter = null;
let indexToCheck = 0;
let planetsDestroyed = 0;
let total_planets = 0;

document.addEventListener('DOMContentLoaded', async () => {
    getWords();
    document.querySelector('.start_button').addEventListener('click', () => {
        startGame();
        document.querySelector('.start_message').style.display = 'none';
    })
})

function startGame() {
    gameLoop(); 
    spawnPlanet();
    startAudio();
}

function gameLoop() {
    requestAnimationFrame(gameLoop);
    movePlanet();
}

function createPlanet() {
    if (vocabulary.length === 0) return;

    // Parent div for the image
    const div = createDiv('div', 'planet-container');
    const { x_coor, y_coor } = generateRandomCoor();
    
    div.style.bottom = `${y_coor}%`;
    div.style.left = `${x_coor}%`;
    div.addEventListener('click', handleChangeWord);

    // Add the tooltip word definition for div 
    const tooltip = createDiv('div', 'tooltip')
    const word = vocabulary.pop();

    tooltip.setAttribute('word', `${word.word}`);
    tooltip.textContent = `${word.definition}`;
    div.appendChild(tooltip);

    // Actual image inside the div
    const planet = createDiv('img', 'enemy_planet');
    const planetImg = Math.floor(Math.random() * planetNames.length)
    planet.src = `${url}/static/planetGame/images/${planetNames[planetImg]}`;
    planet.alt = 'Planet to crush the earth';
    
    // Save it to the array and append it to DOM
    div.appendChild(planet);
    planets.push(div);

    document.querySelector('.main').appendChild(div);
}

const createDiv = (element, classes) => {
    let el = document.createElement(element);
    el.classList.add(classes);
    return el
}

function generateRandomCoor() {
    let x_coor = Math.floor(Math.random() * 100) 
    let y_coor = 95;

    return {x_coor: x_coor, y_coor: y_coor}
}

function movePlanet() {
    const speed = 0.03; 

    for (let i = 0; i < planets.length; i++) {
        const planet = planets[i];

        const currentLeft = parseFloat(planet.style.left);
        const currentBottom = parseFloat(planet.style.bottom);

        // Calculate the vector toward Earth's center
        const dx = earthCoor.x - currentLeft; 
        const dy = earthCoor.y - currentBottom; 

        const distance = Math.sqrt(dx * dx + dy * dy);

        const moveX = (dx / distance) * speed;
        const moveY = (dy / distance) * speed;

        planet.style.left = `${currentLeft + moveX}%`;
        planet.style.bottom = `${currentBottom + moveY}%`;

        if (distance < 1) {
            // console.log('Planet reached the Earth!');
        }
    }
}

function spawnPlanet() {
    createPlanet();

    let nextInterval = 10000;
    setTimeout(() => {
        spawnPlanet();
    }, nextInterval);
}

function handleChangeWord(event) {
    selectedPlanet = this;

    let suggestedLetters = document.querySelector('.suggested_words');
    suggestedLetters.innerHTML = '';

    let actualWordBox = document.querySelector('.actual_word');
    actualWordBox.innerHTML = '';

    // Change to obj to know which letter has been found
    selectedWord = this.querySelector('div').getAttribute('word');

    // Make the upper actual word boxes (if word has 8 letters make 8 little boxes)
    renderLetterBoxTop(selectedWord, actualWordBox);

    let options = makeThreeOptions(selectedWord[0]);
    expectedLetter = selectedWord[0];
    options = shuffleArray(options);

    renderThreeOptions(suggestedLetters, options);
}

function renderLetterBoxTop(selectedWord, actualWordBox) {
    for (let i = 0; i < selectedWord.length; i++) {
        const div = createDiv('div', 'actual_word_letter');
        actualWordBox.appendChild(div);
    }
}

function renderThreeOptions(suggestedLetters, options) {
    for (let i = 0; i < 3; i++) {
        const div = createDiv('div', 'suggested_letter');
        div.textContent = options[i];
        div.addEventListener('click', checkInLetterCorrect);
        suggestedLetters.appendChild(div);
    }
}

function stringToObj(str) {
    let obj = {};
    for (let i = 0; i < str.length; i++) {
        obj[str[i]] = false;
    }

    return obj
}

function makeThreeOptions(letter) {
    const options = [letter];
    const pool = vowels.includes(letter) ? vowels : consonants;
    // If vowel, give back vowel option and vice versa
    while (options.length < 3) {
        const randomLetter = pool[Math.floor(Math.random() * pool.length)];
        if (!options.includes(randomLetter)) {
            options.push(randomLetter);
        }
    }

    return options
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); 
        [arr[i], arr[j]] = [arr[j], arr[i]];  
    }
    return arr;
}

function checkInLetterCorrect(event) {
    const letter = this.textContent;
    
    if (selectedWord[indexToCheck] !== letter) return;

    document.querySelectorAll('.actual_word_letter')[indexToCheck].textContent = letter;

    if(++indexToCheck === selectedWord.length) {
        resetGameState();
        return
    }

    // Renew the options
    updateSuggestedWords(selectedWord[indexToCheck]);
}

function resetGameState() {
    indexToCheck = 0;
    selectedPlanet.remove();
    
    document.querySelector('.actual_word').innerHTML = '';
    document.querySelector('.suggested_words').innerHTML = '';  
    planetsDestroyed++;

    if (planetsDestroyed === total_planets) {
        document.querySelector('.winner_message').style.display = 'block';
        stopAudio();
    }
}

function updateSuggestedWords(nextLetter) {
    
    const options = shuffleArray(makeThreeOptions(nextLetter));

    const suggestedWordsDiv = document.querySelector('.suggested_words');
    suggestedWordsDiv.innerHTML = '';
    options.forEach(letter => {
        const div = createDiv('div', 'suggested_letter')
        div.textContent = letter;
        div.addEventListener('click', checkInLetterCorrect);
        suggestedWordsDiv.appendChild(div);
    });
}

const audio = new Audio(`${url}/static/planetGame/audio/background.mp3`);

function startAudio() {
    audio.play();
}

function stopAudio() {
    audio.pause();
}

async function getWords() {
    const pathParts = window.location.pathname.split('/');
    const lessonNumber = pathParts[pathParts.length - 2];
    try {
        const response = await fetch(`${url}get_words/`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({
                'lessonNumber': lessonNumber
            })
        });

        if (!response.ok) {
            throw new Error("Network problem");
        }

        const res = await response.json();
        vocabulary = res.words;
        total_planets = res.words.length;

        return res.words;

    } catch (error) {
        console.error("The error: ", error);
        throw error;
    }

}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
// https://youtu.be/_wgDtAzpWd4?si=RvMuIbAHFBkRLCIo