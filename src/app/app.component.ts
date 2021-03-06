import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  board: number[][];
  boardIcons: string[] = ["", "X", "O"];
  player: number;
  bot: number;
  empty: number = 0;
  winner: number;
  boardSize: number = 3;

  constructor() {
    // use board size if passed as last url param
    let lastUrlParam = parseInt(window.location.href.split('/').pop());
    if (lastUrlParam) {
      if (lastUrlParam < 3) {
        lastUrlParam = 3;
      } else if (lastUrlParam > 10) {
        lastUrlParam = 10;
      }

      this.boardSize = lastUrlParam;
    }

    // Init board
    this.fillBoard(this.boardSize, this.empty);

    // Randomly choose X and O
    if (Math.random() > 0.5) {
      this.player = 1;
      this.bot = 2;
    } else {
      this.player = 2;
      this.bot = 1;
    }

    // If bot is player 1
    if (this.bot == 1) {
      this.moveBot();
    }
  }

  // create a empty board of specified dimension
  fillBoard(dimension: number, value = this.empty): void {
    this.board = new Array(dimension);
    for (let i = 0; i < dimension; i++) {
      this.board[i] = new Array(dimension).fill(value);
    }
  }

  // returns all available free space in the board
  getFreeSpaces(board = this.board): [number, number][] {
    let freeSpaces: [number, number][] = [];

    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[0].length; j++) {
        if (board[i][j] === this.empty) {
          freeSpaces.push([i, j]);
        }
      }
    }

    return freeSpaces;
  }

  // check if the given player has won
  hasWon(player: number, board = this.board): boolean {
    let rowCheck = true;
    let columnCheck = true;
    let leftDiagonalCheck = true;
    let rightDiagonalCheck = true;

    for (let i = 0, k = board.length - 1; i < board.length; i++, k--) {
      for (let j = 0; j < board.length; j++) {
        rowCheck = rowCheck && (player === board[i][j]);
        columnCheck = columnCheck && (player === board[j][i]);

        if (!(rowCheck || columnCheck)) { // breaks if both the check fails
          break;
        }
      }

      // check diagonals
      leftDiagonalCheck = leftDiagonalCheck && (player === board[i][i]);
      rightDiagonalCheck = rightDiagonalCheck && (player === board[i][k]);

      if (rowCheck || columnCheck) {
        return true;
      } else {
        rowCheck = true;
        columnCheck = true;
      }
    }

    return leftDiagonalCheck || rightDiagonalCheck;
  }

  // compute fitness for the given move count
  fitness(playerMoveCount: number, opponentMoveCount: number): number {
    if (playerMoveCount > 0 && opponentMoveCount === 0) {
      return playerMoveCount * playerMoveCount;
    }

    if (opponentMoveCount > 0 && playerMoveCount === 0) {
      return -1 * opponentMoveCount * opponentMoveCount;
    }

    return 0;
  }

  // compute heuristic value for the given board based on number of available winning spots for the player
  winningHeuristics(player: number, board: number[][]): number {
    let opponent = this.opponent(player);

    let playerLeftDiagonalCount = 0;
    let opponentLeftDiagonalCount = 0;
    let playerRightDiagonalCount = 0;
    let opponentRightDiagonalCount = 0;

    let fitness = 0;
    for (let i = 0, k = board.length - 1; i < board.length; i++, k--) {
      let playerRowCount = 0;
      let opponentRowCount = 0;
      let playerColumnCount = 0;
      let opponentColumnCount = 0;
      
      for (let j = 0; j < board.length; j++) {
        board[i][j] === player && playerRowCount++;
        board[i][j] === opponent && opponentRowCount++;

        board[j][i] === player && playerColumnCount++;
        board[j][i] === opponent && opponentColumnCount++;
      }

      fitness += this.fitness(playerRowCount, opponentRowCount);
      fitness += this.fitness(playerColumnCount, opponentColumnCount);

      board[i][i] === player && playerLeftDiagonalCount++;
      board[i][i] === opponent && opponentLeftDiagonalCount++;

      board[i][k] === player && playerRightDiagonalCount++;
      board[i][k] === opponent && opponentRightDiagonalCount++;
    }

    fitness += this.fitness(playerLeftDiagonalCount, opponentLeftDiagonalCount);
    fitness += this.fitness(playerRightDiagonalCount, opponentRightDiagonalCount);

    return fitness;
  }

  // returns opponent of the given player
  opponent(player: number): number {
    return player == this.player ? this.bot : this.player;
  }

  // returns the best move for the given player
  minimax(curBoard: number[][], curPlayer: number, depth = 4, alpha = Number.MIN_SAFE_INTEGER,
    beta = Number.MAX_SAFE_INTEGER): [number, [number, number]] {
    // if player won
    if (this.hasWon(this.player, curBoard)) {
      return [-10000 - depth, null];
    }

    // if bot won
    if (this.hasWon(this.bot, curBoard)) {
      return [10000 + depth, null];
    }

    let freeSpaces: [number, number][] = this.getFreeSpaces(curBoard);
    if (!freeSpaces.length) { // Tie
      return [0, null];
    }

    // Depth limit
    if (!depth) {
      return [this.winningHeuristics(curPlayer, curBoard), null];
    }

    // Pick the next best move for free spaces
    let bestMove: [number, [number, number]] = [curPlayer === this.bot ? 
      Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER, null];
    for (let i = 0; i < freeSpaces.length; i++) {
      // move player to current free space
      curBoard[freeSpaces[i][0]][freeSpaces[i][1]] = curPlayer;
      
      // get the best move for the current free space
      let move = this.minimax(curBoard, curPlayer == this.bot ? this.player : this.bot, depth - 1, alpha, beta);
      move[1] = freeSpaces[i];

      if (curPlayer === this.bot) { // Maximizing player
        if (bestMove[0] < move[0]) {
          bestMove = move;
        }
        
        alpha = Math.max(alpha, move[0]);
        if (beta <= alpha) { // α-β pruning
          curBoard[freeSpaces[i][0]][freeSpaces[i][1]] = this.empty;
          break;
        }
      } else { // Minimizing player
        if (bestMove[0] > move[0]) {
          bestMove = move;
        }

        beta = Math.min(beta, move[0]);
        if (beta <= alpha) { // α-β pruning
          curBoard[freeSpaces[i][0]][freeSpaces[i][1]] = this.empty;
          break;
        }
      }

      // reset board
      curBoard[freeSpaces[i][0]][freeSpaces[i][1]] = this.empty;
    }

    return bestMove;
  }

  moveBot(): void {
    // perform minimax if freeSpace is available
    if (this.getFreeSpaces().length) {
      console.time('bot-runtime');
      let move: [number, number] = this.minimax(this.board, this.bot)[1];
      console.timeEnd('bot-runtime');
      this.board[move[0]][move[1]] = this.bot;
    }

    // Check if the bot has won
    if (this.hasWon(this.bot)) {
      console.log(this.board);
      console.log(this.bot);
      
      this.fillBoard(this.boardSize, this.bot);
    }
  }

  move(row: number, col: number): void {
    // skip if the position is already occupied
    if (this.board[row][col] != this.empty) {
      return;
    }

    this.board[row][col] = this.player; // make player's move

    // Check if the player has won
    if (this.hasWon(this.player)) {
      console.log(this.board);
      console.log(this.bot);
      this.fillBoard(this.boardSize, this.player);
      return;
    }

    // Bot's move
    this.moveBot();
  }
}
