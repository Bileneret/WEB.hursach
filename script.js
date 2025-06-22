import { clamp, getRandomColor, rgbToHex, interpolateColor, colorToRgb, generateId } from './utils.js';
import { drawFreehand, drawSpray, drawMarker, erasePixels, floodFill, applyFilter } from './tools.js';
import { drawLine, drawRectangle, drawCircle, drawTriangle, drawHexagon, drawPentagon, drawStar, drawHeart, drawDiamond, drawArrow, drawCurve } from './shapes.js';
import { layers, activeLayerIndex, createLayer, removeCurrentLayer, addNewLayer, updateLayersList, setActiveLayer, redrawAllLayers, getActiveContext, getActiveCanvas, drawOnActiveLayer, mergeLayers } from './layers.js';

export const canvas = document.getElementById('drawing-canvas');
export const ctx = canvas.getContext('2d');
const previewCanvas = document.getElementById('preview-canvas');
const previewCtx = previewCanvas.getContext('2d');
const colorPicker = document.getElementById('color-picker');
const lineWidth = document.getElementById('line-width');
const widthValue = document.getElementById('width-value');
const opacitySlider = document.getElementById('opacity-slider');
const opacityValue = document.getElementById('opacity-value');
const clearBtn = document.getElementById('clear-btn');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const saveBtn = document.getElementById('save-btn');
const layersBtn = document.getElementById('layers-btn');
const addLayerBtn = document.getElementById('add-layer');
const removeLayerBtn = document.getElementById('remove-layer');
const mergeLayersBtn = document.getElementById('merge-layers');
const layersPanel = document.getElementById('layers-panel');
const layersList = document.getElementById('layers-list');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const zoomLevel = document.getElementById('zoom-level');
const saveFormat = document.getElementById('save-format');
const toolButtons = document.querySelectorAll('.tool-btn');
const rValue = document.getElementById('r-value');
const gValue = document.getElementById('g-value');
const bValue = document.getElementById('b-value');
const gradientBtn = document.getElementById('gradient-btn');
const gradientColor1 = document.getElementById('gradient-color1');
const gradientColor2 = document.getElementById('gradient-color2');
const gradientPreview = document.getElementById('gradient-preview');
const grayscaleBtn = document.getElementById('grayscale-btn');
const invertBtn = document.getElementById('invert-btn');
const darkThemeBtn = document.getElementById('dark-theme-btn');
const colorSwatches = document.getElementById('color-swatches');
const loadImageBtn = document.getElementById('load-image-btn');
const brushShape = document.getElementById('brush-shape');
const fullscreenBtn = document.getElementById('fullscreen-btn');

let currentTool = 'pencil';
let isDrawing = false;
let startX = 0;
let startY = 0;
let currentColor = '#000000';
let currentOpacity = 1;
let currentLineWidth = 5;
let undoStack = [];
let redoStack = [];
let maxUndoSteps = 30;
let zoom = 1;
let isGradientMode = false;
let lastX = 0;
let lastY = 0;
let curvePoints = [];
let sprayInterval = null;
let currentBrushShape = 'round';

// Фиксированные размеры холста
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1000;

function init() {
    canvas.width = CANVAS_WIDTH * 2;
    canvas.height = CANVAS_HEIGHT * 2;
    previewCanvas.width = CANVAS_WIDTH * 2;
    previewCanvas.height = CANVAS_HEIGHT * 2;

    if (layers.length === 0) {
        createLayer('Основний шар');
    }

    const activeCtx = getActiveContext();
    activeCtx.lineJoin = 'round';
    activeCtx.lineCap = 'round';

    saveState();
    updateUndoRedoButtons();
    updateZoomLevel();
    setupEventListeners();
    setupColorPickerTool();

    updateRGBValues();
    updateGradientPreview();
    setupTooltips();
}

function setupTooltips() {
    const tooltips = document.querySelectorAll('[title]');
    tooltips.forEach(tool => {
        tool.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = tool.title;
            tooltip.style.left = `${e.clientX + 10}px`;
            tooltip.style.top = `${e.clientY + 10}px`;
            document.body.appendChild(tooltip);

            tool.dataset.tooltipId = tooltip.textContent;
            tool.addEventListener('mouseleave', () => {
                tooltip.remove();
            });
        });
    });
}

function getCanvasCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

function startDrawing(e) {
    if (e.target !== canvas) return;

    const { x, y } = getCanvasCoordinates(e);
    startX = x;
    startY = y;
    lastX = startX;
    lastY = startY;

    isDrawing = true;

    if (currentTool === 'fill') {
        const fillColor = isGradientMode ?
            getGradientColorAtPoint(startX, startY, startX, startY, gradientColor1.value, gradientColor2.value) :
            currentColor;

        floodFill(startX, startY, fillColor, getActiveContext());
        redrawAllLayers();
        saveState();
        isDrawing = false;
    } else if (currentTool === 'spray') {
        sprayInterval = setInterval(() => {
            const sprayColor = isGradientMode ?
                getGradientColorAtPoint(lastX, lastY, startX, startY, gradientColor1.value, gradientColor2.value) :
                currentColor;
            drawSpray(lastX, lastY, currentLineWidth, 5, sprayColor, getActiveContext());
            redrawAllLayers();
        }, 30);
    } else if (currentTool === 'eraser') {
        const activeCtx = getActiveContext();
        activeCtx.globalCompositeOperation = 'destination-out';
        activeCtx.strokeStyle = 'rgba(0,0,0,1)';
        activeCtx.lineWidth = currentLineWidth;
        activeCtx.lineJoin = currentBrushShape;
        activeCtx.lineCap = currentBrushShape;
        activeCtx.beginPath();
        activeCtx.moveTo(startX, startY);
    } else if (['pencil', 'pen', 'marker'].includes(currentTool)) {
        const activeCtx = getActiveContext();
        activeCtx.beginPath();
        activeCtx.moveTo(startX, startY);
        activeCtx.strokeStyle = isGradientMode ?
            createGradient(startX, startY, startX + 100, startY + 100, activeCtx) :
            currentColor;
        activeCtx.lineWidth = currentTool === 'pencil' ? currentLineWidth :
            currentTool === 'pen' ? currentLineWidth * 1.5 : currentLineWidth;
        activeCtx.globalAlpha = currentOpacity;
        activeCtx.lineJoin = currentBrushShape;
        activeCtx.lineCap = currentBrushShape;
    } else if (currentTool === 'curve') {
        curvePoints = [{ x: startX, y: startY }];
    }
}

function draw(e) {
    if (!isDrawing) return;

    const { x, y } = getCanvasCoordinates(e);
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    if (currentTool === 'marker') {
        drawMarker(lastX, lastY, x, y, currentLineWidth, currentColor, currentOpacity, getActiveContext());
        lastX = x;
        lastY = y;
        redrawAllLayers();
    } else if (currentTool === 'spray') {
        lastX = x;
        lastY = y;
    } else if (['pencil', 'pen', 'eraser'].includes(currentTool)) {
        const activeCtx = getActiveContext();
        activeCtx.lineTo(x, y);
        activeCtx.stroke();
        activeCtx.beginPath();
        activeCtx.moveTo(x, y);
        lastX = x;
        lastY = y;
        redrawAllLayers();
    } else if (currentTool === 'curve') {
        if (curvePoints.length > 0) {
            previewCtx.strokeStyle = currentColor;
            previewCtx.lineWidth = currentLineWidth;
            previewCtx.globalAlpha = currentOpacity;
            previewCtx.lineJoin = currentBrushShape;
            previewCtx.lineCap = currentBrushShape;

            previewCtx.beginPath();
            previewCtx.moveTo(curvePoints[0].x, curvePoints[0].y);
            for (let i = 1; i < curvePoints.length; i++) {
                previewCtx.lineTo(curvePoints[i].x, curvePoints[i].y);
            }
            previewCtx.lineTo(x, y);
            previewCtx.stroke();
        }
    } else {
        previewCtx.strokeStyle = isGradientMode ? createGradient(startX, startY, x, y, previewCtx) : currentColor;
        previewCtx.fillStyle = isGradientMode ? createGradient(startX, startY, x, y, previewCtx) : currentColor;
        previewCtx.lineWidth = currentLineWidth;
        previewCtx.globalAlpha = currentOpacity;
        previewCtx.lineJoin = currentBrushShape;
        previewCtx.lineCap = currentBrushShape;

        switch (currentTool) {
            case 'line': drawLine(startX, startY, x, y, previewCtx); break;
            case 'rectangle': drawRectangle(startX, startY, x, y, false, previewCtx); break;
            case 'circle': drawCircle(startX, startY, x, y, false, previewCtx); break;
            case 'triangle': drawTriangle(startX, startY, x, y, false, previewCtx); break;
            case 'hexagon': drawHexagon(startX, startY, x, y, previewCtx); break;
            case 'pentagon': drawPentagon(startX, startY, x, y, previewCtx); break;
            case 'star': drawStar(startX, startY, x, y, previewCtx); break;
            case 'heart': drawHeart(startX, startY, x, y, previewCtx); break;
            case 'diamond': drawDiamond(startX, startY, x, y, previewCtx); break;
            case 'arrow': drawArrow(startX, startY, x, y, previewCtx); break;
        }
    }
}

function stopDrawing(e) {
    if (!isDrawing) return;

    isDrawing = false;
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    if (currentTool === 'spray') {
        clearInterval(sprayInterval);
        sprayInterval = null;
        saveState();
        return;
    }

    const { x, y } = getCanvasCoordinates(e);

    if (currentTool === 'curve') {
        curvePoints.push({ x, y });
        if (curvePoints.length > 1) {
            drawOnActiveLayer(ctx => drawCurve(curvePoints, ctx));
            saveState();
        }
    } else if (!['pencil', 'pen', 'marker', 'spray', 'eraser'].includes(currentTool)) {
        const activeCtx = getActiveContext();
        activeCtx.strokeStyle = isGradientMode ? createGradient(startX, startY, x, y, activeCtx) : currentColor;
        activeCtx.fillStyle = isGradientMode ? createGradient(startX, startY, x, y, activeCtx) : currentColor;
        activeCtx.lineWidth = currentLineWidth;
        activeCtx.globalAlpha = currentOpacity;
        activeCtx.lineJoin = currentBrushShape;
        activeCtx.lineCap = currentBrushShape;

        switch (currentTool) {
            case 'line': drawOnActiveLayer(ctx => drawLine(startX, startY, x, y, ctx)); break;
            case 'rectangle': drawOnActiveLayer(ctx => drawRectangle(startX, startY, x, y, false, ctx)); break;
            case 'circle': drawOnActiveLayer(ctx => drawCircle(startX, startY, x, y, false, ctx)); break;
            case 'triangle': drawOnActiveLayer(ctx => drawTriangle(startX, startY, x, y, false, ctx)); break;
            case 'hexagon': drawOnActiveLayer(ctx => drawHexagon(startX, startY, x, y, ctx)); break;
            case 'pentagon': drawOnActiveLayer(ctx => drawPentagon(startX, startY, x, y, ctx)); break;
            case 'star': drawOnActiveLayer(ctx => drawStar(startX, startY, x, y, ctx)); break;
            case 'heart': drawOnActiveLayer(ctx => drawHeart(startX, startY, x, y, ctx)); break;
            case 'diamond': drawOnActiveLayer(ctx => drawDiamond(startX, startY, x, y, ctx)); break;
            case 'arrow': drawOnActiveLayer(ctx => drawArrow(startX, startY, x, y, ctx)); break;
        }
        saveState();
    } else if (currentTool === 'eraser') {
        const activeCtx = getActiveContext();
        activeCtx.globalCompositeOperation = 'source-over';
        redrawAllLayers();
        saveState();
    } else {
        redrawAllLayers();
        saveState();
    }

    if (currentTool !== 'curve') curvePoints = [];
}

function createGradient(x1, y1, x2, y2, context) {
    const gradient = context.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, gradientColor1.value);
    gradient.addColorStop(1, gradientColor2.value);
    return gradient;
}

function getGradientColorAtPoint(x, y, x1, y1, color1, color2) {
    const distance = Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2));
    const maxDistance = Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2));
    const ratio = distance / maxDistance;
    return interpolateColor(color1, color2, ratio);
}

function handleKeyDown(e) {
    if (e.ctrlKey) {
        if (e.key === 'z') {
            e.preventDefault();
            undo();
        } else if (e.key === 'y') {
            e.preventDefault();
            redo();
        }
    }

    if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        changeZoom(0.1);
    }
    if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        changeZoom(-0.1);
    }
    if (e.ctrlKey && e.key === 'v') handlePasteImage(e);
}

function handleWheel(e) {
    if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        changeZoom(delta);
    }
}

export function saveState() {
    if (undoStack.length >= maxUndoSteps) undoStack.shift();
    const state = canvas.toDataURL();
    undoStack.push(state);
    redoStack = []; // Очищаємо redo при новому дії
    updateUndoRedoButtons();
}

function undo() {
    if (undoStack.length > 1) {
        const currentState = undoStack.pop();
        redoStack.push(currentState);
        const previousState = undoStack[undoStack.length - 1];
        updateUndoRedoButtons();
        restoreState(previousState);
        saveState();
    }
}

function redo() {
    if (redoStack.length > 0) {
        const nextState = redoStack.pop();
        undoStack.push(nextState);
        restoreState(nextState);
        updateUndoRedoButtons();
    }
}

function restoreState(state) {
    const img = new Image();
    img.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
    img.src = state;
}

function updateUndoRedoButtons() {
    undoBtn.disabled = undoStack.length <= 1;
    redoBtn.disabled = redoStack.length === 0;
}

function clearCanvas() {
    if (confirm('Ви впевнені, що хочете очистити полотно?')) {
        const activeCtx = getActiveContext();
        activeCtx.clearRect(0, 0, activeCtx.canvas.width, activeCtx.canvas.height);
        redrawAllLayers();
        saveState();
    }
}

function saveDrawing() {
    const format = saveFormat.value;
    const mimeType = format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/svg+xml';

    const link = document.createElement('a');
    link.download = `drawing.${format}`;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    layers.forEach(layer => {
        if (layer.visible) {
            tempCtx.globalAlpha = layer.opacity;
            tempCtx.globalCompositeOperation = layer.blendMode;
            tempCtx.drawImage(layer.canvas, 0, 0);
            tempCtx.globalAlpha = 1;
            tempCtx.globalCompositeOperation = 'source-over';
        }
    });

    link.href = tempCanvas.toDataURL(mimeType);
    link.click();
}

function handlePasteImage(e) {
    const items = (e.clipboardData || window.clipboardData).items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
                    const width = img.width * ratio;
                    const height = img.height * ratio;
                    const x = (canvas.width - width) / 2;
                    const y = (canvas.height - height) / 2;

                    const layer = createLayer('Вставлене зображення');
                    layer.ctx.drawImage(img, x, y, width, height);
                    redrawAllLayers();
                    saveState();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(blob);
            break;
        }
    }
}

function handleLoadImage(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
                const width = img.width * ratio;
                const height = img.height * ratio;
                const x = (canvas.width - width) / 2;
                const y = (canvas.height - height) / 2;

                const layer = createLayer('Завантажене зображення');
                layer.ctx.drawImage(img, x, y, width, height);
                redrawAllLayers();
                saveState();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
    e.target.value = '';
}

function toggleLayersPanel() {
    layersPanel.classList.toggle('active');
    layersBtn.classList.toggle('active', layersPanel.classList.contains('active'));
}

function toggleDarkTheme() {
    document.body.classList.toggle('dark-theme');
    saveState();
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function changeZoom(delta) {
    zoom = Math.max(0.1, Math.min(3, zoom + delta));
    updateZoomLevel();

    const container = document.getElementById('canvas-container');
    container.style.transform = `scale(${zoom})`;
    container.style.transformOrigin = '0 0';
}

function updateZoomLevel() {
    zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
}

function updateRGBValues() {
    const hex = currentColor.startsWith('#') ? currentColor : `#${currentColor}`;
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);

    rValue.value = r;
    gValue.value = g;
    bValue.value = b;
}

function updateColorFromRGB() {
    const r = parseInt(rValue.value) || 0;
    const g = parseInt(gValue.value) || 0;
    const b = parseInt(bValue.value) || 0;

    currentColor = `rgb(${r}, ${g}, ${b})`;
    colorPicker.value = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function toggleGradientMode() {
    isGradientMode = !isGradientMode;
    gradientBtn.classList.toggle('active', isGradientMode);
    updateGradientPreview();
}

function updateGradientPreview() {
    gradientPreview.style.background = `linear-gradient(to right, ${gradientColor1.value}, ${gradientColor2.value})`;
}

function createColorSwatches() {
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', function() {
            currentColor = this.style.backgroundColor;
            colorPicker.value = rgbToHex(currentColor);
            updateRGBValues();
        });
    });

    document.getElementById('add-swatch').addEventListener('click', function() {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = currentColor;
        swatch.addEventListener('click', function() {
            currentColor = this.style.backgroundColor;
            colorPicker.value = rgbToHex(currentColor);
            updateRGBValues();
        });
        document.getElementById('swatches-grid').appendChild(swatch);
    });
}

function setupEventListeners() {
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    document.addEventListener('keydown', handleKeyDown);

    colorPicker.addEventListener('input', (e) => {
        currentColor = e.target.value;
        updateRGBValues();
    });

    lineWidth.addEventListener('input', (e) => {
        currentLineWidth = e.target.value;
        widthValue.textContent = `${currentLineWidth}px`;
    });

    opacitySlider.addEventListener('input', (e) => {
        currentOpacity = e.target.value;
        opacityValue.textContent = `${Math.round(currentOpacity * 100)}%`;
    });

    rValue.addEventListener('input', updateColorFromRGB);
    gValue.addEventListener('input', updateColorFromRGB);
    bValue.addEventListener('input', updateColorFromRGB);

    gradientBtn.addEventListener('click', toggleGradientMode);
    gradientColor1.addEventListener('input', updateGradientPreview);
    gradientColor2.addEventListener('input', updateGradientPreview);

    grayscaleBtn.addEventListener('click', () => {
        const activeCtx = getActiveContext();
        applyFilter('grayscale', activeCtx);
        redrawAllLayers();
        saveState();
    });

    invertBtn.addEventListener('click', () => {
        const activeCtx = getActiveContext();
        applyFilter('invert', activeCtx);
        redrawAllLayers();
        saveState();
    });

    darkThemeBtn.addEventListener('click', toggleDarkTheme);

    clearBtn.addEventListener('click', clearCanvas);
    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);
    saveBtn.addEventListener('click', saveDrawing);

    layersBtn.addEventListener('click', toggleLayersPanel);
    addLayerBtn.addEventListener('click', () => {
        addNewLayer();
        saveState();
    });
    removeLayerBtn.addEventListener('click', () => {
        removeCurrentLayer();
        saveState();
    });
    mergeLayersBtn.addEventListener('click', () => {
        mergeLayers();
        saveState();
    });

    zoomInBtn.addEventListener('click', () => {
        changeZoom(0.1);
    });
    zoomOutBtn.addEventListener('click', () => {
        changeZoom(-0.1);
    });

    loadImageBtn.addEventListener('change', handleLoadImage);
    fullscreenBtn.addEventListener('click', toggleFullscreen);

    toolButtons.forEach(button => {
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
            toolButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentTool = button.dataset.tool;
            previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

            if (currentTool === 'curve') curvePoints = [];
        });
    });

    brushShape.addEventListener('change', (e) => {
        currentBrushShape = e.target.value;
    });
}

function setupColorPickerTool() {
    createColorSwatches();
}

// Initialize the application
init();