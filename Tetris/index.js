var canvas = document.getElementById("tetris");
var ctx = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;
var gameWidth = 10;
var gameHeight = 20;
var blockSize = height / 20;
var boardSizeX = width / gameWidth;
var boardSizeY = height / gameHeight;
var interval = null;
var gameSpeed = 750;
var board = [];
var currentShape = [];
var currentShapePos = 0;
var currentShapeColor = '';
var currentShapeXOffset = 3;
var currentShapeRow = 0;
/**
 * Block types
 */
var Type;
(function (Type) {
    Type[Type["EMPTY"] = 0] = "EMPTY";
    Type[Type["BLOCK"] = 1] = "BLOCK";
})(Type || (Type = {}));
/**
 * Keyboard mapping
 */
var Key;
(function (Key) {
    Key[Key["LEFT"] = 37] = "LEFT";
    Key[Key["RIGHT"] = 39] = "RIGHT";
    Key[Key["DOWN"] = 40] = "DOWN";
    Key[Key["UP"] = 38] = "UP";
    Key[Key["SPACE"] = 32] = "SPACE";
})(Key || (Key = {}));
var Size;
(function (Size) {
    Size[Size["BIG"] = 16] = "BIG";
    Size[Size["MEDIUM"] = 9] = "MEDIUM";
    Size[Size["SMALL"] = 4] = "SMALL";
})(Size || (Size = {}));
/**
 * Define standard tetris shapes as array of bits
 */
var shapes = [
    [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
    ],
    [
        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 1, 0, 0,
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
];
/**
 * Define colors for tetris blocks
 */
var shapeColors = [
    "black",
    "green",
    "cyan",
    "orange",
    "red",
    "blue",
    "yellow",
    "brown"
];
/**
 * just draw block on canvas
 * @param  {} x
 * @param  {} y
 */
var drawBlock = function (x, y) {
    ctx.fillStyle = currentShapeColor;
    draw(x, y);
};
var fillEmpty = function (x, y) {
    ctx.fillStyle = shapeColors[0];
    draw(x, y);
};
var drawDebug = function (x, y) {
    ctx.fillStyle = "white";
    draw(x, y);
};
var draw = function (x, y) {
    ctx.fillRect(blockSize * x, blockSize * y, blockSize - 1, blockSize - 1);
    ctx.strokeRect(blockSize * x, blockSize * y, blockSize - 1, blockSize - 1);
};
/**
 * Function clears canvas
 */
var clear = function () { return ctx.clearRect(0, 0, width, height); };
/**
 * Render scene (game loop)
 */
var render = function () {
    clear();
    // draw grid with freezed elements
    for (var x = 0; x < gameWidth; ++x) {
        for (var y_1 = 0; y_1 < gameHeight; ++y_1) {
            if (board[y_1][x] == Type.BLOCK) {
                drawBlock(y_1, x);
            }
            else if (board[y_1][x] == Type.EMPTY) {
                fillEmpty(x, y_1);
            }
        }
    }
    var y = 0;
    // draw current shape
    for (var x = 0; x < currentShape.length; x++) {
        if (currentShape[x] == Type.BLOCK) {
            drawBlock(x % currentShapeRow + currentShapeXOffset, currentShapePos + y);
        } //else drawDebug(x % currentShapeRow + currentShapeXOffset, currentShapePos + y);
        if ((x % currentShapeRow) == (currentShapeRow - 1)) {
            y++;
        }
        if (currentShapePos >= 20)
            generateRandomShape();
    }
    //currentShapePos++;
    var timeout = setTimeout(function () {
        requestAnimationFrame(render);
        clearTimeout(timeout);
    }, gameSpeed);
};
var canMoveLeft = function () {
    // take first column y = 0
    var hasBlock = false;
    var check = 0;
    while (!hasBlock) {
        for (var x = check; x < currentShape.length; x = x + currentShapeRow) {
            if (currentShape[x] == Type.BLOCK)
                hasBlock = true;
        }
        if (!hasBlock) {
            check++;
        }
    }
    if (!(currentShapeXOffset + check))
        return false;
    return true;
};
var canMoveRight = function () {
    // take first column y = 0
    var hasBlock = false;
    var check = currentShape.length;
    while (!hasBlock) {
        for (var x = check - 1; x >= 0; x = x - currentShapeRow) {
            if (currentShape[x] == Type.BLOCK)
                hasBlock = true;
        }
        if (!hasBlock) {
            check--;
        }
    }
    if (currentShapeXOffset + (currentShapeRow - (currentShape.length - check)) >= gameWidth)
        return false;
    return true;
};
var canMoveDown = function () {
    return true;
};
/**
 * Function checks if current shape can rotate on grid
 * without overlaping with other elements
 * @param  {Type[]} shapeCopy
 * @returns boolean
 */
var canRotate = function (shapeCopy) {
    var boardCopy = JSON.parse(JSON.stringify(board));
    var yy = 0;
    var check = currentShape.length;
    var checkForShape = false;
    for (var y = 0; y < gameHeight; ++y) {
        for (var x = 0; x < gameWidth; ++x) {
            if (x >= currentShapeXOffset && x < (currentShapeXOffset + currentShapeRow) && y >= currentShapePos && y < (currentShapePos + currentShapeRow)) {
                console.log(x, currentShapeXOffset, yy, currentShapeRow, (x - currentShapeXOffset) + yy);
                if (shapeCopy[(x - currentShapeXOffset) + yy] === Type.BLOCK && boardCopy[y][x] === Type.BLOCK)
                    return false;
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
    if (check)
        return false;
    return true;
};
var moveLeft = function () { return canMoveLeft() ? currentShapeXOffset-- : noop(); };
var moveRight = function () { return canMoveRight() ? currentShapeXOffset++ : noop(); };
var moveDown = function () { return canMoveDown() ? currentShapePos++ : noop(); };
var rotateCurrentShape = function () {
    var shapeCopy = [];
    var rowLength = currentShapeRow;
    for (var i = 0; i < currentShape.length; i++) {
        var x = i % rowLength;
        var y = Math.floor(i / rowLength);
        var newX = rowLength - y - 1;
        var newY = x;
        var newPosition = newY * rowLength + newX;
        shapeCopy[newPosition] = currentShape[i];
    }
    // check if shape copy overlaps somewhere on grid with some other element
    if (!canRotate(shapeCopy)) {
        console.log("CANT ROATATE");
        return;
    }
    currentShape = shapeCopy;
};
var generateRandomShape = function () {
    var shape = Math.floor(Math.random() * (shapes.length - 1) + 1);
    currentShape = shapes[shape];
    currentShapeColor = shapeColors[shape];
    switch (currentShape.length) {
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
};
var noop = function () { };
var bindEventListener = function () { return document.onkeyup = handleEvent; };
var handleEvent = function (e) {
    switch (e.keyCode) {
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
};
var initBoard = function () {
    bindEventListener();
    // create board matrix representing tetris fields
    for (var y = 0; y < gameHeight; ++y) {
        board[y] = [];
        for (var x = 0; x < gameWidth; ++x) {
            board[y][x] = Type.EMPTY;
            fillEmpty(x, y);
        }
    }
    board[5][6] = Type.BLOCK;
    generateRandomShape();
    requestAnimationFrame(render);
};
initBoard();
//# sourceMappingURL=index.js.map