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

  getFreeSpaces(): [number, number][] {
    let freeSpaces: [number, number][] = [];

    for (let i = 0; i < this.board.length; i++) {
      for (let j = 0; j < this.board[0].length; j++) {
        if (this.board[i][j] === this.empty) {
          freeSpaces.push([i, j]);
        }
      }
    }

    return freeSpaces;
  }

  hasWon(): boolean {
    // row check
    let rowCheck: boolean = this.board.map(row =>
        row[0] != this.empty && row.every(cell => cell == row[0])).includes(true);

    // column check
    let columnCheck = false;
    for (let i = 0; i < this.board.length; i++) {
      if (this.board[0][i] == this.empty) {
        continue;
      }

      let won = true;
      for (let j = 0; j < this.board[0].length; j++) {
        won = this.board[0][i] == this.board[j][i];
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
    let leftDiagonalCheck = this.board[0][0] != this.empty;
    for (let i = 1; i < this.board.length && leftDiagonalCheck; i++) {
      leftDiagonalCheck = this.board[0][0] == this.board[i][i];
    }

    let rightDiagonalCheck = this.board[0][this.board.length - 1] != this.empty;
    for (let i = 0, j = this.board.length - 1; i < this.board.length && rightDiagonalCheck; i++, j--) {
      rightDiagonalCheck = this.board[0][this.board.length - 1] == this.board[i][j];
    }

    return rowCheck || columnCheck || leftDiagonalCheck || rightDiagonalCheck;
  }

  moveBot(): void {
    let freeSpaces: [number, number][] = this.getFreeSpaces();
    let move: number = Math.floor(Math.random() * freeSpaces.length);

    if (freeSpaces.length) {
      this.board[freeSpaces[move][0]][freeSpaces[move][1]] = this.bot;
    }
    
    if (this.hasWon()) {
      this.fillBoard(this.boardSize, this.bot);
      return;
    }
  }

  move(row: number, col: number): void {
    // skip if the position is already occupied
    if (this.board[row][col] != this.empty) {
      return;
    }

    this.board[row][col] = this.player; // make player's move

    if (this.hasWon()) {
      this.fillBoard(this.boardSize, this.player);
      return;
    }

    this.moveBot();
  }
}
