document.getElementById("title").style.color = "red";

function changeback() {
  document.getElementById("yoga-image").src =
    "https://i.ibb.co/CzpmKMw/yoga.jpg";
}

function changeimage() {
  document.getElementById("yoga-image").src =
    "https://i.ibb.co/L144X0k/yoga2.jpg";
}

class Student {
  constructor(name, age, race) {
    this.name = name;
    this.age = age;
    this.race = race;
  }
  studentInfo() {
    return "Name: " + this.name + ", Age: " + this.age + ", Race: " + this.race;
  }
}

var ally = new Student("Ally", 35, "Chinese");
var steve = new Student("Steve", 44, "Chinese");
var alfred = new Student("Alfred", 51, "Chinese");

var studentlist = [ally, steve, alfred];
var text = "";

for (let i = 0; i < studentlist.length; i++) {
  text += "<li>" + studentlist[i].studentInfo() + "</li>";
  console.log(studentlist[i])
}

document.getElementById("student").innerHTML = text;
