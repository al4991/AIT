function createElement(type, traits={}, ...child) {
    const newElement = document.createElement(type);
    if (traits['class']) {
        for (const i of traits['class'].split(' ')) {
            newElement.classList.add(i);
        }
    }
    if (traits['id']) {
        newElement.id = traits['id'];
    }
    if (traits['type']) {
        newElement.type = traits['type'];
    }
    if (traits['value']) {
        newElement.value = traits['value'];
    }
    if (child) {
        for (const i of child) {
            if (typeof i === 'string') {
                newElement.appendChild(document.createTextNode(i));
            } else {newElement.appendChild(i);}
        }
    }
    return newElement;
}

function handleModalButton() {
    let modal = document.querySelectorAll('.modal');
    if (this.parentElement.nodeName === 'MAIN') {
        modal[0].classList.toggle('open');
    } else {
        modal[1].classList.toggle('open');
        modal[1].firstChild.nextSibling.lastChild.value = this.id;
    }
}

function handleCloseButton() {
    this.parentElement.parentElement.classList.toggle('open');
}

function handlePostQuestion() {
    let question = document.querySelector("#question-text").value;
    fetch('./questions', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body:JSON.stringify({
            "title": question
        }),
    })
        .then(response => {
            return response.json();
        })
        .then(response => {
            if (response["error"]) {
                console.log(response["error"]);
            } else {
                this.parentElement.parentElement.classList.toggle('open');
                setListeners();
            }
        })
}

function handlePostAnswer() {
    let questionId = this.parentNode.lastChild["value"];
    let newAnswer = document.querySelector('#answer-text').value;
    fetch(`./questions/${questionId}/answers`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body:JSON.stringify({
            "answer": newAnswer
        }),
    }) .then(response => {
        return response.json();
    })
        .then(response => {
            if (response["error"]) {
                console.log(response["error"]);
            } else {
                this.parentElement.parentElement.classList.toggle('open');
                setListeners();
            }
        })
}

function fetchAndUpdate() {
    let addedButtons = fetch('./questions/')
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            const dbData = response;
            const mainElement = document.querySelector('main');
            const addedButtons = [];

            while (mainElement.children.length > 1) {
                mainElement.removeChild(mainElement.lastChild);
            }

            for (let i = 0; i < dbData.length; i++) {
                const breakTag = document.createElement('br');
                const answers = [];
                const newBtn = createElement("input", {"type": "button", "value": "Add an answer", "id" : dbData[i]["_id"]});
                addedButtons.push(newBtn);
                for (let j = 0 ; j < dbData[i]["answers"].length; j++) {
                    answers.push(createElement('li', {}, dbData[i]['answers'][j]));
                }
                mainElement.appendChild(createElement('div', {}, dbData[i]['question'],
                    createElement('ul', {}, ...answers), newBtn));
                mainElement.appendChild(breakTag)
            }
            return addedButtons;
        });
    return new Promise(resolve => resolve(addedButtons));
}

async function setListeners() {
    let addedButtons = await fetchAndUpdate();
    const buttons = [document.querySelector('input[type="button"]'), ...addedButtons];
    const closeButtons = document.querySelectorAll('.close');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', handleModalButton);
    }
    for (let i = 0; i < closeButtons.length; i++) {
        closeButtons[i].addEventListener('click', handleCloseButton);
    }
    document.querySelector('#create-question').addEventListener('click', handlePostQuestion);
    document.querySelector('#create-answer').addEventListener('click', handlePostAnswer);
}

function main() {
    setListeners();
}

document.addEventListener("DOMContentLoaded", main);
