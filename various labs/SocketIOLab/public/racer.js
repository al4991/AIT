const socket = io();

function handleButtonClick1() {
    socket.emit('1');
}
function handleButtonClick2() {
    socket.emit('2');
}


function main() {
    const btn1 = document.querySelector('.player1Btn');
    const btn2 = document.querySelector('.player2Btn');
    btn1.addEventListener('click', handleButtonClick1);
    btn2.addEventListener('click', handleButtonClick2);
    const player1 = document.querySelector('.player1');
    const player2 = document.querySelector('.player2');

    socket.on('rendered', (data) => {
        player1.style.left = data.x1 + 'px';
        player2.style.left = data.x2 + 'px';
    })
    socket.on('victory', (data) => {
        document.body.innerHTML = `<h1> Player ${data} wins </h1>` + document.body.innerHTML

    })

}

document.addEventListener("DOMContentLoaded", main);