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
let gameSpeed: number = 250;

let board: Type[][] = [];
let currentShape: Type[] = [];
let currentShapePos: number = 0;
let currentShapeColor: string = '';
let currentShapeXOffset = 3;
let currentShapeRow = 0;

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
    // draw current shape
    for(let x = 0; x < currentShape.length; x++) {
        if (currentShape[x] == Type.BLOCK) {
            drawBlock(x % currentShapeRow + currentShapeXOffset, currentShapePos + y);
        }
        if ((x % currentShapeRow) == (currentShapeRow - 1)) {
            y++;
        }
        if (currentShapePos >= 20) generateRandomShape();
    }

}

const frame = () => {
    render();
    if (canMoveDown()) {
        currentShapePos++;
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
            board[currentShapePos + y][x % currentShapeRow + currentShapeXOffset] = Type.BLOCK;
        } 
        if ((x % currentShapeRow) == (currentShapeRow - 1)) {
            y++;
        }
    }
    collapseRows();
    generateRandomShape();
}

const collapseRows = (): void => {
    let completeRows = gameHeight;
    let rowCompleted = true;
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
        }
    }
}

const canMoveLeft = (): boolean => {
    let y = 0;
    for(let x = 0; x < currentShape.length; x++) {
        if (currentShape[x] == Type.BLOCK) {
            let nextX  = x % currentShapeRow + currentShapeXOffset - 1;
            let nextY = currentShapePos + y;
            if (nextX < 0 || board[nextY][nextX] == Type.BLOCK) {
                return false;
            }
        } 
        if ((x % currentShapeRow) == (currentShapeRow - 1)) {
            y++;
        }
    }
    return true;
}

const canMoveRight = (): boolean => {
    let y = 0;
    for(let x = 0; x < currentShape.length; x++) {
        if (currentShape[x] == Type.BLOCK) {
            let nextX  = x % currentShapeRow + currentShapeXOffset + 1;
            let nextY = currentShapePos + y;
            if (nextX >= gameWidth || board[nextY][nextX] == Type.BLOCK) {
                return false;
            }
        } 
        if ((x % currentShapeRow) == (currentShapeRow - 1)) {
            y++;
        }
    }
    return true;
}

const canMoveDown = (): boolean => {
    let y = 0;
    for(let x = 0; x < currentShape.length; x++) {
        if (currentShape[x] == Type.BLOCK) {
            let nextX  = x % currentShapeRow + currentShapeXOffset;
            let nextY = currentShapePos + y + 1;
            if (nextY >= gameHeight || board[nextY][nextX] == Type.BLOCK) {
                return false;
            }
        } 
        if ((x % currentShapeRow) == (currentShapeRow - 1)) {
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
            if (x >= currentShapeXOffset && x < (currentShapeXOffset + currentShapeRow) && y >= currentShapePos && y < (currentShapePos + currentShapeRow)) {
                if (shapeCopy[(x - currentShapeXOffset) + yy] === Type.BLOCK && boardCopy[y][x] === Type.BLOCK) return false;
                check--;
                checkForShape = true;
            }
        }
        if (checkForShape)
            yy += currentShapeRow;
    }

    if (check) return false;

    return true;

}

const moveLeft = () => {
    if (canMoveLeft()) {
        currentShapeXOffset--;
        render();
    } 
}

const moveRight = () => {
    if (canMoveRight()) {
        currentShapeXOffset++
        render();
    }
}

const moveDown = () => {
    if (canMoveDown()) {
        currentShapePos++;
        render();
    }
}

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
  
    if (!canRotate(shapeCopy)) return;

    currentShape = shapeCopy;

    render();

}

const generateRandomShape = (): void => {
    var shape = Math.floor(Math.random() * (shapes.length - 1) + 1);
    currentShape = shapes[shape];
    currentShapeColor = shapeColors[shape];
    currentShapeRow = 4;
    currentShapeXOffset = 5 - Math.floor(currentShapeRow / 2);
    currentShapePos = 0;
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
    generateRandomShape();
    requestAnimationFrame(frame);
}

initBoard();

