// // function myFunction() {
// //     document.getElementById('demo2').innerHTML = "See my Javascript"
// // }

// // document.writeln("Hellow from script.js") // will always put it at the bottom.

// // function alertFunction() {
// //     alert("HOOT~!")
// // }

// // console.log("Hello!")

// // // let = fixed values. block scope. use it if it's always fixed so that it cannot be changed later on. 
// // // var = for variables


// // let day = "It\'s a sunny day";
// // console.log(day);

// // let hey = 'she said \"Hello\"';
// // console.log(hey);

// // var txt = "Hello world";
// // var result = txt.length;
// // console.log(result); // used to check if number of characters are enough for password etc

// // var str = "Please locate where 'locate' occurs";
// // var pos = str.indexOf("locate");
// // console.log(pos); // eg for checking the email the. "@" so if @ does not exist, then can reject and ask for actual email etc.

// // var fruit = "Apple, Banana, Kiwi";
// // var part = fruit.slice(7, 13);
// // console.log(part);

// // var str2 = "Please visit Microsoft";
// // var newStr = str2.replace("Microsoft", "ABC");
// // console.log(newStr)
// // // eg to replace generic USER as actual user name after logging in

// // var text1 = "meow";
// // var text2 = text1.toUpperCase();
// // console.log(text2);

// //// array can print in console log but not appear in the page. until you toString it 


// // var fruit2 = ["Banana", "Apple", "Kiwi", "Orange", "Pineapple", "Mango"]
// // var fruit3 = ["grape", "durian"]



// // document.getElementById("demo4").innerHTML = fruit2.join(fruit3);
// // //  ends up with array 0 + fruit 3, array 1 + fruit 3
// // console.log(fruit2.pop()) // shows what is removed
// // console.log(fruit2) // shows what's left in the array

// // console.log(fruit2.push("watermelon")); // add at the end
// // console.log(fruit2);

// // fruit2.shift(); //remove in front
// // console.log(fruit2);

// // fruit2.unshift("lemon"); //add in front
// // console.log(fruit2);

// // fruit2[0] = "Peach";
// // console.log(fruit2); //replaces the one at the array number

// // fruit2.splice(2,0,"Lime","Cherry"); // 2 add at position 2, 0 is remove number of elements next
// // console.log(fruit2);


// // console.log(fruit2.concat(fruit3));

// // var remove = fruit2.slice(1,3) // start taking from [1], stop before[3]
// // console.log(remove)

// // console.log(fruit2.sort()); //alphabetical
// // // pricing/best seller etc


// // console.log(Date());

// // //booleans used for checks. only true or false

// // var person = {
// //     firstName: "John", 
// //     lastName:"MEOW", 
// //     age: 50, 
// //     phone: 12345678
// // }; //object/class : key + value (value will always be dynamic)

// // var welcome = ("Welcome " + person.firstName + " " + person.lastName);

// // document.getElementById("demo5").innerHTML = welcome

// var person2 = {
//     name: "Ally",
//     height: 160
// };
// var allyHeight = (person2.name + "\'s height is " + person2.height + "cm.");
// document.getElementById("demo6").innerHTML = allyHeight;




// // Math

// console.log(Math.min(0, 150, 30, 20, -8, -200));
// console.log(Math.max(0, 150, 30, 20, -8, -200));
// console.log(Math.random()); // between 0 and 1
// console.log(Math.round(4.7));
// console.log(Math.ceil(4.4)); // like round up
// console.log(Math.floor(4.7)); // like round down
// console.log(Math.sqrt(64));
// console.log(Math.abs(-4.7));
// console.log(Math.pow(4, 3));
// console.log(Math.sin());
// console.log(Math.PI);
// console.log(Math.E);

// var area = Math.PI * Math.pow(5, 2);
// console.log(area);

// var dice = Math.floor(Math.random() * 6) + 1;
// console.log(dice);

// // if (dice == 1) {
// //     console.log("You rolled a 1")
// // } else if (dice == 2) {
// //     console.log("you rolled a 2")
// // } else {
// //     console.log("You win!")
// // }

// switch (dice) {
//     case 1: // depends on the result. if it's based on fruits, then is case lemon or strawberry
//         console.log("You rolled a 1");
//         break;
//     case 2:
//         console.log("you rolled a 2");
//         break;
//     default:
//         console.log("You win!")
// }


let dates = moment()
console.log(dates.format('MMMM DD YYYY'))

function showTime() {
    let time = new Date();
    let hour = time.getHours();
    let min = time.getMinutes();
    let sec = time.getSeconds();
    let session = "AM";

    if (hour > 12) {
        hour -= 12;
        session = "PM";
    } else {
        session = "PM"
    }
    if (hour == 0) {
        hour = 12;
        session = "AM"
    }

    hour = (hour < 10) ? "0" + hour : hour; // ternary operator: if hour less than 0, then after the ? is add a 0 if true, else just show hour
    min = (min < 10) ? "0" + min : min;
    sec = (sec < 10) ? "0" + sec : sec;

    let timeNow = hour + ":" + min + ":" + sec + " " + session;
    document.getElementById("clock").innerHTML = timeNow
}

setInterval(showTime, 1000);
showTime();

var dice2 = Math.floor((Math.random() * 6) + 1);


// if (dice2 == 1){
//     console.log("Rolled odd")
// }
// if (dice2 == 2){
//     console.log("Rolled even")
// }
// if (dice2 == 3){
//     console.log("Rolled odd")
// }
// if (dice2 == 4){
//     console.log("Rolled even")
// }
// if (dice2 == 5){
//     console.log("Rolled odd")
// }
// if (dice2 == 6){
//     console.log("Rolled even")
// }

console.log(dice2);
if (dice2 % 2 == 0) { // modular - if any number can divide by 2 = 0 then is even number
    console.log("Rolled even");
} else {
    console.log("Rolled odd");
};

var text = "";
var i;
for (i = 0; i < 5; i++) {
    text += "the number is " + i + "<br>";
}
document.getElementById("demo7").innerHTML = text;


var cars = ["BMW", "Volvo", "Saab", "Ford"]
var text2 = "";
for (i = 0; i < cars.length; i++) {
    text2 += cars[i] + "<br>";
}
document.getElementById("demo8").innerHTML = text2

var txt = "";
var person = { fname: "John", lname: "Doe", age: 25 };
var p;
for (p in person) {
    txt += person[p] + " ";
}
document.getElementById("demo9").innerHTML = txt


var num = "";
var n = 0;
// while (n < 5) {
//     num += 
//     n++;
// }
// document.getElementById("demo10").innerHTML = num

//while can be for strings/integers
//for is only for integers

// do {
//     num += "the number is " + n + "<br>";
//     n++;
// }
// while (n < 5);
// document.getElementById("demo10").innerHTML = num


var exercise = "";
var j;
for (var j = 0; j < 10; j++) {
    if (j == 5) {
        continue // skips that number. can also work for strings
    }
    if (j == 8) {
        break
    }
    exercise += "Number is " + j + "<br>";
}
document.getElementById("demo11").innerHTML = exercise



// Functions
function myFunction(a, b) { //can put generic number in a and b so that it still runs and doesn't crash
    return a * b
}

console.log(myFunction(2, 4))


function myArea(r) {
    let area = Math.PI * Math.pow(r, 2) // can also do return area directly without the let
    return area
}
console.log(myArea(5))


var people = {
    firstName: "John",
    lastName: "Doe",
    id: 5566,
    fullName: function () {
        return this.firstName + " " + this.lastName; //applicable for objects, tells the code it's referring to this people class
    }
};
console.log(people.fullName())


// arrow function 
var hello = function () {
    return "hello world";
}
var hello = () => {
    return "hello world";
}
// these two are the same 
var hello = (a = 1, b = 2) => {
    return a * b;
}

// local scope used within the own function. global can be used by everyone

// let and const is similar. use let
var image = document.getElementById("merlion");
image.onclick = () => {
    alert("this is a merlion");
};


//DOM

// alert(document.getElementsByClassName("intro").innerHTML = "Hello Hello"); // 1

// var getAlert = document.getElementsByClassName("intro").innerHTML = "Hello Hello"
// alert(getAlert) // 2 

// tag names are p / b / h1 h2 etc

document.getElementById("change").innerHTML = "MEOWWWW"


var image2 = document.getElementById("merlion2");
image2.onclick = () => {
    document.getElementById("merlion2").src = "https://cdn.pixabay.com/photo/2024/05/26/10/15/bird-8788491_1280.jpg";
};



function changeText(id) {
    id.innerHTML = "Ooops!";
}

function errFunction() {
    var message, x; // declares 2 variables at one go
    message = document.getElementById("demo14")
    message.innerHTML = "";

    x = document.getElementById("demo15").value;

    console.log(x)
    try {
        if (x == "") throw "empty";
        if (isNaN(x)) throw "is not a number";

        x = Number(x);
        if (x < 5) throw "Too low";
        if (x > 10) throw "too high";

    } catch (err) {
        message.innerHTML = "input is " + err;
    }
}

class Rect {
    constructor(length, width) {
        this.length = length
        this.width = width;
    }
    area() {
        let totalArea = this.length * this.width
        return totalArea;
    }
}

// var r1 = new Rect(5, 5);
// console.log(r1.area());
// var r2 = new Rect(9, 5);
// console.log(r2.area());
// var r3 = new Rect(5, 6);
// console.log(r3.area()); // uses the class Rect as a blueprint to create again

class Square extends Rect {
    constructor(length) {
        super(length, length);
    }
}

let square1 = new Square(5);
console.log(square1.area());

// class Car{
//     constructor(brand){
//         this.brand = brand;
//     }
//     carBrand(){
// return ("My car is " + this.brand);
//     }
// }

// let myCar = new Car("Toyota");
// console.log(myCar.carBrand())



class Car {
    constructor(brand) {
        this.carName = brand;
    }
    carBrand() {
        return "I have a " + this.carName;
    }
}

class Model extends Car {
    constructor(brand, mod) {
        super(brand) // use super to link to the bigger class
        this.model = mod;
    }

    show() {
        return this.carBrand() + ", it is a " + this.model
    }
}

let myVroom = new Model("Ford", "Mustang");
console.log(myVroom.show()) // for development, easier and tidier if lesser code

// ternary operator used for eye in passwords. to see or not to see




// API IMPT~~
// Create Request Update Delete
//Get = retrieve, the post = calculations or send to front, put/patch is update DB. del is just del. 
// del - hard delete (data gone forever) vs soft delete (deactivate the acc cuz may want to retrieve it later. put "delflag" to flag the inactive)


var newJson = `{"name":"John","age":30,"country":"Singapore"}`
var newObj = JSON.parse(newJson)
localStorage.setItem("Person", JSON.stringify(newObj))
let item = JSON.parse (localStorage.getItem("Person"))
console.log("print JSON", item)

document.getElementById("demo").style.color = "red"