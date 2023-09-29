// App setup
const express = require("express");
const PORT = 3000;
const app = express();
const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT} ...`);
});

// Static files
app.use(express.static("public"));

// Socket setup
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:8100",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});

var player_1; // socket of player 1
var player_2; // socket of player 2
let num_players = 0;

var isPlayer1 = true;
var isAI = false;

const GameState = {
    WAITING: 0,
    STARTED: 1,
    FINISHED: 2
};
var game_state = GameState.WAITING;

const NUM_ROWS = 19;
const NUM_COLS = NUM_ROWS;
const NUM_TO_WIN = 5;
let board = new Array(NUM_ROWS);
for (let i = 0; i < NUM_ROWS; i++) {
    board[i] = new Array(NUM_COLS);
    for (let j = 0; j < NUM_COLS; j++) {
        board[i][j] = 0;
    }
}

io.on('connection', function(socket) {
    socket.on('disconnect', function() {
        if (game_state == GameState.STARTED) {
            if (socket.id == player_1) { // player 1 exited
                console.log("Player 1 exited the game");
                socket.broadcast.to(player_2).emit('exit', {});
            } else if (socket.id == player_2) { // player 2 exited
                console.log("Player 2 exited the game");
                socket.broadcast.to(player_1).emit('exit', {});
            }
            game_state = GameState.FINISHED;
            resetGame();
        }
    });

    socket.on('requestGame', function(data) {
        if (game_state != GameState.WAITING) { // reject player if the game has started
            socket.emit('err', { message: 'Game already started' });
            return;
        }
        if (data.isAI) {
            console.log("Player " + ++num_players + " joined the game");
            console.log("Player " + ++num_players + " is AI");
            player_1 = socket.id;
            player_2 = "AI";
            isAI = true;
            game_state = GameState.STARTED;
            socket.emit('start_ai', {player: socket.id});
        } else {
            num_players++;
            isAI = false;
            console.log("Player " + num_players + " joined the game");
            if (num_players == 1) { // player 1 joined
                player_1 = data.player;
                game_state = GameState.WAITING;
                socket.emit('wait', {player: data.player});
            } else { // player 2 joined
                player_2 = data.player;
                game_state = GameState.STARTED;
                socket.emit('start', {player: data.player});
                socket.broadcast.to(player_1).emit( 'start', {player: data.player} );
            }
        }
    });

    socket.on('make_move', function(data) {
        if (game_state == GameState.FINISHED) {
            socket.emit('err', { message: 'Game already finished' });
            return;
        } else if (game_state == GameState.WAITING) {
            socket.emit('err', { message: 'Game not started yet' });
            return;
        } else {
            let row = data.row;
            let col = data.col;
            let player = data.player;

            let err = checkValidMove(row, col, player);
            if (err == "") {
                console.log("Player" + (isPlayer1 ? "1" : "2") + " made a move at (" + row + ", " + col + ")");
                board[row][col] = player;
                io.emit('move_made', { row: row, col: col, isPlayer1: isPlayer1 });
                if (checkWin(row, col, player)) {
                    io.emit('game_over', { winner: player});
                    game_state = GameState.FINISHED;
                } else {
                    isPlayer1 = !isPlayer1;
                }

                // AI makes a move
                if (isAI && game_state == GameState.STARTED) {
                    let row, col;
                    [row, col] = find_best_move();
                    console.log("AI made a move at (" + row + ", " + col + ")");
                    board[row][col] = player_2;
                    io.emit('move_made', { row: row, col: col, isPlayer1: false });
                    if (checkWin(row, col, player_2)) {
                        io.emit('game_over', { winner: player_2});
                        game_state = GameState.FINISHED;
                    } else {
                        isPlayer1 = !isPlayer1;
                    }
                }

            } else {
                socket.emit('err', { message: err });
            }
        }
    });

    socket.on('exit', function(data) {
        if (data.player == player_1) { // player 1 exited
            console.log("Player 1 exited the game");
            socket.broadcast.to(player_2).emit('exit', {});
        } else if (data.player == player_2) { // player 2 exited
            console.log("Player 2 exited the game");
            socket.broadcast.to(player_1).emit('exit', {});
        }
        game_state = GameState.FINISHED;
        resetGame();
    });
});

function resetGame() {
    num_players = 0;
    player_1 = null;
    player_2 = null;
    isPlayer1 = true;
    game_state = GameState.WAITING;
    board = new Array(NUM_ROWS);
    for (let i = 0; i < NUM_ROWS; i++) {
        board[i] = new Array(NUM_COLS);
        for (let j = 0; j < NUM_COLS; j++) {
            board[i][j] = 0;
        }
    }
}

function checkValidMove(row, col, player) {
    if (row < 0 || row >= NUM_ROWS || col < 0 || col >= NUM_COLS) {
        return "Position out of bound";
    }
    if (board[row][col] != 0) {
        return "Position already occupied";
    }
    if (isPlayer1 && player != player_1) {
        return "Wait for player 1 to make a move";
    }
    if (!isPlayer1 && player != player_2) {
        return "Wait for player 2 to make a move";
    }
    return "";
}

function checkWin(row, col, player, win_count = NUM_TO_WIN) {
    let count = 0;
    // check horizontal
    for (let i = col; i >= 0; i--) {
        if (board[row][i] == player) {
            count++;
        } else {
            break;
        }
    }
    for (let i = col + 1; i < NUM_COLS; i++) {
        if (board[row][i] == player) {
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
        if (board[i][col] == player) {
            count++;
        } else {
            break;
        }
    }
    for (let i = row + 1; i < NUM_ROWS; i++) {
        if (board[i][col] == player) {
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
        if (board[i][j] == player) {
            count++;
        } else {
            break;
        }
    }
    for (let i = row + 1, j = col + 1; i < NUM_ROWS && j < NUM_COLS; i++, j++) {
        if (board[i][j] == player) {
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
        if (board[i][j] == player) {
            count++;
        } else {
            break;
        }
    }
    for (let i = row + 1, j = col - 1; i < NUM_ROWS && j >= 0; i++, j--) {
        if (board[i][j] == player) {
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

function find_best_move() {
    for (let c = NUM_TO_WIN; c >= 1; c--) {
        for (let i = 0; i < NUM_ROWS; i++) {
            for (let j = 0; j < NUM_COLS; j++) {
                // under the current situation, play a piece for each side
                if (board[i][j] == '0') {
                    board[i][j] = player_2;
                    if (checkWin(i, j, player_2, c)) {
                        board[i][j] = '0';
                        return [i, j];
                    }
                    board[i][j] = player_1;
                    if (checkWin(i, j, player_1, c)) {
                        board[i][j] = '0';
                        return [i, j];
                    }
                    board[i][j] = '0';
                }
            }
        }
    }
}