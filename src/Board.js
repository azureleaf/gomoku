import React from 'react';
import Square from './Square'


/**
 *  
 *  Instantiated by : Game object
 *  Instantiate     : Board object
 * 
 *  @param {array} props.squares
 *    e.g. ["X", "O", null, "X", null....]
 *  @param {function} props.onClick
 */
export default class Board extends React.Component {

  /**
   * @param {int} i 
   *    Ordinal number for every square in the board
   * @return {JSX} 
   *    Unlike "onClick()" in class Square,
   *    onClick() here isn't that of native HTML
   *    (therefore, can be renamed freely)
   */
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  /**
   * 
   * @param {int} boardSize 
   */
  renderRows(boardSize) {

    var rows = new Array(boardSize).fill(null);

    for (var i = 0; i < boardSize; i++) {
      rows[i] = new Array(boardSize).fill(null);
      for (var j = 0; j < boardSize; j++) {
        rows[i][j] = i * boardSize + j;
      }
    }

    return (
      <div>
        {rows.map(row => <div key={row[0].toString()}>{this.renderRow(row)}</div>)}
      </div>
    )
  }

  /**
   * 
   * @param {array of int} numbers
   *    array of numbers 
   */
  renderRow(numbers) {
    return (
      <div className="board-row">
        {numbers.map(number => <span key={number.toString()}>{this.renderSquare(number)}</span>)}
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.renderRows(this.props.boardSize)}
      </div>
    );
  }
}

