// src/pages/Snake.jsx
import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Trophy, Gamepad2, Zap } from "lucide-react";

const GRID_SIZE = 20;
const CELL_SIZE = 25;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };

export default function Snake() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 10 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem("snakeHighScore") || "0"));

  const canvasRef = useRef(null);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("snakeHighScore", score.toString());
    }
  }, [score, highScore]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowUp": if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
        case "ArrowDown": if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
        case "ArrowLeft": if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
        case "ArrowRight": if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const moveSnake = setInterval(() => {
      setSnake((prevSnake) => {
        const newHead = {
          x: prevSnake[0].x + direction.x,
          y: prevSnake[0].y + direction.y,
        };

        // Check collisions
        if (
          newHead.x < 0 || newHead.x >= GRID_SIZE ||
          newHead.y < 0 || newHead.y >= GRID_SIZE ||
          prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
        ) {
          setGameOver(true);
          setIsPlaying(false);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 1);
          setFood({
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
          });
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 120); // Slightly faster for more fun

    return () => clearInterval(moveSnake);
  }, [isPlaying, gameOver, direction, food]);

  // Draw canvas
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // Clear with dark background
    ctx.fillStyle = "#0f172a"; // Slate 900
    ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

    // Draw Grid (Subtle)
    ctx.strokeStyle = "#1e293b"; // Slate 800
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw Food (Glowing)
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ef4444";
    ctx.fillStyle = "#ef4444"; // Red
    ctx.beginPath();
    ctx.arc(food.x * CELL_SIZE + CELL_SIZE / 2, food.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Snake (Glowing)
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#3b82f6";
    ctx.fillStyle = "#3b82f6"; // Blue
    snake.forEach((segment, i) => {
      // Head is slightly lighter
      if (i === 0) ctx.fillStyle = "#60a5fa";
      else ctx.fillStyle = "#3b82f6";

      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });
    ctx.shadowBlur = 0;

  }, [snake, food]);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 flex flex-col items-center animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3 mb-2">
          <Gamepad2 className="text-purple-500" size={40} />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            Neon Snake
          </span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Collect energy orbs. Don't crash.
        </p>
      </div>

      <div className="bg-slate-900 p-4 rounded-[2rem] shadow-2xl border-4 border-slate-800 relative ring-4 ring-purple-500/20">
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="bg-slate-800 px-4 py-1.5 rounded-full text-sm font-bold text-blue-400 flex items-center gap-2 border border-slate-700">
            <Zap size={14} /> Score: {score}
          </div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700">
            <Trophy size={14} /> High: {highScore}
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="rounded-xl shadow-inner bg-slate-950"
        />

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-[1.8rem] flex flex-col items-center justify-center text-white z-10 animate-in fade-in zoom-in duration-300">
            <h2 className="text-4xl font-bold mb-2 text-red-500 drop-shadow-lg">GAME OVER</h2>
            <p className="mb-8 text-slate-300 text-lg">Final Score: <span className="text-white font-bold">{score}</span></p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold hover:scale-105 transition-transform shadow-lg shadow-purple-500/30 flex items-center gap-2"
            >
              <RotateCcw size={20} /> Try Again
            </button>
          </div>
        )}

        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-[1.8rem] flex flex-col items-center justify-center text-white z-10">
            <button
              onClick={startGame}
              className="p-6 bg-blue-600 rounded-full hover:bg-blue-500 transition-all shadow-[0_0_30px_rgba(59,130,246,0.6)] transform hover:scale-110 group"
            >
              <Play size={40} fill="currentColor" className="ml-1 group-hover:text-white" />
            </button>
            <p className="mt-6 font-bold text-xl tracking-widest uppercase text-blue-400">Press Start</p>
          </div>
        )}
      </div>

      <div className="mt-8 text-sm text-gray-500 text-center bg-gray-100 dark:bg-neutral-800 px-6 py-3 rounded-full">
        Use <span className="font-bold text-gray-700 dark:text-gray-300">Arrow Keys</span> to control the snake
      </div>
    </div>
  );
}
