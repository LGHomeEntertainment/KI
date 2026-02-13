class Animal {
  constructor(color, leg) {
    this.color = color;
    this.leg = leg;
  }

  info() {
    document.writeln(
      "This " + this.color + " animal has " + this.leg + " legs"
    );
  }
}

var a = new Animal("white", 4);
// a.info();
// console.log(a.info())

class Cat extends Animal {
  constructor(color) {
    super(color, 4);
  }
  sound() {
    document.writeln("meow meow meow");
  }
}

var cat1 = new Cat("black");
cat1.sound();


var x = function (a, b = 3) {
  return a * b;
};
var z = x(5);
console.log(z)