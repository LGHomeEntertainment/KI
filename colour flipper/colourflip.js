let colors = ["yellow", "red" , "rgba(133, 122, 200)", "#77ff87ff"];
let btn = document.getElementById("btn");
let color = document.querySelector(".color");

btn.addEventListener("click", function(){
    const randomNumber = getRandomNumber();

    document.body.style.backgroundColor = colors[randomNumber];
    color.textContent = colors[randomNumber]
})



getRandomNumber = () => {
    return Math.floor(Math.random() * colors.length);
}