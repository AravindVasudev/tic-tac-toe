import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  board: number[][];
  boardIcons: string[] = ["", "X", "O"];

  constructor() {
    this.board = [[0, 0, 0],
                  [0, 0, 0],
                  [0, 0, 0]];
  }

  move(row: number, col: number) {
    if (!this.board[row][col]) {
      this.board[row][col] = Math.random() > 0.5 ? 1 : 2;
    }
  }
}
