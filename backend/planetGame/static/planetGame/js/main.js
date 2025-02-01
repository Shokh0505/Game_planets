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
    const inputs = document.querySelectorAll('.game_main_control_item');
    for (let input of inputs) {
        input.classList.remove('move_right');
        input.classList.add('move_left');
    }

    document.querySelector('.game_main_title').textContent = 'Add Word';

    const main_box = document.querySelector('.game_main_control');

    // Add lessons to the main box
    let lessons = []
    let hashMap = new Map();

    for (let i of words) {
        if (!hashMap.has(i.lesson)) {
            lessons.push(i.lesson);
            hashMap.set(i.lesson, true);
        } 
    }

    lessons.sort((a, b) => a - b);

    let motherDiv = document.createElement('div');
    motherDiv.classList.add('lessons_wrapper');

    for (let i = 0; i < lessons.length; i++) {
        const game_div = document.createElement('div');
        game_div.classList.add('game_main_lesson');
        game_div.setAttribute('data-lesson', `${lessons[i]}`);
        game_div.addEventListener('click', handleOpenWords);

        let textDiv = document.createElement('div');
        textDiv.classList.add('game_main_lesson_text');
        textDiv.textContent = `Lesson ${lessons[i]}`;

        let svgDiv = document.createElement('div');
        svgDiv.classList.add('game_main_lesson_svg');
        let svg = document.createElement('img');
        svg.setAttribute("src", "/static/planetGame/images/chevron-down.svg");
        svg.style.color = '#fff';
        svgDiv.appendChild(svg);

        game_div.append(textDiv, svgDiv);
        motherDiv.append(game_div);
    }

    // Add + for adding lessons
    let plusDiv = document.createElement('div');
    plusDiv.classList.add('game_main_lesson');
    plusDiv.addEventListener('click', handleAddNewLesson);
    let plus = document.createElement('img');
    plus.setAttribute("src", "/static/planetGame/images/plus-circle.svg");
    plusDiv.append(plus);
    plusDiv.style.justifyContent = 'center';
    motherDiv.append(plusDiv);
    

    main_box.append(motherDiv);
    // End of adding lessons for the main divs

    // Add the buttons for adding words and go back
    let buttonsDiv = document.createElement('div');
    buttonsDiv.classList.add('game_main_control_buttons');
    let button1 = document.createElement('button');
    button1.innerText = 'Go Back';
    button1.classList.add('go_back');
    button1.setAttribute('data-view', 'lesson');
    button1.addEventListener('click', handleGoBack);

    let button2 = document.createElement('button');
    button2.classList.add('add_word')
    button2.addEventListener('click', handleAddWord);
    button2.innerText = 'Add Word';

    buttonsDiv.append(button1, button2);
    main_box.appendChild(buttonsDiv);
}

/*
    Clears out any opened words list from the DOM and created a new one for selected lesson
*/
function handleOpenWords(event) {
    let leftOverDivs = document.querySelectorAll('.lesson_words');


    for (let item of leftOverDivs) {
        item.previousElementSibling.querySelector('img').setAttribute("src", "/static/planetGame/images/chevron-down.svg");
        item.remove();
    }

    const lessonDiv = event.currentTarget;
    const lessonNumber = lessonDiv.getAttribute('data-lesson');
    const imageSVG = lessonDiv.querySelector('img');
    imageSVG.setAttribute("src", "/static/planetGame/images/chevron-up.svg");


    let wordsOfLesson = words.filter((item) => item.lesson == lessonNumber);
    
    const wrapperDiv = document.createElement('div');
    wrapperDiv.classList.add('lesson_words');

    for (let i = 0; i < wordsOfLesson.length; i++) {
        const mothDiv = document.createElement('div');
        mothDiv.classList.add('lesson_word');

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

        mothDiv.append(textDiv, mothImg);
        wrapperDiv.append(mothDiv);
    }

    lessonDiv.insertAdjacentElement('afterend', wrapperDiv);
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

        const inputs = document.querySelectorAll('.game_main_control_item');

        for (let input of inputs) {
            input.classList.remove('move_left');
            input.classList.add('move_right');
        }
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


/*
    Moves all the lessons to the left and makes a textarea for submitting words;
*/
function handleAddWord(event) {
    // This part is resposible for sending the data to an API if textarea has words to send
    const button = document.querySelector('.add_word');
    let attribute = button.getAttribute('data-view');

    // Making an api call for saving the words
    if (attribute === 'word_add') {
        if (!selectedLesson) {
            alert("No selected lesson")
            return
        }
        
        const text = document.querySelector('.text_area');
        let value = text.value;
        
        if (value.length >= 5000) {
            alert("Insof bilan. Shunchaa so'zni qabul qila olmayman!")
            return
        }

        // Check if one previous lesson has the words. if tries to add lesson 3, 4 and doesn't add words
        // for 3, the result could be 1, 2, 4 lessons after reloading
        let previousLessons = words.filter(item => item.lesson === selectedLesson - 1);
        if (previousLessons.length === 0 && selectedLesson != 1) {
            alert("Oldingi darsda hech qanday so'z yo'q!");
            return
        }



        fetch(`${url}save_words/`, {
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
        .then(response => {
            if (!response.ok) {
                throw new Error('Network was not ok');
            }

            return response.json()
        })
        .then(res => {
            text.value = '';
            getWords();
        })
        .catch(error => {
            console.error('Error with network', error);
        })
        

        return
    }


    // This part is responsible for sliding everything to the left
    let lessonWords = document.querySelector('.lesson_words');
    
    if (lessonWords === null) {
        alert('Please, choose a lesson first!');
        return
    }

    // Change the button attributes for proper handling
    document.querySelector('.go_back').setAttribute('data-view', 'word_add');
    document.querySelector('.add_word').setAttribute('data-view', 'word_add');
    
    let lesson = lessonWords.previousElementSibling;
    lesson = lesson.getAttribute('data-lesson');
    selectedLesson = lesson;


    const lessonsWrapper = document.querySelector('.lessons_wrapper');
    lessonsWrapper.classList.remove('move_right');
    lessonsWrapper.classList.add('move_left');

    const textAreaDiv = document.createElement('div');
    const textArea = document.createElement('textarea');
    textArea.setAttribute('title', 'How are you doing man')
    textArea.setAttribute('placeholder', `Lesson: ${lesson}: \nEach word starts with order number. \n\nWord and defition should be separed by semicolon ":" \n\n1: Word : Definition \n2 Word2 : defintion2 `)
    textArea.classList.add('text_area');
    textAreaDiv.classList.add('text_area_div');
    textAreaDiv.appendChild(textArea);

    let parentButtons = document.querySelector('.game_main_control_buttons');
    parentButtons.insertAdjacentElement('beforebegin', textAreaDiv);
    
    const lessonWordsDiv = document.querySelector('.lesson_words');

    lessonWordsDiv.previousElementSibling.querySelector('img').setAttribute("src", "/static/planetGame/images/chevron-down.svg");
    lessonWordsDiv.remove();
}

/*
    Movel Play, Adding words and Options to left. It lists the available lessons for choosing
*/
function handlePlay(event) {
    const inputs = document.querySelectorAll('.game_main_control_item');
    for (let input of inputs) {
        input.classList.remove('move_right');
        input.classList.add('move_left');
    }

    const main_box = document.querySelector('.game_main_control');

    // Add lessons to the main box
    let lessons = []
    let hashMap = new Map();

    for (let i of words) {
        if (!hashMap.has(i.lesson)) {
            lessons.push(i.lesson);
            hashMap.set(i.lesson, true);
        } 
    }

    lessons.sort((a, b) => a - b);

    let motherDiv = document.createElement('div');
    motherDiv.classList.add('lessons_wrapper');


    for (let i = 0; i < lessons.length; i++) {
        const game_div = document.createElement('div');
        game_div.classList.add('game_main_lesson');
        game_div.setAttribute('data-lesson', `${lessons[i]}`);
        game_div.addEventListener('click', handlePlayChooseLesson);


        let textDiv = document.createElement('div');
        textDiv.classList.add('game_main_lesson_text');
        textDiv.textContent = `Lesson ${lessons[i]}`;
        textDiv.style.padding = '0.4rem 1rem';

        game_div.append(textDiv);
        motherDiv.append(game_div);
    }

    main_box.append(motherDiv);

    // Add the buttons for adding words and go back
    let buttonsDiv = document.createElement('div');
    buttonsDiv.classList.add('game_main_control_buttons');
    let button1 = document.createElement('button');
    button1.innerText = 'Go Back';
    button1.addEventListener('click', goBackPlay)
    button1.classList.add('go_back');

    let button2 = document.createElement('button');
    button2.classList.add('Play')
    button2.innerText = 'PLAY';
    button2.addEventListener('click', letsGo);

    buttonsDiv.append(button1, button2);
    main_box.appendChild(buttonsDiv);
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
    const game_div = document.createElement('div');
    game_div.classList.add('game_main_lesson');
    game_div.setAttribute('data-lesson', `${total_lessons + 1}`);
    game_div.addEventListener('click', handleOpenWords);

    let textDiv = document.createElement('div');
    textDiv.classList.add('game_main_lesson_text');
    textDiv.textContent = `Lesson ${total_lessons + 1}`;

    let svgDiv = document.createElement('div');
    svgDiv.classList.add('game_main_lesson_svg');
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