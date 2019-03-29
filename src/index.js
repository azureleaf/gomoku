import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Board from './Board';
import * as serviceWorker from './serviceWorker';


class Game extends React.Component {
  constructor(props) {
    super(props);
    this.boardSize = 4;
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
    if (calculateWinner(squares) || squares[i]) {
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
    const winner = calculateWinner(current.squares);

    console.log("History:", history);

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
      status = winner + "の勝ち";
    } else {
      status = "手番: " + (this.state.xIsNext ? "X" : "O");
    }

    // How does they identify which square was clicked?
    // At this "Game" class level, it's not determined which square was clicked.
    // Click on anywhere in Board DOM element triggers event handler
    return (
      <div>
        <h1>Tic Tac Toe</h1>

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

// This hard-coded "lines" should be modified into flexible one
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;

}


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
