const c = require('./connectmoji.js');
const readlineSync = require('readline-sync');
const clear = require('clear');

function fixInput(uglyInput){
    const uglyArray = [[], [], [], [], []];
    let x = 0;
    for (const i of uglyInput){
        if (i === ',') {
            x++;
        } else {
            uglyArray[x].push(i);
        }
    }
    const prettyArray = [...uglyArray];
    const player = prettyArray[0][0];
    const computer = prettyArray[1][1];
    const scriptString = prettyArray[1].reduce(function(pre, next){
        return pre + next;
    });
    const rows = Number(prettyArray[2]);
    const cols = Number(prettyArray[3]);
    const numConsecutive = Number(prettyArray[4]);
    return { player, computer, scriptString, rows, cols, numConsecutive};
}


function retrieveRowCol(board, turn) {
    function playerPhase(board){
        let userInput, rowCol;
        const lintAppeaser =true;
        while(lintAppeaser){
            userInput = readlineSync.question('Which column to drop in? ');
            rowCol = c.getEmptyRowCol(board, userInput);
            if (rowCol !== null) {
                return rowCol;
            }
            console.log('Error, please enter a valid column');
        }
    }
    function enemyPhase(board) {
        let randomCol, rowCol;
        const lintAppeaser =true;
        while(lintAppeaser){
            randomCol = Math.floor((Math.random() * board.cols));
            rowCol = c.getEmptyRowCol(board, String.fromCharCode(65 + randomCol));
            if (rowCol !== null) {
                return rowCol;
            }
        }
    }
    return turn ? playerPhase(board) : enemyPhase(board);
}

function configureSettings(){
    const rCC = readlineSync.question('Enter the number of rows, columns, and consecutive pieces for win \n');
    const spltString = rCC.split(',');
    let rows, cols, numConsecutive, player, computer;
    if (spltString[0] === '') {
        rows = 6;
        cols = 7;
        numConsecutive = 4;
    } else {
        rows = Number(spltString[0]);
        cols = Number(spltString[1]);
        numConsecutive = Number(spltString[2]);
    }
    console.log('Using row, col and consecutive', rows, cols, numConsecutive);
    const players = readlineSync.question('Enter two characters that represent the player and computer\n');
    if (players === ''){
        player = '😎';
        computer = '💻';
    } else {
        const splitString2 = players.split(',');
        player = splitString2[0];
        computer = splitString2[1];
    }
    console.log('Using player and computer characters', player, computer);

    const first = readlineSync.question('Who goes first, (P)layer or (C)omputer? \n');
    const turn = first !== 'C';

    console.log(turn ? 'Player' : 'Computer', 'goes first\n');
    return { player, computer, rows, cols, numConsecutive, turn };
}

function play() {
    let game = true;
    let master, board, turn, rowCol, winner;

    if (process.argv[2] === undefined) {
        master = configureSettings();
        board = c.generateBoard(master.rows, master.cols);
        turn = master.turn;
        clear();
    } else {
        master = fixInput(process.argv[2]);
        board = c.generateBoard(master.rows, master.cols);
        const postScriptState = c.autoplay(board, master.scriptString, master.numConsecutive);
        board = postScriptState.board;
        const lastPlayer = postScriptState.lastPieceMoved;
        turn = lastPlayer !== master.player;
        if (postScriptState.winner !== undefined) {
            game = false;
            console.log('The winner is: ', postScriptState.winner);
        } else { winner = postScriptState.winner;}
        if (postScriptState.board === null) {
            console.log('Yikes, you put in a bad string.\n');
        }

    }
    readlineSync.question('Press <ENTER> to start game');
    console.log(c.boardToString(board));
// Account for full board
    while (game) {
        rowCol = retrieveRowCol(board, turn);
        if (!turn) {
            readlineSync.question('Press <ENTER> to see computer move');
        }
        clear();
        board = c.setCell(board, rowCol.row, rowCol.col, turn ? master.player : master.computer);
        game = !c.hasConsecutiveValues(board, rowCol.row, rowCol.col, master.numConsecutive);
        if (game === false) { winner = turn ? master.player : master.computer;}
        console.log('...dropping in column ', rowCol.col);
        console.log(c.boardToString(board));
        turn = !turn;
        if (c.getAvailableColumns(board).length === 0){ game = false; }

    }

    if (winner !== undefined) {
        console.log('The winner is: ', winner);
    } else {
        console.log('No winner. So sad 😭');
    }
}

play();



