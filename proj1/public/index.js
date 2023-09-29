const socket = io();
var inGame = false;
var isPlayer1 = true;
var isAI = false;
var isLocal = false;
var role = null;
const NUM_TO_WIN = 5;

// set up board
const board = document.getElementById('board');
const context = board.getContext('2d');
const NUM_ROWS = 19, NUM_COLS = NUM_ROWS, BOARD_SIZE = 760;
board.width = BOARD_SIZE, board.height = BOARD_SIZE;
context.strokeStyle = 'black';

const cells = new Array(NUM_ROWS);
for (let i = 0; i < NUM_ROWS; i++) {
    cells[i] = new Array(NUM_ROWS);
    for (let j = 0; j < NUM_ROWS; j++) {
        cells[i][j] = 0;
    }
}

function resetBoard() {
    context.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);
    for (var x = 0; x <= BOARD_SIZE; x += BOARD_SIZE/NUM_ROWS) {
        context.moveTo(x, 0);
        context.lineTo(x, BOARD_SIZE);
        context.moveTo(0, x);
        context.lineTo(BOARD_SIZE, x);
    }
    context.stroke();
    for (let i = 0; i < NUM_ROWS; i++) {
        for (let j = 0; j < NUM_ROWS; j++) {
            cells[i][j] = 0;
        }
    }
}
resetBoard();
set_homepage();

board.addEventListener('click', function(event) {
    const row = Math.round(event.offsetY / (BOARD_SIZE/NUM_ROWS));
    const col = Math.round(event.offsetX / (BOARD_SIZE/NUM_ROWS));
    console.log("Attempting to make move at (" + row + ", " + col + ")");
    if (role == null) {
        console.log("Game not started yet");
        alert("Game not started yet");
        return;
    }
    if (!inGame) {
        console.log("Game already finished");
        alert("Game already finished");
        return;
    }
    if (cells[row][col] != 0) {
        console.log("Position already occupied");
        alert("Position already occupied");
        return;
    }
    if (!isLocal) {
        if (isPlayer1 && role != "player_1") {
            console.log("Wait for player 1 to make a move");
            alert("Wait for player 1 to make a move");
            return;
        }
        if (!isPlayer1 && role != "player_2") {
            console.log("Wait for player 2 to make a move");
            alert("Wait for player 2 to make a move");
            return;
        }
        socket.emit('make_move', { row: row, col: col, player: socket.id, isAI: isAI});
    } else {
        drawMove(row, col, isPlayer1);
        if (checkWin(row, col, isPlayer1 ? 1 : 2)) {
            document.getElementById("message").innerHTML = isPlayer1 ? "Black wins!" : "White wins!";
            inGame = false;
            return;
        } 
        isPlayer1 = !isPlayer1;
        role = isPlayer1 ? "player_1" : "player_2";
        document.getElementById("message").innerHTML = isPlayer1 ? "Black's turn" : "White's turn";
    }
});

function drawMove(row, col, isPlayer1) {
    var x = Math.round(col * (BOARD_SIZE/NUM_ROWS));
    var y = Math.round(row * (BOARD_SIZE/NUM_ROWS));
    cells[row][col] = isPlayer1 ? 1 : 2;
    context.beginPath();
    context.arc(x, y, 10, 0, 2*Math.PI);
    context.fillStyle = isPlayer1 ? 'black' : 'white';
    context.fill();
    context.stroke();
}

// game state
socket.on('connect', function() {
    console.log('Connected to server');
    set_homepage();
});

socket.on('disconnect', function() {
    console.log('Disconnected from server');
    socket.emit('exit', {player:socket.id});
    set_homepage();
});

socket.on('err', function(data) {
    alert(data.message);
});

// For homepage: 
document.getElementById("start_local").onclick = function() {
    console.log("Requesting game with local player");
    isLocal = true;
    isAI = false;
    inGame = true;
    set_gamepage();
    resetBoard();
    document.getElementById("message").innerHTML = "Black's turn";
    role = "player_1";
};
document.getElementById("start_player").onclick = function() {
    console.log("Requesting game with player");
    isLocal = false;
    isAI = false;
    socket.emit('requestGame', {isAI: false, player: socket.id});
};
document.getElementById("start_ai").onclick = function() {
    console.log("Requesting game with AI");
    isLocal = false;
    isAI = true;
    socket.emit('requestGame', {isAI: true, player: socket.id});
};

function set_homepage() {
    inGame = false;
    document.getElementById("start_player").disabled = false;
    document.getElementById("start_ai").disabled = false;
    document.getElementById("homepage").style.display = "block";
    document.getElementById("gamepage").style.display = "none";
}

// For gamepage:

document.getElementById("exit").onclick = function() {
    console.log("Exiting game");
    socket.emit('exit', {player:socket.id});
    set_homepage();
    window.location.reload();
};

function set_gamepage() {
    inGame = true;
    document.getElementById("start_player").disabled = true;
    document.getElementById("start_ai").disabled = true;
    document.getElementById("homepage").style.display = "none";
    document.getElementById("gamepage").style.display = "block";
}

socket.on('wait', function(data) {
    if (data.player == socket.id) {
        isAI = false;
        set_gamepage();
        resetBoard();
        document.getElementById("message").innerHTML = "Waiting for another player to join...";
    }
});

socket.on('start', function(data) {
    isAI = false;
    set_gamepage();
    resetBoard();
    if (data.player != socket.id) { // player 1
        document.getElementById("message").innerHTML = "Your turn";
        role = "player_1";
    } else { // player 2
        document.getElementById("message").innerHTML = "Waiting for other player to make a move...";
        role = "player_2";
    }
});

socket.on('start_ai', function(data) {
    isAI = true;
    set_gamepage();
    resetBoard();
    document.getElementById("message").innerHTML = "Your turn";
    role = "player_1";
});

socket.on('move_made', function(data) {
    isPlayer1 = !isPlayer1;
    const message = document.getElementById("message").innerHTML;
    if (message == "Your turn") {
        document.getElementById("message").innerHTML = "Waiting for other player to make a move...";
    } else {
        document.getElementById("message").innerHTML = "Your turn";
    }
    drawMove(data.row, data.col, data.isPlayer1);
});

socket.on('game_over', function(data) {
    if (data.winner == socket.id) {
        document.getElementById("message").innerHTML = "You win!";
    } else {
        document.getElementById("message").innerHTML = "You lose!";
    }
});

socket.on('exit', function(data) {
    alert("Other player exited the game");
    set_homepage();
    window.location.reload();
});

function checkWin(row, col, player, win_count = NUM_TO_WIN) {
    let count = 0;
    // check horizontal
    for (let i = col; i >= 0; i--) {
        if (cells[row][i] == player) {
            count++;
        } else {
            break;
        }
    }
    for (let i = col + 1; i < NUM_COLS; i++) {
        if (cells[row][i] == player) {
            count++;
        } else {
            break;
        }
    }
    if (count >= win_count) {
        return true;
    }

    // check vertical
    count = 0;
    for (let i = row; i >= 0; i--) {
        if (cells[i][col] == player) {
            count++;
        } else {
            break;
        }
    }
    for (let i = row + 1; i < NUM_ROWS; i++) {
        if (cells[i][col] == player) {
            count++;
        } else {
            break;
        }
    }
    if (count >= win_count) {
        return true;
    }

    // check diagonal
    count = 0;
    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
        if (cells[i][j] == player) {
            count++;
        } else {
            break;
        }
    }
    for (let i = row + 1, j = col + 1; i < NUM_ROWS && j < NUM_COLS; i++, j++) {
        if (cells[i][j] == player) {
            count++;
        } else {
            break;
        }
    }
    if (count >= win_count) {
        return true;
    }

    // check anti-diagonal
    count = 0;
    for (let i = row, j = col; i >= 0 && j < NUM_COLS; i--, j++) {
        if (cells[i][j] == player) {
            count++;
        } else {
            break;
        }
    }
    for (let i = row + 1, j = col - 1; i < NUM_ROWS && j >= 0; i++, j--) {
        if (cells[i][j] == player) {
            count++;
        } else {
            break;
        }
    }
    if (count >= win_count) {
        return true;
    }
    return false;
}