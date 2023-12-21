import { useState } from 'react';

function Square({ win, value, onSquareClick } : { win: boolean, value: string | null, onSquareClick: () => void}){
  return (
    <button 
      className = {win ? `squareWinner` : `square`} 
      onClick = {onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, numMoves } : { xIsNext: boolean, squares: string[], onPlay: (nextSquares: string[]) => void, numMoves: number  }){
  const result = calculateWinner(squares);
  const numRows = 3;
  const numCols = 3;
  const winningSquares = result ? result.winningSquares : null;
  let boardSetup = [];
  for (let i = 0; i < numRows; ++i){
    let row = [];
    for (let j = 0; j < numCols; ++j){
      const win = winningSquares ? winningSquares.includes(i * numCols + j) : false;
      row.push(<Square win = {win} value = {squares[i * numCols + j]} onSquareClick={() => handleClick(i * numCols + j)}/>);
    }
    boardSetup.push(<div className="board-row">{row}</div>);
  }

  let status;
  if (result){
    status = "winner " + result.winner;
  } 
  else if (numMoves === 9) {
    status = "game drawn";
  } 
  else {
    status = "next player " + (xIsNext ? 'X' : 'O')
  }

  function handleClick(i: number){
    if (squares[i] || calculateWinner(squares))
      return
    const nextSquares = squares.slice();
    if (xIsNext){
      nextSquares[i]  = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    
    onPlay(nextSquares);
  }

  return <>
  <div className="status"> {status} </div>
  {boardSetup}
  </> 
};

export default function Game()  {
  const [history, setHistory] = useState<string[][]>([Array(9).fill(null)]);  
  const [currentMove, setCurrentMove] = useState<number>(0);
  const [ascendingOrder, setAscendingOrder] = useState<boolean>(true);

  const currentSquares = history[currentMove];
  const xIsNext = currentMove % 2 === 0;

  function handlePlay(nextSquares: string[]){
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove: number){
    setCurrentMove(nextMove);
  }

  function toggleAscendingOrder(){
    setAscendingOrder(!ascendingOrder);
  }

  function getDifferentElementIndex(arr1: string[], arr2: string[]){
    for (let i = 0; i < arr1.length; ++i){
      if (arr1[i] !== arr2[i]){
        return [Math.floor(i / 3) + 1, (i % 3) + 1];
      }
    }
  }

  function getSquareClickedHistory(history: string[][]){
    let squareClickedHistory = [];
    for (let i = 0; i < history.length - 1; ++i){
      if (history[i] !== history[i + 1]){
        squareClickedHistory.push(getDifferentElementIndex(history[i], history[i + 1]));
      }
    }
    return squareClickedHistory;
  }

  const squareClickedHistory = getSquareClickedHistory(history);

  const moves = history.map((squares, move, history) => {
    let description;
    if (move === 0){
      description = `go to game start`;
    }
    else if (move === history.length -1){
      description = `you are at move # ${move}: (${squareClickedHistory[move-1]})`;
    }
    else {
      description = `go to move # ${move}: (${squareClickedHistory[move-1]})`;
    }
    return (
      <li key = {move}>
        {(move === history.length -1) ? (<b>{description}</b>) : (<button onClick = {() => jumpTo(move)}>{description}</button>)}
      </li>
    );

  });

  if (!ascendingOrder){
    moves.reverse();
  }

  return (
    <div  className = "game">
      <div className = "game-board">
        <Board xIsNext =  {xIsNext} squares = {currentSquares} onPlay = {handlePlay} numMoves = {moves.length - 1}  />
      </div>
      <div className = "game-info">
        <button onClick = {toggleAscendingOrder}>
          {ascendingOrder ? `sort descending` : `sort ascending`}
        </button> 
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares: string[]){
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

  for (let i = 0; i < lines.length; ++i){
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]){
      const winner = squares[a];
      const winningSquares = [a, b, c]
      return {winner, winningSquares};
    }
  }
  return null;
}