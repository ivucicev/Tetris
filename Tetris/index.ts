const canvas: HTMLCanvasElement = document.getElementById("tetris") as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

const width: number = canvas.width;
const height: number = canvas.height;
const gameWidth: number = 10;
const gameHeight: number = 20;

const blockSize: number = height / 20;
const boardSizeX: number = width / gameWidth;
const boardSizeY: number = height / gameHeight;

let interval: any = null;
let gameSpeed: number = 750;

let board: Type[][] = [];
let currentShape: Type[] = [];
let currentShapePos: number = 0;
let currentShapeColor: string = '';
let currentShapeXOffset = 3;
let currentShapeRow = 0;

/**
 * Block types
 */
enum Type {
    EMPTY,
    BLOCK
}

/**
 * Keyboard mapping
 */
enum Key {
    LEFT = 37,
    RIGHT = 39,
    DOWN = 40,
    UP = 38,
    SPACE = 32,

}

enum Size {
    BIG = 16,
    MEDIUM = 9,
    SMALL = 4
}

/**
 * Define standard tetris shapes as array of bits
 */
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
        1, 1, 0,
        1, 0, 0,
        1, 0, 0,
    ],
    [
        0, 1, 1,
        0, 0, 1,
        0, 0, 1,
    ],
    [
        0, 0, 1,
        0, 1, 1, 
        0, 1, 0, 
    ],
    [
        1, 0, 0, 
        1, 1, 0, 
        0, 1, 0, 
    ],
    [
        1, 0, 0,
        1, 1, 0,
        1, 0, 0, 
    ],
    [
        1, 1,
        1, 1,
    ],
] 

/** 
 * Define colors for tetris blocks
 */
const shapeColors: string[] = [
    "black",
    "green",
    "cyan",
    "orange",
    "red",
    "blue",
    "yellow",
    "brown"
]

/**
 * just draw block on canvas
 * @param  {} x
 * @param  {} y
 */
const drawBlock = (x, y) => {
    ctx.fillStyle = currentShapeColor;    
    draw(x, y);
}

const fillEmpty = (x, y) => {
    ctx.fillStyle = shapeColors[0];
    draw(x, y);
}

const drawDebug = (x, y) => {
    ctx.fillStyle = "white";
    draw(x, y);  
}

const draw = (x, y) => {
    ctx.fillRect(blockSize * x, blockSize * y, blockSize - 1, blockSize - 1);
    ctx.strokeRect(blockSize * x, blockSize * y, blockSize - 1, blockSize - 1);  
}

/**
 * Function clears canvas
 */
const clear = (): void => ctx.clearRect(0, 0, width, height);

/**
 * Render scene (game loop)
 */
const render = (): void => {
    
    clear();

    // draw grid with freezed elements
    for(let x = 0; x < gameWidth; ++x) {
        for(let y = 0; y < gameHeight; ++y) {
            if (board[y][x] == Type.BLOCK) {
                drawBlock(y, x);
            } else if (board[y][x] == Type.EMPTY) {
                fillEmpty(x, y);
            }
        }
    }

    let y = 0;
    // draw current shape
    for(let x = 0; x < currentShape.length; x++) {
        if (currentShape[x] == Type.BLOCK) {
            drawBlock(x % currentShapeRow + currentShapeXOffset, currentShapePos + y);
        } //else drawDebug(x % currentShapeRow + currentShapeXOffset, currentShapePos + y);
        if ((x % currentShapeRow) == (currentShapeRow - 1)) {
            y++;
        }
        if (currentShapePos >= 20) generateRandomShape();
    }

    //currentShapePos++;

    const timeout = setTimeout(() => { 
        requestAnimationFrame(render);
        clearTimeout(timeout);
    }, gameSpeed);

}

const canMoveLeft = (): boolean => {

    // take first column y = 0
    let hasBlock = false;
    let check = 0;

    while (!hasBlock) {
        for (let x = check; x < currentShape.length; x = x + currentShapeRow) {
            if (currentShape[x] == Type.BLOCK) hasBlock = true;
        }
        if (!hasBlock) {
             check++;
        }
    }

    if (!(currentShapeXOffset + check)) return false;

    return true;

}

const canMoveRight = (): boolean => {

    // take first column y = 0
    let hasBlock = false;
    let check = currentShape.length;

    while (!hasBlock) {
        for (let x = check - 1; x >= 0; x = x - currentShapeRow) {
            if (currentShape[x] == Type.BLOCK) hasBlock = true;
        }
        if (!hasBlock) {
             check--;
        }
    }

    if (currentShapeXOffset + (currentShapeRow - (currentShape.length - check)) >= gameWidth ) return false;

    return true;

}

const canMoveDown = (): boolean => {
    return true;
}

/**
 * Function checks if current shape can rotate on grid 
 * without overlaping with other elements
 * @param  {Type[]} shapeCopy
 * @returns boolean
 */
const canRotate = (shapeCopy: Type[]): boolean => {

    let boardCopy = JSON.parse(JSON.stringify(board));
    let yy = 0;
    let check = currentShape.length;
    let checkForShape = false;

    for(let y = 0; y < gameHeight; ++y) {
        for(let x = 0; x < gameWidth; ++x) {
            if (x >= currentShapeXOffset && x < (currentShapeXOffset + currentShapeRow) && y >= currentShapePos && y < (currentShapePos + currentShapeRow)) {
                console.log(x, currentShapeXOffset, yy, currentShapeRow, (x - currentShapeXOffset) + yy);
                if (shapeCopy[(x - currentShapeXOffset) + yy] === Type.BLOCK && boardCopy[y][x] === Type.BLOCK) return false;
                check--;
                checkForShape = true;
                if (shapeCopy[(x - currentShapeXOffset) + yy] == Type.BLOCK)
                boardCopy[y][x] = shapeCopy[(x - currentShapeXOffset) + yy];
            }
        }
        if (checkForShape)
            yy += currentShapeRow;
    }

    console.clear();
    console.log(JSON.stringify(boardCopy));

    if (check) return false;

    return true;

}

const moveLeft = () => canMoveLeft() ? currentShapeXOffset-- : noop();

const moveRight = () => canMoveRight() ? currentShapeXOffset++ : noop();

const moveDown = () => canMoveDown() ? currentShapePos++ : noop();

const rotateCurrentShape = (): void => {

    let shapeCopy: Type[] = [];
    let rowLength = currentShapeRow;  

    for (let i = 0; i < currentShape.length; i++)
    {
        let x = i % rowLength;
        let y = Math.floor(i / rowLength);
        let newX = rowLength - y - 1;
        let newY = x;    
        let newPosition = newY * rowLength + newX;
        shapeCopy[newPosition] = currentShape[i];
    }

    // check if shape copy overlaps somewhere on grid with some other element
  
    if (!canRotate(shapeCopy)) {
        console.log("CANT ROATATE")
        return;
    }
    currentShape = shapeCopy;

}

const generateRandomShape = (): void => {
    var shape = Math.floor(Math.random() * (shapes.length - 1) + 1);
    currentShape = shapes[shape];
    currentShapeColor = shapeColors[shape];
    switch(currentShape.length) {
        case Size.BIG:
            currentShapeRow = 4;
            break;
        case Size.MEDIUM:
            currentShapeRow = 3;
            break;
        case Size.SMALL:
            currentShapeRow = 2;
            break;
    }
    currentShapeXOffset = 5 - Math.floor(currentShapeRow / 2);
    currentShapePos = 0;
}

const noop = (): void => {};

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
    board[5][6] = Type.BLOCK;
    generateRandomShape();
    requestAnimationFrame(render);
}

initBoard();

