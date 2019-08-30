const wcwidth = require('wcwidth');
/* 
When called, this makes a new board object with the given dimensions. 
The object uses only an array instead of a 2d array because it was 
in the specifications of the assignment. 
By default fills the board with null
*/
function generateBoard(rows, cols, fill=null) {
    return {
        data:( Array(rows* cols)).fill(fill),
        rows, 
        cols
    };
}


/*
Takes the row and col for a board, and finds the index that is linked with 
those coordinates.
*/
function rowColToIndex(board, row, col) {
    return (((row) * board.cols) + col);
}

/*
Takes the index for the data in a board, and returns the coordinates associated with it
*/
function indexToRowCol(board, i) {
    const row = Math.floor((i / board.cols));
    const col = i % board.cols ; 
    return { row, col };
}

/* 
Takes a row/col for a board and sets it to a passed in value
*/
function setCell(board, row, col, value) {
    const returnBoard = {data: [...board.data], rows: board.rows, cols : board.cols};
    returnBoard.data[rowColToIndex(returnBoard, row, col)] = value;
    return returnBoard; 
}

/*
Takes an arbitrary number of moves as a parameter in the form: 
    setCells(board, {row: 1, col: 1, value: x}, { row: 1, col: 1, value: x}  ... ) 
and executes all the moves. Returns new board object. 
*/
function setCells(board, ...moves){
    let finalBoard = {data: [...board.data], rows: board.rows, cols: board.cols};
    for (const i of moves) {
        finalBoard = setCell(finalBoard, i.row, i.col, i.val);
    }
    return finalBoard;
}

/*
Returns a string representation of the board. Store parts of a string in an array and then
used reduce to create the final string.
I feel like it could have been done by just doing += to a string, but it was good experience
*/
function boardToString(board){
    // Returns how long the a cell should be
    let longest = 1; // Default expected length of values
    for (let i = 0 ; i < board.data.length; i++) {
        if (wcwidth(board.data[i]) > longest) { longest = wcwidth(board.data[i]);}
    }

    const storageArray = [];
    const celLen = longest + 2;

    for (let i = 0; i < board.data.length; i++) {
        storageArray.push('|');
        if( board.data[i] === null) { storageArray.push(' '.repeat(celLen));}
        else {
            const width = wcwidth(board.data[i]);
            const buffer = ' '.repeat(celLen - (width + 1));
            storageArray.push(' ' + board.data[i] + buffer);
        }
        if ((i + 1) % board.cols === 0) { storageArray.push('|\n'); }

    }

    const dashbuffer = '-'.repeat(celLen);
    storageArray.push('|' + dashbuffer);
    for (let i = 1; i < board.cols ; i++){ 
        storageArray.push('+', dashbuffer);
    }
    storageArray.push('|\n');

    const letterbuffer = ' '.repeat(celLen - 2);
    for (let i = 0; i < board.cols ; i++){ 
        storageArray.push('|' + ' ' + String.fromCharCode(65 + i) + letterbuffer);
    }
    storageArray.push('|');



    return storageArray.reduce(function (pre, next) {
        return pre + next;
    });
}

/*
Takes a letter and returns the column it should correspond to. We were allowed to assume that all input would
be valid.
*/
function letterToCol(letter){
    if (letter.length !== 1 ) { return null; }
    const returnCol = letter.charCodeAt(0) - 65;
    if (returnCol < 0 || returnCol > 25) { return null; }
    return (returnCol);
} 

/*
Returns row of empty cell that is closest to the bottom of the board. Must be in the
column of the letter inputted.
*/
function getEmptyRowCol(board, letter, empty=null) {
    let emptyRow = null;
    const returnCol = letterToCol(letter);
    if (returnCol >= board.cols) { return null; }
    for (let i = returnCol; i < board.data.length; i += board.cols) {
        if (board.data[i] === empty){
            emptyRow = i; 
        } else { break; }
    }
    if (emptyRow !== null) {
        emptyRow = Math.floor(emptyRow / board.cols);
        return {row : emptyRow, col : returnCol };
    }
    return null;
}

/*
Returns an array with the letters of the columns that have a space available in them
*/
function getAvailableColumns(board) {
    const returnArray = [];
    let temp; 
    for (let i = 0; i < board.cols; i++) {
        temp = String.fromCharCode(65 + i);
        if (getEmptyRowCol(board, temp) !== null){
            returnArray.push(temp);
        }
    }
    return returnArray; 
}

/*
Returns a boolean value. True if there are n consecutive values in any direction, including the row,col
passed in, or false if not.
*/
function hasConsecutiveValues(board, row, col, n) {
    /* Returns function that takes in an array of  2 objects of the form {conition, step}
    and will loop through all possible indices reachable based on the condition and step provided.
     */
    function checkCreator(boardData, startIndex, searchVal) {
        return function(directions) {
            let len = 0;
/*eslint-disable*/
            for (let i = startIndex; i >= directions[0].condition; i += directions[0].step) {
/*eslint-enable*/
                if (boardData[i] === searchVal) {
                    len++;
                    if (len === n) { return true; }
                } else { break; }
            }
            for (let i = startIndex + directions[1].step; i < directions[1].condition; i += directions[1].step) {
                if (boardData[i] === searchVal) {
                    // console.log(boardData[i], searchVal, len);
                    len++;
                    if (len === n) { return true;}
                } else { break; }
            }
            return false;
        };
    }

    const startIndex = rowColToIndex(board, row, col);
    const searchVal = board.data[startIndex];
    const check = checkCreator(board.data, startIndex, searchVal);
    // Array of array of two objects.
    const dirs = [
        [// east west
            {condition: (Math.floor(startIndex / board.cols)) * board.cols, step : -1 },
            {condition: ((Math.floor(startIndex / board.cols)) + 1) * board.cols, step : 1 }
        ],
        [// north south
            {condition: 0, step: -board.cols},
            {condition: board.rows * board.cols, step: board.cols},
        ],
        [// northwest southeast
            {condition: 0 , step: -(board.cols + 1) },
            {condition: board.rows * board.cols, step: board.cols + 1 },
        ],
        [// northeast southwest
            {condition: 0 , step: -(board.cols - 1) },
            {condition: board.rows * board.cols, step: board.cols -1},
        ]
    ];
    // Loops through all the direction sets in the array, passing them into check.
    for (const b of dirs){
        if (check(b)) {return true;}
    }
    return false;
}

/*
Takes a string and a win length.
The string will be of the format XOccccc,
where X and O are strings representing player 1 and 2, and c is the column in
which a move will be played.
 */
function autoplay(board, s, numConsecutive) {
    const master = [...s];
    const pieces = [master[0], master[1]];
    let returnBoard = {data: [...board.data], rows: board.rows, cols: board.cols};
    let error, winner, storedRC, currPlayer;
    let turn = true;
    for (let ind = 2; ind < master.length; ind++) {
        currPlayer = turn ? pieces[0] : pieces[1];
        storedRC = getEmptyRowCol(returnBoard, master[ind]);
        if (storedRC === null || winner !== undefined) {
            error = { num: ind - 1, val: currPlayer, col: master[ind]};
            return {board : null,
                pieces,
                lastPieceMoved : currPlayer,
                error
            };
        }

        returnBoard = setCell(returnBoard, storedRC.row, storedRC.col, currPlayer);
        if (hasConsecutiveValues(returnBoard, storedRC.row, storedRC.col, numConsecutive)){
            winner = currPlayer;
        }
        turn = !turn;
    }

    if (winner === undefined) { return {board : returnBoard, pieces, lastPieceMoved: currPlayer };}
    return {
        board : returnBoard,
        pieces,
        lastPieceMoved: currPlayer,
        winner,
    };
}

module.exports = {
    generateBoard : generateBoard,
    rowColToIndex : rowColToIndex,
    indexToRowCol : indexToRowCol,
    setCell : setCell,
    setCells : setCells,
    boardToString : boardToString,
    letterToCol : letterToCol,
    getEmptyRowCol : getEmptyRowCol,
    getAvailableColumns : getAvailableColumns,
    hasConsecutiveValues : hasConsecutiveValues,
    autoplay : autoplay,
};

// const goodbois = ['😂🦄'];
