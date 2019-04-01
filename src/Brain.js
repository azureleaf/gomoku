export default class Brain {
  constructor(matrix, boardSize, winnerChainLength) {
    this.matrix = matrix;
    this.boardSize = boardSize;
    this.winnerChainLength = winnerChainLength;
  }

  /**
   *  @param {int} patternLength
   */
  generatePatterns(patternLength) {
    var patterns = new Array(Math.pow(2, patternLength)).fill(null);

    for (var i = 0; i < patterns.length; i++) {
      patterns[i] = returnBinaryArray(i, patternLength);
    }

    /**
     * Convert a number into binary array.
     * Unused upper digit will be filled with 0.
     *    e.g.
     *      5 => [0, 0, 1, 0, 1]
     * @param {int} num 
     * @param {int} arrayLength
     * @return {array.<int>}
     */
    function returnBinaryArray(num, arrayLength) {
      var strBinary = num.toString(2);
      var array = new Array(arrayLength).fill(0);
      for (var i = 0; i < strBinary.length; i++) {
        array[i] = Number(strBinary[i]);
      }
      return array;
    }
    // console.log(patterns);
  }

  
  /**
  * 
  * @param {int} n 
  * @return {int} factorial of n
  */
  factorial(n) {
    if (n !== 0) return n * (n - 1);
    else return 1;
  }

  nextMove(squares) {
    /*
      array: candidates[][]
      associative array: patternTable
        "x1111": 100,
        "1x111": 100,
        "11x11": 100,
        "0x1110": 100,
        "011x10": 100,
        "0x111": 70
        "001x00": 5
        "0010x0": 3
        "00100x0": 2
   
      for: all lines{
        scan a line
        give score for "O" to every blank in the line
        give score for "X" to every blank in the line
      }
   
      sum up all the scores for every cell in the board
        coefficient for "advantage score" & "disturbance score" must be elaborated
        direction of the line must be considered (because some candidates is easier to deceive human opponent)
        when score is identical for several moves, decide with random number
      pick the move with the highest score
   
      machine learning: if that move was killed by human opponent followingly, reduce the pattern score
   
   
    */

  }

}