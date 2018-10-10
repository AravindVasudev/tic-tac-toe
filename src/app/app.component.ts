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

  fillBoard(dimension: number, value: number): void {
    this.board = new Array(dimension);
    for (let i = 0; i < dimension; i++) {
      this.board[i] = new Array(dimension).fill(value);
    }
  }

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

  hasWon(player: number, board = this.board): boolean {
    // row check
    let rowCheck: boolean = board.map(row =>
        row.every(cell => cell == player)).includes(true);

    // column check
    let columnCheck = false;
    for (let i = 0; i < board.length; i++) {
      let won = true;
      for (let j = 0; j < board[0].length; j++) {
        won = player == board[j][i];
        if (!won) {
          break;
        }
      }

      if (won) {
        columnCheck = true;
        break;
      }
    } 

    // diagonal check
    let leftDiagonalCheck = true;
    let rightDiagonalCheck = true;
    for (let i = 0, j = board.length - 1; i < board.length; i++, j--) {
      leftDiagonalCheck = player == board[i][i];
      rightDiagonalCheck = player == board[i][j];

      if (!leftDiagonalCheck && !rightDiagonalCheck) {
        break;
      }
    }

    console.log(rowCheck, columnCheck, leftDiagonalCheck, rightDiagonalCheck);
    return rowCheck || columnCheck || leftDiagonalCheck || rightDiagonalCheck;
  }

  hasWon3By3(player: number, board = this.board): boolean {
    if
    ((board[0][0] === player && board[0][1] === player && board[0][2] === player) ||
    (board[1][0] === player && board[1][1] === player && board[1][2] === player) ||
    (board[2][0] === player && board[2][1] === player && board[2][2] === player) ||
    (board[0][0] === player && board[1][0] === player && board[2][0] === player) ||
    (board[0][1] === player && board[1][1] === player && board[2][1] === player) ||
    (board[0][2] === player && board[1][2] === player && board[2][2] === player) ||
    (board[0][0] === player && board[1][1] === player && board[2][2] === player) ||
    (board[0][2] === player && board[1][1] === player && board[2][0] === player)) {
      return true;
    }

    return false;
  }

  minimax(curBoard, curPlayer): [number, [number, number]] {
    // Player won
    if (this.hasWon3By3(this.player, curBoard)) {
      return [-10, null];
    }

    // Bot won
    if (this.hasWon3By3(this.bot, curBoard)) {
      return [10, null];
    }

    let freeSpaces: [number, number][] = this.getFreeSpaces(curBoard);
    if (!freeSpaces.length) { // Tie
      return [0, null];
    }

    // get all possible moves with their respective scores
    let moves: [number, [number, number]][] = [];
    for (let i = 0; i < freeSpaces.length; i++) {
      // move player to current free space
      curBoard[freeSpaces[i][0]][freeSpaces[i][1]] = curPlayer;
      
      // add next move to the moves array
      let move = this.minimax(curBoard, curPlayer == this.bot ? this.player : this.bot);
      move[1] = freeSpaces[i];

      moves.push(move);

      // reset board
      curBoard[freeSpaces[i][0]][freeSpaces[i][1]] = this.empty;
    }

    // choose the next move
    let bestMove: number;
    if (curPlayer === this.bot) { // Maximizer
      let bestScore = -10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i][0] > bestScore) {
          bestScore = moves[i][0];
          bestMove = i;
        }
      }
    } else { // Minimizer
      let bestScore = 10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i][0] < bestScore) {
          bestScore = moves[i][0];
          bestMove = i;
        }
      }
    }

    return moves[bestMove];
  }

  randomMove(player: number): [number, number] {
    const freeSpaces: [number, number][] = this.getFreeSpaces();
    return freeSpaces[Math.floor(Math.random() * freeSpaces.length)];
  }

  moveBot(): void {
    if (this.getFreeSpaces().length) {
      let move: [number, number] = this.minimax(this.board, this.bot)[1];
      this.board[move[0]][move[1]] = this.bot;
    }

    // Check if the bot has won
    if (this.hasWon(this.bot)) {
      console.log(this.board);
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
      this.fillBoard(this.boardSize, this.player);
      return;
    }

    this.moveBot();
  }
}
