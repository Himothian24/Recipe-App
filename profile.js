const retriction_input = document.getElementById("Dietary-Restrictons");
const key = "Dietary-Restrictons";

const JsString = localStorage.getItem(key);
const parsed = JSON.parse(JsString);
const StringText = JSON.stringify(parsed);

retriction_input.value = StringText;
console.log(parsed);

var savebutton = document.getElementById("Save-button");

savebutton.addEventListener('click', async () => {
    alert("Saved");
    const retriction = retriction_input.value.trim();
    const stringy = JSON.stringify(retriction);
    localStorage.setItem(key, stringy);

});