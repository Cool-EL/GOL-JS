const ROWS = 100;
const COLS = ROWS;

const DEAD = 0;
const ALIVE = 1;
const NEIBOR = 2;

let animationFrameID = undefined;
let timeoutID = undefined;
const canvasSpeedInput = document.getElementById( "canvas-speed" );
let canvasSpeed = parseInt( canvasSpeedInput.value );
canvasSpeedInput.addEventListener( "change", (e) => {
    canvasSpeed = parseInt( canvasSpeedInput.value ) ?? 50;
    stopAnimation();
    if( animationFrameID ) {
        startLoop();
    }
} );
canvasSpeedInput.addEventListener( "keyup", (e) => {
    e.stopImmediatePropagation();
} );

/**
 * @type {Array<Array>}
 */
let boardVector = [];
/* Init 2D array with 0 */
for( let i = 0; i<ROWS; i++ ) {
    let tempArr = [];
    for( let j = 0; j<COLS; j++ ) {
        tempArr.push( 0 );
    }
    boardVector.push( tempArr );
}

/**
 * @type {HTMLCanvasElement}
 */
const golCanvas = document.getElementById( "gol-canvas" );
/**
 * @type {CanvasRenderingContext2D}
 */
const golCtx = golCanvas.getContext("2d");

const DOMCanvasWidth = golCanvas.getBoundingClientRect().width;
const DOMCanvasHeight = golCanvas.getBoundingClientRect().height;
console.log("DOM canvas sizes: ", DOMCanvasWidth, "px by ", DOMCanvasWidth, "px")

const CELL_SIZE = parseInt( DOMCanvasWidth/ROWS );
console.log("Possible cell size: ", CELL_SIZE)

const WIDTH = ROWS * CELL_SIZE;
const HEIGHT = COLS * CELL_SIZE;
golCanvas.style.width = `${ WIDTH }px`;
golCanvas.style.height = `${ HEIGHT }px`;
golCanvas.width = ROWS * CELL_SIZE;
golCanvas.height = COLS * CELL_SIZE;


/* DRAW */
createBoard();

window.addEventListener( "keyup", (e) => {
    e.preventDefault();

    if(e.code === "KeyR") {
        stopAnimation();
        createBoard();
        return;
    }
    if(e.code === "Enter") {
        console.log("e")
        startLoop();
        return;
    }
} )

/* Glider */
// setCellAt(ALIVE, 25, 25);
// setCellAt(ALIVE, 26, 25);
// setCellAt(ALIVE, 27, 25);
// setCellAt(ALIVE, 27, 24);
// setCellAt(ALIVE, 26, 23);

function stopAnimation() {
    clearTimeout( timeoutID );
    cancelAnimationFrame( animationFrameID );
}

function createBoard() {
    drawBoard();
    for( let j = 0; j<COLS; j++ ) {
        for( let i = 0; i<ROWS; i++ ) {
            setCellAt(parseInt( Math.random() * 2 ), i, j);
        }
    }
    drawCells();
}

function startLoop() {
    updateBoard();
    drawBoard();
    drawCells();
    timeoutID = setTimeout( () => {
        animationFrameID = requestAnimationFrame(startLoop);
    }, canvasSpeed );
}


function drawBoard() {
    golCtx.fillStyle = "white";
    golCtx.beginPath();
    golCtx.moveTo(0, 0);
    golCtx.lineTo(WIDTH, 0);
    golCtx.lineTo(WIDTH, HEIGHT);
    golCtx.lineTo(0, HEIGHT);
    golCtx.fill();

    golCtx.strokeStyle = "gray";
    golCtx.beginPath();
    golCtx.moveTo(0, 0);
    golCtx.lineTo(WIDTH, 0);
    golCtx.lineTo(WIDTH, HEIGHT);
    golCtx.lineTo(0, HEIGHT);
    golCtx.stroke();

    /* Draw vertical lines */
    for( let i = 1; i<ROWS; i++ ) {
        golCtx.beginPath();
        golCtx.moveTo(CELL_SIZE * i, 0);
        golCtx.lineTo(CELL_SIZE * i, HEIGHT);
        golCtx.stroke();
    }
    /* Draw horizontal lines */
    for( let i = 1; i<COLS; i++ ) {
        golCtx.beginPath();
        golCtx.moveTo(0, CELL_SIZE * i);
        golCtx.lineTo(WIDTH, CELL_SIZE * i);
        golCtx.stroke();
    }
}

/**
 * 
 * @param {number} row 
 * @param {number} col 
 */
function drawCells() {
    for( let j = 0; j<COLS; j++ ) {
        for( let i = 0; i<ROWS; i++ ) {
            if( boardVector[i][j] === ALIVE ) {
                    golCtx.fillStyle = "black";
                    golCtx.fillRect( i * CELL_SIZE + 1, j * CELL_SIZE + 1, ( CELL_SIZE - 2 ), ( CELL_SIZE - 2 ) );
                }
            }
    }
}

function drawDebugCellAt( type, i, j, size ) {
    switch( type ) {
        case DEAD:
            golCtx.fillStyle = "white";
            golCtx.fillRect( i * CELL_SIZE + size/2 + 1, j * CELL_SIZE + size/2 + 1, ( size-2 ), ( size-2 ) );
            break;
        case ALIVE:
            golCtx.fillStyle = "black";
            golCtx.fillRect( i * CELL_SIZE + size/2 + 1, j * CELL_SIZE + size/2 + 1, ( size-2 ), ( size-2 ) );
            break;
        case NEIBOR:
            golCtx.fillStyle = "yellow";
            golCtx.fillRect( i * CELL_SIZE + size/2 + 1, j * CELL_SIZE + size/2 + 1, ( size-2 ), ( size-2 ) );
            break;
    }
}

/**
 * 
 * @param {0|1} value 
 * @param {number} row 
 * @param {number} col 
 */
function setCellAt(value, row, col) {
    boardVector[row][col] = value;
}

function updateBoard() {
    let tempBoardVector = structuredClone( boardVector );
    for( let j = 0; j<COLS; j++ ) {
        for( let i = 0; i<ROWS; i++ ) {
            const neibors = checkNeibors(i, j);
            if( tempBoardVector[i][j] === ALIVE ) {
                if( neibors < 2 ) {
                    tempBoardVector[i][j] = DEAD;
                }
                if( neibors > 3 ) {
                    tempBoardVector[i][j] = DEAD;
                }
            }
            if( tempBoardVector[i][j] === DEAD ) {
                if( neibors === 3 ) {
                    tempBoardVector[i][j] = ALIVE;
                }
            }
        }
    }

    boardVector = structuredClone( tempBoardVector );
}

/**
 * 
 * @param {number} row 
 * @param {number} col 
 * @returns {number}
 */
function checkNeibors(row, col) {
    let neibors = 0;
    let neiborsPositions = [
        [ (row-1 + ROWS) % ROWS, (col-1 + COLS) % COLS ],
        [ (  row + ROWS) % ROWS, (col-1 + COLS) % COLS ],
        [ (row+1 + ROWS) % ROWS, (col-1 + COLS) % COLS ],
        [ (row-1 + ROWS) % ROWS, (  col + COLS) % COLS ],
        [ (row+1 + ROWS) % ROWS, (  col + COLS) % COLS ],
        [ (row-1 + ROWS) % ROWS, (col+1 + COLS) % COLS ],
        [ (  row + ROWS) % ROWS, (col+1 + COLS) % COLS ],
        [ (row+1 + ROWS) % ROWS, (col+1 + COLS) % COLS ]
    ];

    for( let i = 0; i<neiborsPositions.length; i++ ) {
        if( boardVector[neiborsPositions[i][0]][neiborsPositions[i][1]] === ALIVE ){
            neibors++;
            // drawDebugCellAt( NEIBOR, neiborsPositions[i][0], neiborsPositions[i][1], parseInt( CELL_SIZE/2 ) );
        }
        
    }

    return neibors;
}