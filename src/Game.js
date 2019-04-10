import React from 'react';
import Board from './Board';
import Brain from './Brain';
import Control from './Control';
import Table from 'react-bootstrap/Table';


export default class Game extends React.Component {
  // "history" format is like:
  //  [
  //    {squares: [null, null, null, null, null, null, null, null, null]},
  //    {squares: [null, "O" , null, null, null, null, null, null, null]},
  //    {squares: [null, "O" , null, "X" , null, null, null, null, null]},
  //  ]
  constructor(props) {
    super(props);
    this.boardSize = 15;
    this.winnerChainLength = 5;

    // Balance between "Make move to win" or "Make move to disturb opponent"
    // The more aggressiveness, the less com player's disturbing to opponent
    this.aggressiveness = 2;
    
    this.brain = new Brain(this.boardSize, this.winnerChainLength, this.aggressiveness);
    this.state = {
      history: [
        {
          squares: Array(this.boardSize * this.boardSize).fill(null),
        }
      ],
      stepNumber: 0,
      xIsNext: false,
      winner: null,
      lastMoves: [],
      oIsCom: false,
      xIsCom: true
    };
  }


  /**
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

    // Because "array1 = array2" is not copying but just making reference,
    // you need to use [...arr] or .slice()
    const squares = [...current.squares];

    // Not to change the state and just ignore the click event:
    //    A. when winner is already confirmed 
    //      (This evaluates if winner is confirmed BEFORE this click event)
    //    B. when squares[i] already has value
    if (this.state.winner || squares[i]) {
      return;
    }

    // If it's X's turn, fill the clicked cell with X
    // If not, fill with O
    squares[i] = this.state.xIsNext ? "X" : "O";

    let winner = this.brain.findWinner(squares, i);

    this.setState({
      history: history.concat([
        {
          squares: squares
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      lastMoves: lastMoves.concat(i),
      winner: winner? winner: null,
    },
      () => {
        // callback function (Run after setState())
        if(this.state.xIsNext)
          this.computerMove(this.state.history[this.state.history.length - 1].squares, "X")
      }
    );

    /** console.log() below fails.
     * Instead of showing updated state above, this shows old state.
     * Because setState() is async function
     *   which executed after even console.log()
     */
    // console.log(this.state.stepNumber);
  }

  /**
   * 
   * @param {int} step 
   */
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 1,
    });
  }


  computerMove(squares, nextPlayer) {
    const nextMove = this.brain.calculateScore(squares, nextPlayer);
    if(nextPlayer === "X"){
      this.handleClick(nextMove.row * this.boardSize + nextMove.col);
    }
  }

  render() {
    // Notice that you can write codes inside render() scope before "return(JSX)".
    const history = this.state.history;
    const current = history[this.state.stepNumber];

    let status;
    if (this.state.winner) {
      status = this.state.winner + "の勝ち！";
    } else {
      status = (this.state.xIsNext ? "X" : "O") + "の番です";
    }

    // At this "Game" class level, it's not sepcified which square was clicked.
    // Click on anywhere in Board DOM element triggers event handler
    return (
      <div className="container">
        <div className="game col-12">
          <div className="game-board col-9">
            <Board
              boardSize={this.boardSize}
              squares={current.squares}
              onClick={i => this.handleClick(i)}
            />
          </div>
          <div className="game-info col-3">
            <h1>Gomoku</h1>
            
            <Table striped bordered hover>
              <tbody className="gameStatus">
                <tr>
                  <td>手番</td>
                  <td>{status}</td>
                </tr>
                <tr>
                  <td>手数</td>
                  <td>{this.state.stepNumber + 1}手目</td>
                </tr>
                <tr>
                  <td>O</td>
                  <td>
                    人間<br/>
                    ?連勝中<br/>
                    勝率?%
                  </td>
                </tr>
                <tr>
                  
                  <td>X</td>
                  <td>
                    計算機<br/>
                    ?連勝中<br/>
                    勝率?%
                  </td>
                </tr>
                
                
              </tbody>
            </Table>
            <Control />
          </div>
        </div>
      </div>
    );
  }
}


