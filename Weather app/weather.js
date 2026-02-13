const form = document.querySelector(".top-banner form")
const input = document.querySelector(".top-banner input")
const msg = document.querySelector(".top-banner .msg");
const list = document.querySelector(".result-section .cities")

const apiKey = "b291291082d8b5d9f742dfe5c91440d5";

form.addEventListener("submit", event => {
    event.preventDefault();
    let inputVal = input.value;

const url = `https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=metric`;
// use the ` and the ${} in js to do dynamic retrievals

let xhttp = new XMLHttpRequest(); // SOP for API retrieval

xhttp.open("GET", url, true); // true is standard
xhttp.responseType = "json"; // retrieve the json data
xhttp.send(); // fire the API

xhttp.onload = function(){ 
    if (xhttp.status === 200) {
        try{
            let responseObj = xhttp.response;
            console.log(responseObj);
            if (responseObj.cod != 200) { // cod = status (eg 404 / 200 / 500 (server down))
                throw responseObj;
            } 

            const li = document.createElement("li");
            li.classList.add("city");
            const markup = `
            <h2 class="city-name" data-name="${responseObj.sys.country}">
            <span>${responseObj.name}</span>
            <sup>${responseObj.sys.country}</sup>
            </h2>
            <div class="city-temp">${Math.round(responseObj.main.temp)}<sup>°C</sup></div>
            `;
            li.innerHTML = markup;
            list.appendChild(li);

        } catch (err) {
            // document.getElementById("errMsg").innerHTML = err.message // if want to show end user the error msg
            console.log(err);

        }
    }
}
})


