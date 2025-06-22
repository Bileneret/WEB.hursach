import { colorToRgb, rgbToHex, interpolateColor } from './utils.js';

function drawFreehand(x1, y1, x2, y2, context) {
    const prevStrokeStyle = context.strokeStyle;
    const prevLineWidth = context.lineWidth;
    const prevGlobalAlpha = context.globalAlpha;
    const prevLineJoin = context.lineJoin;
    const prevLineCap = context.lineCap;

    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.strokeStyle = prevStrokeStyle;
    context.lineWidth = prevLineWidth;
    context.globalAlpha = prevGlobalAlpha;
    context.lineJoin = prevLineJoin;
    context.lineCap = prevLineCap;
    context.stroke();
}

function drawSpray(x, y, radius, density, color, context) {
    const prevFillStyle = context.fillStyle;
    const prevGlobalAlpha = context.globalAlpha;

    const points = radius * density;
    context.fillStyle = color;
    context.globalAlpha = 1;

    for (let i = 0; i < points; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        const px = x + Math.cos(angle) * distance;
        const py = y + Math.sin(angle) * distance;
        context.beginPath();
        context.arc(px, py, 1, 0, Math.PI * 2);
        context.fill();
    }

    context.fillStyle = prevFillStyle;
    context.globalAlpha = prevGlobalAlpha;
}

function drawMarker(x1, y1, x2, y2, width, color, opacity, context) {
    const prevStrokeStyle = context.strokeStyle;
    const prevLineWidth = context.lineWidth;
    const prevGlobalAlpha = context.globalAlpha;
    const prevLineJoin = context.lineJoin;
    const prevLineCap = context.lineCap;

    context.strokeStyle = color;
    context.lineWidth = width;
    context.globalAlpha = opacity * 0.7;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = context.canvas.width;
    tempCanvas.height = context.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(context.canvas, 0, 0);

    context.save();
    context.globalCompositeOperation = 'copy';
    context.filter = 'blur(3px)';
    context.drawImage(tempCanvas, 0, 0);
    context.restore();

    context.strokeStyle = prevStrokeStyle;
    context.lineWidth = prevLineWidth;
    context.globalAlpha = prevGlobalAlpha;
    context.lineJoin = prevLineJoin;
    context.lineCap = prevLineCap;
}

function erasePixels(x, y, radius, context) {
    const prevGlobalCompositeOperation = context.globalCompositeOperation;
    const prevFillStyle = context.fillStyle;
    const prevLineWidth = context.lineWidth;
    const prevLineJoin = context.lineJoin;
    const prevLineCap = context.lineCap;

    context.globalCompositeOperation = 'destination-out';
    context.fillStyle = 'rgba(0,0,0,1)';
    context.lineWidth = radius * 2;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();

    context.globalCompositeOperation = prevGlobalCompositeOperation;
    context.fillStyle = prevFillStyle;
    context.lineWidth = prevLineWidth;
    context.lineJoin = prevLineJoin;
    context.lineCap = prevLineCap;
}

function floodFill(startX, startY, fillColor, context) {
    if (!context) return;
    const canvas = context.canvas;
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const startPos = (Math.floor(startY) * canvas.width + Math.floor(startX)) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];

    const fillRgb = colorToRgb(fillColor);
    if (!fillRgb) return;
    if (startR === fillRgb.r && startG === fillRgb.g && startB === fillRgb.b && startA === 255) return;

    const pixelStack = [[Math.floor(startX), Math.floor(startY)]];
    const width = canvas.width;

    while (pixelStack.length) {
        const newPos = pixelStack.pop();
        const x = newPos[0];
        let y = newPos[1];
        let pixelPos = (y * width + x) * 4;

        while (y-- >= 0 && matchStartColor(pixelPos, data, startR, startG, startB, startA)) {
            pixelPos -= width * 4;
        }
        pixelPos += width * 4;
        y++;
        let reachLeft = false;
        let reachRight = false;

        while (y++ < canvas.height - 1 && matchStartColor(pixelPos, data, startR, startG, startB, startA)) {
            colorPixel(pixelPos, data, fillRgb.r, fillRgb.g, fillRgb.b);

            if (x > 0) {
                if (matchStartColor(pixelPos - 4, data, startR, startG, startB, startA)) {
                    if (!reachLeft) pixelStack.push([x - 1, y]);
                    reachLeft = true;
                } else if (reachLeft) reachLeft = false;
            }

            if (x < canvas.width - 1) {
                if (matchStartColor(pixelPos + 4, data, startR, startG, startB, startA)) {
                    if (!reachRight) pixelStack.push([x + 1, y]);
                    reachRight = true;
                } else if (reachRight) reachRight = false;
            }

            pixelPos += width * 4;
        }
    }

    context.putImageData(imageData, 0, 0);
}

function matchStartColor(pixelPos, data, r, g, b, a) {
    return data[pixelPos] === r && data[pixelPos + 1] === g && data[pixelPos + 2] === b && data[pixelPos + 3] === a;
}

function colorPixel(pixelPos, data, r, g, b) {
    data[pixelPos] = r;
    data[pixelPos + 1] = g;
    data[pixelPos + 2] = b;
    data[pixelPos + 3] = 255;
}

function applyFilter(filterType, context) {
    const canvas = context.canvas;
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    switch (filterType) {
        case 'grayscale':
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11);
                data[i] = avg;
                data[i + 1] = avg;
                data[i + 2] = avg;
            }
            break;

        case 'invert':
            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];
                data[i + 1] = 255 - data[i + 1];
                data[i + 2] = 255 - data[i + 2];
            }
            break;
    }

    context.putImageData(imageData, 0, 0);
}

export { drawFreehand, drawSpray, drawMarker, erasePixels, floodFill, applyFilter };