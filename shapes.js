import { generateId } from './utils.js';

function drawLine(x1, y1, x2, y2, context) {
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

function drawRectangle(x1, y1, x2, y2, fill = false, context) {
    const prevStrokeStyle = context.strokeStyle;
    const prevFillStyle = context.fillStyle;
    const prevLineWidth = context.lineWidth;
    const prevGlobalAlpha = context.globalAlpha;
    const prevLineJoin = context.lineJoin;
    const prevLineCap = context.lineCap;

    const minX = Math.min(x1, x2);
    const minY = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    context.beginPath();
    context.rect(minX, minY, width, height);
    if (fill) {
        context.fillStyle = prevFillStyle;
        context.fill();
    }
    context.strokeStyle = prevStrokeStyle;
    context.lineWidth = prevLineWidth;
    context.globalAlpha = prevGlobalAlpha;
    context.lineJoin = prevLineJoin;
    context.lineCap = prevLineCap;
    context.stroke();
}

function drawCircle(x1, y1, x2, y2, fill = false, context) {
    const prevStrokeStyle = context.strokeStyle;
    const prevFillStyle = context.fillStyle;
    const prevLineWidth = context.lineWidth;
    const prevGlobalAlpha = context.globalAlpha;
    const prevLineJoin = context.lineJoin;
    const prevLineCap = context.lineCap;

    const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    context.beginPath();
    context.arc(x1, y1, radius, 0, Math.PI * 2);
    if (fill) {
        context.fillStyle = prevFillStyle;
        context.fill();
    }
    context.strokeStyle = prevStrokeStyle;
    context.lineWidth = prevLineWidth;
    context.globalAlpha = prevGlobalAlpha;
    context.lineJoin = prevLineJoin;
    context.lineCap = prevLineCap;
    context.stroke();
}

function drawTriangle(x1, y1, x2, y2, fill = false, context) {
    const prevStrokeStyle = context.strokeStyle;
    const prevFillStyle = context.fillStyle;
    const prevLineWidth = context.lineWidth;
    const prevGlobalAlpha = context.globalAlpha;
    const prevLineJoin = context.lineJoin;
    const prevLineCap = context.lineCap;

    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(x1 * 2 - x2, y2);
    context.closePath();

    if (fill) {
        context.fillStyle = prevFillStyle;
        context.fill();
    }
    context.strokeStyle = prevStrokeStyle;
    context.lineWidth = prevLineWidth;
    context.globalAlpha = prevGlobalAlpha;
    context.lineJoin = prevLineJoin;
    context.lineCap = prevLineCap;
    context.stroke();
}

function drawHexagon(x1, y1, x2, y2, context) {
    const prevStrokeStyle = context.strokeStyle;
    const prevLineWidth = context.lineWidth;
    const prevGlobalAlpha = context.globalAlpha;
    const prevLineJoin = context.lineJoin;
    const prevLineCap = context.lineCap;

    const centerX = x1;
    const centerY = y1;
    const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    context.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        context.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
    }
    context.closePath();
    context.strokeStyle = prevStrokeStyle;
    context.lineWidth = prevLineWidth;
    context.globalAlpha = prevGlobalAlpha;
    context.lineJoin = prevLineJoin;
    context.lineCap = prevLineCap;
    context.stroke();
}

function drawPentagon(x1, y1, x2, y2, context) {
    const prevStrokeStyle = context.strokeStyle;
    const prevLineWidth = context.lineWidth;
    const prevGlobalAlpha = context.globalAlpha;
    const prevLineJoin = context.lineJoin;
    const prevLineCap = context.lineCap;

    const centerX = x1;
    const centerY = y1;
    const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    context.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        context.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
    }
    context.closePath();
    context.strokeStyle = prevStrokeStyle;
    context.lineWidth = prevLineWidth;
    context.globalAlpha = prevGlobalAlpha;
    context.lineJoin = prevLineJoin;
    context.lineCap = prevLineCap;
    context.stroke();
}

function drawStar(x1, y1, x2, y2, context) {
    const prevStrokeStyle = context.strokeStyle;
    const prevLineWidth = context.lineWidth;
    const prevGlobalAlpha = context.globalAlpha;
    const prevLineJoin = context.lineJoin;
    const prevLineCap = context.lineCap;

    const centerX = x1;
    const centerY = y1;
    const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const outerRadius = radius;
    const innerRadius = outerRadius / 2;

    context.beginPath();
    for (let i = 0; i < 10; i++) {
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        context.lineTo(centerX + r * Math.cos(angle), centerY + r * Math.sin(angle));
    }
    context.closePath();
    context.strokeStyle = prevStrokeStyle;
    context.lineWidth = prevLineWidth;
    context.globalAlpha = prevGlobalAlpha;
    context.lineJoin = prevLineJoin;
    context.lineCap = prevLineCap;
    context.stroke();
}

function drawHeart(x1, y1, x2, y2, context) {
    const prevStrokeStyle = context.strokeStyle;
    const prevLineWidth = context.lineWidth;
    const prevGlobalAlpha = context.globalAlpha;
    const prevLineJoin = context.lineJoin;
    const prevLineCap = context.lineCap;

    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    const centerX = x1;
    const centerY = y1;
    const size = Math.min(width, height) / 2;

    context.beginPath();
    context.moveTo(centerX, centerY - size/2);
    context.bezierCurveTo(
        centerX + size, centerY - size,
        centerX + size, centerY + size/2,
        centerX, centerY + size
    );
    context.bezierCurveTo(
        centerX - size, centerY + size/2,
        centerX - size, centerY - size,
        centerX, centerY - size/2
    );
    context.strokeStyle = prevStrokeStyle;
    context.lineWidth = prevLineWidth;
    context.globalAlpha = prevGlobalAlpha;
    context.lineJoin = prevLineJoin;
    context.lineCap = prevLineCap;
    context.stroke();
}

function drawDiamond(x1, y1, x2, y2, context) {
    const prevStrokeStyle = context.strokeStyle;
    const prevLineWidth = context.lineWidth;
    const prevGlobalAlpha = context.globalAlpha;
    const prevLineJoin = context.lineJoin;
    const prevLineCap = context.lineCap;

    const centerX = x1;
    const centerY = y1;
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    context.beginPath();
    context.moveTo(centerX, centerY - height/2); // Верхняя точка
    context.lineTo(centerX + width/2, centerY);  // Правая точка
    context.lineTo(centerX, centerY + height/2); // Нижняя точка
    context.lineTo(centerX - width/2, centerY);  // Левая точка
    context.closePath();

    context.strokeStyle = prevStrokeStyle;
    context.lineWidth = prevLineWidth;
    context.globalAlpha = prevGlobalAlpha;
    context.lineJoin = prevLineJoin;
    context.lineCap = prevLineCap;
    context.stroke();
}

function drawArrow(x1, y1, x2, y2, context) {
    const prevStrokeStyle = context.strokeStyle;
    const prevFillStyle = context.fillStyle;
    const prevLineWidth = context.lineWidth;
    const prevGlobalAlpha = context.globalAlpha;
    const prevLineJoin = context.lineJoin;
    const prevLineCap = context.lineCap;

    // Рассчитываем длину стрелки
    const dx = x2 - x1;
    const dy = y2 - y1;
    const angle = Math.atan2(dy, dx);
    const length = Math.sqrt(dx * dx + dy * dy);

    // Размер наконечника стрелки пропорционален толщине линии, но не более 30
    const headLength = Math.min(30, prevLineWidth * 3);

    // Корректируем конечную точку, чтобы линия не заходила за наконечник
    const adjustedX2 = x2 - headLength * Math.cos(angle);
    const adjustedY2 = y2 - headLength * Math.sin(angle);

    // Рисуем линию
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(adjustedX2, adjustedY2);
    context.strokeStyle = prevStrokeStyle;
    context.lineWidth = prevLineWidth;
    context.globalAlpha = prevGlobalAlpha;
    context.lineJoin = prevLineJoin;
    context.lineCap = prevLineCap;
    context.stroke();

    // Рисуем наконечник стрелки
    context.beginPath();
    context.moveTo(x2, y2);
    context.lineTo(
        x2 - headLength * Math.cos(angle - Math.PI / 6),
        y2 - headLength * Math.sin(angle - Math.PI / 6)
    );
    context.lineTo(
        x2 - headLength * Math.cos(angle + Math.PI / 6),
        y2 - headLength * Math.sin(angle + Math.PI / 6)
    );
    context.closePath();
    context.fillStyle = prevStrokeStyle;
    context.fill();
}

function drawCurve(points, context) {
    const prevStrokeStyle = context.strokeStyle;
    const prevLineWidth = context.lineWidth;
    const prevGlobalAlpha = context.globalAlpha;
    const prevLineJoin = context.lineJoin;
    const prevLineCap = context.lineCap;

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        context.lineTo(points[i].x, points[i].y);
    }
    context.strokeStyle = prevStrokeStyle;
    context.lineWidth = prevLineWidth;
    context.globalAlpha = prevGlobalAlpha;
    context.lineJoin = prevLineJoin;
    context.lineCap = prevLineCap;
    context.stroke();
}

export { drawLine, drawRectangle, drawCircle, drawTriangle, drawHexagon, drawPentagon, drawStar, drawHeart, drawDiamond, drawArrow, drawCurve };