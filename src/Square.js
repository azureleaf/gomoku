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

export default function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}