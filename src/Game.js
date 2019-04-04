import React from 'react';
import Board from './Board'
import Brain from './Brain'
import findWinner from './findWinner'
import Control from './Control'


export default class Game extends React.Component {
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
      xIsNext: false,
      lastMoves: [],
      winner: null
    };
  }


  /**
   * 
   * State is updated in 2 situations:
   *  When user clicked the square for new move 
   *  When user clicked the button to reproduce the past scene
   * 
   * @param {int} i 
   *  ordial number of the square in the board
   * @return {JSX}
   *  whole game (header, Board, moves, etc.)
   */
  handleClick(i) {
    // When the user resumes from move history, 
    // future moves from that time point must be deleted.
    // Therefore slice() is used
    // why stepNumber +1???
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const lastMoves = this.state.lastMoves.slice(0, this.state.stepNumber);

    const current = history[history.length - 1];

    // "array1 = array2" just results in reference,
    // therefore you need .slice() to copy every value of the array.
    // Alternative notation for ES6:
    //    const squares = [...current.squares]
    // When I delete "slice()" part, jumpTo() button is no longer available. why???
    const squares = current.squares.slice();

    // console.log("before slice:", current.squares);
    // console.log("after slice", current.squares.slice());

    // Not to change the state and just ignore the click event:
    //    when winner is determined
    //    when squares[i] already has value
    let winner = findWinner(
      squares,
      this.boardSize,
      this.winnerChainLength,
      i)
    this.setState({ winner: winner });

    if (winner || squares[i]) {
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
      xIsNext: !this.state.xIsNext,
      lastMoves: lastMoves.concat(i)
    });
  }

  /**
   * 
   * @param {int} step 
   */
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 1
    });
  }

  render() {

    // Notice that you can write codes inside render() scope
    // before "return(JSX)".
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = findWinner(
      current.squares,
      this.boardSize,
      this.winnerChainLength,
      this.state.lastMoves[this.state.lastMoves.length - 1])

    // console.log(this.state.lastMoves);


    // Here let's review the structure of "history"
    // "History" is the array of associative arrays.
    //    An associative array represents a scene
    // And an associative array has only one key:value pair
    //    The key is always "squares"
    //    The value is an array.
    //    Every element in the array represent each square of the board
    const scenes = history.map((step, scene) => {
      const description = scene ? scene + "手目" : '初期状態';

      // wrapping "ol" is written in render() part
      return (
        // "add key to repetitive components" rule
        <li key={scene}>
          <button onClick={() => this.jumpTo(scene)}>{description}</button>
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

    // Test Brain class
    let testMatrix = [
      [null, "O", "O", null, null],
      [null, "X", null, null, null],
      [null, "X", null, "O", null],
      [null, "O", "O", "X", null],
      [null, null, "O", null, null],
    ];
    var brain = new Brain(testMatrix, this.boardSize, this.winnerChainLength);
    console.log(brain.patterns);
    console.log(brain.matchPattern([null, null, null, null, "O", "O",], "O"));

    // At this "Game" class level, it's not determined which square was clicked.
    // Click on anywhere in Board DOM element triggers event handler
    return (
      <div>
        <div className="game">
          <div className="game-board">
            <Board
              boardSize={this.boardSize}
              squares={current.squares}
              onClick={i => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <h1>Gomoku</h1>
            <Control />
            <h2>{status}</h2>
            <ol>{scenes}</ol>
          </div>
        </div>
      </div>
    );
  }
}


