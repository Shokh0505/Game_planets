export const createDiv = (element, classes) => {
    let el = document.createElement(element);
    el.classList.add(classes);
    return el
}
