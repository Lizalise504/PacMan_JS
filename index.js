
var canvas = document.querySelector("canvas");
var context = canvas.getContext("2d");
var scoreEl = document.querySelector(".num");
var outcome = document.querySelector(".condition h1");

// console.log(context);
canvas.width = innerWidth;
canvas.height = innerHeight;

// this is creating the pacman world, boundary is the walls
class Boundary{
    static width = 40           //creating boundary width for the block
    static height = 40           //creating boundary height for the block
    constructor({position}){
        this.position = position
        this.width = 40
        this.height = 40
    }
    // draw function determines how the Boundry is going to look like
    draw(){
        context.strokeStyle = "blue"
        context.strokeRect(this.position.x, this.position.y, this.width, this.height)
    }
}

// creating pacman
class Player {
    constructor({position, velocity}){
        this.position = position        //we going to have a dynamic position
        this.velocity = velocity        //we need to make him move
        this.radius = 15
        this.radians = 0.75
        this.openRate = 0.12
        this.rotation = 0
    }
    draw(){
        context.save()
        context.translate(this.position.x, this.position.y)
        context.rotate(this.rotation)
        context.translate(-this.position.x, -this.position.y)
        context.beginPath()
        context.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians)
        context.lineTo(this.position.x, this.position.y)
        context.fillStyle = "yellow"
        context.fill()
        context.closePath()
        context.restore()
    }

    update(){       //determines how pacman should move when we call a function and for each frame we loop through
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        if (this.radians < 0 || this.radians > 0.75){
            this.openRate = -this.openRate
        } 
        this.radians += this.openRate
    }
}

// Creating Ghost
class Ghost {
    static speed = 2;
    constructor({position, velocity, color = "red"}){
        this.position = position        //we going to have a dynamic position
        this.velocity = velocity        //we need to make him move
        this.radius = 15
        this.color = color
        this.prevCollisions = []
        this.speed = 2;
        this.scared = false;
    }
    draw(){
        context.beginPath()
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.scared ? "blue" :this.color
        context.fill();
        context.closePath();
    }

    update(){                   //determines how ghost should move when we call a function and for each frame we loop through
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}
// creating pillets
class Pellet {
    constructor({position}){
        this.position = position        //we going to have a dynamic position
        this.radius = 4
    }
    draw(){
        context.beginPath()
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        context.fillStyle = "yellow"
        context.fill()
        context.closePath()
    }
}
// creating powerup
class PowerUp {
    constructor({position}){
        this.position = position        //we going to have a dynamic position
        this.radius = 10
    }
    draw(){
        context.beginPath()
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        context.fillStyle = "white"
        context.fill()
        context.closePath()
    }
}



var map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,2,1,1,1,2,1,2,1,2,1],
    [1,2,1,2,2,2,2,2,1,2,1,2,1],
    [1,2,2,2,1,1,2,1,1,2,1,2,1],
    [1,2,1,2,2,2,2,2,2,2,1,2,1],
    [1,2,1,2,1,1,2,1,1,2,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,2,1,3,1,2,1],
    [1,2,2,2,2,3,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1]
];

var pellets = [];
var boundries = [];
var powerUps = [];
var player = new Player({
    position: {
        x: Boundary.width + Boundary.width / 2,
        y: Boundary.height + Boundary.height / 2
    },
    velocity: {
        x: 0,               // x and y properties set to zero so that pacman doesnt move yet
        y: 0
    }
})
var ghosts = [new Ghost({
    position: {
        x: Boundary.width * 6 + Boundary.width / 2,
        y: Boundary.height + Boundary.height / 2
    },
    velocity: {
        x: Ghost.speed,               // x and y properties set to zero so that ghost doesnt move yet
        y: 0
    }
}),
new Ghost({
    position: {
        x: Boundary.width * 6 + Boundary.width / 2,
        y: Boundary.height * 3 + Boundary.height / 2
    },
    velocity: {
        x: Ghost.speed,               // x and y properties set to zero so that ghost doesnt move yet
        y: 0
    },
    color: "pink"
})
]
var keys = {
    w: {
        pressed: false
    },
    s: {
        pressed: false
    },
    a: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

var lastKey = "";                   //helps with changing direction if two keys are pressed at once
var score = 0;
map.forEach((row, i) => {
    row.forEach((number, j) => {
        switch (number) {
            case 1:
                boundries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    }
                })
                )
                break;
            case 2:
                pellets.push(new Pellet({
                    position: {
                        x: j * Boundary.width + Boundary.width / 2,
                        y: i * Boundary.height + Boundary.height / 2
                    }
                })
                )
                break;
            case 3:
                powerUps.push(new PowerUp({
                    position: {
                        x: j * Boundary.width + Boundary.width / 2,
                        y: i * Boundary.height + Boundary.height / 2
                    }
                })
                )
                break;
        }
    })
});

function collisionWall({circle, rectangle}){
    var padding = Boundary.width / 2 - circle.radius - 1;
    return(// building collision blocks
        circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding && circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding && circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding
    )
}
var animationId;
function animate(){             //animation loop(infinite loop) to keep calling the player.update() and boundaries
    animationId = requestAnimationFrame(animate);
    context.clearRect(0, 0, canvas.width, canvas.height)
    // Pacman movement
    if(keys.w.pressed && lastKey === "w"){
        for(var i = 0; i < boundries.length; i++){
            var boundary = boundries[i];
            if(collisionWall({
                circle: {...player, 
                    velocity: {
                        x: 0,
                        y: -5
                    }
                }, 
                rectangle: boundary
                })
                ){
                player.velocity.y = 0;
                break
                } else{
                player.velocity.y = -5;
            }
        }
    } else if(keys.a.pressed && lastKey === "a"){
        for(var i = 0; i < boundries.length; i++){
            var boundary = boundries[i];
            if(collisionWall({
                circle: {...player, 
                    velocity: {
                        x: -5,
                        y: 0
                    }
                }, 
                rectangle: boundary
                })
                ){
                    player.velocity.x = 0;
                    break
                } else{
                player.velocity.x = -5;
            }
        }
    } else if(keys.d.pressed && lastKey === "d"){
        for(var i = 0; i < boundries.length; i++){
            var boundary = boundries[i];
            if(collisionWall({
                circle: {...player, 
                    velocity: {
                        x: 5,
                        y: 0
                    }
                }, 
                rectangle: boundary
                })
                ){
                    player.velocity.x = 0;
                    break
                } else{
                player.velocity.x = 5;
            }
        }
    } else if(keys.s.pressed && lastKey === "s"){
        for(var i = 0; i < boundries.length; i++){
            var boundary = boundries[i];
            if(collisionWall({
                circle: {...player, 
                    velocity: {
                        x: 0,
                        y: 5
                    }
                }, 
                rectangle: boundary
                })
                ){
                    player.velocity.y = 0;
                    break
                } else{
                player.velocity.y = 5;
            }
        }
    }

    // checks if pacman and ghost are touching and looping through the ghost array
    for ( var i = ghosts.length -1; 0 <= i; i--){
        var ghost = ghosts[i];
        if(Math.hypot(ghost.position.x - player.position.x, ghost.  position.y - player.position.y) < ghost.radius + player.radius){
            if(ghost.scared){
                ghosts.splice(i, 1)
            } else{
                cancelAnimationFrame(animationId);
                outcome.innerText = "Well You Lost"
            }
        }
    }

    // winning condition
    if(pellets.length === 0){
        cancelAnimationFrame(animationId);
        outcome.innerText = "You Won Champ"
    }
    // PowerUp array and colliding with pacman
    for ( var i = powerUps.length -1; 0 <= i; i--){
        var powerUp = powerUps[i];
        powerUp.draw();
        if(Math.hypot(powerUp.position.x - player.position.x, powerUp.position.y - player.position.y) < powerUp.radius + player.radius){
            powerUps.splice(i, 1)

            // taking away the ghost powers
            ghosts.forEach(ghost => {
                ghost.scared = true;

                setTimeout(() => {
                    ghost.scared = false
                }, 6000)
            })
        }
    }
    // looping through the array of pellets backwards and adding score 
    for ( var i = pellets.length -1; 0 <= i; i--){
        var pellet = pellets[i];
        pellet.draw();
        // collission between pacman and the pellets
        if(Math.hypot(pellet.position.x - player.position.x, pellet.position.y - player.position.y) < pellet.radius + player.radius){
            pellets.splice(i, 1)
            score += 10;
            scoreEl.innerText = score;
        }
    }
    
    boundries.forEach((boundary) => {
        boundary.draw()
        if(collisionWall({
            circle: player, 
            rectangle: boundary})){
            player.velocity.x = 0;
            player.velocity.y = 0;
        }
    })
    player.update()             //displays pacman on the screen
    player.velocity.x = 0;
    player.velocity.y = 0;
    // collission between ghost and the walls
    ghosts.forEach(ghost => {
        ghost.update();
        
        var collisions = [];
        boundries.forEach((boundary) =>{
            if(!collisions.includes("right") && collisionWall({
                circle: {...ghost, 
                    velocity: {
                        x: ghost.speed,
                        y: 0
                    }
                }, 
                rectangle: boundary
                })
            ){
                collisions.push("right")
            }

            if(!collisions.includes("left") && collisionWall({
                circle: {...ghost, 
                    velocity: {
                        x: -ghost.speed,
                        y: 0
                    }
                }, 
                rectangle: boundary
                })
            ){
                collisions.push("left")
            }

            if(!collisions.includes("up") && collisionWall({
                circle: {...ghost, 
                    velocity: {
                        x: 0,
                        y: -ghost.speed
                    }
                }, 
                rectangle: boundary
                })
            ){
                collisions.push("up")
            }

            if(!collisions.includes("down") && collisionWall({
                circle: {...ghost, 
                    velocity: {
                        x: 0,
                        y: ghost.speed
                    }
                }, 
                rectangle: boundary
                })
            ){
                collisions.push("down")
            }
        })
        if (collisions.length > ghost.prevCollisions.length){
            ghost.prevCollisions = collisions
        }
        if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)){
            if(ghost.velocity.x > 0){
                ghost.prevCollisions.push("right");
            } else if(ghost.velocity.x < 0){
                ghost.prevCollisions.push("left");
            } else if(ghost.velocity.y < 0){
                ghost.prevCollisions.push("up");
            } else if(ghost.velocity.y > 0){
                ghost.prevCollisions.push("down");
            }
            var pathways = ghost.prevCollisions.filter(collision =>{
                return !collisions.includes(collision)
            })
            var direction = pathways[Math.floor(Math.random() * pathways.length)];

            switch (direction) {
                case "down":
                    ghost.velocity.x = 0
                    ghost.velocity.y = ghost.speed
                    break;
                    case "up":
                        ghost.velocity.x = 0
                        ghost.velocity.y = -ghost.speed
                        break;
                    case "right":
                    ghost.velocity.x = ghost.speed
                    ghost.velocity.y = 0
                    break;
                    case "left":
                        ghost.velocity.x = -ghost.speed
                        ghost.velocity.y = 0
                        break;
            }
            ghost.prevCollisions = [];
        }
    })
}
animate()

addEventListener("keydown", ( {key} ) => {             //putting {key} like this gets us the key we press not the properties
    switch (key) {
        case "w":                   //pacman goes up
            keys.w.pressed = true;
            lastKey = "w";
            player.rotation = Math.PI * 1.5;
            break;
        case "a":                   //pacman goes to the left
            keys.a.pressed = true;
            lastKey = "a";
            player.rotation = Math.PI;
            break;
        case "s":                   //pacman goes down
            keys.s.pressed = true;
            lastKey = "s";
            player.rotation = Math.PI / 2;
            break;
        case "d":                   //pacman goes to the right
            keys.d.pressed = true;
            lastKey = "d";
            player.rotation = 0;
            break;
    }
})

addEventListener("keyup",({key}) => {             //putting {key} like this gets us the key we press not the properties
    switch (key) {
        case "w":                   //pacman goes up
            keys.w.pressed = false;
            break;
        case "a":                   //pacman goes to the left
            keys.a.pressed = false;
            break;
        case "s":                   //pacman goes down
            keys.s.pressed = false;
            break;
        case "d":                   //pacman goes to the right
            keys.d.pressed = false;
            break;
    }
})