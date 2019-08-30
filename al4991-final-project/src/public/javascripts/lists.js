import create from './createElement.js'

function handleDeleteList(evt) {
    evt.stopPropagation();
    fetch('./deleteList',{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "id": this.parentElement.id
        })
    }) .then(response => {
        return response.json();
    }) .then(response => {
        if (response["err"]) console.log(response["err"]);
        else {
            main();
        }
    })
}

function handleModalButton(){
    let modal = document.querySelectorAll('.modal');
    modal[0].classList.toggle('open');
}

function handleAddList(){
    const newListTitle = document.querySelector('.add-list-title').value;
    fetch('./addList', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "name": newListTitle
        })
    }) .then(response => {
        return response.json();
    }) .then(response => {
        if (response["err"]) console.log(response["err"]);
        else {
            this.parentElement.parentElement.parentElement.classList.toggle('open');
            document.querySelector('.add-list-title').value = "";
            main();
        }
    })
}

function handleCloseButton() {
    document.querySelector('.add-list-title').value = "";
    this.parentElement.parentElement.parentElement.classList.toggle('open');
}

function handleListRedirect() {
    window.location.href = `./list/${this.id}`
}

function setModalListeners() {
    const addListButton = document.querySelector("#add-new-list");
    addListButton.addEventListener('click', handleModalButton);
    const closeButtons = document.querySelectorAll(".cancel-list");
    for (let i = 0; i < closeButtons.length; i++) {
        closeButtons[i].addEventListener('click', handleCloseButton);
    }
    const submitButton = document.querySelector('.add-list');
    submitButton.addEventListener('click', handleAddList)
}

function updatePage(){
    let mainContent = document.querySelector("main");
    fetch('./fetchLists')
        .then(function(response) {
            return response.json();
        })
        .then(function(response){
            while (mainContent.children.length > 0) {
                mainContent.removeChild(mainContent.lastChild);
            }
            return response.map(elem => {
                const brTag = document.createElement('br');
                const newBtn = create("input", {"type":"button", "value": "-"});
                mainContent.appendChild(create('div', {'class': 'playlistDiv', "id" : elem["_id"]},
                    elem['name'], newBtn));
                mainContent.appendChild(brTag);
                return newBtn;
            });
        }).then(function(response) {
            const divs = document.querySelectorAll('.playlistDiv');
            for (let i = 0; i < divs.length; i++) {
                divs[i].addEventListener('click', handleListRedirect)
            }
            for (let i = 0; i < response.length; i++) {
                response[i].addEventListener('click', handleDeleteList);
            }
        });
}

function main() {
    setModalListeners();
    updatePage();
}

document.addEventListener("DOMContentLoaded", main);