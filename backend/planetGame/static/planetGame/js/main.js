let words = []
let total_lessons = 0;
const url = 'http://127.0.0.1:8000/';
let selectedLesson = undefined;

window.addEventListener('DOMContentLoaded', () => {
    const shepDivlar = document.querySelectorAll('.game_main_control_item');
    let addWord = shepDivlar[1];
    addWord.addEventListener('click', handleAddingWordDiv);

    let play = shepDivlar[0];
    play.addEventListener('click', handlePlay);

    let options = shepDivlar[2];
    options.addEventListener('click', handleOptions);

    getWords();
})

/*
    Determines the number of lessons and add them to the DOM with 'Go back' and 'Add Word' buttons
*/
function handleAddingWordDiv() {
    moveDivsLeft('game_main_control_item');
    document.querySelector('.game_main_title').textContent = 'Add Word';
    
    // Add lessons to the main box
    let lessons = determineLessonNum();

    let lessonsWrapper = createDiv('div', 'lessons_wrapper');
    renderLessons(lessons, lessonsWrapper);
    lessonsWrapper.append(createPlus());

    // End of adding lessons for the main divs

    // Add the buttons for adding words and go back
    const mainBox = document.querySelector('.game_main_control');
    mainBox.append(lessonsWrapper, addButtons())
}

function moveDivsLeft(classes) {
    const inputs = document.querySelectorAll(`.${classes}`);
    for (let input of inputs) {
        input.classList.remove('move_right');
        input.classList.add('move_left');
    }
}

function determineLessonNum() {
    return [...new Set(words.map(word => word.lesson))].sort((a, b) => a - b)
}

function createDiv(element, classes) {
    let el = document.createElement(element);
    el.classList.add(classes);
    return el
}

function renderLessons(lessons, motherDiv) {
    lessons_len = lessons.length;

    for (let i = 0; i < lessons_len; i++) {
        const game_div = createDiv('div', 'game_main_lesson');
        game_div.setAttribute('data-lesson', `${lessons[i]}`);
        game_div.addEventListener('click', handleOpenWords);

        let textDiv = createDiv('div', 'game_main_lesson_text');
        textDiv.textContent = `Lesson ${lessons[i]}`;

        let svgDiv = createDiv('div', 'game_main_lesson_svg');
        let svg = document.createElement('img');
        svg.setAttribute("src", "/static/planetGame/images/chevron-down.svg");
        svg.style.color = '#fff';
        svgDiv.appendChild(svg);

        game_div.append(textDiv, svgDiv);
        motherDiv.append(game_div);
    }
}

function addButtons() {
    let buttonsDiv = createDiv('div', 'game_main_control_buttons')
    let button1 = createDiv('button', 'go_back');
    button1.innerText = 'Go Back';
    button1.setAttribute('data-view', 'lesson');
    button1.addEventListener('click', handleGoBack);

    let button2 = createDiv('button', 'add_word');
    button2.addEventListener('click', handleAddWord);
    button2.innerText = 'Add Word';

    buttonsDiv.append(button1, button2);
    return buttonsDiv
}

function createPlus() {
    let plusDiv = createDiv('div', 'game_main_lesson');
    plusDiv.addEventListener('click', handleAddNewLesson);
    
    let plus = document.createElement('img');
    plus.setAttribute("src", "/static/planetGame/images/plus-circle.svg");
    plusDiv.append(plus);
    plusDiv.style.justifyContent = 'center';
    
    return plusDiv
}

/*
    Clears out any opened words list from the DOM and created a new one for selected lesson
*/
function handleOpenWords(event) {
    clearLeftOver();

    const lessonDiv = event.currentTarget;
    const lessonNumber = lessonDiv.getAttribute('data-lesson');
    const imageSVG = lessonDiv.querySelector('img');
    imageSVG.setAttribute("src", "/static/planetGame/images/chevron-up.svg");

    // get the words for this particular lesson
    let wordsOfLesson = words.filter((item) => item.lesson == lessonNumber);
    
    const wrapperDiv = createDiv('div', 'lesson_words');
    renderLessonWords(wrapperDiv, wordsOfLesson.length, wordsOfLesson); 
    
    lessonDiv.insertAdjacentElement('afterend', wrapperDiv);
}

function clearLeftOver() {
    let leftOverDivs = document.querySelectorAll('.lesson_words');

    for (let item of leftOverDivs) {
        item.previousElementSibling.querySelector('img').setAttribute("src", "/static/planetGame/images/chevron-down.svg");
        item.remove();
    }
}

function renderLessonWords(wrapperDiv, length, wordsOfLesson) {
    for (let i = 0; i < length; i++) {
        const wrapper = createDiv('div', 'lesson_word');
        
        const textDiv = document.createElement('div');
        const text = document.createElement('div');
        text.textContent = `${i + 1}. ${wordsOfLesson[i].word} - ${wordsOfLesson[i].definition}`;
        textDiv.append(text);

        const mothImg = document.createElement('div');
        mothImg.setAttribute("data-id", `${wordsOfLesson[i].id}`);
        const delImg = document.createElement('img');
        delImg.setAttribute("src", "/static/planetGame/images/trash-2.svg");
        delImg.addEventListener('click', handleDeleteWord);
        mothImg.appendChild(delImg)

        wrapper.append(textDiv, mothImg);
        wrapperDiv.append(wrapper);
    }
}

/*
    Moves back to previous state. 
    If adding word, it goes back to lessons.
    If seeing lesson, it goes back to default landing page
*/
function handleGoBack(event) {
    let button = event.currentTarget;
    let attribute = button.getAttribute('data-view');

    if (attribute === 'lesson') {
        let wrapper = document.querySelector('.lessons_wrapper');
        wrapper.innerHTML = '';

        wrapper.remove();
        document.querySelector('.game_main_control_buttons').remove();
        document.querySelector('.game_main_title').innerText = 'Save The Earth';

        moveDivsRight('game_main_control_item');
    }
    else if (attribute === 'word_add') {
        document.querySelector('.text_area_div').remove();

        const lessonWrapper = document.querySelector('.lessons_wrapper');
        lessonWrapper.classList.remove('move_left');
        lessonWrapper.classList.add('move_right');

        button.setAttribute('data-view', 'lesson');
        document.querySelector('.add_word').setAttribute('data-view', 'lesson');
        
    }
}

function moveDivsRight(classes) {
    const inputs = document.querySelectorAll(`.${classes}`);

    for (let input of inputs) {
        input.classList.remove('move_left');
        input.classList.add('move_right');
    }
}

/*
    Moves all the lessons to the left and makes a textarea for submitting words;
*/
function handleAddWord(event) {
    // Send the data to an API if textarea has words to send
    const button = document.querySelector('.add_word');
    let attribute = button.getAttribute('data-view');

    // Making an api call for saving the words
    if (attribute === 'word_add') {
        if (!selectedLesson) {
            alert("No selected lesson")
            return
        }
        
        const value = document.querySelector('.text_area').value;

        if (!checkBeforeAdding(value)) {
            return
        }

        save_words(value);

        return
    }


    // Slide everything to the left
    let lesson = setSelectedLesson();
    if (!lesson) {
        return
    }

    // Change the button attributes for proper handling
    document.querySelector('.go_back').setAttribute('data-view', 'word_add');
    document.querySelector('.add_word').setAttribute('data-view', 'word_add');
    
    moveDivsLeft('lessons_wrapper');

    const textAreaDiv = createTextArea(lesson);

    let parentButtons = document.querySelector('.game_main_control_buttons');
    parentButtons.insertAdjacentElement('beforebegin', textAreaDiv);
    
    const lessonWordsDiv = document.querySelector('.lesson_words');
    lessonWordsDiv.previousElementSibling.querySelector('img').setAttribute("src", "/static/planetGame/images/chevron-down.svg");
    lessonWordsDiv.remove();
}

function checkBeforeAdding(value) {
    if (value.length >= 5000) {
        alert("Insof bilan. Shunchaa so'zni qabul qila olmayman!")
        return false
    }

    /* 
        Check if one previous lesson has the words. if tries to add lesson 3, 4 and doesn't add words
        for 3, the result could be 1, 2, 4 lessons after reloading
    */
    let previousLessons = words.filter(item => item.lesson === selectedLesson - 1);
    if (previousLessons.length === 0 && selectedLesson != 1) {
        alert("Oldingi darsda hech qanday so'z yo'q!");
        return false
    }

    return true
}

async function save_words(value) {
    try {
        const res = await fetch(`${url}save_words/`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({
                'lessonNumber': selectedLesson,
                'words': value
            }),
        })

        if (!res.ok) {
            throw new Error('Problem with saving the word');
        }

        document.querySelector('.text_area').value = '';
        getWords();
    } catch (error) {
        console.error(error);
    }
}

function setSelectedLesson() {
    let lessonWords = document.querySelector('.lesson_words');
    
    if (lessonWords === null) {
        alert('Please, choose a lesson first!');
        return
    }

    let lesson = lessonWords.previousElementSibling;
    lesson = lesson.getAttribute('data-lesson');
    selectedLesson = lesson;

    return lesson
}

function createTextArea(lesson) {
    const textAreaDiv = createDiv('div', 'text_area_div')
    const textArea = createDiv('textarea', 'text_area');
    textArea.setAttribute('title', 'How are you doing man')
    textArea.setAttribute('placeholder', `Lesson: ${lesson}: \nEach word starts with order number. \n\nWord and defition should be separed by semicolon ":" \n\n1: Word : Definition \n2 Word2 : defintion2 `)
    textAreaDiv.appendChild(textArea);

    return textAreaDiv
}

/*
    Movel Play, Adding words and Options to left. It lists the available lessons for choosing
*/
function handlePlay(event) {
    moveDivsLeft('game_main_control_item');

    const main_box = document.querySelector('.game_main_control');

    // Add lessons to the main box
    let lessons = determineLessonNum();
    let lessonWrapper = createDiv('div', 'lessons_wrapper');

    renderLessonsPlay(lessonWrapper, lessons);    

    main_box.append(lessonWrapper);

    let buttonsDiv = renderButtonsPlay();
    main_box.appendChild(buttonsDiv);
}

function renderLessonsPlay(lessonsWrapper, lessons) {
    for (let i = 0; i < lessons.length; i++) {
        const game_div = createDiv('div', 'game_main_lesson')
        game_div.setAttribute('data-lesson', `${lessons[i]}`);
        game_div.addEventListener('click', handlePlayChooseLesson);

        let textDiv = createDiv('div', 'game_main_lesson_text')
        textDiv.textContent = `Lesson ${lessons[i]}`;
        textDiv.style.padding = '0.4rem 1rem';

        game_div.append(textDiv);
        lessonsWrapper.append(game_div);
    }
}

function renderButtonsPlay() {
    let buttonsDiv = createDiv('div', 'game_main_control_buttons')
    let button1 = createDiv('button', 'go_back')
    button1.innerText = 'Go Back';
    button1.addEventListener('click', goBackPlay)

    let button2 = createDiv('button', 'Play');
    button2.innerText = 'PLAY';
    button2.addEventListener('click', letsGo);

    buttonsDiv.append(button1, button2);
    return buttonsDiv
}

// The name of the function is itself document, dude
function handlePlayChooseLesson(event) {
    let selected = document.querySelector('.selected');
    if (selected !== null) {
        selected.classList.remove('selected');
    }

    event.currentTarget.classList.add('selected');
}

// O'sha gap
function goBackPlay(event) {
    document.querySelector('.game_main_control_buttons').remove();
    document.querySelector('.lessons_wrapper').remove();

    const inputs = document.querySelectorAll('.game_main_control_item');
    for (let input of inputs) {
        input.classList.remove('move_left');
        input.classList.add('move_right');
    }
}

// Tepadagi gap
function letsGo(event) {
    let selected = document.querySelector('.selected');
    let lessonNumber = selected.getAttribute("data-lesson");

    if (selected === null) {
        alert("Mavzu tanlang, birodar!");
    }
    else {
        window.location.href = `/play/${lessonNumber}`;
    }

}

function handleOptions(event) {
    alert("Birodari aziz, hali qilishga ulgurmadim! \nBoshqa funksiyalarini tekshirib turing buni keyin qilib qo'yaman :)")
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

function handleAddNewLesson(event) {
    const game_div = createDiv('div', 'game_main_lesson');
    game_div.setAttribute('data-lesson', `${total_lessons + 1}`);
    game_div.addEventListener('click', handleOpenWords);

    let textDiv = createDiv('div', 'game_main_lesson_text')
    textDiv.textContent = `Lesson ${total_lessons + 1}`;

    let svgDiv = createDiv('div', 'game_main_lesson_svg');
    let svg = document.createElement('img');
    svg.setAttribute("src", "/static/planetGame/images/chevron-down.svg");
    svg.style.color = '#fff';
    svgDiv.appendChild(svg);

    total_lessons++;
    game_div.append(textDiv, svgDiv);
    event.currentTarget.insertAdjacentElement('beforebegin', game_div);
}

function getWords() {
    // Get the words
    fetch(`${url}get_words/`, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network was not ok');
        }

        return response.json()
    })
    .then(res => {
        words = res.words;
        total_lessons = res.total_lessons;
    })
    .catch(error => {
        console.error('Error with network', error);
    })
}

function handleDeleteWord(event) {
    let img = event.currentTarget;
    id = img.parentElement.getAttribute("data-id")

    fetch(`${url}delete_word/`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify(id),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network was not ok');
        }

        return response.json()
    })
    .then(res => {
        img.parentElement.parentElement.remove();
    })
    .catch(error => {
        console.error('Error with network', error);
    })
}