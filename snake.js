const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const fps = 10;
const widthBoard = canvas.width;
const heightBoard = canvas.height;
const rectScale = 20;

function genRect(max) {
    return gen(0, max, rectScale);
}

function gen(min, max, scale) {
    scale = scale === undefined ? 1 : scale;
    return (Math.floor(Math.random() * ((max - min) / scale)) * scale) + min;
}

const Direction = {
    UP: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3
};

const GameObject = function(color, x, y) {
    this.genNewPosition(x, y);
    this.width = rectScale;
    this.height = rectScale;
    this.color = color;
};

GameObject.prototype.paint = function() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
};

GameObject.prototype.clear = function() {
    ctx.clearRect(this.x, this.y, this.width, this.height);
};

GameObject.prototype.genNewPosition = function(x, y) {
    this.x = x === undefined ? genRect(widthBoard) : x;
    this.y = y === undefined ? genRect(heightBoard): y;
};

const Snake = function() {
    GameObject.apply(this, ["#ff085f"]);
    this.speed = 1;
    this.direction = gen(0, 4);
    this.tail = [];
};

Snake.prototype = Object.create(GameObject.prototype);
Snake.prototype.constructor = Snake;

Snake.prototype.move = function() {
    if (this.tail.length > 0) {
        for (let i = this.tail.length; i > 1; i--) {
            this.tail[i - 1].x = this.tail[i - 2].x;
            this.tail[i - 1].y = this.tail[i - 2].y;
            this.tail[i - 1].direction = this.tail[i - 2].direction;
        }
        this.tail[0].x = this.x;
        this.tail[0].y = this.y;
        this.tail[0].direction = this.direction;
    }

    switch (this.direction) {
        case Direction.UP:
            this.y -= this.speed * this.height;
            break;
        case Direction.DOWN:
            this.y += this.speed * this.height;
            break;
        case Direction.LEFT:
            this.x -= this.speed * this.width;
            break;
        case Direction.RIGHT:
            this.x += this.speed * this.width;
            break;
    }
};

Snake.prototype.eat = function() {
    let tailPart;
    let direction;
    if (this.tail.length > 0) {
        let lastTailPart = this.tail[this.tail.length - 1];
        tailPart = new TailPart(lastTailPart.x, lastTailPart.y, lastTailPart.direction);
        direction = lastTailPart.direction;
    } else {
        tailPart = new TailPart(this.x, this.y, this.direction);
        direction = this.direction;
    }

    switch (direction) {
        case Direction.UP:
            tailPart.y += this.height;
            break;
        case Direction.DOWN:
            tailPart.y -= this.height;
            break;
        case Direction.LEFT:
            tailPart.x += this.width;
            break;
        case Direction.RIGHT:
            tailPart.x -= this.width;
            break;
    }

    this.tail.push(tailPart);
};

Snake.prototype.clear = function() {
    GameObject.prototype.clear.apply(this, arguments);
    for (let tailPart of this.tail) {
        tailPart.clear();
    }
};

Snake.prototype.paint = function() {
    GameObject.prototype.paint.apply(this, arguments);
    for (let tailPart of this.tail) {
        tailPart.paint();
    }
};

Snake.prototype.genNewPosition = function() {
    GameObject.prototype.genNewPosition.apply(this, arguments);
    this.direction = gen(0, 4);
    this.tail = [];
};

Snake.prototype.eatHimself = function() {
    for (let tailPart of this.tail) {
        if (tailPart.x === this.x && tailPart.y === this.y) {
            return true;
        }
    }
    return false;
};

const TailPart = function (x, y, direction) {
    GameObject.apply(this, ["#ff7160", x, y]);
    this.direction = direction;
};

TailPart.prototype = Object.create(GameObject.prototype);
TailPart.prototype.constructor = TailPart;

const Apple = function() {
    GameObject.apply(this, ["#ff0900"]);
};

Apple.prototype = Object.create(GameObject.prototype);
Apple.prototype.constructor = Apple;

let gameObjects = [];
const snake = addGameObject(new Snake());
const apples = addGameObject([new Apple()]);

function addGameObject(obj) {
    if (Array.isArray(obj)) {
        gameObjects = gameObjects.concat(obj);
    } else {
        gameObjects.push(obj);
    }
    return obj;
}

onkeydown = function keyDown(event) {
    if (event.keyCode === 39 &&
            snake.direction !== Direction.LEFT) {
        snake.direction = Direction.RIGHT;
    } else if (event.keyCode === 37 &&
            snake.direction !== Direction.RIGHT) {
        snake.direction = Direction.LEFT;
    } else if (event.keyCode === 38 &&
            snake.direction !== Direction.DOWN) {
        snake.direction = Direction.UP;
    } else if (event.keyCode === 40 &&
            snake.direction !== Direction.UP) {
        snake.direction = Direction.DOWN;
    }
};

function processCollision() {
    if (snake.x > widthBoard || snake.x < 0 ||
            snake.y > heightBoard || snake.y < 0 ||
                snake.eatHimself()) {
        snake.genNewPosition();
    } else {
        for (let apple of apples) {
            if (snake.x === apple.x &&
                    snake.y === apple.y) {
                snake.eat();
                apple.genNewPosition();
            }
        }
    }
    printScore();
}

function printScore() {
    const scoreText = "Score: " + snake.tail.length.toString(10);
    const score = document.getElementById("score");
    score.textContent = scoreText;
}

function gameLoop() {
    gameObjects.forEach(function (go) {
        go.clear();
    });

    snake.move();
    processCollision();

    gameObjects.forEach(function (go) {
        go.paint();
    });
}

function runGame() {
    setInterval(gameLoop, 1000 / fps);
}

runGame();
