import create from "./createElement.js";

const listId = ('' + window.location.href).split('/')[4];
let generatedHeader = false;

function handleModalButton(){
    let modal = document.querySelectorAll('.modal');
    modal[0].classList.toggle('open');
}

function handleCloseButton() {
    document.querySelector('#invalidLink').classList.add('hidden');
    document.querySelector('.add-song-name').value = '';
    document.querySelector('.add-song-link').value = '';
    this.parentElement.parentElement.parentElement.classList.toggle('open');
}

function handleDeleteSong() {
    fetch('./../deleteSong',{
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

function testString(str, cb) {
    if (cb(str)) {
        return `http://www.youtube.com/embed/${str.split('=')[1]}`;
    } else {
        return 'invalid'
    }
}


function handleAddSong() {
    function formatLink(link) {
        return testString(link, (str => /^(http(s)??:\/\/)?(www\.)?(youtube\.com\/watch\?v=)([a-zA-Z0-9\-_]+)/.test(str)
            // I adapted this regular expression from an answer I found on StackOverflow.
            // link is: https://stackoverflow.com/questions/19377262/regex-for-youtube-url
        ));
    }

    const name = document.querySelector('.add-song-name').value;
    const link = formatLink(document.querySelector('.add-song-link').value);

    if (link === 'invalid') {
        document.querySelector('#invalidLink').classList.toggle('hidden')
    }
    else {
        fetch('./../addSong', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "name": name,
                "link": link,
                "parent": listId
            })
        }).then(response => {
            return response.json();
        }).then(response => {
            if (response["err"]) console.log(response["err"]);
            else {
                this.parentElement.parentElement.parentElement.classList.toggle('open');
                document.querySelector('.add-song-name').value = "";
                document.querySelector('.add-song-link').value = "";
                document.querySelector('#invalidLink').classList.add('hidden');
                fetchDetails();
            }
        });
    }
}

function clearMain() {
    let mainContent = document.querySelector("main");
    while (mainContent.children.length > 0) {
        mainContent.removeChild(mainContent.lastChild);
    }
}

function fetchDetails() {
    fetch(`./../fetchListDetails/${listId}`)
        .then(function (response) {
            return response.json();
        })
        .then(function(response) {
            if (!generatedHeader){
                let mainPageBlock = document.querySelector('.main-page-block');
                const addSongButton = create('input', {'type':'button', 'id': 'add-new-song', 'value':'+'})
                addSongButton.addEventListener('click', handleModalButton);
                mainPageBlock.insertBefore(
                    create('h2', {},
                        response['lists']['name'] + '  ',
                        addSongButton
                    ), mainPageBlock.firstChild
                );
                generatedHeader = true;
            }
            clearMain();

            const songElems = response['songs'].map(song => {
                const newBtn = create("input", {"type":"button", "value": "-"});
                const newDiv =  create('div', {'class': 'songDiv', 'id': song['_id']}, song['name'], newBtn);
                newDiv.innerHTML += `<br><br><div><iframe width="100%" height="300px" src="${song['link']}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen><iframe> </div>`;
                return newDiv
            });
            return songElems
         })
        .then(function(response) {
            let mainContent = document.querySelector("main");
            response.forEach(elem => {
                elem.firstElementChild.addEventListener('click', handleDeleteSong);
                mainContent.appendChild(elem);
            });
        })
}

function main() {
    const modalCancelButton = document.querySelector('.cancel-song');
    const modalAddButton = document.querySelector('.add-song');
    modalCancelButton.addEventListener('click', handleCloseButton);
    modalAddButton.addEventListener('click', handleAddSong);

    fetchDetails();
}

document.addEventListener("DOMContentLoaded", main);
