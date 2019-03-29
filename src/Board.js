import React from 'react';


/**
 *  Returns a square of the game board
 *  Called from class Board
 * 
 *  @param {str} props.value
 *    "O", "X", or blank
 *  @param {function} props.onClick
 *    
 *  @return {JSX}
 *    button element to reproduce past scene
 */
function Square(props) {
    return (
        <button className="square" onClick={props.onClick}>
            {props.value}
        </button>
    );
}


// class Row extends React.Component{
//   render(){
//     return(
//       <div className="board-row">
//         {numbers.map(number => <span key={number.toString()}>{this.renderSquare(number)}</span>)}
//       </div>
//     )
//   }
// }

/**
 *  
 *  Instantiated by : Game object
 *  Instantiate     : Board object
 * 
 *  @param {array} props.squares
 *    e.g. ["X", "O", null, "X", null....]
 *  @param {function} props.onClick
 */
class Board extends React.Component {

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
    renderMatrix(boardSize) {

        for (var i = 0; i < boardSize; i++) {

            var arr = new Array(boardSize).fill(null);

            for (var j = 0; j < boardSize; j++) {
                arr[j] = i * boardSize + j;
                if (j % boardSize === 0) {
                    //console.log(this.renderRow(arr));
                    console.log("Array #", i, arr)
                }

            }
        }

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

                {/* {this.renderMatrix(this.props.boardSize)} */}
                {/* <Row numbers="" onClick=""/> */}
                {this.renderRow([0, 1, 2])}
                {this.renderRow([3, 4, 5])}
                {this.renderRow([6, 7, 8])}

            </div>
        );
    }
}


export default Board