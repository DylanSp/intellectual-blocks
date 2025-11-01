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
