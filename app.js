/* ==========================================================================
   AuraCard Studio - Core Application Logic
   ========================================================================== */

// 1. STATE OBJECT
const STATE = {
  // Participant Info
  name: "Alex Morgan",
  photoImage: null, // HTMLImageElement
  photoFileName: "",
  
  // Photo Zoom & Pan Adjustments
  photoZoom: 1.0,
  photoOffsetX: 0,
  photoOffsetY: 0,

  // Event Poster Template
  templateImage: null, // Custom template image (HTMLImageElement)
  
  // Layout Coordinates (Adjustable via Advanced settings)
  layout: {
    chairX: 250,
    chairY: 280,
    chairW: 300,
    chairH: 330,
    chairR: 30,
    nameX: 400,
    nameY: 815,
    nameSize: 36,
    nameRotation: 0,
    underlineY: 830
  },

  // Active theme
  theme: "dark"
};

// 2. INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
  initLucideIcons();
  initTheme();
  bindEvents();
  
  // Load default template if present, or draw vector poster
  checkLocalTemplate();
  
  // Initial draw
  drawCanvas();
});

// Check if a template.png file exists in the directory
function checkLocalTemplate() {
  const img = new Image();
  img.onload = () => {
    STATE.templateImage = img;
    applyLayoutMode("template");
    showToast("Template image loaded.", "success");
    drawCanvas();
  };
  img.onerror = () => {
    applyLayoutMode("vector");
    console.log("No local template.png found. Rendering built-in vector template.");
  };
  img.src = "template.png";
}

// 3. CANVAS DRAWING ENGINE
function drawCanvas() {
  const canvas = document.getElementById("card-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Step 1: Draw Background Poster
  if (STATE.templateImage) {
    // Draw uploaded or loaded template image (Scale to fit canvas)
    ctx.drawImage(STATE.templateImage, 0, 0, canvas.width, canvas.height);
  } else {
    // Draw built-in premium vector-based event poster
    drawDefaultVectorPoster(ctx, canvas.width, canvas.height);
  }
  
  // Step 2: Draw Photo Inside the Chair Area
  drawPhotoInsideChair(ctx);

  // Step 3: Draw Chair Outline / Frame Overlay (if using default vector poster)
  if (!STATE.templateImage) {
    drawChairFrameOverlay(ctx);
  }

  // Step 4: Draw Participant Name
  drawParticipantName(ctx);
}

// Helper to draw built-in high-quality tech event poster
function drawDefaultVectorPoster(ctx, w, h) {
  // Dark Tech Gradient Background
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, "#080b19");
  bgGrad.addColorStop(0.5, "#0d1330");
  bgGrad.addColorStop(1, "#04050d");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Add Abstract Cyber Grid Elements
  ctx.strokeStyle = "rgba(99, 102, 241, 0.05)";
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Glowing Neon Circles in Background
  drawGlowCircle(ctx, w - 100, 150, 250, "rgba(99, 102, 241, 0.15)"); // Violet glow
  drawGlowCircle(ctx, 100, h - 200, 300, "rgba(168, 85, 247, 0.12)"); // Purple glow
  drawGlowCircle(ctx, w / 2, h / 2, 200, "rgba(6, 182, 212, 0.08)"); // Cyan glow

  // Tech Corner Accents
  ctx.strokeStyle = "rgba(99, 102, 241, 0.3)";
  ctx.lineWidth = 2;
  const padding = 20;
  const len = 30;
  
  // Top-Left Corner
  ctx.beginPath();
  ctx.moveTo(padding + len, padding);
  ctx.lineTo(padding, padding);
  ctx.lineTo(padding, padding + len);
  ctx.stroke();

  // Top-Right Corner
  ctx.beginPath();
  ctx.moveTo(w - padding - len, padding);
  ctx.lineTo(w - padding, padding);
  ctx.lineTo(w - padding, padding + len);
  ctx.stroke();

  // Bottom-Left Corner
  ctx.beginPath();
  ctx.moveTo(padding + len, h - padding);
  ctx.lineTo(padding, h - padding);
  ctx.lineTo(padding, h - padding + len);
  ctx.stroke();

  // Bottom-Right Corner
  ctx.beginPath();
  ctx.moveTo(w - padding - len, h - padding);
  ctx.lineTo(w - padding, h - padding);
  ctx.lineTo(w - padding, h - padding + len);
  ctx.stroke();

  // Top Title Text
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  // Subtitle / Label
  ctx.font = "bold 15px 'Outfit', sans-serif";
  ctx.fillStyle = "#818cf8";
  ctx.letterSpacing = "6px";
  ctx.fillText("FUTURE INTELLIGENCE FORUM 2026", w / 2, 80);
  ctx.letterSpacing = "0px"; // Reset letter spacing
  
  // Main Title
  ctx.font = "800 40px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("AI REVOLUTION SUMMIT", w / 2, 130);

  // Gradient separator line
  const lineGrad = ctx.createLinearGradient(w / 2 - 150, 0, w / 2 + 150, 0);
  lineGrad.addColorStop(0, "transparent");
  lineGrad.addColorStop(0.2, "rgba(99, 102, 241, 0.8)");
  lineGrad.addColorStop(0.5, "rgba(168, 85, 247, 1)");
  lineGrad.addColorStop(0.8, "rgba(99, 102, 241, 0.8)");
  lineGrad.addColorStop(1, "transparent");
  ctx.fillStyle = lineGrad;
  ctx.fillRect(w / 2 - 150, 165, 300, 3);

  // Speaker Badge or Keynote marker
  ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fillText("SAN FRANCISCO, CA • JUNE 15-17", w / 2, 195);

  // Render "I'M ATTENDING" Badge
  drawAttendingBadge(ctx, w / 2, 735);
}

// Draw radial gradient glowing circle on canvas
function drawGlowCircle(ctx, x, y, r, color) {
  ctx.save();
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, color);
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Draw the "I'M ATTENDING" badge
function drawAttendingBadge(ctx, x, y) {
  const w = 220;
  const h = 42;
  const r = 21; // pill
  
  ctx.save();
  
  // Draw badge capsule
  const grad = ctx.createLinearGradient(x - w/2, 0, x + w/2, 0);
  grad.addColorStop(0, "#6366f1");
  grad.addColorStop(1, "#a855f7");
  ctx.fillStyle = grad;
  
  // Drop shadow for the badge
  ctx.shadowColor = "rgba(99, 102, 241, 0.4)";
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 4;
  
  drawRoundedRect(ctx, x - w / 2, y - h / 2, w, h, r);
  ctx.fill();
  
  // Draw text
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 15px 'Outfit', sans-serif";
  ctx.letterSpacing = "2px";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("I'M ATTENDING", x, y + 1); // small offset for optical alignment
  
  ctx.restore();
}

// Draw chair pedestal and overlay borders (only on default template)
function drawChairFrameOverlay(ctx) {
  const { chairX, chairY, chairW, chairH, chairR } = STATE.layout;
  
  ctx.save();
  
  // 1. Draw Chair Pedestal Base (Below backrest)
  const centerX = chairX + chairW / 2;
  const bottomY = chairY + chairH;
  
  ctx.strokeStyle = "rgba(148, 163, 184, 0.4)"; // Chrome silver metallic
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  
  // Pedestal vertical stand
  ctx.beginPath();
  ctx.moveTo(centerX, bottomY + 20); // seat base
  ctx.lineTo(centerX, bottomY + 70); // pedestal column
  ctx.stroke();
  
  // Star base legs
  ctx.lineWidth = 6;
  ctx.beginPath();
  // Center leg down-left
  ctx.moveTo(centerX, bottomY + 70);
  ctx.lineTo(centerX - 60, bottomY + 95);
  // Center leg down-right
  ctx.moveTo(centerX, bottomY + 70);
  ctx.lineTo(centerX + 60, bottomY + 95);
  // Center leg straight down (perspective short)
  ctx.moveTo(centerX, bottomY + 70);
  ctx.lineTo(centerX, bottomY + 100);
  ctx.stroke();

  // Wheels
  ctx.fillStyle = "#0c0f24";
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1;
  const wheelRadius = 7;
  // wheel 1
  ctx.beginPath(); ctx.arc(centerX - 60, bottomY + 95, wheelRadius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // wheel 2
  ctx.beginPath(); ctx.arc(centerX + 60, bottomY + 95, wheelRadius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // wheel 3
  ctx.beginPath(); ctx.arc(centerX, bottomY + 100, wheelRadius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // 2. Draw Seat Cushion
  const seatH = 20;
  const seatW = chairW + 30;
  const seatX = centerX - seatW / 2;
  const seatY = bottomY;
  
  const seatGrad = ctx.createLinearGradient(seatX, 0, seatX + seatW, 0);
  seatGrad.addColorStop(0, "#1e1b4b");
  seatGrad.addColorStop(0.5, "#312e81");
  seatGrad.addColorStop(1, "#1e1b4b");
  
  ctx.fillStyle = seatGrad;
  ctx.strokeStyle = "rgba(99, 102, 241, 0.6)"; // Neon blue seat trim
  ctx.lineWidth = 2;
  
  drawRoundedRect(ctx, seatX, seatY, seatW, seatH, 10);
  ctx.fill();
  ctx.stroke();

  // 3. Draw Outer backrest border frame (around the photo)
  const borderPad = 8;
  const outerX = chairX - borderPad;
  const outerY = chairY - borderPad;
  const outerW = chairW + borderPad * 2;
  const outerH = chairH + borderPad * 2;
  const outerR = chairR + borderPad;
  
  const frameGrad = ctx.createLinearGradient(outerX, outerY, outerX + outerW, outerY + outerH);
  frameGrad.addColorStop(0, "#a855f7");
  frameGrad.addColorStop(0.5, "#6366f1");
  frameGrad.addColorStop(1, "#06b6d4");
  
  ctx.strokeStyle = frameGrad;
  ctx.lineWidth = 5;
  ctx.shadowColor = "rgba(99, 102, 241, 0.4)";
  ctx.shadowBlur = 15;
  
  drawRoundedRect(ctx, outerX, outerY, outerW, outerH, outerR);
  ctx.stroke();
  
  ctx.restore();
}

// Mask and draw the participant photo inside the chair rounded-rect
function drawPhotoInsideChair(ctx) {
  const { chairX, chairY, chairW, chairH, chairR } = STATE.layout;
  
  ctx.save();
  
  // Define rounded rectangle clipping path (the chair interior)
  drawRoundedRect(ctx, chairX, chairY, chairW, chairH, chairR);
  ctx.clip();
  
  if (STATE.photoImage) {
    // 1. Calculate ideal cover fit scale
    const frameW = chairW;
    const frameH = chairH;
    const imgW = STATE.photoImage.width;
    const imgH = STATE.photoImage.height;
    
    const scaleX = frameW / imgW;
    const scaleY = frameH / imgH;
    const coverScale = Math.max(scaleX, scaleY);
    
    // 2. Apply user zoom adjustment
    const finalScale = coverScale * STATE.photoZoom;
    
    // 3. Center and apply pan offsets
    const dx = chairX + frameW / 2 - (imgW * finalScale) / 2 + STATE.photoOffsetX;
    const dy = chairY + frameH / 2 - (imgH * finalScale) / 2 + STATE.photoOffsetY;
    
    // Draw the image
    ctx.drawImage(STATE.photoImage, dx, dy, imgW * finalScale, imgH * finalScale);
  } else {
    // Draw placeholder graphic
    ctx.fillStyle = "#111827";
    ctx.fillRect(chairX, chairY, chairW, chairH);
    
    // Draw grid lines inside placeholder
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let i = 10; i < chairW; i += 20) {
      ctx.beginPath(); ctx.moveTo(chairX + i, chairY); ctx.lineTo(chairX + i, chairY + chairH); ctx.stroke();
    }
    for (let i = 10; i < chairH; i += 20) {
      ctx.beginPath(); ctx.moveTo(chairX, chairY + i); ctx.lineTo(chairX + chairW, chairY + i); ctx.stroke();
    }
    
    // Draw a stylized avatar silhouette
    const centerX = chairX + chairW / 2;
    const centerY = chairY + chairH / 2 - 10;
    
    ctx.fillStyle = "#1f2937";
    
    // Head circle
    ctx.beginPath();
    ctx.arc(centerX, centerY - 25, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Shoulders arch
    ctx.beginPath();
    ctx.arc(centerX, centerY + 50, 50, Math.PI, 0);
    ctx.fill();
    
    // Upload hint text
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("UPLOAD PHOTO", centerX, centerY + 85);
  }
  
  ctx.restore();
}

// Draw participant name and the underline
function drawParticipantName(ctx) {
  const { nameY, nameSize, underlineY, nameRotation } = STATE.layout;
  const nameX = STATE.layout.nameX;
  
  ctx.save();
  
  // 1. Draw Underline (Only if not using template poster design)
  if (!STATE.templateImage) {
    const underlineW = 400;
    const startX = nameX - underlineW / 2;
    const endX = nameX + underlineW / 2;
    
    // Metallic or neon underline gradient
    const lineGrad = ctx.createLinearGradient(startX, 0, endX, 0);
    lineGrad.addColorStop(0, "rgba(255, 255, 255, 0.05)");
    lineGrad.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
    lineGrad.addColorStop(0.5, "#ffffff");
    lineGrad.addColorStop(0.8, "rgba(255, 255, 255, 0.8)");
    lineGrad.addColorStop(1, "rgba(255, 255, 255, 0.05)");
    
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(startX, underlineY);
    ctx.lineTo(endX, underlineY);
    ctx.stroke();
  }
  
  // 2. Translate and Rotate canvas context for name text
  ctx.translate(nameX, nameY);
  const angleRad = ((nameRotation || 0) * Math.PI) / 180;
  ctx.rotate(angleRad);
  
  // 3. Render Name with Auto-Scaling to prevent boundary collision
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  
  // Dark text color when custom template is active, white for built-in dark template
  ctx.fillStyle = STATE.templateImage ? "#09122c" : "#ffffff";
  
  // Subtle name text shadow (suppressed for light templates)
  if (STATE.templateImage) {
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  } else {
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
  }
  
  // Auto-scale font size
  let activeFontSize = nameSize;
  ctx.font = `bold ${activeFontSize}px 'Outfit', sans-serif`;
  let textWidth = ctx.measureText(STATE.name.toUpperCase()).width;
  const maxAllowedWidth = 350; // Max horizontal width allowed for the name
  
  while (textWidth > maxAllowedWidth && activeFontSize > 16) {
    activeFontSize -= 1;
    ctx.font = `bold ${activeFontSize}px 'Outfit', sans-serif`;
    textWidth = ctx.measureText(STATE.name.toUpperCase()).width;
  }
  
  // Render at 0, 0 because of translation!
  ctx.fillText(STATE.name.toUpperCase(), 0, 0);
  
  ctx.restore();
}

// 4. UTILITY DRAWING HELPERS
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// 5. INTERACTIVE EVENT HANDLERS
function bindEvents() {
  const nameInput = document.getElementById("participant-name");
  const fileInput = document.getElementById("photo-input");
  const dropZone = document.getElementById("drop-zone");
  const clearBtn = document.getElementById("clear-photo-btn");
  
  // Zoom & Pan Sliders
  const zoomSlider = document.getElementById("photo-zoom");
  const offsetXSlider = document.getElementById("photo-offset-x");
  const offsetYSlider = document.getElementById("photo-offset-y");
  
  // Advanced Accordion Trigger
  const advTrigger = document.getElementById("advanced-trigger");
  const advItem = advTrigger.parentElement;
  
  // Advanced Layout Sliders
  const chairXSlider = document.getElementById("chair-x");
  const chairYSlider = document.getElementById("chair-y");
  const chairWSlider = document.getElementById("chair-w");
  const chairHSlider = document.getElementById("chair-h");
  const chairRSlider = document.getElementById("chair-r");
  const nameXSlider = document.getElementById("name-x");
  const nameYSlider = document.getElementById("name-y");
  const nameSizeSlider = document.getElementById("name-size");
  const nameRotationSlider = document.getElementById("name-rotation");
  const underlineYSlider = document.getElementById("underline-y");
  const resetLayoutBtn = document.getElementById("reset-layout-btn");
  const templateInput = document.getElementById("template-input");
  
  // Theme and Download Triggers
  const themeToggle = document.getElementById("theme-toggle-btn");
  const downloadBtn = document.getElementById("download-btn");

  // Name Input handler
  nameInput.addEventListener("input", (e) => {
    STATE.name = e.target.value || "";
    drawCanvas();
  });

  // Photo Uploader handlers
  fileInput.addEventListener("change", (e) => {
    handlePhotoFile(e.target.files[0]);
  });
  
  // Drag & drop handlers
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
  
  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });
  
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) {
      handlePhotoFile(e.dataTransfer.files[0]);
    }
  });

  // Clear photo handler
  clearBtn.addEventListener("click", () => {
    STATE.photoImage = null;
    STATE.photoFileName = "";
    
    // Disable sliders
    toggleFittingSliders(false);
    
    // Reset inputs
    fileInput.value = "";
    document.getElementById("photo-preview-bar").classList.add("hidden");
    dropZone.classList.remove("hidden");
    
    drawCanvas();
    showToast("Photo removed.", "info");
  });

  // Zoom & Pan Sliders handlers
  zoomSlider.addEventListener("input", (e) => {
    STATE.photoZoom = parseFloat(e.target.value);
    document.getElementById("zoom-value").textContent = Math.round(STATE.photoZoom * 100);
    drawCanvas();
  });
  
  offsetXSlider.addEventListener("input", (e) => {
    STATE.photoOffsetX = parseInt(e.target.value);
    document.getElementById("offset-x-value").textContent = STATE.photoOffsetX;
    drawCanvas();
  });

  offsetYSlider.addEventListener("input", (e) => {
    STATE.photoOffsetY = parseInt(e.target.value);
    document.getElementById("offset-y-value").textContent = STATE.photoOffsetY;
    drawCanvas();
  });

  // Advanced Accordion Trigger
  advTrigger.addEventListener("click", () => {
    const isExpanded = advTrigger.getAttribute("aria-expanded") === "true";
    advTrigger.setAttribute("aria-expanded", !isExpanded);
    advItem.classList.toggle("active", !isExpanded);
  });

  // Advanced Layout Coordinate Sliders handlers
  chairXSlider.addEventListener("input", (e) => {
    STATE.layout.chairX = parseInt(e.target.value);
    drawCanvas();
  });
  chairYSlider.addEventListener("input", (e) => {
    STATE.layout.chairY = parseInt(e.target.value);
    drawCanvas();
  });
  chairWSlider.addEventListener("input", (e) => {
    STATE.layout.chairW = parseInt(e.target.value);
    drawCanvas();
  });
  chairHSlider.addEventListener("input", (e) => {
    STATE.layout.chairH = parseInt(e.target.value);
    drawCanvas();
  });
  chairRSlider.addEventListener("input", (e) => {
    STATE.layout.chairR = parseInt(e.target.value);
    drawCanvas();
  });
  nameXSlider.addEventListener("input", (e) => {
    STATE.layout.nameX = parseInt(e.target.value);
    drawCanvas();
  });
  nameYSlider.addEventListener("input", (e) => {
    STATE.layout.nameY = parseInt(e.target.value);
    drawCanvas();
  });
  nameSizeSlider.addEventListener("input", (e) => {
    STATE.layout.nameSize = parseInt(e.target.value);
    drawCanvas();
  });
  nameRotationSlider.addEventListener("input", (e) => {
    STATE.layout.nameRotation = parseFloat(e.target.value);
    drawCanvas();
  });
  underlineYSlider.addEventListener("input", (e) => {
    STATE.layout.underlineY = parseInt(e.target.value);
    drawCanvas();
  });

  // Custom Template Uploader handler
  templateInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        STATE.templateImage = img;
        applyLayoutMode("template");
        drawCanvas();
        showToast("Custom template applied.", "success");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Reset layout button
  resetLayoutBtn.addEventListener("click", () => {
    STATE.templateImage = null;
    templateInput.value = "";
    checkLocalTemplate(); // reload local template if present
  });

  // Theme toggle
  themeToggle.addEventListener("click", () => {
    const newTheme = STATE.theme === "dark" ? "light" : "dark";
    STATE.theme = newTheme;
    document.documentElement.setAttribute("data-theme", newTheme);
    showToast(`Switched to ${newTheme} mode.`, "info");
  });

  // Download card button
  downloadBtn.addEventListener("click", () => {
    exportCardPNG();
  });
}

// Handle processing for uploaded photo file
function handlePhotoFile(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("Invalid file type. Please upload an image.", "error");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      STATE.photoImage = img;
      STATE.photoFileName = file.name;
      
      // Update preview DOM elements
      document.getElementById("preview-thumbnail").src = e.target.result;
      document.getElementById("preview-filename").textContent = file.name;
      document.getElementById("drop-zone").classList.add("hidden");
      document.getElementById("photo-preview-bar").classList.remove("hidden");
      
      // Reset fitting settings
      STATE.photoZoom = 1.0;
      STATE.photoOffsetX = 0;
      STATE.photoOffsetY = 0;
      
      // Sync sliders
      document.getElementById("photo-zoom").value = "1.0";
      document.getElementById("zoom-value").textContent = "100";
      document.getElementById("photo-offset-x").value = "0";
      document.getElementById("offset-x-value").textContent = "0";
      document.getElementById("photo-offset-y").value = "0";
      document.getElementById("offset-y-value").textContent = "0";
      
      // Enable sliders
      toggleFittingSliders(true);
      
      drawCanvas();
      showToast("Photo uploaded successfully!", "success");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Toggle enabled status of the fitting adjustment controls
function toggleFittingSliders(enabled) {
  const zoomSlider = document.getElementById("photo-zoom");
  const offsetXSlider = document.getElementById("photo-offset-x");
  const offsetYSlider = document.getElementById("photo-offset-y");
  
  zoomSlider.disabled = !enabled;
  offsetXSlider.disabled = !enabled;
  offsetYSlider.disabled = !enabled;
}

// 6. DOWNLOADING CARD EXPORTER
function exportCardPNG() {
  const canvas = document.getElementById("card-canvas");
  if (!canvas) return;
  
  try {
    // Generate data URL
    const dataUrl = canvas.toDataURL("image/png");
    
    // Create download link anchor
    const link = document.createElement("a");
    const sanitizedName = STATE.name.toLowerCase().replace(/[^a-z0-9]/g, "-") || "participant";
    link.download = `event-participant-${sanitizedName}.png`;
    link.href = dataUrl;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("Card download started!", "success");
  } catch (error) {
    console.error(error);
    showToast("Export failed. Ensure images do not cross-origin taint the canvas.", "error");
  }
}

// 7. PRESENTATIONAL UTILITIES
function initTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  STATE.theme = prefersDark ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", STATE.theme);
}

function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function showToast(message, type = "success") {
  const mount = document.getElementById("toast-mount");
  if (!mount) return;
  
  const toast = document.createElement("div");
  toast.className = `toast ${type}-toast`;
  
  let iconName = "check-circle";
  if (type === "error") iconName = "alert-triangle";
  if (type === "info") iconName = "info";
  
  toast.innerHTML = `
    <i data-lucide="${iconName}"></i>
    <span>${message}</span>
  `;
  
  mount.appendChild(toast);
  initLucideIcons();
  
  // Auto-destroy after animations complete
  setTimeout(() => {
    toast.remove();
  }, 3900);
}

// 8. LAYOUT MODES AND SLIDERS SYNCHRONIZATION
function applyLayoutMode(mode) {
  const canvas = document.getElementById("card-canvas");
  if (!canvas) return;

  if (mode === "template") {
    canvas.width = STATE.templateImage ? STATE.templateImage.naturalWidth : 819;
    canvas.height = STATE.templateImage ? STATE.templateImage.naturalHeight : 1024;
    STATE.layout = {
      chairX: 562,
      chairY: 95,
      chairW: 175,
      chairH: 175,
      chairR: 20,
      nameX: 250,
      nameY: 520,
      nameSize: 28,
      nameRotation: -3.0, // Pre-align default tilt of the brush stroke underline
      underlineY: 518
    };
  } else {
    canvas.width = 800;
    canvas.height = 1000;
    STATE.layout = {
      chairX: 250,
      chairY: 280,
      chairW: 300,
      chairH: 330,
      chairR: 30,
      nameX: 400,
      nameY: 815,
      nameSize: 36,
      nameRotation: 0,
      underlineY: 830
    };
  }

  // Update slider ranges dynamically
  const updateRangeMax = (id, maxVal) => {
    const el = document.getElementById(id);
    if (el) el.max = maxVal;
  };
  updateRangeMax("chair-x", canvas.width);
  updateRangeMax("name-x", canvas.width);
  updateRangeMax("chair-w", canvas.width);
  updateRangeMax("chair-y", canvas.height);
  updateRangeMax("name-y", canvas.height);
  updateRangeMax("chair-h", canvas.height);
  updateRangeMax("underline-y", canvas.height);

  syncSlidersToState();
}

function syncSlidersToState() {
  const sliders = {
    "chair-x": STATE.layout.chairX,
    "chair-y": STATE.layout.chairY,
    "chair-w": STATE.layout.chairW,
    "chair-h": STATE.layout.chairH,
    "chair-r": STATE.layout.chairR,
    "name-x": STATE.layout.nameX,
    "name-y": STATE.layout.nameY,
    "name-size": STATE.layout.nameSize,
    "name-rotation": STATE.layout.nameRotation,
    "underline-y": STATE.layout.underlineY
  };

  for (const [id, val] of Object.entries(sliders)) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }
}
