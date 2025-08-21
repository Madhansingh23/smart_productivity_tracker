import React, { useEffect, useRef, useState } from "react";

export default function Snake() {
  // Wrapper matches your Dashboard.jsx theme
  const wrapperClass =
    "max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 text-neutral-900 dark:text-neutral-100";

  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [time, setTime] = useState(0);

  // Grid cell size
  const scale = 20;

  // Responsive canvas size (mobile: reduce width only, laptop: wider)
  const getCanvasSize = () => {
    const isMobile = window.innerWidth < 768;
    return isMobile
      ? { width: 350, height: 600 } // Mobile: reduced width
      : { width: 1100, height: 500 }; // Laptop: wider as you provided
  };

  const [{ width, height }, setCanvasSize] = useState(getCanvasSize);

  useEffect(() => {
    const handleResize = () => setCanvasSize(getCanvasSize());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Snake + fruit state (in refs to avoid re-renders every tick)
  const snakeRef = useRef({ body: [], dx: scale, dy: 0 });
  const fruitRef = useRef({ x: 0, y: 0 });

  // --- Helpers --------------------------------------------------------------
  const rndInt = (n) => Math.floor(Math.random() * n);

  const spawnFruit = () => {
    const cols = Math.floor(width / scale);
    const rows = Math.floor(height / scale);

    // Ensure fruit doesn't spawn on snake
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

  // Initialize once sizes are known
  useEffect(() => {
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  // Controls
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

  // Game Loop
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

  // --- Update --------------------------------------------------------------
  const update = () => {
    const snake = snakeRef.current;
    const head = snake.body[0];
    const newHead = { x: head.x + snake.dx, y: head.y + snake.dy };

    // Wrap on same row/column, aligned to grid
    const maxCols = Math.floor(width / scale);
    const maxRows = Math.floor(height / scale);
    if (newHead.x >= maxCols * scale) newHead.x = 0;
    if (newHead.x < 0) newHead.x = (maxCols - 1) * scale;
    if (newHead.y >= maxRows * scale) newHead.y = 0;
    if (newHead.y < 0) newHead.y = (maxRows - 1) * scale;

    // Self collision
    for (const seg of snake.body) {
      if (seg.x === newHead.x && seg.y === newHead.y) {
        setGameOver(true);
        setRunning(false);
        return;
      }
    }

    // Move
    snake.body.unshift(newHead);

    // Eat fruit
    if (
      newHead.x === fruitRef.current.x &&
      newHead.y === fruitRef.current.y
    ) {
      setScore((s) => s + 1);
      spawnFruit(); // new random position
    } else {
      snake.body.pop(); // normal move (no growth)
    }
  };

  // --- Draw ---------------------------------------------------------------
  // Rounded-rect path (for head) with fallback if roundRect isn't supported
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

    // Background (light/dark friendly)
    ctx.fillStyle = "#f4f4f9";
    ctx.fillRect(0, 0, width, height);

    // Fruit: red, soft glow + subtle pulse (size varies slightly)
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

    // Snake: head with curved front + eyes; tapered tail with slight sway
    const body = snakeRef.current.body;
    const { dx, dy } = snakeRef.current;

    for (let i = body.length - 1; i >= 0; i--) {
      const seg = body[i];
      const isHead = i === 0;

      // Tapering factor for tail (min 45% of scale at the very end)
      const t = body.length > 1 ? i / (body.length - 1) : 0;
      const size = isHead ? scale : Math.max(scale * (1 - 0.55 * t), scale * 0.45);

      // Slight sway perpendicular to movement, only for tail/body (not head)
      let ox = 0,
        oy = 0;
      if (!isHead) {
        const amp = 0.25 * scale * (1 - t); // smaller towards the tail end
        const phase = (now / 130 + i * 0.9);
        // Perpendicular to movement
        if (dx !== 0) {
          oy = Math.sin(phase) * amp; // moving horizontally -> sway vertically
        } else if (dy !== 0) {
          ox = Math.sin(phase) * amp; // moving vertically -> sway horizontally
        }
      }

      if (isHead) {
        // Head color
        ctx.fillStyle = "#0ea5e9"; // sky-500
        ctx.strokeStyle = "#0c4a6e"; // darker outline
        ctx.lineWidth = 1.25;

        // Draw rounded head
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(14,165,233,0.6)";
        roundRectPath(ctx, seg.x, seg.y, size, size, 6);
        ctx.fill();
        ctx.restore();
        ctx.stroke();

        // Eyes (tiny white dots with black pupils)
        const eyeR = Math.max(2, scale * 0.12);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(seg.x + size * 0.30, seg.y + size * 0.30, eyeR, 0, Math.PI * 2);
        ctx.arc(seg.x + size * 0.70, seg.y + size * 0.30, eyeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#111827"; // near-black pupil
        ctx.beginPath();
        ctx.arc(seg.x + size * 0.30, seg.y + size * 0.30, eyeR * 0.55, 0, Math.PI * 2);
        ctx.arc(seg.x + size * 0.70, seg.y + size * 0.30, eyeR * 0.55, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Body segments, tapered + slight sway
        const x = seg.x + (scale - size) / 2 + ox;
        const y = seg.y + (scale - size) / 2 + oy;
        ctx.fillStyle = "#38bdf8"; // sky-400
        ctx.strokeStyle = "#075985"; // outline
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
        className="rounded-2xl shadow-md border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 w-full"
        style={{ maxWidth: `${width}px`, height: `${height}px` }}
      />
    </div>
  );
}
