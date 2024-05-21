import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [gameState, setGameState] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [playerNumber, setPlayerNumber] = useState(null);
  const [playerIdentity, setPlayerIdentity] = useState(null);
  const [winner, setWinner] = useState(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');

    socket.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.type === 'GAME_STATE') {
        setGameState(data.gameState);
        setCurrentPlayer(data.currentPlayer);
      } else if (data.type === 'INITIAL_STATE') {
        setGameState(data.gameState);
        setPlayerNumber(data.playerNumber);
        setPlayerIdentity(data.playerNumber === 1 ? 'X' : 'O');
      } else if (data.type === 'GAME_OVER') {
        setWinner(data.winner);
      } else if (data.type === 'ERROR') {
        alert(data.message);
        socket.close();
      }
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  const handleClick = (index) => {
    if (gameState[index] === null && ws && winner === null) {
      ws.send(JSON.stringify({ type: 'MOVE', index }));
    }
  };

  return (
    <div className="game">
      <div className="status">
        {winner !== null ? (
          winner === null ? "It's a draw!" : `Player ${winner} wins!`
        ) : (
          `Player ${playerIdentity}, it's your turn!`
        )}
      </div>
      <Board squares={gameState} onClick={handleClick} />
    </div>
  );
}

function Board({ squares, onClick }) {
  return (
    <div className="board">
      {squares.map((square, i) => (
        <Square key={i} value={square} onClick={() => onClick(i)} />
      ))}
    </div>
  );
}

function Square({ value, onClick }) {
  return (
    <button className="square" onClick={onClick}>
      {value}
    </button>
  );
}

export default App;
