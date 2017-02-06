const canvas: HTMLCanvasElement = document.getElementById("tetris") as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

const width: number = canvas.width;
const height: number = canvas.height;
const gameWidth: number = 10;
const gameHeight: number = 20;

const blockSize: number = height / 20;
const boardSizeX: number = width / gameWidth;
const boardSizeY: number = height / gameHeight;
const shapeSize: number = 4;

let gameSpeed: number = 750;
let board: Type[][] = [];
let currentShape: Type[] = [];
let currentShapeYPosition: number = 0;
let currentShapeXPosition: number = 3;
let currentShapeColor: string = '';
let score = 0;

enum Type {
    EMPTY,
    BLOCK
}

enum Key {
    LEFT = 37,
    RIGHT = 39,
    DOWN = 40,
    UP = 38,
    SPACE = 32,
}

const shapes: Array<Type[]> = [
    [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0 ,0 ,0 ,0,
    ],
    [
        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 1 ,0 ,0,
    ],
    [
        0, 1, 1, 0,
        0, 1, 0, 0, 
        0, 1, 0, 0, 
        0, 0, 0, 0,
    ],
    [
        0, 1, 1, 0,
        0, 0, 1, 0,
        0, 0, 1, 0,
        0, 0, 0, 0
    ],
    [
        0, 0, 1, 0,
        0, 1, 1, 0,
        0, 1, 0, 0,
        0, 0, 0, 0,
    ],
    [
        0, 1, 0, 0, 
        0, 1, 1, 0, 
        0, 0, 1, 0, 
        0, 0, 0, 0
    ],
    [
        0, 1, 0, 0,
        0, 1, 1, 0,
        0, 1, 0, 0, 
        0, 0, 0, 0
    ],
    [ 
        0, 0, 0, 0,
        0, 1, 1, 0,
        0, 1, 1, 0,
        0, 0, 0, 0,
    ],
] 

const shapeColors: string[] = [
    "black", "green", "cyan", "orange", "red", "blue", "yellow", "brown"
]

const drawBlock = (x, y) => {
    ctx.fillStyle = currentShapeColor;    
    draw(x, y);
}

const fillEmpty = (x, y) => {
    ctx.fillStyle = shapeColors[0];
    draw(x, y);
}

const draw = (x, y) => {
    ctx.fillRect(blockSize * x, blockSize * y, blockSize - 1, blockSize - 1);
    ctx.strokeRect(blockSize * x, blockSize * y, blockSize - 1, blockSize - 1);  
}

const clear = (): void => ctx.clearRect(0, 0, width, height);

const render = (): void => { 
    clear();
    for(let x = 0; x < gameWidth; ++x) {
        for(let y = 0; y < gameHeight; ++y) {
            if (board[y][x] == Type.BLOCK) {
                drawBlock(x, y);
            } else if (board[y][x] == Type.EMPTY) {
                fillEmpty(x, y);
            }
        }
    }

    let y = 0;
    for(let x = 0; x < currentShape.length; x++) {
        if (currentShape[x] == Type.BLOCK) {
            if (currentShapeYPosition + y >= 0)
                drawBlock(x % shapeSize + currentShapeXPosition, currentShapeYPosition + y);
        }
        if ((x % shapeSize) == (shapeSize - 1)) {
            y++;
        }
        if (currentShapeYPosition >= 20) generateRandomShape();
    }
}

const frame = () => {
    render();
    if (canMoveDown()) {
        currentShapeYPosition++;
    } else {
        saveShapePositionToBoard();
    }
    const timeout = setTimeout(() => { 
        requestAnimationFrame(frame);
        clearTimeout(timeout);
    }, gameSpeed);
}

const saveShapePositionToBoard = (): void => {
    let y = 0;
    for(let x = 0; x < currentShape.length; x++) {
        if (currentShape[x] == Type.BLOCK) {
            board[currentShapeYPosition + y][x % shapeSize + currentShapeXPosition] = Type.BLOCK;
        } 
        if ((x % shapeSize) == (shapeSize - 1)) {
            y++;
        }
    }
    collapseRows();
    generateRandomShape();
}

const collapseRows = (): void => {
    let completeRows = gameHeight;
    let rowCompleted = true;
    let collapsedRows = 0;
    rows:
    for(let y = 0; y < gameHeight; ++y) {
        rowCompleted = true;
        for(let x = 0; x < gameWidth; ++x) {
            if (board[y][x] == Type.EMPTY) {
                completeRows--;
                rowCompleted = false;
                continue rows;
            }
        }
        if (rowCompleted) {
            for (let yy = y; yy > 0; yy--) {
                board[yy] = board[yy - 1];
            }
            collapsedRows++;
        }
    }

    score += collapsedRows*100;
    updateScore();

}

const updateScore = (): void => {
    const scoreEl = document.getElementById("score");
    scoreEl.innerHTML = `${score}`;
    // if (score % 3000) gameSpeed -= 75;   
}

const canMoveLeft = (): boolean => {
    let y = 0;
    for(let x = 0; x < currentShape.length; x++) {
        if (currentShape[x] == Type.BLOCK) {
            let nextX  = x % shapeSize + currentShapeXPosition - 1;
            let nextY = currentShapeYPosition + y;
            if (nextX < 0 || board[nextY][nextX] == Type.BLOCK) {
                return false;
            }
        } 
        if ((x % shapeSize) == (shapeSize - 1)) {
            y++;
        }
    }
    return true;
}

const canMoveRight = (): boolean => {
    let y = 0;
    for(let x = 0; x < currentShape.length; x++) {
        if (currentShape[x] == Type.BLOCK) {
            let nextX  = x % shapeSize + currentShapeXPosition + 1;
            let nextY = currentShapeYPosition + y;
            if (nextX >= gameWidth || board[nextY][nextX] == Type.BLOCK) {
                return false;
            }
        } 
        if ((x % shapeSize) == (shapeSize - 1)) {
            y++;
        }
    }
    return true;
}

const canMoveDown = (): boolean => {
    if (currentShapeYPosition < 0) return true;
    let y = 0;
    for(let x = 0; x < currentShape.length; x++) {
        if (currentShape[x] == Type.BLOCK) {
            let nextX  = x % shapeSize + currentShapeXPosition;
            let nextY = currentShapeYPosition + y + 1;
            if (nextY >= gameHeight || board[nextY][nextX] == Type.BLOCK) {
                return false;
            }
        } 
        if ((x % shapeSize) == (shapeSize - 1)) {
            y++;
        }
    }
    return true;
}

const canRotate = (shapeCopy: Type[]): boolean => {
    let boardCopy = JSON.parse(JSON.stringify(board));
    let yy = 0;
    let check = currentShape.length;
    let checkForShape = false;
    for(let y = 0; y < gameHeight; ++y) {
        for(let x = 0; x < gameWidth; ++x) {
            if (x >= currentShapeXPosition && x < (currentShapeXPosition + shapeSize) && y >= currentShapeYPosition && y < (currentShapeYPosition + shapeSize)) {
                if (shapeCopy[(x - currentShapeXPosition) + yy] === Type.BLOCK && boardCopy[y][x] === Type.BLOCK) return false;
                check--;
                checkForShape = true;
            }
        }
        if (checkForShape)
            yy += shapeSize;
    }
    if (check) return false;
    return true;
}

const moveLeft = () => {
    if (canMoveLeft()) {
        currentShapeXPosition--;
        render();
    } 
}

const moveRight = () => {
    if (canMoveRight()) {
        currentShapeXPosition++
        render();
    }
}

const moveDown = () => {
    if (canMoveDown()) {
        currentShapeYPosition++;  
        render();
    }
}

const rotateCurrentShape = (): void => {
    let shapeCopy: Type[] = [];
    let rowLength = shapeSize;  
    for (let i = 0; i < currentShape.length; i++) {
        let x = i % rowLength;
        let y = Math.floor(i / rowLength);
        let newX = rowLength - y - 1;
        let newY = x;    
        let newPosition = newY * rowLength + newX;
        shapeCopy[newPosition] = currentShape[i];
    }
    if (!canRotate(shapeCopy)) return;
    currentShape = shapeCopy;
    render();
}

const generateRandomShape = (): void => {
    let randomShapeIndex = Math.floor(Math.random() * (shapes.length - 1) + 1);
    currentShape = shapes[randomShapeIndex];
    currentShapeColor = shapeColors[randomShapeIndex];
    currentShapeXPosition = 3;
    currentShapeYPosition = -4;
}

const bindEventListener = () => document.onkeyup = handleEvent;

const handleEvent = (e): void => {
    switch(e.keyCode) {
        case Key.SPACE:
            generateRandomShape();
            break;
        case Key.UP:
            rotateCurrentShape();
            break;
        case Key.LEFT:
            moveLeft();
            break;
        case Key.RIGHT:
            moveRight();
            break;
        case Key.DOWN:
            moveDown();
            break;
        default:
            break;
    }
}

const initBoard = (): void => {
    bindEventListener();
    // create board matrix representing tetris fields
    for(let y = 0; y < gameHeight; ++y) {
        board[y] = [];
        for(let x = 0; x < gameWidth; ++x) {
            board[y][x] = Type.EMPTY;
            fillEmpty(x, y);
        }
    }
    updateScore();
    generateRandomShape();
    requestAnimationFrame(frame);
}

initBoard();


