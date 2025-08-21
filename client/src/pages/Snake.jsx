import React, { useEffect, useRef, useState } from "react";

export default function Snake() {
  const wrapperClass =
    "max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 text-neutral-900 dark:text-neutral-100";

  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [time, setTime] = useState(0);

  const scale = 20;

  const getCanvasSize = () => {
    const isMobile = window.innerWidth < 768;
    return isMobile
      ? { width: 350, height: 600 }
      : { width: 1100, height: 500 };
  };
  const [{ width, height }, setCanvasSize] = useState(getCanvasSize);

  useEffect(() => {
    const handleResize = () => setCanvasSize(getCanvasSize());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const snakeRef = useRef({ body: [], dx: scale, dy: 0 });
  const fruitRef = useRef({ x: 0, y: 0 });

  const rndInt = (n) => Math.floor(Math.random() * n);

  const spawnFruit = () => {
    const cols = Math.floor(width / scale);
    const rows = Math.floor(height / scale);
    let fx, fy, clash;
    const snake = snakeRef.current.body;
    do {
      fx = rndInt(cols) * scale;
      fy = rndInt(rows) * scale;
      clash = snake.some((s) => s.x === fx && s.y === fy);
    } while (clash);
    fruitRef.current.x = fx;
    fruitRef.current.y = fy;
  };

  const resetGame = () => {
    const startX = Math.floor(width / (2 * scale)) * scale;
    const startY = Math.floor(height / (2 * scale)) * scale;
    const defaultLen = 4;
    snakeRef.current.body = Array.from({ length: defaultLen }, (_, i) => ({
      x: startX - i * scale,
      y: startY,
    }));
    snakeRef.current.dx = scale;
    snakeRef.current.dy = 0;
    spawnFruit();
    setScore(0);
    setTime(0);
    setGameOver(false);
    setRunning(true);
  };

  useEffect(() => {
    resetGame();
  }, [width, height]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e) => {
      const { dx, dy } = snakeRef.current;
      if (!running) return;
      if (e.key === "ArrowUp" && dy === 0) {
        snakeRef.current = { ...snakeRef.current, dx: 0, dy: -scale };
      } else if (e.key === "ArrowDown" && dy === 0) {
        snakeRef.current = { ...snakeRef.current, dx: 0, dy: scale };
      } else if (e.key === "ArrowLeft" && dx === 0) {
        snakeRef.current = { ...snakeRef.current, dx: -scale, dy: 0 };
      } else if (e.key === "ArrowRight" && dx === 0) {
        snakeRef.current = { ...snakeRef.current, dx: scale, dy: 0 };
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [running]);

  // ✅ Touch controls for mobile
  useEffect(() => {
    let startX = 0,
      startY = 0;
    const threshold = 30; // min swipe distance

    const handleTouchStart = (e) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
    };

    const handleTouchEnd = (e) => {
      if (!running) return;
      const t = e.changedTouches[0];
      const dxSwipe = t.clientX - startX;
      const dySwipe = t.clientY - startY;

      if (Math.abs(dxSwipe) > Math.abs(dySwipe)) {
        // horizontal swipe
        if (dxSwipe > threshold && snakeRef.current.dx === 0) {
          snakeRef.current = { ...snakeRef.current, dx: scale, dy: 0 }; // right
        } else if (dxSwipe < -threshold && snakeRef.current.dx === 0) {
          snakeRef.current = { ...snakeRef.current, dx: -scale, dy: 0 }; // left
        }
      } else {
        // vertical swipe
        if (dySwipe > threshold && snakeRef.current.dy === 0) {
          snakeRef.current = { ...snakeRef.current, dx: 0, dy: scale }; // down
        } else if (dySwipe < -threshold && snakeRef.current.dy === 0) {
          snakeRef.current = { ...snakeRef.current, dx: 0, dy: -scale }; // up
        }
      }
    };

    const canvas = canvasRef.current;
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchend", handleTouchEnd);

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [running]);

  // Game loop
  useEffect(() => {
    if (!running || gameOver) return;
    const ctx = canvasRef.current.getContext("2d");
    const loop = setInterval(() => {
      update();
      draw(ctx);
    }, 110);
    return () => clearInterval(loop);
  }, [running, gameOver, width, height]);

  // Timer
  useEffect(() => {
    if (!running || gameOver) return;
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running, gameOver]);

  const update = () => {
    const snake = snakeRef.current;
    const head = snake.body[0];
    const newHead = { x: head.x + snake.dx, y: head.y + snake.dy };

    const maxCols = Math.floor(width / scale);
    const maxRows = Math.floor(height / scale);
    if (newHead.x >= maxCols * scale) newHead.x = 0;
    if (newHead.x < 0) newHead.x = (maxCols - 1) * scale;
    if (newHead.y >= maxRows * scale) newHead.y = 0;
    if (newHead.y < 0) newHead.y = (maxRows - 1) * scale;

    for (const seg of snake.body) {
      if (seg.x === newHead.x && seg.y === newHead.y) {
        setGameOver(true);
        setRunning(false);
        return;
      }
    }

    snake.body.unshift(newHead);

    if (
      newHead.x === fruitRef.current.x &&
      newHead.y === fruitRef.current.y
    ) {
      setScore((s) => s + 1);
      spawnFruit();
    } else {
      snake.body.pop();
    }
  };

  // Rounded rectangle for snake
  const roundRectPath = (ctx, x, y, w, h, r) => {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const draw = (ctx) => {
    const now = Date.now();
    ctx.clearRect(0, 0, width, height);

    // Background (light vs dark)
    ctx.fillStyle = document.documentElement.classList.contains("dark")
      ? "#000000"
      : "#f4f4f9";
    ctx.fillRect(0, 0, width, height);

    // Fruit (glow + pulse)
    const pulse = 1 + 0.12 * Math.sin(now / 180);
    const fr = (scale / 2.4) * pulse;
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#ff3b3b";
    ctx.fillStyle = "#ff2d2d";
    ctx.beginPath();
    ctx.arc(
      fruitRef.current.x + scale / 2,
      fruitRef.current.y + scale / 2,
      fr,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    // Snake drawing (unchanged from your version)
    const body = snakeRef.current.body;
    const { dx, dy } = snakeRef.current;

    for (let i = body.length - 1; i >= 0; i--) {
      const seg = body[i];
      const isHead = i === 0;
      const t = body.length > 1 ? i / (body.length - 1) : 0;
      const size = isHead ? scale : Math.max(scale * (1 - 0.55 * t), scale * 0.45);

      let ox = 0,
        oy = 0;
      if (!isHead) {
        const amp = 0.25 * scale * (1 - t);
        const phase = now / 130 + i * 0.9;
        if (dx !== 0) oy = Math.sin(phase) * amp;
        else if (dy !== 0) ox = Math.sin(phase) * amp;
      }

      if (isHead) {
        ctx.fillStyle = "#0ea5e9";
        ctx.strokeStyle = "#0c4a6e";
        ctx.lineWidth = 1.25;
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(14,165,233,0.6)";
        roundRectPath(ctx, seg.x, seg.y, size, size, 6);
        ctx.fill();
        ctx.restore();
        ctx.stroke();

        // Eyes
        const eyeR = Math.max(2, scale * 0.12);
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(seg.x + size * 0.3, seg.y + size * 0.3, eyeR, 0, Math.PI * 2);
        ctx.arc(seg.x + size * 0.7, seg.y + size * 0.3, eyeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#111";
        ctx.beginPath();
        ctx.arc(seg.x + size * 0.3, seg.y + size * 0.3, eyeR * 0.55, 0, Math.PI * 2);
        ctx.arc(seg.x + size * 0.7, seg.y + size * 0.3, eyeR * 0.55, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const x = seg.x + (scale - size) / 2 + ox;
        const y = seg.y + (scale - size) / 2 + oy;
        ctx.fillStyle = "#38bdf8";
        ctx.strokeStyle = "#075985";
        ctx.lineWidth = 1;
        roundRectPath(ctx, x, y, size, size, 4);
        ctx.fill();
        ctx.stroke();
      }
    }
  };

  return (
    <div className={`${wrapperClass} flex flex-col items-center gap-4`}>
      <h1 className="text-2xl font-bold">🐍 Snake Game</h1>
      <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base">
        <span className="font-mono">Score: {score}</span>
        <span className="font-mono">Time: {time}s</span>
        <button
          onClick={() => setRunning((r) => !r)}
          className="px-3 py-1 rounded-md border dark:border-neutral-700 bg-white/70 dark:bg-neutral-900 hover:bg-white shadow-sm"
        >
          {running ? "Pause" : "Resume"}
        </button>
        {gameOver && (
          <button
            onClick={resetGame}
            className="px-3 py-1 rounded-md border dark:border-neutral-700 bg-red-500 text-white shadow-sm hover:bg-red-600"
          >
            Restart
          </button>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-2xl shadow-md border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-black w-full"
        style={{ maxWidth: `${width}px`, height: `${height}px` }}
      />
    </div>
  );
}
