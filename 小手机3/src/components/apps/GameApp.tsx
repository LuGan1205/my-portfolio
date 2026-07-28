import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Gamepad2,
  ChevronLeft,
  RotateCw,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Pause,
  Play,
  RotateCcw,
  Trophy,
  Zap,
  Sparkles,
  Flame,
  Award,
} from "lucide-react";

interface GameAppProps {
  onBackToHome: () => void;
}

type GameType = "menu" | "tetris" | "snake";

// ==================== TETRIS CONSTANTS & UTILS ====================
const TETRIS_ROWS = 20;
const TETRIS_COLS = 10;

const TETROMINOES: Record<string, { shape: number[][]; color: string; border: string }> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "bg-cyan-400",
    border: "border-cyan-300",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "bg-blue-400",
    border: "border-blue-300",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "bg-amber-400",
    border: "border-amber-300",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "bg-yellow-300",
    border: "border-yellow-200",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: "bg-emerald-400",
    border: "border-emerald-300",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "bg-purple-400",
    border: "border-purple-300",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: "bg-rose-400",
    border: "border-rose-300",
  },
};

const TETRAMINO_KEYS = ["I", "J", "L", "O", "S", "T", "Z"];

const getRandomTetromino = () => {
  const key = TETRAMINO_KEYS[Math.floor(Math.random() * TETRAMINO_KEYS.length)];
  return {
    type: key,
    ...TETROMINOES[key],
  };
};

const createEmptyBoard = () =>
  Array.from({ length: TETRIS_ROWS }, () => Array(TETRIS_COLS).fill(null));

// ==================== SNAKE CONSTANTS ====================
const SNAKE_GRID_SIZE = 16;
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

const FOOD_TYPES = [
  { icon: "🍎", score: 10 },
  { icon: "🍓", score: 15 },
  { icon: "🍰", score: 20 },
  { icon: "🧀", score: 12 },
  { icon: "⭐", score: 25 },
];

export const GameApp: React.FC<GameAppProps> = ({ onBackToHome }) => {
  const [activeGame, setActiveGame] = useState<GameType>("menu");

  // High Scores
  const [tetrisHighScore, setTetrisHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem("cy_tetris_highscore") || "0", 10);
  });
  const [snakeHighScore, setSnakeHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem("cy_snake_highscore") || "0", 10);
  });

  // ==================== TETRIS STATE ====================
  const [tetrisBoard, setTetrisBoard] = useState<(string | null)[][]>(createEmptyBoard);
  const [currentPiece, setCurrentPiece] = useState<{
    type: string;
    shape: number[][];
    color: string;
    border: string;
    x: number;
    y: number;
  } | null>(null);
  const [nextPiece, setNextPiece] = useState<{
    type: string;
    shape: number[][];
    color: string;
    border: string;
  } | null>(null);
  const [tetrisScore, setTetrisScore] = useState<number>(0);
  const [tetrisLines, setTetrisLines] = useState<number>(0);
  const [tetrisLevel, setTetrisLevel] = useState<number>(1);
  const [tetrisPaused, setTetrisPaused] = useState<boolean>(false);
  const [tetrisGameOver, setTetrisGameOver] = useState<boolean>(false);
  const [tetrisStarted, setTetrisStarted] = useState<boolean>(false);

  // ==================== SNAKE STATE ====================
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 8, y: 8 },
    { x: 8, y: 9 },
    { x: 8, y: 10 },
  ]);
  const [snakeDirection, setSnakeDirection] = useState<Direction>("UP");
  const nextDirectionRef = useRef<Direction>("UP");
  const [food, setFood] = useState<{ x: number; y: number; icon: string; score: number }>({
    x: 5,
    y: 5,
    icon: "🍎",
    score: 10,
  });
  const [snakeScore, setSnakeScore] = useState<number>(0);
  const [snakePaused, setSnakePaused] = useState<boolean>(false);
  const [snakeGameOver, setSnakeGameOver] = useState<boolean>(false);
  const [snakeStarted, setSnakeStarted] = useState<boolean>(false);

  // Generate random food for Snake
  const generateFood = useCallback((currentSnake: { x: number; y: number }[]) => {
    let newX: number, newY: number;
    while (true) {
      newX = Math.floor(Math.random() * SNAKE_GRID_SIZE);
      newY = Math.floor(Math.random() * SNAKE_GRID_SIZE);
      const isOccupied = currentSnake.some((segment) => segment.x === newX && segment.y === newY);
      if (!isOccupied) break;
    }
    const foodType = FOOD_TYPES[Math.floor(Math.random() * FOOD_TYPES.length)];
    return { x: newX, y: newY, ...foodType };
  }, []);

  // ==================== TETRIS LOGIC ====================
  const checkCollision = useCallback(
    (
      pieceShape: number[][],
      pieceX: number,
      pieceY: number,
      board: (string | null)[][]
    ) => {
      for (let r = 0; r < pieceShape.length; r++) {
        for (let c = 0; c < pieceShape[r].length; c++) {
          if (pieceShape[r][c] !== 0) {
            const newX = pieceX + c;
            const newY = pieceY + r;
            if (
              newX < 0 ||
              newX >= TETRIS_COLS ||
              newY >= TETRIS_ROWS ||
              (newY >= 0 && board[newY][newX] !== null)
            ) {
              return true;
            }
          }
        }
      }
      return false;
    },
    []
  );

  const startTetris = () => {
    const first = getRandomTetromino();
    const second = getRandomTetromino();
    setTetrisBoard(createEmptyBoard());
    setCurrentPiece({
      ...first,
      x: Math.floor((TETRIS_COLS - first.shape[0].length) / 2),
      y: 0,
    });
    setNextPiece(second);
    setTetrisScore(0);
    setTetrisLines(0);
    setTetrisLevel(1);
    setTetrisPaused(false);
    setTetrisGameOver(false);
    setTetrisStarted(true);
  };

  const spawnNextTetrisPiece = useCallback(() => {
    if (!nextPiece) return;
    const newPiece = {
      ...nextPiece,
      x: Math.floor((TETRIS_COLS - nextPiece.shape[0].length) / 2),
      y: 0,
    };
    const upcoming = getRandomTetromino();

    if (checkCollision(newPiece.shape, newPiece.x, newPiece.y, tetrisBoard)) {
      setTetrisGameOver(true);
      setTetrisStarted(false);
      return;
    }

    setCurrentPiece(newPiece);
    setNextPiece(upcoming);
  }, [nextPiece, tetrisBoard, checkCollision]);

  const mergePieceToBoard = useCallback(() => {
    if (!currentPiece) return;
    const newBoard = tetrisBoard.map((row) => [...row]);

    currentPiece.shape.forEach((row, r) => {
      row.forEach((value, c) => {
        if (value !== 0) {
          const boardY = currentPiece.y + r;
          const boardX = currentPiece.x + c;
          if (boardY >= 0 && boardY < TETRIS_ROWS && boardX >= 0 && boardX < TETRIS_COLS) {
            newBoard[boardY][boardX] = currentPiece.color;
          }
        }
      });
    });

    // Clear filled lines
    let linesCleared = 0;
    const clearedBoard = newBoard.filter((row) => {
      const isFull = row.every((cell) => cell !== null);
      if (isFull) linesCleared++;
      return !isFull;
    });

    while (clearedBoard.length < TETRIS_ROWS) {
      clearedBoard.unshift(Array(TETRIS_COLS).fill(null));
    }

    if (linesCleared > 0) {
      const lineScores = [0, 100, 300, 500, 800];
      const addedScore = (lineScores[linesCleared] || 100) * tetrisLevel;
      const newScore = tetrisScore + addedScore;
      const newTotalLines = tetrisLines + linesCleared;
      const newLevel = Math.floor(newTotalLines / 10) + 1;

      setTetrisScore(newScore);
      setTetrisLines(newTotalLines);
      setTetrisLevel(newLevel);

      if (newScore > tetrisHighScore) {
        setTetrisHighScore(newScore);
        localStorage.setItem("cy_tetris_highscore", newScore.toString());
      }
    }

    setTetrisBoard(clearedBoard);
    spawnNextTetrisPiece();
  }, [
    currentPiece,
    tetrisBoard,
    tetrisLevel,
    tetrisScore,
    tetrisLines,
    tetrisHighScore,
    spawnNextTetrisPiece,
  ]);

  const moveTetrisLeft = () => {
    if (!currentPiece || tetrisPaused || tetrisGameOver || !tetrisStarted) return;
    if (!checkCollision(currentPiece.shape, currentPiece.x - 1, currentPiece.y, tetrisBoard)) {
      setCurrentPiece((prev) => (prev ? { ...prev, x: prev.x - 1 } : null));
    }
  };

  const moveTetrisRight = () => {
    if (!currentPiece || tetrisPaused || tetrisGameOver || !tetrisStarted) return;
    if (!checkCollision(currentPiece.shape, currentPiece.x + 1, currentPiece.y, tetrisBoard)) {
      setCurrentPiece((prev) => (prev ? { ...prev, x: prev.x + 1 } : null));
    }
  };

  const moveTetrisDown = useCallback(() => {
    if (!currentPiece || tetrisPaused || tetrisGameOver || !tetrisStarted) return;
    if (!checkCollision(currentPiece.shape, currentPiece.x, currentPiece.y + 1, tetrisBoard)) {
      setCurrentPiece((prev) => (prev ? { ...prev, y: prev.y + 1 } : null));
    } else {
      mergePieceToBoard();
    }
  }, [currentPiece, tetrisPaused, tetrisGameOver, tetrisStarted, tetrisBoard, checkCollision, mergePieceToBoard]);

  const dropTetrisHard = () => {
    if (!currentPiece || tetrisPaused || tetrisGameOver || !tetrisStarted) return;
    let newY = currentPiece.y;
    while (!checkCollision(currentPiece.shape, currentPiece.x, newY + 1, tetrisBoard)) {
      newY++;
    }
    const droppedPiece = { ...currentPiece, y: newY };
    
    // Merge immediately
    const newBoard = tetrisBoard.map((row) => [...row]);
    droppedPiece.shape.forEach((row, r) => {
      row.forEach((value, c) => {
        if (value !== 0) {
          const boardY = droppedPiece.y + r;
          const boardX = droppedPiece.x + c;
          if (boardY >= 0 && boardY < TETRIS_ROWS && boardX >= 0 && boardX < TETRIS_COLS) {
            newBoard[boardY][boardX] = droppedPiece.color;
          }
        }
      });
    });

    let linesCleared = 0;
    const clearedBoard = newBoard.filter((row) => {
      const isFull = row.every((cell) => cell !== null);
      if (isFull) linesCleared++;
      return !isFull;
    });

    while (clearedBoard.length < TETRIS_ROWS) {
      clearedBoard.unshift(Array(TETRIS_COLS).fill(null));
    }

    if (linesCleared > 0) {
      const lineScores = [0, 100, 300, 500, 800];
      const addedScore = (lineScores[linesCleared] || 100) * tetrisLevel;
      const newScore = tetrisScore + addedScore + 20;
      const newTotalLines = tetrisLines + linesCleared;
      const newLevel = Math.floor(newTotalLines / 10) + 1;

      setTetrisScore(newScore);
      setTetrisLines(newTotalLines);
      setTetrisLevel(newLevel);

      if (newScore > tetrisHighScore) {
        setTetrisHighScore(newScore);
        localStorage.setItem("cy_tetris_highscore", newScore.toString());
      }
    } else {
      setTetrisScore((prev) => prev + 20);
    }

    setTetrisBoard(clearedBoard);
    
    // Spawn next piece
    if (nextPiece) {
      const newPiece = {
        ...nextPiece,
        x: Math.floor((TETRIS_COLS - nextPiece.shape[0].length) / 2),
        y: 0,
      };
      const upcoming = getRandomTetromino();

      if (checkCollision(newPiece.shape, newPiece.x, newPiece.y, clearedBoard)) {
        setTetrisGameOver(true);
        setTetrisStarted(false);
        setCurrentPiece(null);
        return;
      }

      setCurrentPiece(newPiece);
      setNextPiece(upcoming);
    }
  };

  const rotateTetris = () => {
    if (!currentPiece || tetrisPaused || tetrisGameOver || !tetrisStarted) return;
    const originalShape = currentPiece.shape;
    const rows = originalShape.length;
    const cols = originalShape[0].length;
    const rotated: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        rotated[c][rows - 1 - r] = originalShape[r][c];
      }
    }

    // Try offset if hits boundary
    let offsetX = 0;
    if (checkCollision(rotated, currentPiece.x, currentPiece.y, tetrisBoard)) {
      if (!checkCollision(rotated, currentPiece.x - 1, currentPiece.y, tetrisBoard)) {
        offsetX = -1;
      } else if (!checkCollision(rotated, currentPiece.x + 1, currentPiece.y, tetrisBoard)) {
        offsetX = 1;
      } else if (!checkCollision(rotated, currentPiece.x - 2, currentPiece.y, tetrisBoard)) {
        offsetX = -2;
      } else {
        return; // Rotation invalid
      }
    }

    setCurrentPiece((prev) =>
      prev
        ? {
            ...prev,
            shape: rotated,
            x: prev.x + offsetX,
          }
        : null
    );
  };

  // Tetris Interval Loop
  useEffect(() => {
    if (activeGame !== "tetris" || !tetrisStarted || tetrisPaused || tetrisGameOver) return;
    const speed = Math.max(120, 800 - (tetrisLevel - 1) * 70);
    const timer = setInterval(() => {
      moveTetrisDown();
    }, speed);
    return () => clearInterval(timer);
  }, [activeGame, tetrisStarted, tetrisPaused, tetrisGameOver, tetrisLevel, moveTetrisDown]);

  // ==================== SNAKE LOGIC ====================
  const startSnake = () => {
    const initialSnake = [
      { x: 8, y: 8 },
      { x: 8, y: 9 },
      { x: 8, y: 10 },
    ];
    setSnake(initialSnake);
    setSnakeDirection("UP");
    nextDirectionRef.current = "UP";
    setFood(generateFood(initialSnake));
    setSnakeScore(0);
    setSnakePaused(false);
    setSnakeGameOver(false);
    setSnakeStarted(true);
  };

  const moveSnake = useCallback(() => {
    if (!snakeStarted || snakePaused || snakeGameOver) return;

    const currentDir = nextDirectionRef.current;
    setSnakeDirection(currentDir);

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      let newHead = { ...head };

      if (currentDir === "UP") newHead.y -= 1;
      if (currentDir === "DOWN") newHead.y += 1;
      if (currentDir === "LEFT") newHead.x -= 1;
      if (currentDir === "RIGHT") newHead.x += 1;

      // Check wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= SNAKE_GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= SNAKE_GRID_SIZE
      ) {
        setSnakeGameOver(true);
        setSnakeStarted(false);
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setSnakeGameOver(true);
        setSnakeStarted(false);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        const addedScore = food.score;
        setSnakeScore((s) => {
          const nextS = s + addedScore;
          if (nextS > snakeHighScore) {
            setSnakeHighScore(nextS);
            localStorage.setItem("cy_snake_highscore", nextS.toString());
          }
          return nextS;
        });
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop(); // Remove tail
      }

      return newSnake;
    });
  }, [snakeStarted, snakePaused, snakeGameOver, food, generateFood, snakeHighScore]);

  const changeSnakeDirection = (dir: Direction) => {
    if (!snakeStarted || snakePaused || snakeGameOver) return;
    const current = snakeDirection;
    if (dir === "UP" && current !== "DOWN") nextDirectionRef.current = "UP";
    if (dir === "DOWN" && current !== "UP") nextDirectionRef.current = "DOWN";
    if (dir === "LEFT" && current !== "RIGHT") nextDirectionRef.current = "LEFT";
    if (dir === "RIGHT" && current !== "LEFT") nextDirectionRef.current = "RIGHT";
  };

  // Snake Interval Loop
  useEffect(() => {
    if (activeGame !== "snake" || !snakeStarted || snakePaused || snakeGameOver) return;
    const speed = Math.max(90, 220 - Math.floor(snakeScore / 30) * 15);
    const timer = setInterval(() => {
      moveSnake();
    }, speed);
    return () => clearInterval(timer);
  }, [activeGame, snakeStarted, snakePaused, snakeGameOver, snakeScore, moveSnake]);

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeGame === "tetris") {
        if (e.key === "ArrowLeft") moveTetrisLeft();
        if (e.key === "ArrowRight") moveTetrisRight();
        if (e.key === "ArrowDown") moveTetrisDown();
        if (e.key === "ArrowUp") rotateTetris();
        if (e.key === " ") {
          e.preventDefault();
          dropTetrisHard();
        }
      } else if (activeGame === "snake") {
        if (e.key === "ArrowLeft") changeSnakeDirection("LEFT");
        if (e.key === "ArrowRight") changeSnakeDirection("RIGHT");
        if (e.key === "ArrowUp") changeSnakeDirection("UP");
        if (e.key === "ArrowDown") changeSnakeDirection("DOWN");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeGame, moveTetrisLeft, moveTetrisRight, moveTetrisDown, rotateTetris, changeSnakeDirection]);

  // Touch Swipe for Snake
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeGame !== "snake") return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (activeGame !== "snake" || !touchStartRef.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
      if (deltaX > 0) changeSnakeDirection("RIGHT");
      else changeSnakeDirection("LEFT");
    } else if (Math.abs(deltaY) > 20) {
      if (deltaY > 0) changeSnakeDirection("DOWN");
      else changeSnakeDirection("UP");
    }
    touchStartRef.current = null;
  };

  // Build Tetris Render Grid
  const renderTetrisGrid = () => {
    const displayGrid = tetrisBoard.map((row) => [...row]);

    // Overlay active piece
    if (currentPiece && tetrisStarted) {
      currentPiece.shape.forEach((row, r) => {
        row.forEach((value, c) => {
          if (value !== 0) {
            const boardY = currentPiece.y + r;
            const boardX = currentPiece.x + c;
            if (boardY >= 0 && boardY < TETRIS_ROWS && boardX >= 0 && boardX < TETRIS_COLS) {
              displayGrid[boardY][boardX] = currentPiece.color;
            }
          }
        });
      });
    }

    return displayGrid;
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900 text-white overflow-hidden select-none">
      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between px-3.5 py-2.5 bg-slate-800/80 backdrop-blur-md border-b border-slate-700/60 shadow-md">
        <div className="flex items-center space-x-2">
          {activeGame === "menu" ? (
            <button
              onClick={onBackToHome}
              className="p-1.5 rounded-xl bg-slate-700/60 text-slate-200 hover:bg-slate-600 active:scale-95 transition-all flex items-center space-x-1"
            >
              <ChevronLeft size={18} />
              <span className="text-xs font-medium">返回桌面</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveGame("menu")}
              className="p-1.5 rounded-xl bg-slate-700/60 text-slate-200 hover:bg-slate-600 active:scale-95 transition-all flex items-center space-x-1"
            >
              <ChevronLeft size={18} />
              <span className="text-xs font-medium">大厅</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          <Gamepad2 size={18} className="text-emerald-400" />
          <h1 className="text-sm font-bold text-slate-100 tracking-wide">
            {activeGame === "menu" && "小游戏乐园"}
            {activeGame === "tetris" && "俄罗斯方块"}
            {activeGame === "snake" && "贪吃蛇大作战"}
          </h1>
        </div>

        <div className="w-16 flex justify-end">
          {activeGame === "tetris" && tetrisStarted && (
            <button
              onClick={() => setTetrisPaused((p) => !p)}
              className="p-1.5 rounded-xl bg-purple-600/60 text-purple-200 hover:bg-purple-600 active:scale-95 transition-all"
            >
              {tetrisPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>
          )}
          {activeGame === "snake" && snakeStarted && (
            <button
              onClick={() => setSnakePaused((p) => !p)}
              className="p-1.5 rounded-xl bg-emerald-600/60 text-emerald-200 hover:bg-emerald-600 active:scale-95 transition-all"
            >
              {snakePaused ? <Play size={16} /> : <Pause size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* ==================== MENU SCREEN ==================== */}
      {activeGame === "menu" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Banner Card */}
            <div className="relative rounded-3xl p-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden shadow-lg border border-white/10">
              <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="relative z-10 space-y-1">
                <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white/90 text-[10px] font-bold backdrop-blur-xs">
                  <Sparkles size={12} />
                  <span>休闲娱乐专区</span>
                </div>
                <h2 className="text-lg font-black text-white tracking-wide">欢迎来到游戏中心 🎮</h2>
                <p className="text-xs text-purple-100 leading-relaxed opacity-90">
                  精选经典休闲小游戏，随时随地放松心情，破纪录领奖章！
                </p>
              </div>
            </div>

            {/* Game 1: Tetris Card */}
            <div className="bg-slate-800/90 rounded-2xl p-3.5 border border-slate-700 shadow-md flex flex-col space-y-3 hover:border-purple-500/50 transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-md font-black text-xl">
                  🧩
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-100">俄罗斯方块 (Tetris)</h3>
                    <span className="text-[10px] font-semibold text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-full border border-purple-700/50">
                      经典消除
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    快速下落与旋转，消除成排方块！
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                  <Trophy size={14} className="text-amber-400" />
                  <span>最高分: </span>
                  <span className="font-bold text-amber-400">{tetrisHighScore}</span>
                </div>

                <button
                  onClick={() => {
                    setActiveGame("tetris");
                    startTetris();
                  }}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center space-x-1"
                >
                  <Play size={14} />
                  <span>开始游戏</span>
                </button>
              </div>
            </div>

            {/* Game 2: Snake Card */}
            <div className="bg-slate-800/90 rounded-2xl p-3.5 border border-slate-700 shadow-md flex flex-col space-y-3 hover:border-emerald-500/50 transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md font-black text-xl">
                  🐍
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-100">贪吃蛇大作战 (Snake)</h3>
                    <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-700/50">
                      手速与反应
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    吃掉各色水果蛋糕，挑战更长的蛇身！
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                  <Trophy size={14} className="text-amber-400" />
                  <span>最高分: </span>
                  <span className="font-bold text-amber-400">{snakeHighScore}</span>
                </div>

                <button
                  onClick={() => {
                    setActiveGame("snake");
                    startSnake();
                  }}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center space-x-1"
                >
                  <Play size={14} />
                  <span>开始游戏</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/40 text-center space-y-1">
            <p className="text-[11px] text-slate-400">✨ 随时试玩，数据自动保存在手机本地</p>
          </div>
        </div>
      )}

      {/* ==================== TETRIS SCREEN ==================== */}
      {activeGame === "tetris" && (
        <div className="flex-1 flex flex-col justify-between p-3 overflow-hidden bg-slate-950">
          {/* Status Bar */}
          <div className="flex items-center justify-between bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-200">
            <div className="flex items-center space-x-3">
              <div>
                <span className="text-[10px] text-slate-400 block">得分</span>
                <span className="font-bold text-amber-400 text-sm">{tetrisScore}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">消行</span>
                <span className="font-semibold text-purple-300">{tetrisLines}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">难度</span>
                <span className="font-semibold text-cyan-300">Lv.{tetrisLevel}</span>
              </div>
            </div>

            {/* Next Piece Preview */}
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-slate-400">下一个:</span>
              <div className="w-10 h-10 bg-slate-900 rounded-lg p-1 border border-slate-700 flex items-center justify-center">
                {nextPiece && (
                  <div
                    className="grid gap-0.5"
                    style={{
                      gridTemplateColumns: `repeat(${nextPiece.shape[0].length}, minmax(0, 1fr))`,
                    }}
                  >
                    {nextPiece.shape.map((row, r) =>
                      row.map((val, c) => (
                        <div
                          key={`np_${r}_${c}`}
                          className={`w-2 h-2 rounded-xs ${
                            val !== 0 ? nextPiece.color : "bg-transparent"
                          }`}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Board Container */}
          <div className="relative flex-1 flex items-center justify-center my-2">
            <div
              className="relative bg-slate-900/90 border-2 border-slate-700 rounded-xl p-1 grid gap-0.5 shadow-inner"
              style={{
                gridTemplateColumns: `repeat(${TETRIS_COLS}, minmax(0, 1fr))`,
                width: "220px",
                height: "360px",
              }}
            >
              {renderTetrisGrid().map((row, r) =>
                row.map((cellColor, c) => (
                  <div
                    key={`t_${r}_${c}`}
                    className={`w-full h-full rounded-xs transition-colors duration-75 ${
                      cellColor ? `${cellColor} border border-white/20 shadow-xs` : "bg-slate-800/40"
                    }`}
                  />
                ))
              )}

              {/* Game Over / Pause Overlay */}
              {tetrisGameOver && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-4 text-center space-y-3 z-20">
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
                    <Flame size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-rose-400">GAME OVER</h3>
                    <p className="text-xs text-slate-300 mt-1">最终得分: <span className="font-bold text-amber-400">{tetrisScore}</span></p>
                  </div>
                  <button
                    onClick={startTetris}
                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <RotateCcw size={14} />
                    <span>重新开始</span>
                  </button>
                </div>
              )}

              {tetrisPaused && !tetrisGameOver && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-4 text-center space-y-3 z-20">
                  <h3 className="text-base font-bold text-purple-300">游戏已暂停</h3>
                  <button
                    onClick={() => setTetrisPaused(false)}
                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <Play size={14} />
                    <span>继续游戏</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Touch Controls for Mobile */}
          <div className="bg-slate-800/70 p-2 rounded-2xl border border-slate-700/80 space-y-2">
            <div className="grid grid-cols-5 gap-2 text-center">
              <button
                onClick={moveTetrisLeft}
                className="py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 active:bg-purple-600 active:text-white transition-all flex items-center justify-center shadow-sm"
              >
                <ArrowLeft size={20} />
              </button>

              <button
                onClick={moveTetrisRight}
                className="py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 active:bg-purple-600 active:text-white transition-all flex items-center justify-center shadow-sm"
              >
                <ArrowRight size={20} />
              </button>

              <button
                onClick={rotateTetris}
                className="py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold active:scale-95 transition-all flex items-center justify-center shadow-sm"
              >
                <RotateCw size={18} />
              </button>

              <button
                onClick={moveTetrisDown}
                className="py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 active:bg-purple-600 active:text-white transition-all flex items-center justify-center shadow-sm"
              >
                <ArrowDown size={20} />
              </button>

              <button
                onClick={dropTetrisHard}
                className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold active:scale-95 transition-all flex items-center justify-center shadow-sm text-xs"
              >
                <Zap size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SNAKE SCREEN ==================== */}
      {activeGame === "snake" && (
        <div
          className="flex-1 flex flex-col justify-between p-3 overflow-hidden bg-slate-950"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-200">
            <div className="flex items-center space-x-3">
              <div>
                <span className="text-[10px] text-slate-400 block">得分</span>
                <span className="font-bold text-amber-400 text-sm">{snakeScore}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">长度</span>
                <span className="font-semibold text-emerald-300">{snake.length}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">最高分</span>
                <span className="font-semibold text-teal-300">{snakeHighScore}</span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700">
              <span className="text-[10px] text-slate-400">目标:</span>
              <span className="text-base leading-none">{food.icon}</span>
            </div>
          </div>

          {/* Snake Arena Board */}
          <div className="relative flex-1 flex items-center justify-center my-2">
            <div
              className="relative bg-slate-900 border-2 border-slate-700 rounded-xl p-1 grid gap-0.5 shadow-inner"
              style={{
                gridTemplateColumns: `repeat(${SNAKE_GRID_SIZE}, minmax(0, 1fr))`,
                width: "280px",
                height: "280px",
              }}
            >
              {Array.from({ length: SNAKE_GRID_SIZE * SNAKE_GRID_SIZE }).map((_, index) => {
                const x = index % SNAKE_GRID_SIZE;
                const y = Math.floor(index / SNAKE_GRID_SIZE);

                const isHead = snake[0].x === x && snake[0].y === y;
                const isBody = !isHead && snake.some((s) => s.x === x && s.y === y);
                const isFoodItem = food.x === x && food.y === y;

                return (
                  <div
                    key={`s_${x}_${y}`}
                    className={`w-full h-full rounded-xs flex items-center justify-center transition-all ${
                      isHead
                        ? "bg-emerald-400 rounded-sm shadow-md ring-2 ring-emerald-300/60 z-10 scale-105"
                        : isBody
                        ? "bg-emerald-600/90 rounded-xs"
                        : "bg-slate-800/30"
                    }`}
                  >
                    {isFoodItem && (
                      <span className="text-xs leading-none animate-pulse">{food.icon}</span>
                    )}
                  </div>
                );
              })}

              {/* Game Over / Pause Overlay */}
              {snakeGameOver && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-4 text-center space-y-3 z-20">
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
                    <Flame size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-rose-400">GAME OVER</h3>
                    <p className="text-xs text-slate-300 mt-1">你的得分: <span className="font-bold text-amber-400">{snakeScore}</span></p>
                  </div>
                  <button
                    onClick={startSnake}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <RotateCcw size={14} />
                    <span>重新开始</span>
                  </button>
                </div>
              )}

              {snakePaused && !snakeGameOver && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-4 text-center space-y-3 z-20">
                  <h3 className="text-base font-bold text-emerald-300">游戏已暂停</h3>
                  <button
                    onClick={() => setSnakePaused(false)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <Play size={14} />
                    <span>继续游戏</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* D-Pad Controls */}
          <div className="bg-slate-800/70 p-2 rounded-2xl border border-slate-700/80 flex justify-center">
            <div className="grid grid-cols-3 gap-1.5 w-36">
              <div />
              <button
                onClick={() => changeSnakeDirection("UP")}
                className="w-11 h-11 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 active:bg-emerald-600 active:text-white transition-all flex items-center justify-center shadow-sm"
              >
                <ArrowRight size={18} className="-rotate-90" />
              </button>
              <div />

              <button
                onClick={() => changeSnakeDirection("LEFT")}
                className="w-11 h-11 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 active:bg-emerald-600 active:text-white transition-all flex items-center justify-center shadow-sm"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="w-11 h-11 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-center text-xs text-slate-500">
                🐍
              </div>
              <button
                onClick={() => changeSnakeDirection("RIGHT")}
                className="w-11 h-11 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 active:bg-emerald-600 active:text-white transition-all flex items-center justify-center shadow-sm"
              >
                <ArrowRight size={18} />
              </button>

              <div />
              <button
                onClick={() => changeSnakeDirection("DOWN")}
                className="w-11 h-11 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 active:bg-emerald-600 active:text-white transition-all flex items-center justify-center shadow-sm"
              >
                <ArrowDown size={18} />
              </button>
              <div />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
