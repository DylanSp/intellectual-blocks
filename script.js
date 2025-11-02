const workspace = document.getElementById("workspace");
const tray = document.getElementById("tray");
let pickedShape = null;
let offsetX = 0;
let offsetY = 0;
const shapeOriginalPositions = new Map();

// Initialize shapes - store original positions
document.querySelectorAll(".shape").forEach((shape) => {
  // Store original position
  shapeOriginalPositions.set(shape, {
    left: shape.style.left,
    top: shape.style.top,
  });
});

// Handle shape clicks
document.addEventListener("click", function (e) {
  const shape = e.target.closest(".shape");

  if (shape && !pickedShape) {
    // Pick up the shape
    pickedShape = shape;
    pickedShape.classList.add("picked-up");

    const rect = shape.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  } else if (pickedShape) {
    // Set down the shape
    pickedShape.classList.remove("picked-up");
    pickedShape = null;
  }
});

// Handle mouse movement
document.addEventListener("mousemove", function (e) {
  if (pickedShape) {
    // Move to workspace if not already there
    if (!pickedShape.classList.contains("in-workspace")) {
      pickedShape.classList.add("in-workspace");
      const originalPos = shapeOriginalPositions.get(pickedShape);
      const trayRect = tray.getBoundingClientRect();
      const workspaceRect = workspace.getBoundingClientRect();

      // Convert tray-relative position to workspace-relative position
      const absoluteLeft =
        trayRect.left - workspaceRect.left + parseInt(originalPos.left);
      const absoluteTop =
        trayRect.top - workspaceRect.top + parseInt(originalPos.top);

      pickedShape.style.left = absoluteLeft + "px";
      pickedShape.style.top = absoluteTop + "px";

      workspace.appendChild(pickedShape);
    }

    const workspaceRect = workspace.getBoundingClientRect();
    let newX = e.clientX - workspaceRect.left - offsetX;
    let newY = e.clientY - workspaceRect.top - offsetY;

    // Keep shape within workspace bounds
    newX = Math.max(
      0,
      Math.min(newX, workspace.clientWidth - pickedShape.offsetWidth)
    );
    newY = Math.max(
      0,
      Math.min(newY, workspace.clientHeight - pickedShape.offsetHeight)
    );

    pickedShape.style.left = newX + "px";
    pickedShape.style.top = newY + "px";
  }
});

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
