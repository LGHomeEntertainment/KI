let count = 0;

const value = document.querySelector("#value");
const btns = document.querySelectorAll(".btn"); //in htmml is single. so btn. so now want to group everything into a group of btns

// # = ID
// . = class


btns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
        const styles = e.currentTarget.classList;
        if (styles.contains("decrease")) {
            count--;
        } else if (styles.contains("increase")) {
            count++;
        } else {
            count = 0;
        }

        if (count > 0) {
            value.style.color = "green";
        }

        value.textContent = count
    });
}); // each button waiting to listen

