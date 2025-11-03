const GRID_SIZE = 6; // puzzle grid is GRID_SIZE x GRID_SIZE

const workspace = document.getElementById("workspace");
const tray = document.getElementById("tray");
let pickedPiece = null;
let offsetX = 0;
let offsetY = 0;
const pieceOriginalPositions = new Map();

// Initialize shapes - store original positions
document.querySelectorAll(".piece").forEach((piece) => {
  // Store original position
  pieceOriginalPositions.set(piece, {
    left: piece.style.left,
    top: piece.style.top,
  });
});

// Handle shape clicks
document.addEventListener("click", function (e) {
  const piece = e.target.closest(".piece");

  if (piece && !pickedPiece) {
    // Pick up the shape
    pickedPiece = piece;
    pickedPiece.classList.add("picked-up");

    const rect = piece.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  } else if (pickedPiece) {
    // Set down the shape
    pickedPiece.classList.remove("picked-up");
    pickedPiece = null;
  }
});

// Handle mouse movement
document.addEventListener("mousemove", function (e) {
  if (pickedPiece) {
    // Move to workspace if not already there
    if (!pickedPiece.classList.contains("in-workspace")) {
      pickedPiece.classList.add("in-workspace");
      const originalPos = pieceOriginalPositions.get(pickedPiece);
      const trayRect = tray.getBoundingClientRect();
      const workspaceRect = workspace.getBoundingClientRect();

      // Convert tray-relative position to workspace-relative position
      const absoluteLeft =
        trayRect.left - workspaceRect.left + parseInt(originalPos.left);
      const absoluteTop =
        trayRect.top - workspaceRect.top + parseInt(originalPos.top);

      pickedPiece.style.left = absoluteLeft + "px";
      pickedPiece.style.top = absoluteTop + "px";

      workspace.appendChild(pickedPiece);
    }

    const workspaceRect = workspace.getBoundingClientRect();
    let newX = e.clientX - workspaceRect.left - offsetX;
    let newY = e.clientY - workspaceRect.top - offsetY;

    // Keep shape within workspace bounds
    newX = Math.max(
      0,
      Math.min(newX, workspace.clientWidth - pickedPiece.offsetWidth)
    );
    newY = Math.max(
      0,
      Math.min(newY, workspace.clientHeight - pickedPiece.offsetHeight)
    );

    pickedPiece.style.left = newX + "px";
    pickedPiece.style.top = newY + "px";
  }
});

// in-memory state; source of truth, render from this
// TODO - save to localStorage to persist on reloads?
let puzzleGridState = [];

function randomBlockers() {
  const dice = [
    ["A6", "A6", "A6", "F1", "F1", "F1"],
    ["D3", "B4", "C3", "C4", "E3", "D4"],
    ["D1", "D2", "F3", "A1", "E2", "C1"],
    ["B1", "B2", "B3", "A2", "A3", "C2"],
    ["E4", "E5", "F5", "E6", "D5", "F4"],
    ["B5", "C5", "F6", "D6", "A4", "C6"],
    ["A5", "F2", "A5", "F2", "B6", "E1"],
  ];

  function rollDie(die) {
    return die[Math.floor(Math.random() * 6)];
  }

  function parseDieResult(result) {
    const rowName = result[0];
    const colName = result[1];

    const row = rowName.charCodeAt(0) - "A".charCodeAt(0);
    const col = Number.parseInt(colName, 10) - 1; // subtract 1 to convert to 0-indexed

    return [row, col];
  }

  let blockerPositions = [];
  for (const die of dice) {
    const [row, col] = parseDieResult(rollDie(die));
    blockerPositions.push([row, col]);
  }

  return blockerPositions;
}

function setupBlockers() {
  // TODO - load from URL/localStorage?
  const blockerPositions = randomBlockers();

  for (const [blockerRow, blockerCol] of blockerPositions) {
    puzzleGridState[blockerRow][blockerCol] = "blocker";
  }
}

function initializeState() {
  puzzleGridState = new Array(6);
  for (let row = 0; row < 6; row++) {
    puzzleGridState[row] = new Array(6);

    for (let col = 0; col < 6; col++) {
      puzzleGridState[row][col] = "empty";
    }
  }

  setupBlockers();
}
initializeState();

function renderPuzzleGrid() {
  const container = document.getElementById("puzzle-grid");

  const newChildren = [];

  // set up corner
  const corner = document.createElement("div");
  corner.className = "grid-corner";
  newChildren.push(corner);

  // set up column labels
  for (let col = 0; col < GRID_SIZE; col++) {
    const columnLabel = document.createElement("div");
    columnLabel.className = "grid-label";
    columnLabel.innerText = (col + 1).toString(10);
    newChildren.push(columnLabel);
  }

  // set up rows, starting each row with a label
  for (let row = 0; row < GRID_SIZE; row++) {
    const rowLabel = document.createElement("div");
    rowLabel.className = "grid-label";
    rowLabel.innerText = String.fromCharCode("A".charCodeAt(0) + row);
    newChildren.push(rowLabel);

    // set up grid cells
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = document.createElement("div");
      cell.className = "grid-cell";

      switch (puzzleGridState[row][col]) {
        case "empty":
          // intentional no-op
          break;
        case "blocker":
          const blocker = document.createElement("div");
          blocker.className = "blocker";
          cell.appendChild(blocker);
      }

      newChildren.push(cell);
    }
  }

  container.replaceChildren(...newChildren);
}

// temp - for testing
document
  .getElementById("renderBtn")
  .addEventListener("click", renderPuzzleGrid);
