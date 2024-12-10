const BOARD_SIZE = 12; // 12x12 grid
const MINE_COUNT = 25; // Increased mines for complexity
let board = [];
let gameOver = false;
let flagsRemaining = MINE_COUNT;

const boardEl = document.getElementById("game-board");

function createBoard() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        const rowArr = [];
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener("click", () => revealCell(row, col));
            cell.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                flagCell(row, col);
            });
            boardEl.appendChild(cell);
            rowArr.push({ mine: false, revealed: false, flagged: false, adjacentMines: 0 });
        }
        board.push(rowArr);
    }
}

function resetGame() {
    board = [];
    gameOver = false;
    flagsRemaining = MINE_COUNT;
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 40px)`;
    createBoard();
    placeMines();
    updateNumbers();
}

function placeMines() {
    let placedMines = 0;
    while (placedMines < MINE_COUNT) {
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        if (!board[row][col].mine) {
            board[row][col].mine = true;
            placedMines++;
        }
    }
}

function updateNumbers() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col].mine) continue;

            let mineCount = 0;
            for (let r = -1; r <= 1; r++) {
                for (let c = -1; c <= 1; c++) {
                    const newRow = row + r;
                    const newCol = col + c;
                    if (
                        newRow >= 0 &&
                        newRow < BOARD_SIZE &&
                        newCol >= 0 &&
                        newCol < BOARD_SIZE &&
                        board[newRow][newCol].mine
                    ) {
                        mineCount++;
                    }
                }
            }
            board[row][col].adjacentMines = mineCount;
        }
    }
}

function getCellElement(row, col) {
    return boardEl.querySelector(`[data-row='${row}'][data-col='${col}']`);
}

function revealCell(row, col) {
    if (gameOver || board[row][col].revealed || board[row][col].flagged) return;

    const cell = board[row][col];
    cell.revealed = true;
    const cellEl = getCellElement(row, col);
    cellEl.classList.add("revealed");

    if (cell.mine) {
        cellEl.classList.add("mine");
        cellEl.textContent = "💣";
        gameOver = true;
        revealAllBombs();
        alert("Game Over! You hit a mine!");
        return;
    }

    if (cell.adjacentMines > 0) {
        cellEl.textContent = cell.adjacentMines;
        cellEl.classList.add(`number-${cell.adjacentMines}`);
    } else {
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                const newRow = row + r;
                const newCol = col + c;
                if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                    revealCell(newRow, newCol);
                }
            }
        }
    }

    checkWin();
}

function flagCell(row, col) {
    if (gameOver || board[row][col].revealed) return;

    const cell = board[row][col];
    if (cell.flagged) {
        flagsRemaining++;
    } else {
        flagsRemaining--;
    }

    if (flagsRemaining < 0) {
        alert("You've used up all your flags!");
        return;
    }

    cell.flagged = !cell.flagged;
    const cellEl = getCellElement(row, col);
    cellEl.classList.toggle("flagged");
    cellEl.textContent = cell.flagged ? "🚩" : "";
}

function revealAllBombs() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = board[row][col];
            const cellEl = getCellElement(row, col);
            if (cell.mine) {
                cellEl.classList.add("mine");
                cellEl.textContent = "💣";
            } else if (!cell.revealed) {
                cellEl.classList.add("revealed");
                if (cell.adjacentMines > 0) {
                    cellEl.textContent = cell.adjacentMines;
                    cellEl.classList.add(`number-${cell.adjacentMines}`);
                }
            }
        }
    }
}

function checkWin() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = board[row][col];
            if (!cell.mine && !cell.revealed) return;
        }
    }
    alert("Congratulations! You win!");
    gameOver = true; // Stop further actions after winning
}

resetGame();
