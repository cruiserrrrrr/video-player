"use stric";
const inputElement = document.getElementById("inputSearch");
const buttonElement = document.getElementById("buttonSearch");
new Kinobox('.kinobox_player', { search: { query: !!inputElement.value ? inputElement.value : "Титаник" } }).init()
console.log(!!inputElement.value)
buttonElement.addEventListener("click", function (event) {
    event.preventDefault();
    var inputValue = inputElement.value;
    new Kinobox('.kinobox_player', { search: { query: !!inputValue ? inputValue : "Титаник" } }).init()
});