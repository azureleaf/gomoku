import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Board from './Board';
import * as serviceWorker from './serviceWorker';


class Game extends React.Component {
  constructor(props) {
    super(props);
    this.boardSize = 15;
    this.winnerChainLength = 5;
    this.state = {
      history: [
        {
          squares: Array(this.boardSize * this.boardSize).fill(null)
        }
      ],
      stepNumber: 0,
      xIsNext: true
    };
  }


  /**
   * 
   * State is updated in 2 situations:
   *  When user clicked the square for new move 
   *  When user clicked the button to reproduce the past scene
   * 
   * @param {int} i 
   *    number 
   */
  handleClick(i) {
    // What is this slice() for???
    const history = this.state.history.slice(0, this.state.stepNumber + 1);

    const current = history[history.length - 1];

    // Again, what is this "slice()" for???
    const squares = current.squares.slice();

    // Don't change the state and just ignore the click event:
    //    when winner is determined, or
    //    when squares[i] already has value
    if (findWinner(squares, this.boardSize, this.winnerChainLength) || squares[i]) {
      return;
    }

    // If it's X's turn, fill with X
    // If not, fill with O
    squares[i] = this.state.xIsNext ? "X" : "O";


    this.setState({
      history: history.concat([
        {
          // I think using the identical names like below are quite confusing
          squares: squares
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  /**
   * 
   * @param {int} step 
   */
  jumpTo(step) {
    this.setState({
      stepNumber: step,

      // This is a bit tricky but concise
      xIsNext: (step % 2) === 0
    });
  }

  render() {
    // Notice that you can write codes inside render() scope
    // other than "return(JSX)".

    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = findWinner(current.squares, this.boardSize, this.winnerChainLength)


    // Here let's review the structure of "history"
    // "History" is the array of associative arrays.
    //    An associative array represents a scene
    // And an associative array has only one key:value pair
    //    The key is always "squares"
    //    The value is an array.
    //    Every element in the array represent each square of the board
    const moves = history.map((step, move) => {
      // "move" is integer, however it is converted to string implicitly when "+" operator is applied
      const desc = move ?
        '場面 #' + move :
        '開始時場面';

      // "ul" is not defined anywhere, but somehow it works 
      return (
        // "add key to repetitive components" rule
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    // You don't have to write as "this.status",
    // maybe because "this" is necessary only when 
    // it refers to elements which is outside this method scope
    let status;
    if (winner) {
      status = winner + "の勝ち！";
    } else {
      status = "手番: " + (this.state.xIsNext ? "X" : "O");
    }

    // How does they identify which square was clicked?
    // At this "Game" class level, it's not determined which square was clicked.
    // Click on anywhere in Board DOM element triggers event handler
    return (
      <div>
        <h1>五目並べ</h1>
        <div className="game">
          <div className="game-board">
            <Board
              boardSize={this.boardSize}
              squares={current.squares}
              onClick={i => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <div>{status}</div>
            <ol>{moves}</ol>
          </div>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));



function findWinner(squares, boardSize, winnerChainLength) {

  var matrix = convertTo2D(squares);

  // Results of winner check
  // Each element represents for the check of a line

  for (var i = 0; i < boardSize; i++) {
    var results = [];

    results.push(countChain(
      scanLine(matrix, { x: i, y: 0 }, "R")
    ))
    results.push(countChain(
      scanLine(matrix, { x: 0, y: i }, "D")
    ))
    results.push(countChain(
      scanLine(matrix, { x: i, y: 0 }, "DR")
    ))
    results.push(countChain(
      scanLine(matrix, { x: 0, y: i }, "DR")
    ))
    results.push(countChain(
      scanLine(matrix, { x: i, y: 0 }, "UR")
    ))
    results.push(countChain(
      scanLine(matrix, { x: boardSize - 1, y: i }, "UR")
    ))

    for (var j = 0; j < results.length; j++) {
      if (results[j] != null) return results[j];
    }
  }


  /**
   * Convert array[boardSize*boardSize] into array[boardSize][boardSize]
   * 
   * @param {Array.<string|null>} arr 
   * @return {Array.<Array.<string|null>>}
   */
  function convertTo2D(arr) {
    var matrix = new Array(boardSize);
    for (var i = 0; i < boardSize; i++) {
      matrix[i] = new Array(boardSize);
      for (var j = 0; j < boardSize; j++) {
        matrix[i][j] = arr[i * boardSize + j];
      }
    }
    return matrix;
  }


  /**
   * Scan a line in the board
   *  from the designated point
   *  toward the designated direction
   *  until cursor reaches the edge of the board
   * Returns all the value found
   * 
   * @param {Array.<Array.<string|null>>} matrix 
   *  Two-dimension square array in the size of boardSize*boardSize
   * @param {object} origin 
   *  {x: int, y: int}
   * @param {string} direction 
   *  "R"  : toward right
   *  "D"  : toward down
   *  "DR" : toward down & right
   *  "UR" : toward up   & right
   */
  function scanLine(matrix, origin, direction) {
    var cursor = {
      x: origin.x,
      y: origin.y
    };
    var line = [];

    while (1) {
      line.push(matrix[cursor.x][cursor.y]);

      // If cursor reaches the board edge, return the line so far
      switch (direction) {
        case "R":
          if (cursor.y === boardSize - 1) return line;
          else cursor.y++;
          break;
        case "D":
          if (cursor.x === boardSize - 1) return line;
          else cursor.x++;
          break;
        case "DR":
          if (cursor.x === boardSize - 1 || cursor.y === boardSize - 1)
            return line;
          else {
            cursor.x++;
            cursor.y++;
          }
          break;
        case "UR":
          if (cursor.x === 0 || cursor.y === boardSize - 1)
            return line;
          else {
            cursor.x--;
            cursor.y++;
          }
          break;
        default:
          console.log("Error: unknown direction");
          return null;
      }
    }
  }


  /**
   * Returns winner if there's a completed stone chains
   * 
   * @param {Array.<string|null>} sequence 
   *  sequence of a line, e.g. ["X", null, "O", "O", null]
   * @return {string|null} 
   *  if winner is confirmed: "O" or "X"
   *  if not: null
   */
  function countChain(sequence) {

    // "player" is any of "null", "O", "X"
    var counter = {
      player: null,
      chainLength: 0
    };

    for (var i = 0; i < sequence.length; i++) {
      if (counter.player === sequence[i]) {
        counter.chainLength++;

        // chain of "null" is meaningless for the game, then ignore it
        if (counter.player !== null && counter.chainLength >= winnerChainLength) {
          return counter.player;
        }
      } else {
        counter.player = sequence[i];
        counter.chainLength = 1;
      }
    }

    // When no chain is completed
    return null;
  }
}


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
