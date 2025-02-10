/**
 * 
 * @param {string | number} text 
 * @param {HTMLButtonElement} button 
 */
function copyText(text, button) {
    console.log("copied")
    navigator.clipboard.writeText(`${text}`)
        .then(() => {
            setTimeout(() => button.blur(), 10);
            setTimeout(() => button.focus(), 10);
        })
        .catch((error) => {
            console.error(`Could not copy text: ${error}`);
        });
}

/**
 * 
 * @param {string} id 
 */
function copyElement(id) {
    /** @type {HTMLInputElement | HTMLElement | null} */
    const input = document.getElementById(id);
    if (input instanceof HTMLInputElement) {
        input.select();
        navigator.clipboard.writeText(input.value);
    }
}

const Button = {
    copyText: copyText,
    copyElement: copyElement
}

export default Button