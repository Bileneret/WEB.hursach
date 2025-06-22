// Утилітні функції для загального використання
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function rgbToHex(color) {
    if (color.startsWith('#')) return color;
    const rgb = color.match(/\d+/g);
    if (!rgb || rgb.length < 3) return '#000000';
    const r = parseInt(rgb[0]);
    const g = parseInt(rgb[1]);
    const b = parseInt(rgb[2]);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function interpolateColor(color1, color2, factor) {
    if (factor <= 0) return color1;
    if (factor >= 1) return color2;
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);
    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function colorToRgb(color) {
    if (color.startsWith('#')) {
        return {
            r: parseInt(color.substr(1, 2), 16),
            g: parseInt(color.substr(3, 2), 16),
            b: parseInt(color.substr(5, 2), 16)
        };
    } else if (color.startsWith('rgb')) {
        const rgb = color.match(/\d+/g);
        return {
            r: parseInt(rgb[0]),
            g: parseInt(rgb[1]),
            b: parseInt(rgb[2])
        };
    }
    return null;
}

// Експорт усіх функцій
export { clamp, getRandomColor, formatTime, isEmpty, generateId, rgbToHex, interpolateColor, colorToRgb };