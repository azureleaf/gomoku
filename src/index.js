import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}
 

class Row extends React.Component {
  

  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  numbers = [6, 7, 8]

  render() {
    return (
      <div className="board-row">
        {this.numbers.map(number =>
          <span key={number.toString()}>
            {this.renderSquare(number)}
          </span>)}
      </div>
    )
  }
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderArray(boardSize) {
    var arr = new Array(boardSize * boardSize);

    for (var i = 0; i < arr.length; i++) {
      arr[i] = i;

      // if (i % boardsize == 0) { }
    }

    console.log(arr);
  }


  numbers = [3, 4, 5];

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.numbers.map(number => <span key={number.toString()}>{this.renderSquare(number)}</span>)}
        </div>
        <div className="board-row">
          {/* <Row /> */}
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          // Board size is hardcoded here
          squares: Array(9).fill(null)
        }
      ],
      stepNumber: 0,
      xIsNext: true
    };
  }

  handleClick(i) {
    // What is this "slice()" for???
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    // When winner is determined, or
    // when squares[i] already has value (that is, that cell is not vacant),
    // don't change the state and just ignore the click event
    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    // If it's "x"'s turn, fill with X
    // If not, fill with O
    squares[i] = this.state.xIsNext ? "X" : "O";


    this.setState({
      history: history.concat([
        {
          squares: squares
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,

      // This is a bit tricky but concise
      xIsNext: (step % 2) === 0
    });
  }

  render() {
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

    let status;
    if (winner) {
      status = winner + "の勝ち";
    } else {
      status = "手番: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div>
        <h1>Tic Tac Toe</h1>

        <div className="game">
          <div className="game-board">
            <Board
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
