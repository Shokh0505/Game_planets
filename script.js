// Todo for tomorrow. make planets with different words come to the earth

let planets = []
const earthCoor = {
    x: 50,
    y: 6
}

const vocabulary = [
    { word: "car", definition: "mashina" },
    { word: "man", definition: "erkak kishi" },
    { word: "hello", definition: "salom" },
];
const vowels = ['a', 'e', 'i', 'o', 'u'];
const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];

let vocabCopy = vocabulary;
let selectedWord = '';
let selectedPlanet = null;
let expectedLetter = null;
let indexToCheck = 0;

document.addEventListener('DOMContentLoaded', () => {
    gameLoop(); 
    spawnPlanet();
    startAudio();
})

function gameLoop() {
    requestAnimationFrame(gameLoop);
    movePlanet();
}

function createPlanet() {
    if (vocabCopy.length === 0) {
        return
    }

    // Parent div for the image
    const div = document.createElement('div')
    div.classList.add('planet-container');
    let position = generateRandomCoor();
    div.style.bottom = `${position.y_coor}%`;
    div.style.left = `${position.x_coor}%`;
    div.addEventListener('click', handleChangeWord);

    // Add the tooltip word definition for div 
    const tooltip = document.createElement('div');
    const word = vocabCopy.pop();
    tooltip.setAttribute('word', `${word.word}`);
    tooltip.classList.add('tooltip');
    tooltip.textContent = `${word.definition}`;
    div.appendChild(tooltip);

    // Actual image inside the div
    const planet = document.createElement('img');
    planet.src = './images/planet1.png';
    planet.alt = 'Planet to crush the earth';
    planet.classList.add('enemy_planet');
    
    // Save it to the array and append it to DOM
    div.appendChild(planet);
    planets.push(div);

    document.querySelector('.main').appendChild(div);
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
            console.log('Planet reached the Earth!');
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
    for (let i = 0; i < selectedWord.length; i++) {
        const div = document.createElement('div');
        div.classList.add('actual_word_letter');
        actualWordBox.appendChild(div);
    }


    let options = makeThreeOptions(selectedWord[0]);
    expectedLetter = selectedWord[0];
    options = shuffleArray(options);

    for (let i = 0; i < 3; i++) {
        const div = document.createElement('div');
        div.classList.add('suggested_letter');
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
    const options = []
    options.push(letter);
    // If vowel, give back vowel option and vice versa
    if (vowels.includes(letter)) {
        while (options.length != 3) {
            let indexRandom = Math.floor(Math.random() * vowels.length);

            if (!options.includes(vowels[indexRandom])) {
                options.push(vowels[indexRandom]);
            }
        }
    }
    else {
        while (options.length != 3) {
            let indexRandom = Math.floor(Math.random() * consonants.length);

            if (!options.includes(consonants[indexRandom])) {
                options.push(consonants[indexRandom]);
            }
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
    

    
    if (selectedWord[indexToCheck] === letter) {
        const actualWordsDiv = document.querySelector('.actual_word');
        const divs = actualWordsDiv.querySelectorAll('.actual_word_letter');
        divs[indexToCheck].textContent = letter;
    }
    else {
        return
    }
    
    if(indexToCheck + 1 === selectedWord.length) {
        indexToCheck = 0;
        selectedPlanet.remove();
        document.querySelector('.actual_word').innerHTML = '';
        document.querySelector('.suggested_words').innerHTML = '';  
        
        // Game is over
        if (vocabCopy.length === 0) {
            let winner_div = document.querySelector('.winner_message');
            winner_div.style.display = 'block';
        }
        return
    }

    // Renew the options

    let options = makeThreeOptions(selectedWord[indexToCheck + 1]);
    options = shuffleArray(options);
    
    let suggestedWordsDiv = document.querySelector('.suggested_words');    
    suggestedWordsDiv.innerHTML = '';
    


    for (let i = 0; i < 3; i++) {
        const div = document.createElement('div');
        div.classList.add('suggested_letter');
        div.textContent = options[i];
        div.addEventListener('click', checkInLetterCorrect);
        suggestedWordsDiv.appendChild(div);
    }

    indexToCheck += 1;
}


function startAudio() {
    const audio = new Audio('./audio/background.mp3');
    audio.play();
}

// https://youtu.be/_wgDtAzpWd4?si=RvMuIbAHFBkRLCIo