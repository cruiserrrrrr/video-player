const inputElement = document.getElementById("inputSearch");
const buttonElement = document.getElementById("buttonSearch");

const savedValue = localStorage.getItem("inputValue");
if (savedValue) {
    inputElement.value = savedValue;
}

new Kinobox('.kinobox_player', { search: { query: savedValue || "Титаник" } }).init();

buttonElement.addEventListener("click", function (event) {
    event.preventDefault();
    var inputValue = inputElement.value;

    localStorage.setItem("inputValue", inputValue);

    new Kinobox('.kinobox_player', { search: { query: inputValue } }).init();
});