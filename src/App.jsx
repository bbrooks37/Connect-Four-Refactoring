import React, { useState, useEffect } from 'react';
import './App.css';

// Main App component for the Connect Four game
function App() {
  // State for the player's chip colors
  const [p1Color, setP1Color] = useState('red');
  const [p2Color, setP2Color] = useState('yellow');

  // State to manage the game status
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('');

  // Game board state: a 2D array representing the grid
  const [board, setBoard] = useState(
    Array.from({ length: 6 }, () => Array(7).fill(null))
  );

  // State for the current player
  const [currentPlayer, setCurrentPlayer] = useState({ id: 1, color: 'red' });

  // Game constants
  const boardHeight = 6;
  const boardWidth = 7;

  // Handles the start of a new game
  const startGame = () => {
    if (!p1Color || !p2Color) {
      setMessage('Please enter colors for both players.');
      return;
    }
    // Reset all game state for a new game
    setGameStarted(true);
    setGameOver(false);
    setWinner(null);
    setBoard(Array.from({ length: boardHeight }, () => Array(boardWidth).fill(null)));
    setCurrentPlayer({ id: 1, color: p1Color });
    setMessage('');
  };

  // Resets the game to the initial setup screen
  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setWinner(null);
    setP1Color('red');
    setP2Color('yellow');
    setBoard(Array.from({ length: boardHeight }, () => Array(boardWidth).fill(null)));
    setCurrentPlayer({ id: 1, color: 'red' });
    setMessage('');
  };

  // useEffect to handle game over messages
  useEffect(() => {
    if (gameOver) {
      if (winner) {
        setMessage(`Player ${winner.id} (${winner.color}) wins!`);
      } else {
        setMessage("It's a tie!");
      }
    }
  }, [gameOver, winner]);

  // Function to find the lowest empty spot in a column
  const findSpotForCol = (x) => {
    for (let y = boardHeight - 1; y >= 0; y--) {
      if (!board[y][x]) {
        return y;
      }
    }
    return null; // Column is full
  };

  // Function to check for a win condition
  const checkForWin = (newBoard) => {
    const _win = (cells) =>
      cells.every(
        ([y, x]) =>
          y >= 0 &&
          y < boardHeight &&
          x >= 0 &&
          x < boardWidth &&
          newBoard[y][x] === currentPlayer.id
      );

    for (let y = 0; y < boardHeight; y++) {
      for (let x = 0; x < boardWidth; x++) {
        const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
        const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
        const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
        const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

        if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
          return true;
        }
      }
    }
    return false;
  };

  // Handles a click on a column
  const handleColumnClick = (x) => {
    if (gameOver) return;

    const y = findSpotForCol(x);
    if (y === null) {
      setMessage('This column is full!');
      return;
    }

    // Create a new board instance to update state immutably
    const newBoard = board.map(row => [...row]);
    newBoard[y][x] = currentPlayer.id;
    setBoard(newBoard);

    // Check for win
    if (checkForWin(newBoard)) {
      setGameOver(true);
      setWinner(currentPlayer.id === 1 ? { id: 1, color: p1Color } : { id: 2, color: p2Color });
      return;
    }

    // Check for tie
    if (newBoard.every((row) => row.every((cell) => cell))) {
      setGameOver(true);
      setWinner(null);
      return;
    }

    // Switch player
    setCurrentPlayer(currentPlayer.id === 1
      ? { id: 2, color: p2Color }
      : { id: 1, color: p1Color });
  };

  // PlayerInput component for color selection
  const PlayerInput = ({ label, value, onChange }) => (
    <div className="player-input">
      <label className="player-label">{label}</label>
      <input
        type="color"
        value={value}
        onChange={onChange}
        className="color-picker"
      />
    </div>
  );

  // Board component
  const Board = () => (
    <div className="game-board">
      {board.map((row, y) =>
        row.map((cell, x) => (
          <Cell
            key={`${y}-${x}`}
            value={cell}
            onClick={() => handleColumnClick(x)}
            p1Color={p1Color}
            p2Color={p2Color}
          />
        ))
      )}
    </div>
  );

  // Cell component
  const Cell = ({ value, onClick, p1Color, p2Color }) => (
    <div className="cell" onClick={onClick}>
      <div 
        className="piece"
        style={{
          backgroundColor: value === 1 ? p1Color : value === 2 ? p2Color : 'transparent',
          boxShadow: value ? `0 0 10px ${value === 1 ? p1Color : p2Color}` : 'none'
        }}
      ></div>
    </div>
  );

  return (
    <div className="app-container">
      <div className="game-card">
        <h1 className="game-title">Connect 4</h1>

        {!gameStarted ? (
          <div className="start-screen">
            <p className="instructions">Choose your colors to start the game!</p>
            <div className="player-inputs">
              <PlayerInput
                label="Player 1"
                value={p1Color}
                onChange={(e) => setP1Color(e.target.value)}
              />
              <PlayerInput
                label="Player 2"
                value={p2Color}
                onChange={(e) => setP2Color(e.target.value)}
              />
            </div>
            <button
              onClick={startGame}
              className="start-button"
            >
              Start Game!
            </button>
          </div>
        ) : (
          <div className="game-screen">
            <h2 className="game-status">
              {gameOver ? (
                <span className="winner-message">{message}</span>
              ) : (
                <>Current Player: <span className="current-player-color" style={{ color: currentPlayer.color }}>{currentPlayer.color}</span></>
              )}
            </h2>
            <Board />
            <button
              onClick={resetGame}
              className="reset-button"
            >
              Reset Game
            </button>
            {message && gameOver && (
              <div className="game-message">
                {message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
