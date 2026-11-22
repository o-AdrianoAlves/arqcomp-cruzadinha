const ROWS = 15;
const COLS = 22;

const WORDS = [
  {
    word: "MICROCONTROLADOR",
    clue: "Chip que integra processamento, memoria e entradas e saidas.",
    row: 5,
    col: 0,
    dir: "H"
  },
  {
    word: "MEMORIADEMASSA",
    clue: "Armazenamento permanente com grande capacidade, como SSD e HD.",
    row: 1,
    col: 9,
    dir: "V"
  },
  {
    word: "REGISTRADORES",
    clue: "Memorias internas rapidissimas usadas durante cada instrucao.",
    row: 2,
    col: 8,
    dir: "H"
  },
  {
    word: "ADDRESSBUS",
    clue: "Conjunto de linhas que indica posicoes para leitura ou escrita.",
    row: 2,
    col: 15,
    dir: "V"
  },
  {
    word: "DUALCORE",
    clue: "Processador com dois nucleos fisicos de processamento.",
    row: 5,
    col: 13,
    dir: "V"
  },
  {
    word: "QUADCORE",
    clue: "Processador com quatro nucleos fisicos de processamento.",
    row: 0,
    col: 6,
    dir: "V"
  },
  {
    word: "DATABUS",
    clue: "Conjunto de linhas que transporta valores e instrucoes entre blocos.",
    row: 4,
    col: 15,
    dir: "H"
  },
  {
    word: "EEPROM",
    clue: "Memoria nao volatil regravavel para guardar configuracoes persistentes.",
    row: 1,
    col: 4,
    dir: "V"
  },
  {
    word: "FLASH",
    clue: "Tipo nao volatil que armazena programa mesmo sem energia.",
    row: 8,
    col: 12,
    dir: "H"
  },
  {
    word: "CACHE",
    clue: "Memoria pequena e veloz com dados acessados recentemente.",
    row: 5,
    col: 2,
    dir: "V"
  },
  {
    word: "CPU",
    clue: "Componente que busca, interpreta e executa instrucoes do programa.",
    row: 8,
    col: 7,
    dir: "V"
  },
  {
    word: "ULA",
    clue: "Parte que realiza calculos e operacoes logicas dentro do processador.",
    row: 4,
    col: 11,
    dir: "V"
  },
  {
    word: "RAM",
    clue: "Memoria volatil usada por programas e variaveis em execucao.",
    row: 7,
    col: 8,
    dir: "H"
  },
  {
    word: "ROM",
    clue: "Memoria nao volatil usada para firmware de inicializacao.",
    row: 3,
    col: 0,
    dir: "V"
  },
  {
    word: "DMA",
    clue: "Recurso que transfere blocos sem mover byte a byte no processador.",
    row: 14,
    col: 7,
    dir: "H"
  },
  {
    word: "UC",
    clue: "Bloco que decodifica instrucoes e envia comandos internos.",
    row: 1,
    col: 6,
    dir: "H"
  }
];

const board = document.getElementById("board");
const acrossList = document.getElementById("acrossList");
const downList = document.getElementById("downList");
const score = document.getElementById("score");
const checkBtn = document.getElementById("checkBtn");
const resetBtn = document.getElementById("resetBtn");

const cellMap = new Map();
const inputMap = new Map();
const wrapperMap = new Map();
const wordById = new Map();

let typingDirection = "H";

function key(row, col) {
  return `${row}-${col}`;
}

function updateDirectionLabel() {
  checkBtn.textContent = typingDirection === "H" ? "Conferir [H]" : "Conferir [V]";
}

function setTypingDirection(direction) {
  typingDirection = direction;
  updateDirectionLabel();
}

function toggleTypingDirection() {
  typingDirection = typingDirection === "H" ? "V" : "H";
  updateDirectionLabel();
}

function updateScore(hits) {
  const completed = hits === WORDS.length;
  score.textContent = completed
    ? `${hits} de ${WORDS.length} palavras - PARABENS!`
    : `${hits} de ${WORDS.length} palavras`;
}

function buildCellMap() {
  WORDS.forEach((entry, index) => {
    entry.id = `w-${index}`;
    entry.cells = [];
    wordById.set(entry.id, entry);

    for (let i = 0; i < entry.word.length; i += 1) {
      const row = entry.dir === "H" ? entry.row : entry.row + i;
      const col = entry.dir === "H" ? entry.col + i : entry.col;
      const letter = entry.word[i];
      const cellKey = key(row, col);

      if (!cellMap.has(cellKey)) {
        cellMap.set(cellKey, {
          row,
          col,
          letter,
          words: [entry.id]
        });
      } else {
        const cell = cellMap.get(cellKey);
        cell.words.push(entry.id);
      }

      entry.cells.push(cellKey);
    }
  });
}

function assignNumbers() {
  const starts = new Map();

  WORDS.forEach((entry) => {
    starts.set(key(entry.row, entry.col), { row: entry.row, col: entry.col });
  });

  const orderedStarts = [...starts.values()].sort((a, b) => {
    if (a.row === b.row) {
      return a.col - b.col;
    }
    return a.row - b.row;
  });

  orderedStarts.forEach((start, idx) => {
    const number = idx + 1;
    const startKey = key(start.row, start.col);

    WORDS.forEach((entry) => {
      if (entry.row === start.row && entry.col === start.col) {
        entry.number = number;
      }
    });

    const startCell = cellMap.get(startKey);
    if (startCell) {
      startCell.number = number;
    }
  });
}

function buildBoard() {
  board.style.gridTemplateColumns = `repeat(${COLS}, var(--cell-size))`;

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const cellKey = key(row, col);
      const data = cellMap.get(cellKey);

      if (!data) {
        const blocker = document.createElement("div");
        blocker.className = "blocker";
        blocker.setAttribute("aria-hidden", "true");
        board.appendChild(blocker);
        continue;
      }

      const wrapper = document.createElement("div");
      wrapper.className = "cell";
      wrapper.dataset.key = cellKey;

      if (data.number) {
        const number = document.createElement("span");
        number.className = "cell-number";
        number.textContent = data.number;
        wrapper.appendChild(number);
      }

      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 1;
      input.dataset.row = row;
      input.dataset.col = col;
      input.dataset.key = cellKey;
      input.setAttribute("aria-label", `Linha ${row + 1}, coluna ${col + 1}`);
      wrapper.appendChild(input);

      inputMap.set(cellKey, input);
      wrapperMap.set(cellKey, wrapper);
      board.appendChild(wrapper);
    }
  }
}

function moveFocusToInput(input) {
  if (!input) {
    return;
  }
  input.focus();
  input.select();
}

function moveFocusByVector(row, col, rowDelta, colDelta) {
  let nextRow = row + rowDelta;
  let nextCol = col + colDelta;

  while (nextRow >= 0 && nextRow < ROWS && nextCol >= 0 && nextCol < COLS) {
    const next = inputMap.get(key(nextRow, nextCol));
    if (next) {
      moveFocusToInput(next);
      return;
    }
    nextRow += rowDelta;
    nextCol += colDelta;
  }
}

function resolveDirection(cellKey) {
  const data = cellMap.get(cellKey);
  if (!data) {
    return typingDirection;
  }

  const availableDirections = data.words.map((wordId) => wordById.get(wordId).dir);
  if (availableDirections.length === 1) {
    return availableDirections[0];
  }
  if (availableDirections.includes(typingDirection)) {
    return typingDirection;
  }
  return availableDirections[0];
}

function moveFocusAlongDirection(row, col, direction, reverse = false) {
  const step = reverse ? -1 : 1;

  if (direction === "V") {
    moveFocusByVector(row, col, step, 0);
    return;
  }
  moveFocusByVector(row, col, 0, step);
}

function createClueItem(word) {
  const item = document.createElement("li");
  item.dataset.wordId = word.id;
  item.textContent = `${word.number}. ${word.clue}`;
  return item;
}

function buildClues() {
  const across = WORDS.filter((w) => w.dir === "H").sort((a, b) => a.number - b.number);
  const down = WORDS.filter((w) => w.dir === "V").sort((a, b) => a.number - b.number);

  across.forEach((word) => acrossList.appendChild(createClueItem(word)));
  down.forEach((word) => downList.appendChild(createClueItem(word)));
}

function clearVisualState() {
  wrapperMap.forEach((cell) => {
    cell.classList.remove("correct", "wrong");
  });

  document.querySelectorAll(".clues li").forEach((item) => {
    item.classList.remove("good", "bad");
  });
}

function collectWordValue(word) {
  return word.cells
    .map((cellKey) => {
      const input = inputMap.get(cellKey);
      return input ? input.value.toUpperCase() : "";
    })
    .join("");
}

function validateBoard() {
  clearVisualState();
  let hits = 0;

  WORDS.forEach((word) => {
    word.correct = collectWordValue(word) === word.word;

    const clueItem = document.querySelector(`[data-word-id='${word.id}']`);
    if (clueItem) {
      clueItem.classList.add(word.correct ? "good" : "bad");
    }

    if (word.correct) {
      hits += 1;
    }
  });

  cellMap.forEach((cell) => {
    const statuses = cell.words.map((wordId) => {
      const entry = wordById.get(wordId);
      return entry ? entry.correct : false;
    });

    const wrapper = wrapperMap.get(key(cell.row, cell.col));
    if (!wrapper) {
      return;
    }

    if (statuses.every(Boolean)) {
      wrapper.classList.add("correct");
      return;
    }

    if (statuses.some((state) => state === false)) {
      wrapper.classList.add("wrong");
    }
  });

  updateScore(hits);
}

function resetBoard() {
  inputMap.forEach((input) => {
    input.value = "";
  });

  clearVisualState();
  setTypingDirection("H");
  updateScore(0);

  const firstWord = [...WORDS].sort((a, b) => a.number - b.number)[0];
  const firstInput = inputMap.get(key(firstWord.row, firstWord.col));
  moveFocusToInput(firstInput);
}

function bindInputs() {
  inputMap.forEach((input) => {
    input.addEventListener("focus", (event) => {
      const direction = resolveDirection(event.target.dataset.key);
      setTypingDirection(direction);
    });

    input.addEventListener("input", (event) => {
      const clean = event.target.value.toUpperCase().replace(/[^A-Z]/g, "");
      event.target.value = clean;

      if (!clean) {
        return;
      }

      const row = Number(event.target.dataset.row);
      const col = Number(event.target.dataset.col);
      const direction = resolveDirection(event.target.dataset.key);
      moveFocusAlongDirection(row, col, direction);
    });

    input.addEventListener("keydown", (event) => {
      const row = Number(event.target.dataset.row);
      const col = Number(event.target.dataset.col);

      if (event.key === "Backspace" && !event.target.value) {
        event.preventDefault();
        const direction = resolveDirection(event.target.dataset.key);
        moveFocusAlongDirection(row, col, direction, true);
      }

      if (event.key === "Enter") {
        event.preventDefault();
        validateBoard();
      }

      if (event.key === "Tab") {
        event.preventDefault();
        toggleTypingDirection();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setTypingDirection("H");
        moveFocusByVector(row, col, 0, -1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setTypingDirection("H");
        moveFocusByVector(row, col, 0, 1);
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setTypingDirection("V");
        moveFocusByVector(row, col, -1, 0);
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setTypingDirection("V");
        moveFocusByVector(row, col, 1, 0);
      }
    });
  });
}

function init() {
  buildCellMap();
  assignNumbers();
  buildBoard();
  buildClues();
  bindInputs();
  checkBtn.addEventListener("click", validateBoard);
  resetBtn.addEventListener("click", resetBoard);
  resetBoard();
}

init();
