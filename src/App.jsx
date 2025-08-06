import React, { useState, useEffect } from 'react';
import './App.css';

// Main App component for the Connect Four game
function App() {
  // State for the player's chip colors
  const [p1Color, setP1Color] = useState('#e74c3c'); // Player's color
  const [p2Color, setP2Color] = useState('#f1c40f'); // Computer's color

  // State to manage the game status
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('');
  // New state for game mode: 'PVP' (Player vs Player) or 'PVC' (Player vs Computer)
  const [gameMode, setGameMode] = useState('PVP');

  // Game board state: a 2D array representing the grid
  const [board, setBoard] = useState(
    Array.from({ length: 6 }, () => Array(7).fill(null))
  );

  // State for the current player, initialized with p1Color
  const [currentPlayer, setCurrentPlayer] = useState({ id: 1, color: '#e74c3c' });
  // New state to track the coordinates of the last dropped piece for animation
  const [lastDroppedPiece, setLastDroppedPiece] = useState(null);

  // Game constants
  const boardHeight = 6;
  const boardWidth = 7;

  // Handles the start of a new game
  const startGame = () => {
    // Reset all game state for a new game
    setGameStarted(true);
    setGameOver(false);
    setWinner(null);
    setBoard(Array.from({ length: boardHeight }, () => Array(boardWidth).fill(null)));
    // Correctly set the initial player's color
    setCurrentPlayer({ id: 1, color: p1Color });
    setMessage('');
    setLastDroppedPiece(null); // Reset the last dropped piece
  };

  // Resets the game to the initial setup screen
  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setWinner(null);
    setP1Color('#e74c3c');
    setP2Color('#f1c40f');
    setBoard(Array.from({ length: boardHeight }, () => Array(boardWidth).fill(null)));
    setCurrentPlayer({ id: 1, color: '#e74c3c' });
    setMessage('');
    setLastDroppedPiece(null); // Reset the last dropped piece
  };

  // useEffect to handle game over messages
  useEffect(() => {
    if (gameOver) {
      if (winner) {
        setMessage(`Player ${winner.id === 1 ? '1' : '2'} wins!`);
      } else {
        setMessage("It's a tie!");
      }
    }
  }, [gameOver, winner]);

  // useEffect for computer's turn
  useEffect(() => {
    if (gameStarted && !gameOver && gameMode === 'PVC' && currentPlayer.id === 2) {
      // Small delay for a better user experience
      setTimeout(handleComputerMove, 1000);
    }
  }, [gameStarted, gameOver, gameMode, currentPlayer]);

  // Function to find the lowest empty spot in a column
  const findSpotForCol = (x) => {
    for (let y = boardHeight - 1; y >= 0; y--) {
      if (!board[y][x]) {
        return y;
      }
    }
    return null; // Column is full
  };

  // Function to check for a win condition for a specific player
  const checkForWin = (checkBoard, playerToCheck) => {
    const _win = (cells) =>
      cells.every(
        ([y, x]) =>
          y >= 0 &&
          y < boardHeight &&
          x >= 0 &&
          x < boardWidth &&
          checkBoard[y][x] === playerToCheck
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
  
  // Function to count potential winning lines for a player
  const countPotentialWins = (checkBoard, playerToCheck, col) => {
    const y = findSpotForCol(col);
    if (y === null) return 0;

    let tempBoard = checkBoard.map(row => [...row]);
    tempBoard[y][col] = playerToCheck;
    
    let winCount = 0;
    
    // Check all potential winning lines from the new piece's position
    for (let i = 0; i < 4; i++) {
        // Horizontal
        if (col - i >= 0 && col - i + 3 < boardWidth) {
            let line = [tempBoard[y][col - i], tempBoard[y][col - i + 1], tempBoard[y][col - i + 2], tempBoard[y][col - i + 3]];
            if (line.filter(c => c === playerToCheck).length === 3 && line.filter(c => c === null).length === 1) {
                winCount++;
            }
        }
        // Vertical
        if (y - i >= 0 && y - i + 3 < boardHeight) {
            let line = [tempBoard[y - i][col], tempBoard[y - i + 1][col], tempBoard[y - i + 2][col], tempBoard[y - i + 3][col]];
            if (line.filter(c => c === playerToCheck).length === 3 && line.filter(c => c === null).length === 1) {
                winCount++;
            }
        }
        // Diagonal Down-Right
        if (y - i >= 0 && y - i + 3 < boardHeight && col - i >= 0 && col - i + 3 < boardWidth) {
            let line = [tempBoard[y - i][col - i], tempBoard[y - i + 1][col - i + 1], tempBoard[y - i + 2][col - i + 2], tempBoard[y - i + 3][col - i + 3]];
            if (line.filter(c => c === playerToCheck).length === 3 && line.filter(c => c === null).length === 1) {
                winCount++;
            }
        }
        // Diagonal Down-Left
        if (y - i >= 0 && y - i + 3 < boardHeight && col + i < boardWidth && col + i - 3 >= 0) {
            let line = [tempBoard[y - i][col + i], tempBoard[y - i + 1][col + i - 1], tempBoard[y - i + 2][col + i - 2], tempBoard[y - i + 3][col + i - 3]];
            if (line.filter(c => c === playerToCheck).length === 3 && line.filter(c => c === null).length === 1) {
                winCount++;
            }
        }
    }
    return winCount;
  }

  // Simple AI for the computer's move (now more strategic)
  const handleComputerMove = () => {
    if (gameOver) return;
    let newBoard = board.map(row => [...row]);
    let move = -1;
    let availableCols = [];

    for (let x = 0; x < boardWidth; x++) {
      if (findSpotForCol(x) !== null) {
        availableCols.push(x);
      }
    }

    // 1. Check for a winning move for the computer
    for (let x of availableCols) {
      const y = findSpotForCol(x);
      newBoard[y][x] = 2; // Temporarily place computer's piece
      if (checkForWin(newBoard, 2)) {
        move = x;
        newBoard[y][x] = null; // Undo the move
        break;
      }
      newBoard[y][x] = null; // Undo the move
    }

    // 2. If no winning move, check for a blocking move
    if (move === -1) {
      for (let x of availableCols) {
        const y = findSpotForCol(x);
        newBoard[y][x] = 1; // Temporarily place player's piece
        if (checkForWin(newBoard, 1)) {
          move = x;
          newBoard[y][x] = null; // Undo the move
          break;
        }
        newBoard[y][x] = null; // Undo the move
      }
    }
    
    // 3. If no immediate win or block, check for a winning "fork" for the computer
    if (move === -1) {
      for (let x of availableCols) {
        if (countPotentialWins(newBoard, 2, x) >= 2) {
          move = x;
          break;
        }
      }
    }
    
    // 4. If no computer fork, check for a player "fork" and block it
    if (move === -1) {
      for (let x of availableCols) {
        if (countPotentialWins(newBoard, 1, x) >= 2) {
          move = x;
          break;
        }
      }
    }
    
    // 5. If no forks, choose a move that creates a single threat (a line of 3)
    if (move === -1) {
        let bestMove = -1;
        let maxThreats = 0;
        for (let x of availableCols) {
            const threats = countPotentialWins(newBoard, 2, x);
            if (threats > maxThreats) {
                maxThreats = threats;
                bestMove = x;
            }
        }
        if (bestMove !== -1) {
            move = bestMove;
        }
    }

    // 6. If all else fails, choose the center column
    if (move === -1 && findSpotForCol(3) !== null) {
      move = 3;
    }

    // 7. Last resort: random move
    if (move === -1) {
      if (availableCols.length > 0) {
        move = availableCols[Math.floor(Math.random() * availableCols.length)];
      } else {
        // No moves left, it's a tie
        setGameOver(true);
        setWinner(null);
        return;
      }
    }
    
    // Execute the chosen move
    const y = findSpotForCol(move);
    newBoard[y][move] = 2;
    setBoard(newBoard);
    setLastDroppedPiece({ y: y, x: move });

    // Check for win after computer's move
    if (checkForWin(newBoard, 2)) {
      setGameOver(true);
      setWinner({ id: 2, color: p2Color });
      return;
    }

    // Check for tie after computer's move
    if (newBoard.every((row) => row.every((cell) => cell))) {
      setGameOver(true);
      setWinner(null);
      return;
    }

    // Switch back to player 1
    setCurrentPlayer({ id: 1, color: p1Color });
  };

  // Handles a click on a column
  const handleColumnClick = (x) => {
    if (gameOver || (gameMode === 'PVC' && currentPlayer.id === 2)) return;

    const y = findSpotForCol(x);
    if (y === null) {
      setMessage('This column is full!');
      return;
    }

    // Create a new board instance to update state immutably
    const newBoard = board.map(row => [...row]);
    newBoard[y][x] = currentPlayer.id;
    setBoard(newBoard);
    
    // Track the coordinates of the last dropped piece
    setLastDroppedPiece({ y, x });

    // Check for win
    if (checkForWin(newBoard, currentPlayer.id)) {
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
            isLastDroppedPiece={lastDroppedPiece && lastDroppedPiece.y === y && lastDroppedPiece.x === x}
          />
        ))
      )}
    </div>
  );

  // Cell component
  const Cell = ({ value, onClick, p1Color, p2Color, isLastDroppedPiece }) => (
    <div className="cell" onClick={onClick}>
      <div 
        className={`piece ${isLastDroppedPiece ? 'animate-drop' : ''}`}
        style={{
          backgroundColor: value === 1 ? p1Color : value === 2 ? p2Color : 'transparent',
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
            <p className="instructions">Choose your game mode and colors to start!</p>
            <div className="game-mode-selection">
              <label htmlFor="gameMode" className="player-label">Game Mode:</label>
              <select 
                id="gameMode"
                value={gameMode}
                onChange={(e) => {
                  setGameMode(e.target.value);
                  // Reset colors to default when switching modes
                  setP1Color('#e74c3c');
                  setP2Color('#f1c40f');
                }}
                className="game-mode-select"
              >
                <option value="PVP">Player vs Player</option>
                <option value="PVC">Player vs Computer</option>
              </select>
            </div>
            <div className="player-inputs">
              <PlayerInput
                label="Player 1"
                value={p1Color}
                onChange={(e) => setP1Color(e.target.value)}
              />
              {gameMode === 'PVP' && (
                <PlayerInput
                  label="Player 2"
                  value={p2Color}
                  onChange={(e) => setP2Color(e.target.value)}
                />
              )}
            </div>
            <button
              onClick={startGame}
              className="game-button start-button"
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
              className="game-button reset-button"
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
