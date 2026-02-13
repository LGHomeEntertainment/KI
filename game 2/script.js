const canvas = document.getElementById("game")
const context = canvas.getContext("2d")

const startScreen = document.getElementById("start-screen")
const gameoverScreen = document.getElementById("gameover-screen")
const viewscoresScreen = document.getElementById("viewscores-screen")

const startButton = document.getElementById("start-button")
const gamestartButton = document.getElementById("gamestart-button")
const viewscoresButton = document.getElementById("viewscores-button")
const gameoverviewscoresButton = document.getElementById("gameover-viewscores-button")
const restartButton = document.getElementById("restart-button")
const saveButton = document.getElementById("save-button")
const closescoresButton = document.getElementById("closescores-button")
const score = document.getElementById("distTravelled")

const minTunnelWidth = 400
const maxTunnelWidth = canvas.width
const minHeight = 10
const maxHeight = 100

const obstacleWidth = 65
const obstacleHeight = 100

// Challenge adjustment
const initialMoveSpeed = 4 // Starting speed
let moveSpeed = initialMoveSpeed
const maxMoveSpeed = 15 // Maximum speed
const speedIncrement = 0.5 // Amount to increase speed by every threshold
let distanceThreshold = 200 // Initial distance to trigger speed increase

// downward acceleration
const gravity = 0.45

let spacePressed = false
let distTravelled = 0
let gameOver = false

// clamp a number between min and max values
function clamp(num, min, max) {
  return Math.min(Math.max(min, num), max)
}

// return a random integer between min (inclusive) and max (inclusive)
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const helicopter = {
  x: 150,
  y: 100,
  width: 100,
  height: 60,
  dy: 0, // velocity
  ddy: 0, // acceleration
}

function drawHelicopter(ctx, helicopter) {
  // Body (Rounded Rectangle)
  ctx.fillStyle = "blue"
  ctx.beginPath()
  ctx.moveTo(helicopter.x + 10, helicopter.y) // Top-left corner
  ctx.lineTo(helicopter.x + helicopter.width - 10, helicopter.y) // Top edge
  ctx.arc(
    helicopter.x + helicopter.width - 10,
    helicopter.y + 10,
    10,
    -Math.PI / 2,
    0,
  ) // Top-right corner
  ctx.lineTo(
    helicopter.x + helicopter.width,
    helicopter.y + helicopter.height - 10,
  ) // Right edge
  ctx.arc(
    helicopter.x + helicopter.width - 10,
    helicopter.y + helicopter.height - 10,
    10,
    0,
    Math.PI / 2,
  ) // Bottom-right corner
  ctx.lineTo(helicopter.x + 10, helicopter.y + helicopter.height) // Bottom edge
  ctx.arc(
    helicopter.x + 10,
    helicopter.y + helicopter.height - 10,
    10,
    Math.PI / 2,
    Math.PI,
  ) // Bottom-left corner
  ctx.lineTo(helicopter.x, helicopter.y + 10) // Left edge
  ctx.arc(helicopter.x + 10, helicopter.y + 10, 10, Math.PI, -Math.PI / 2) // Top-left corner
  ctx.closePath()
  ctx.fill()

  // Cockpit (Quarter Circle at Top-Right)
  ctx.fillStyle = "lightblue"
  ctx.beginPath()
  // Draw the cockpit as a quarter circle in the top-right corner, covering the blue body
  ctx.arc(
    helicopter.x + helicopter.width - 10, // X position (top-right corner)
    helicopter.y + 10, // Y position (top of the body)
    10, // Radius matching the corner radius
    -Math.PI / 2, // Start angle (12 o'clock)
    0, // End angle (3 o'clock)
  )
  // Close the arc with lines going downwards and to the right, hiding the rest of the body in that corner
  ctx.lineTo(helicopter.x + helicopter.width, helicopter.y)
  ctx.lineTo(helicopter.x + helicopter.width - 10, helicopter.y) // Base of the arc
  ctx.closePath()
  ctx.fill()

  // Tail
  ctx.fillStyle = "blue"
  ctx.fillRect(helicopter.x - 30, helicopter.y + 20, 30, 10)

  // Tail Rotor
  ctx.fillStyle = "gray"
  ctx.beginPath()
  ctx.moveTo(helicopter.x - 30, helicopter.y + 25)
  ctx.lineTo(helicopter.x - 45, helicopter.y + 20)
  ctx.lineTo(helicopter.x - 45, helicopter.y + 30)
  ctx.closePath()
  ctx.fill()

  // Top Rotor
  ctx.fillStyle = "gray"
  ctx.fillRect(helicopter.x + 20, helicopter.y - 10, 70, 6)
}

let tunnels = [
  {
    x: 0,
    width: canvas.width,
    start: 50,
    end: 50,
  },
  {
    x: canvas.width,
    width: randInt(minTunnelWidth, maxTunnelWidth),
    start: 50,
    end: randInt(minHeight, maxHeight),
  },
]

let obstacles = [
  {
    x: canvas.width,
    y: canvas.height / 2,
  },
  {
    x: canvas.width * 2,
    y: canvas.height / 2,
  },
]

const wallColor = "green"
context.fillStyle = wallColor
context.fillRect(0, 0, 1, 1)

const wallData = context.getImageData(0, 0, 1, 1)
const [wallRed, wallGreen, wallBlue] = wallData.data

let rAF
function loop() {
  rAF = requestAnimationFrame(loop)
  context.clearRect(0, 0, canvas.width, canvas.height)

  if (spacePressed) {
    helicopter.ddy = -0.7
  } else {
    helicopter.ddy = 0
  }

  helicopter.dy += helicopter.ddy + gravity
  helicopter.dy = clamp(helicopter.dy, -8, 8)
  helicopter.y += helicopter.dy

  // Update the game display (distance traveled)
  updateGame()

  drawHelicopter(context, helicopter)

  context.fillStyle = "green"
  tunnels.forEach((tunnel, index) => {
    tunnel.x -= moveSpeed

    if (
      index === tunnels.length - 1 &&
      tunnel.x + tunnel.width <= canvas.width
    ) {
      tunnels.push({
        x: tunnel.x + tunnel.width,
        width: randInt(minTunnelWidth, maxTunnelWidth),
        start: tunnel.end,
        end: randInt(minHeight, maxHeight),
      })
    }

    context.beginPath()
    context.moveTo(tunnel.x, 0)
    context.lineTo(tunnel.x, tunnel.start)
    context.lineTo(tunnel.x + tunnel.width, tunnel.end)
    context.lineTo(tunnel.x + tunnel.width, 0)
    context.closePath()
    context.fill()

    context.beginPath()
    context.moveTo(tunnel.x, canvas.height)
    context.lineTo(tunnel.x, tunnel.start + 450)
    context.lineTo(tunnel.x + tunnel.width, tunnel.end + 450)
    context.lineTo(tunnel.x + tunnel.width, canvas.height)
    context.closePath()
    context.fill()
  })

  obstacles.forEach((obstacle, index) => {
    obstacle.x -= moveSpeed
    context.fillRect(obstacle.x, obstacle.y, obstacleWidth, obstacleHeight)

    if (
      index === obstacles.length - 1 &&
      obstacle.x + obstacleWidth <= canvas.width
    ) {
      obstacles.push({
        x: canvas.width * 2,
        y: randInt(
          maxHeight + 50,
          canvas.height - obstacleHeight - maxHeight - 50,
        ),
      })
    }
  })

  tunnels = tunnels.filter((tunnel) => tunnel.x + tunnel.width > 0)
  obstacles = obstacles.filter((obstacle) => obstacle.x + obstacleWidth > 0)

  const { data } = context.getImageData(
    helicopter.x,
    helicopter.y,
    helicopter.width,
    helicopter.height,
  )

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    if (r === wallRed && g === wallGreen && b === wallBlue) {
      context.strokeStyle = "red"
      context.setLineDash([5, 15])
      context.lineWidth = 4

      context.beginPath()
      context.arc(
        helicopter.x + helicopter.width / 2,
        helicopter.y + helicopter.height / 2,
        helicopter.width,
        0,
        2 * Math.PI,
      )
      context.stroke()

      cancelAnimationFrame(rAF)
      gameOver = true

      // Delay showing the game over screen
      setTimeout(() => {
        gameoverScreen.style.display = "block" // Show the game over screen
        canvas.style.filter = "blur(10px)" // Add blur effect
      }, 500) // Delay of 500ms	}
    }
  }
}

function resetGame() {
  moveSpeed = initialMoveSpeed // Reset moveSpeed
  distanceThreshold = 200 // Reset distance threshold
  distTravelled = 0  // Reset distance
  score.textContent = distTravelled
  spacePressed = false // Reset the spacePressed variable to avoid unexpected upward movement
  gameOver = false // Reset game

  // Reset the helicopter position and velocity
  helicopter.x = 150
  helicopter.y = 100
  helicopter.dy = 0
  helicopter.ddy = 0

  // Reset tunnels
  tunnels = [
    {
      x: 0,
      width: canvas.width,
      start: 50,
      end: 50,
    },
    {
      x: canvas.width,
      width: randInt(minTunnelWidth, maxTunnelWidth),
      start: 50,
      end: randInt(minHeight, maxHeight),
    },
  ]

  // Reset obstacles
  obstacles = [
    {
      x: canvas.width,
      y: canvas.height / 2,
    },
    {
      x: canvas.width * 2,
      y: canvas.height / 2,
    },
  ]

  // Reset the canvas display and hide gameover screen
  canvas.style.filter = "none" // Remove blur effect
  canvas.style.display = "block" // Show the canvas
  gameoverScreen.style.display = "none" // Hide the game over screen

  // Start the game loop
  rAF = requestAnimationFrame(loop)
}

function updateGame() {
  if (gameOver) return // Stop updating if the game is over

  // Increment the distance traveled
  distTravelled += moveSpeed / 1000 // Increment based on speed
  const roundedDistance = Math.floor(distTravelled)

 // Check if distance threshold has been reached
  if (distTravelled >= distanceThreshold) {
    moveSpeed = Math.min(moveSpeed + speedIncrement, maxMoveSpeed) // Increase speed
    distanceThreshold += 200 // Set next threshold
  }

  // Update the score span dynamically
  score.textContent = roundedDistance

  // Draw the distance on the canvas
  context.fillStyle = "white" // Text color
  context.font = "24px Arial" // Font style
  context.fillText("Distance: " + roundedDistance + " m", 20, 30) // Canvas text
 // context.fillText("Speed: " + moveSpeed.toFixed(2), 20, 60) // Show current speed

  // Continue updating
  requestAnimationFrame(updateGame)
}

// Start the game when the start button is clicked
startButton.addEventListener("click", function () {
  resetGame() // Reset the game state
  startScreen.style.display = "none" // Hide the start screen
  viewscoresScreen.style.display = "none"; // Hide the high scores screen
  canvas.style.display = "block" // Show the game canvas
})

// Start the game when the start button is clicked (highscore)
gamestartButton.addEventListener("click", function () {
  resetGame() // Reset the game state
  startScreen.style.display = "none" // Hide the start screen
  viewscoresScreen.style.display = "none"; // Hide the high scores screen
  canvas.style.display = "block" // Show the game canvas
})

// Restart game
// Start the game when the start button is clicked
restartButton.addEventListener("click", function () {
  resetGame() // Reset the game state
  startScreen.style.display = "none" // Hide the start screen
  canvas.style.display = "block" // Show the game canvas
})

// Close highscores when the button is clicked
closescoresButton.addEventListener("click", function () {
  startScreen.style.display = "block" // Show the start screen
  viewscoresScreen.style.display = "none" // Hide the scores
})

// Update the `displayHighScores` function to properly populate the list
function displayHighScores() {
  const highScoresList = document.getElementById("highscores-list");
  highScoresList.innerHTML = ""; // Clear the list

  highScores.sort((a, b) => b.score - a.score); // Sort by score descending

 highScores.forEach((entry) => {
                const scoreItem = document.createElement("li");
                scoreItem.textContent = `${entry.name}: ${entry.score} meters`;
                highScoresList.appendChild(scoreItem);
            });
}

// Common function for showing high scores
function showHighScoresScreen() {
  startScreen.style.display = "none" // Hide the start screen
  gameoverScreen.style.display = "none" // Hide the game over screen
  viewscoresScreen.style.display = "block" // Show the high scores page
  displayHighScores();
}

  // Array to hold the high score data (name, email, score)
        let highScores = [
            { name: 'Alice', score: 200, email: 'alice@example.com' },
            { name: 'Bob', score: 150, email: 'bob@example.com' },
            { name: 'Charlie', score: 100, email: 'charlie@example.com' },
        ];

// Add event listener for saving the high score
saveButton.addEventListener("click", function () {
  // Get the player's name from the input field
  const playerName = document.getElementById("playerName").value.trim();
  const playerEmail = document.getElementById("playerEmail").value.trim();

 // Validate player name and email
  if (!playerName) {
    alert("Please enter your name!");
    return;
  }
  if (!playerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(playerEmail)) {
    alert("Please enter a valid email!");
    return;
  }

  // Save the high score
  saveHighScore(playerName, Math.floor(distTravelled), playerEmail);

 // Clear input fields after saving
  document.getElementById("playerName").value = "";
  document.getElementById("playerEmail").value = "";


  // Hide game over screen and show high scores
  gameoverScreen.style.display = "none";
  showHighScoresScreen();
});



// Function to save the current score
function saveHighScore(name, score, email) {
  // Add the new score to the highScores array
  highScores.push({ name, score, email });

  // Sort high scores in descending order
  highScores.sort((a, b) => b.score - a.score);

  // Keep only the top 10 high scores (you can adjust the number as needed)
  if (highScores.length > 10) {
    highScores = highScores.slice(0, 10);
  }

  // Update the display
  displayHighScores();
}

    // Handle form submission to save the score
        document.getElementById("scoreForm").addEventListener("submit", function(event) {
            event.preventDefault();

            // Get the player data from the form inputs
            const name = document.getElementById("playerName").value;
            const email = document.getElementById("playerEmail").value;

            // Get the current score directly from the "distanceTraveled" span
            const score = parseInt(document.getElementById("distTravelled").textContent, 10);

            // Save the player score and data
            saveHighScore(name, email, score);

            // Clear the form inputs
            document.getElementById("playerName").value = "";
            document.getElementById("playerEmail").value = "";
        });



// Event listeners for both screens
viewscoresButton.addEventListener("click", showHighScoresScreen) // Start screen
gameoverviewscoresButton.addEventListener("click", showHighScoresScreen) // Game over screen

// listen to touch events to move the helicopter
canvas.addEventListener("touchstart", () => (spacePressed = true))
canvas.addEventListener("touchend", () => (spacePressed = false))

// listen to mouse events to move the helicopter
canvas.addEventListener("mousedown", () => (spacePressed = true))
canvas.addEventListener("mouseup", () => (spacePressed = false))
