document.querySelector("#push").onclick = function() {
    if (document.querySelector("#newtask input").value.length == 0){
        alert("Please enter a task.")
    }else {
        document.querySelector("#tasks").innerHTML += ` 
        <div class="task">
            <span id="taskname">
                ${document.querySelector("#newtask input").value}
            </span>
            <button class="delete">
                <i>DEL</i>
            </button>
        </div>
        `;
        // use the little thing above the Tab if it's html string within js

        var current_tasks = document.querySelectorAll(".delete");
        for (var i = 0; i < current_tasks.length; i++) {
            current_tasks[i].onclick = function() {
                this.parentNode.remove(); //parentnode is to remove the entire inner html code from the innerhtml. so the entire portion is removed
            }
            // this portion is capturing the position of the task, then ddeleting the task that shoul dbe deleted
        }
    }
}
