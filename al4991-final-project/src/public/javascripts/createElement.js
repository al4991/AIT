export default function createElement(type, traits={}, ...child) {
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
};

