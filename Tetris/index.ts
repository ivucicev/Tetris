const canvas: HTMLCanvasElement = document.getElementById("tetris") as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");

const WIDTH: number = canvas.width;
const HEIGHT: number = canvas.height;
const GAME_WIDTH: number = 10;
const GAME_HEIGHT: number = 20;

const BLOCK_SIZE: number = HEIGHT / 20;
const BOARD_SIZE_X: number = WIDTH / GAME_WIDTH;
const BOARD_SIZE_Y: number = HEIGHT / GAME_HEIGHT;
const SHAPE_SIZE: number = 4;

let board: BlockType[][] = [];
let currentShape: BlockType[] = [];
let timer = null;

let currentShapeYPosition: number,
    currentShapeXPosition: number,
    currentShapeColor: string,
    gameSpeed: number,
    score: number,
    level: number;

enum BlockType {
    EMPTY,
    BLOCK
}

enum Key {
    LEFT = 37,
    RIGHT = 39,
    DOWN = 40,
    UP = 38
}

const shapes: Array<BlockType[]> = [
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

const drawBlock = (x, y, isDefault: boolean = false): void => {
    ctx.fillStyle = isDefault ? "powderblue" : currentShapeColor;    
    draw(x, y);
}

const fillEmpty = (x, y): void => {
    ctx.fillStyle = shapeColors[0];
    draw(x, y);
}

const draw = (x, y): void => {
    ctx.fillRect(BLOCK_SIZE * x, BLOCK_SIZE * y, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
    ctx.strokeRect(BLOCK_SIZE * x, BLOCK_SIZE * y, BLOCK_SIZE - 1, BLOCK_SIZE - 1);  
}

const clear = (): void => ctx.clearRect(0, 0, WIDTH, HEIGHT);

const drawBoard = (): void => {
    for(let x = 0; x < GAME_WIDTH; ++x) {
        for(let y = 0; y < GAME_HEIGHT; ++y) {
            if (board[y][x] == BlockType.BLOCK) {
                drawBlock(x, y, true);
            } else if (board[y][x] == BlockType.EMPTY) {
                fillEmpty(x, y);
            }
        }
    }
}

const drawCurrentShape = (): void => {
    let y = 0;
    for(let x = 0; x < currentShape.length; x++) {
        if (currentShape[x] == BlockType.BLOCK) {
            if (currentShapeYPosition + y >= 0)
                drawBlock(x % SHAPE_SIZE + currentShapeXPosition, currentShapeYPosition + y);
        }
        if ((x % SHAPE_SIZE) == (SHAPE_SIZE - 1)) {
            y++;
        }
        if (currentShapeYPosition >= 20) generateRandomShape();
    }
}

const render = (): void => { 
    clear();
    drawBoard();
    drawCurrentShape();
}

const frame = (): void => {
    clearTimeout(timer);
    render();
    if (canMoveDown()) {
        currentShapeYPosition++;
    } else {
        saveShapePositionToBoard();
    }
    timer = setTimeout(() => { 
        requestAnimationFrame(frame);
    }, gameSpeed);
}

const saveShapePositionToBoard = (): void => {
    let y = 0;
    for(let x = 0; x < currentShape.length; x++) {
        if (currentShape[x] == BlockType.BLOCK) {
            board[currentShapeYPosition + y][x % SHAPE_SIZE + currentShapeXPosition] = BlockType.BLOCK;
        } 
        if ((x % SHAPE_SIZE) == (SHAPE_SIZE - 1)) {
            y++;
        }
    }
    collapseRows();
    generateRandomShape();
}

const collapseRows = (): void => {
    let completeRows = GAME_HEIGHT;
    let rowCompleted = true;
    let collapsedRows = 0;
    rows:
    for(let y = 0; y < GAME_HEIGHT; ++y) {
        rowCompleted = true;
        for(let x = 0; x < GAME_WIDTH; ++x) {
            if (board[y][x] == BlockType.EMPTY) {
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
    if (collapsedRows)
        updateScore();

}

const updateScore = (): void => {
    scoreEl.innerHTML = `${score}`;
    if (score % 3000 == 0) {
        //gameSpeed -= 75;
        level++;
        levelEl.innerHTML = `${level}`;    
    }   
}

const canMoveLeft = (): boolean => {
    if (currentShapeYPosition < 0) return false;
    let y = 0;
    for(let x = 0; x < currentShape.length; x++) {
        if (currentShape[x] == BlockType.BLOCK) {
            let nextX  = x % SHAPE_SIZE + currentShapeXPosition - 1;
            let nextY = currentShapeYPosition + y;
            if (nextX < 0 || board[nextY][nextX] == BlockType.BLOCK) {
                return false;
            }
        } 
        if ((x % SHAPE_SIZE) == (SHAPE_SIZE - 1)) {
            y++;
        }
    }
    return true;
}

const canMoveRight = (): boolean => {
    if (currentShapeYPosition < 0) return false;
    let y = 0;
    for(let x = 0; x < currentShape.length; x++) {
        if (currentShape[x] == BlockType.BLOCK) {
            let nextX  = x % SHAPE_SIZE + currentShapeXPosition + 1;
            let nextY = currentShapeYPosition + y;
            if (nextX >= GAME_WIDTH || board[nextY][nextX] == BlockType.BLOCK) {
                return false;
            }
        } 
        if ((x % SHAPE_SIZE) == (SHAPE_SIZE - 1)) {
            y++;
        }
    }
    return true;
}

const canMoveDown = (): boolean => {
    if (currentShapeYPosition < 0) return true;
    let y = 0;
    for(let x = 0; x < currentShape.length; x++) {
        if (currentShape[x] == BlockType.BLOCK) {
            let nextX  = x % SHAPE_SIZE + currentShapeXPosition;
            let nextY = currentShapeYPosition + y + 1;
            if (currentShapeYPosition == 0 && board[nextY][nextX] == BlockType.BLOCK) gameOver();
            if (nextY >= GAME_HEIGHT || board[nextY][nextX] == BlockType.BLOCK) {
                return false;
            }
        } 
        if ((x % SHAPE_SIZE) == (SHAPE_SIZE - 1)) {
            y++;
        }
    }
    return true;
}

const canRotate = (shapeCopy: BlockType[]): boolean => {
    if (currentShapeYPosition < 0) return false;
    let yy = 0;
    let check = currentShape.length;
    let checkForShape = false;
    for(let y = 0; y < GAME_HEIGHT; ++y) {
        for(let x = 0; x < GAME_WIDTH; ++x) {
            if (x >= currentShapeXPosition && x < (currentShapeXPosition + SHAPE_SIZE) && y >= currentShapeYPosition && y < (currentShapeYPosition + SHAPE_SIZE)) {
                if (shapeCopy[(x - currentShapeXPosition) + yy] === BlockType.BLOCK && board[y][x] === BlockType.BLOCK) return false;
                check--;
                checkForShape = true;
            }
        }
        if (checkForShape)
            yy += SHAPE_SIZE;
    }
    if (check) return false;
    return true;
}

const moveLeft = (): void => {
    if (canMoveLeft()) {
        currentShapeXPosition--;
        render();
    } 
}

const moveRight = (): void => {
    if (canMoveRight()) {
        currentShapeXPosition++
        render();
    }
}

const moveDown = (): void => {
    if (canMoveDown()) {
        currentShapeYPosition++;  
        render();
    }
}

const rotateCurrentShape = (): void => {
    let shapeCopy: BlockType[] = [];
    let rowLength = SHAPE_SIZE;  
    for (let i = 0; i < currentShape.length; i++) {
        let x = i % rowLength;
        let y = ~~(i / rowLength);
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
    let randomShapeIndex = ~~(Math.random() * (shapes.length - 1) + 1);
    currentShape = shapes[randomShapeIndex];
    currentShapeColor = shapeColors[randomShapeIndex];
    currentShapeXPosition = 3;
    currentShapeYPosition = -4;
}

const bindEventListener = (): void => { document.onkeyup = handleEvent };

const handleEvent = (e): void => {
    switch(e.keyCode) {
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

const gameOver = (): void => {
    window.alert("Game Over, too bad :/");
    initBoard();
}

const drawEmptyBoard = (): void => {
    for(let y = 0; y < GAME_HEIGHT; ++y) {
        board[y] = [];
        for(let x = 0; x < GAME_WIDTH; ++x) {
            board[y][x] = BlockType.EMPTY;
            fillEmpty(x, y);
        }
    }
}

const setInitialValues = (): void => {
    score = 0;
    level = 0;
    gameSpeed = 750;
    currentShapeXPosition = 3;
    currentShapeYPosition = -4;
}

const initBoard = (): void => {
    bindEventListener();
    drawEmptyBoard();
    setInitialValues();
    clearTimeout(timer);
    updateScore();
    generateRandomShape();
    requestAnimationFrame(frame);
}

initBoard();