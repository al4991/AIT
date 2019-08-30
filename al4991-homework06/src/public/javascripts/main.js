function validInput(docData) {
    function validPresets(presets) {
        const tracker = presets.split(',')
            .reduce((acc, curr) => {
                if (acc.hasOwnProperty(curr)) {
                    acc[curr] += 1;
                } else {
                    acc[curr] = 1;
                }
                return acc;
            }, {});
        for (const i of Object.values(tracker)) {
            if (i % 2 !== 0) {
                return false;
            }
        }
        return true;
    }
    if (docData[2]['value'].length !== 0){
        return (docData[0]['value'] % 2 === 0 &&
                docData[0]['value'] <= 36 &&
                docData[1]['value'] >= docData[0]['value'] / 2 &&
                validPresets(docData[2]['value']));
    } else {
        return (docData[0]['value'] % 2 === 0 &&
                docData[0]['value'] <= 36 &&
                docData[1]['value'] >= docData[0]['value'] / 2);
    }
}

function createElement(type, traits={}, ...child) {
    const newElement = document.createElement(type);
    if (traits['class']) {
        for (const i of traits['class'].split(' ')) {
            newElement.classList.add(i);
        }
    }
    // Add in a check to see if class or id exists and add if they, dont if they dont
    if (child) {
        for (const i of child) {
            if (typeof i === 'string') {
                newElement.appendChild(document.createTextNode(i));
            } else {newElement.appendChild(i);}
        }
    }
    return newElement;
}

function cardHandler() {
    this.classList.remove('text-invisible');
    this.classList.add('clicked');
    this.removeEventListener('click', cardHandler);
}

function afterTwo(maxTurns) {
    let turnCount = 0;
    return function () {
        const buttons = document.querySelectorAll('.clicked');
        const allOther = document.querySelectorAll('.text-invisible');
        document.body.removeChild(document.body.lastChild);
        if (buttons.length === 2) {

            for (const i of allOther) {
                i.removeEventListener('click', cardHandler);
            }

            const match = buttons[0]['textContent'] === buttons[1]['textContent'];
            const prefix = match ? '': 'No';

            const confirm = createElement('input', {});
            confirm.type = 'submit';
            confirm.value = 'OK';


            buttons[0].classList.remove('clicked');
            buttons[1].classList.remove('clicked');

            if (match) {
                buttons[0].classList.add('correct');
                buttons[1].classList.add('correct');
            }

            confirm.addEventListener('click', function () {
                turnCount += 1;
                const tds = document.querySelectorAll('td');
                for (const i of tds) {
                    if (!i.classList.contains('correct')) {
                        i.addEventListener('click', cardHandler);
                        i.classList.add('text-invisible');
                    }
                }
                document.querySelector('.game').removeChild(document.querySelector('.moveResult'));
                document.querySelector('.turns').textContent = `${turnCount}/${maxTurns} turns`;

                const correct = document.querySelectorAll('.correct');
                let win = false;
                if (correct && correct.length === tds.length) {
                    win = true;
                }

                if (win || turnCount === maxTurns) {
                    const gameDiv = document.querySelector('.game');
                    const endGame = createElement('input', {});
                    endGame.type = 'submit';
                    endGame.value = 'End';
                    endGame.addEventListener('click', function() {
                        while (gameDiv.hasChildNodes()) {
                            gameDiv.removeChild(gameDiv.lastChild);
                        }
                        document.querySelector('.start').classList.remove('not-visible');
                    });

                    document.body.removeChild(document.body.lastChild);
                    while (gameDiv.hasChildNodes()) {
                        gameDiv.removeChild(gameDiv.lastChild);
                    }
                    const dispText = win ? 'You win' : 'You lose';
                    gameDiv.appendChild(createElement('h1', {}, dispText));
                    gameDiv.appendChild(endGame);
                }
            });

            const result = createElement('div', {'class': 'moveResult'});
            result.appendChild(createElement('p', {}, `${prefix} Match`));
            result.appendChild(confirm);
            document.querySelector('.game').appendChild(result);
        }
    };
}

function quit() {
    const gameDiv = document.querySelector('.game');
    while (gameDiv.hasChildNodes()) {
        gameDiv.removeChild(gameDiv.firstChild);
    }
    document.body.removeChild(this);
    document.querySelector('.start').classList.remove('not-visible');
}

function createGameBoard(gameDiv, cards, chars, maxTurns) {
    function calcCols(max) {
        let numCols = Math.ceil(Math.sqrt(max));
        while (numCols < cards) {
            if ((max/numCols) % 1 === 0) {
                return numCols;
            }
            numCols -= 1;
        }
    }

    const cols = Math.sqrt(cards) % 1 === 0 ? Math.sqrt(cards) : calcCols(cards);
    const rows = cards / cols;

    const gameBoard = createElement('table', {});
    for (let i = 0; i < rows; i++) {
        const newRow = createElement('tr');
        for (let j = 0; j < cols; j++) {
            const newChild = createElement('td', {class: 'text-invisible'}, chars[(i * cols) + j]);
            newChild.addEventListener('click', cardHandler);
            newRow.appendChild(newChild);
        }
        gameBoard.appendChild(newRow);
    }
    gameBoard.addEventListener('click', afterTwo(maxTurns));
    gameDiv.appendChild(gameBoard);
}

function generateRandom(len) {
    const ascii = [];
    for (let i = 0; i < len/2; i++) {
        ascii.push(Math.floor(Math.random() * 94
        ) + 33);
    }
    ascii.push(...ascii);
    // Adapting the Durstenfield shuffle algorithm I found online
    for (let i = len - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ascii[i], ascii[j]] = [ascii[j], ascii[i]];
    }

    return String.fromCharCode(...ascii);
}

function main() {
    document.querySelector('.play-btn').addEventListener('click', function() {
        const docData = document.getElementsByTagName("input");
        if (validInput(docData)) {
            document.querySelector('.start').classList.add('not-visible');
            document.querySelector('.error-message').classList.remove('visible');

            const gameDiv = document.querySelector('.game');
            const symbols = docData[2]['value'] ?
                docData[2]['value'].split(',').join('') : generateRandom(Number(docData[0]['value']));
            const quitBtn = createElement('input', {}, 'Quit');
            const turnCount = createElement('div', {'class': 'turns'}, `0/${docData[1]['value']} Turns`);

            gameDiv.appendChild(turnCount);
            createGameBoard(gameDiv, docData[0]['value'], symbols, Number(docData[1]['value']));
            gameDiv.classList.add('visible');
            quitBtn.type = 'submit';
            quitBtn.value = 'Quit';
            quitBtn.addEventListener('click', quit);
            document.body.appendChild(quitBtn);

        } else {
            document.querySelector('.error-message').classList.add('visible');
        }
    });
}

document.addEventListener('DOMContentLoaded', main);
