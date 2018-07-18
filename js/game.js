/**
 * image repository to handle all the images used in the game
 */
var imageRepository = new function() {
    // define images
    this.monster = new Image()
    this.monsterRed = new Image()
    this.smokeSprite = new Image()
    this.personRegular = new Image()
    this.personInit = new Image()
    this.personInitSecond = new Image()
    this.personHit = new Image()

    // ensure all images are loaded
    var numImages = 7
    var numLoaded = 0

    function imageLoaded() {
        numLoaded++
        if (numLoaded == numImages) {
            window.init()
        }
    }

    this.monster.onload = function() {
        imageLoaded()
    }

    this.monsterRed.onload = function() {
        imageLoaded()
    }

    this.smokeSprite.onload = function() {
        imageLoaded()
    }

    this.personRegular.onload = function() {
        imageLoaded()
    }

    this.personInit.onload = function() {
        imageLoaded()
    }

    this.personInitSecond.onload = function() {
        imageLoaded()
    }

    this.personHit.onload = function() {
        imageLoaded()
    }

    // set images src
    this.monster.src = "img/monster1.png"
    this.monsterRed.src = "img/monster2.png"
    this.smokeSprite.src = "img/pop-01.png"
    this.personRegular.src = "img/cewe_biasa1.png"
    this.personInit.src = "img/cewe_normal.png"
    this.personInitSecond.src = "img/cewe_normal2.png"
    this.personHit.src = "img/cewe_kena2.png"
}

/**
 * This is the base class for all the Drawable objects in the game.
 * Contains default positioning variables, speed, references, etc
 */
function Drawable() {
    this.init = function(x, y, width, height) {
        // default variables
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    this.speed = 0
    this.canvasWidth = 0
    this.canvasHeight = 0
    this.isColliding = false

    // this is an abstract method for Drawable subclasses to implement
    this.draw = function() {}
}

function Person() {
    var counter = 0
    var max_counter = 15
    var image_status = false
    this.image = imageRepository.personInit
    this.health = 1

    this.initPosition = function(width, height) {
        this.init((this.canvasWidth - width) / 2, this.canvasHeight - height, width, height)
    }

    this.restore = function() {
        this.health = 1
    }

    this.draw = function() {
        this.context.clearRect(this.x, this.y, this.width, this.height)
        if (this.isColliding) {
            this.changeImageHit()
            if (counter > max_counter) {
                this.isColliding = false
                this.health--
            }
        } else {
            if (counter > max_counter) {
                this.changeImageIdle()
                image_status = !image_status
                counter = 0
            }
        }

        this.context.drawImage(this.image, this.x, this.y, this.width, this.height)
        counter++
    }

    this.changeImageIdle = function() {
        if (image_status) {
            this.image = imageRepository.personInit
        } else {
            this.image = imageRepository.personInitSecond
        }
    }

    this.changeImageHit = function() {
        this.image = imageRepository.personHit
    }
}

Person.prototype = new Drawable()

function MonsterPool(maxSize) {
    var size = maxSize
    this.pool = []

    /**
     * Populate with monsters
     */
    this.init = function() {
        for (let i = 0; i < size; i++) {
            let monster = new Monster()
            let image;
            if (Math.random() > 0.5) {
                image = imageRepository.monster
            } else {
                image = imageRepository.monsterRed
            }
            monster.init(0, 0, image.width * 0.5, image.height * 0.5)
            monster.setImage(image)
            this.pool[i] = monster
        }
    }

    this.get = function(x, y, speedX, speedY) {
        if (!this.pool[size - 1].alive) {
            this.pool[size - 1].spawn(x, y, speedX, speedY)
            this.pool.unshift(this.pool.pop())
        }
    }

    this.animate = function() {
        for (let i = 0; i < this.pool.length; i++) {
            if (this.pool[i].alive) {
                if (this.pool[i].draw()) {
                    this.pool[i].clear()
                    this.pool.push((this.pool.splice(i,1))[0])
                }
            } else {
                break
            }
        }
    }
}

function Monster() {
    this.alive = false

    this.setImage = function(image) {
        this.image = image
    }

    this.spawn = function(x, y, speedX, speedY) {
        this.x = x
        this.y = y
        this.speedX = speedX
        this.speedY = speedY
        this.alive = true
    }

    // implement the abstract draw() function
    this.draw = function() {
        this.context.clearRect(this.x, this.y, this.width, this.height)
        this.x += this.speedX
        this.y += this.speedY
        if (this.isColliding) {
            game.playerScore += 10
            return true
        }

        if (this.y >= this.canvasHeight - this.height) {
            return true
        } else {
            this.context.drawImage(this.image, this.x, this.y, this.width, this.height)
            return false
        }
    }

    this.checkIfMouseInsideMonster = function(mouseX, mouseY) {
        return (mouseY > this.y && mouseY < this.y + this.height && mouseX > this.x && mouseX < this.x + this.width)
    }

    this.clear = function() {
        this.x = 0
        this.y = 0
        this.speedX = 0
        this.speedY = 0
        this.alive = false
        this.isColliding = false
    }
}

// Set Monster class to inherit properties from Drawable class
Monster.prototype = new Drawable()

function MonsterSpawner() {
    this.time = 700
    this.monsterPool = new MonsterPool(20)
    var counter = 0
    var maxCounter = 300

    this.monsterPool.init()

    this.setConvergePoint = function(x, y) {
        this.convergePointX = x
        this.convergePointY = y
    }

    this.doSpawn = function() {
        counter++
        if (counter >= maxCounter) {
            this.fire()
            counter = 0
        }
    }

    this.fire = function() {
        // the spawn positioning and speed relative to spawn points are determined here
        // Converge Point (x,y) must be initiated first
        let randX = Math.floor(Math.random() * (this.canvasWidth*2 - imageRepository.monster.width)) - this.canvasWidth
        let randY = -imageRepository.monster.height
        if (randX < -imageRepository.monster.width || randX > this.canvasWidth) {
            randY = Math.floor(Math.random() * (this.canvasHeight - imageRepository.monster.height*2))
        }

        let speedX = (this.convergePointX - randX) / this.time
        let speedY = (this.convergePointY - randY) / this.time

        this.monsterPool.get(randX, randY, speedX, speedY)
    }
}

MonsterSpawner.prototype = new Drawable()

function Explosion() {
    this.currentIndex = 0
    this.srcX = 0
    this.srcY = 0
    var maxIndex = 6

    this.draw = function() {
        if (currentIndex < maxIndex && this.alive) {
            this.context.clearRect(this.x, this.y, this.width, this.height)
            this.context.drawImage(imageRepository.smokeSprite, this.srcX, this.srcY, this.width, this.height, this.x, this.y, this.width, this.height)
            this.currentIndex++
            this.srcX = currentIndex * this.width
        } else {
            this.alive = false
        }
    }
}

Explosion.prototype = new Drawable()

/**
 * The Game class which will hold all objects and data for the game
 */
function Game() {
    this.playerScore = 0

    this.init = function() {
        this.monsterCanvas = document.getElementById("monsterCanvas")
        this.personCanvas = document.getElementById("personCanvas")
        // check if canvas is supported
        if (this.monsterCanvas.getContext) {
            this.monsterCtx = this.monsterCanvas.getContext('2d')
            this.personCtx = this.personCanvas.getContext('2d')
            // initialize informations
            Monster.prototype.context = this.monsterCtx
            Monster.prototype.canvasWidth = this.monsterCanvas.width
            Monster.prototype.canvasHeight = this.monsterCanvas.height

            MonsterSpawner.prototype.canvasWidth = this.monsterCanvas.width
            MonsterSpawner.prototype.canvasHeight = this.monsterCanvas.height
            // initialize the monster
            this.monsterSpawner = new MonsterSpawner()

            Person.prototype.context = this.personCtx
            Person.prototype.canvasWidth = this.personCanvas.width
            Person.prototype.canvasHeight = this.personCanvas.height

            this.person = new Person()
            this.person.initPosition(imageRepository.personInit.width * 0.6, imageRepository.personInit.height * 0.6)
            this.person.draw()

            this.monsterSpawner.setConvergePoint(this.person.x + (this.person.width / 2), this.person.y + (this.person.height / 2))

            this.playerScore = 0

            let game = this

            this.monsterCanvas.addEventListener('click', function(event) {
                let mousePos = getMousePos(this, event)

                game.monsterSpawner.monsterPool.pool.forEach(monster => {
                    if (monster.checkIfMouseInsideMonster(mousePos.x, mousePos.y) && monster.alive) {
                        monster.isColliding = true
                    }
                })
            })

            return true
        } else {
            return false
        }
    }

    this.start = function() {
        animate()
    }

    this.gameOver = function() {
        document.getElementById("myModal").style.display = 'block';
        this.monsterCtx.clearRect(0, 0, this.monsterCanvas.width, this.monsterCanvas.height)
    }

    this.restart = function() {
        document.getElementById("myModal").style.display = 'none';
        this.personCtx.clearRect(0, 0, this.personCanvas.width, this.personCanvas.height)

        this.monsterSpawner = new MonsterSpawner()

        this.person = new Person()
        this.person.initPosition(imageRepository.personInit.width * 0.6, imageRepository.personInit.height * 0.6)
        this.person.draw()

        this.monsterSpawner.setConvergePoint(this.person.x + (this.person.width / 2), this.person.y + (this.person.height / 2))

        this.playerScore = 0
        this.person.restore()

        game.start()
    }
}

function getMousePos(canvas, evt) {

    var rect = canvas.getBoundingClientRect();

    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };

}

/**
 * The animation loop.
 */
function animate() {
    collisionCheck()
    updateUI()
    
    if (game.person.health > 0) {
        requestAnimFrame(animate)
        game.monsterSpawner.monsterPool.animate()
        game.monsterSpawner.doSpawn()
        game.person.draw()
    } else {
        game.gameOver()
    }
}

function updateUI() {
    document.getElementById("score").innerHTML = game.playerScore
}

const collisionToleranceVal = 50

function collisionCheck() {
    let person = game.person
    game.monsterSpawner.monsterPool.pool.forEach(monster => {
        if (monster.alive &&
                monster.x < person.x + person.width - collisionToleranceVal &&
                monster.x + monster.width > person.x + collisionToleranceVal && 
                monster.y < person.y + person.height - collisionToleranceVal &&
                monster.y + monster.height > person.y + collisionToleranceVal) {

            monster.isColliding = true
            person.isColliding = true
        }
    })
}

window.requestAnimFrame = (function() {
    return window.requestAnimationFrame    ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback, element) {
            window.setTimeout(callback, 1000 / 60)
        }
})()

var game = new Game()

function initCanvas() {
    let canvas = document.getElementById("monsterCanvas")
    canvas.width = innerWidth
    canvas.height = innerHeight - 100

    let charCanvas = document.getElementById("personCanvas")
    charCanvas.width = innerWidth
    charCanvas.height = innerHeight
}

function init() {
    initCanvas()

    if (game.init()) {
        let button = document.getElementsByClassName("button-start-game")[0]
        button.addEventListener('click', function(event) {
            this.style.display = "none";
            game.start()
        })
    }
}

// var canvas = document.getElementById("canvas")
// var ctx = canvas.getContext("2d")
// canvas.width = innerWidth
// canvas.height = innerHeight

// var srcX = 0
// var srcY = 0

// var x = 0, y = 0

// var canvasWidth = canvas.width
// var canvasHeight = canvas.height

// var monster = new Image()
// monster.src = "images/pop-01.png"

// var cols = 6

// var sheetWidth = 1679
// var sheetHeight = 278

// var width = sheetWidth / cols

// var curFrame = 0

// function animate() {
//     ctx.clearRect(0, 0, canvasWidth, canvasHeight)
//     curFrame = (curFrame + 1) % cols
//     srcX = curFrame * width
//     srcY = 0

//     ctx.drawImage(monster, srcX, srcY, width, sheetHeight, x, y, width, sheetHeight)
// }

// setInterval(function() {
//     animate()
// }, 80)