import { generateId } from './utils.js';
import { canvas, ctx, saveState as saveScriptState } from './script.js';

let layers = [];
let activeLayerIndex = 0;

function createLayer(name) {
    const layerCanvas = document.createElement('canvas');
    layerCanvas.width = canvas.width;
    layerCanvas.height = canvas.height;
    const layerCtx = layerCanvas.getContext('2d');
    layerCtx.fillStyle = 'rgba(0, 0, 0, 0)';
    layerCtx.fillRect(0, 0, layerCanvas.width, layerCanvas.height);

    const layer = {
        id: generateId(),
        name: name || `Шар ${layers.length + 1}`,
        canvas: layerCanvas,
        ctx: layerCtx,
        visible: true,
        locked: false,
        opacity: 1,
        blendMode: 'source-over'
    };

    layers.push(layer);
    activeLayerIndex = layers.length - 1;
    updateLayersList();
    redrawAllLayers();

    return layer;
}

function removeCurrentLayer() {
    if (layers.length <= 1) {
        alert('Повинен залишатися хоча б один шар!');
        return;
    }

    layers.splice(activeLayerIndex, 1);
    if (activeLayerIndex >= layers.length) {
        activeLayerIndex = layers.length - 1;
    }

    updateLayersList();
    redrawAllLayers();
    saveScriptState();
}

function addNewLayer() {
    createLayer(`Шар ${layers.length + 1}`);
    saveScriptState();
}

function mergeLayers() {
    if (layers.length <= 1) return;

    const newCanvas = document.createElement('canvas');
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;
    const newCtx = newCanvas.getContext('2d');

    layers.forEach(layer => {
        if (layer.visible) {
            newCtx.globalAlpha = layer.opacity;
            newCtx.globalCompositeOperation = layer.blendMode;
            newCtx.drawImage(layer.canvas, 0, 0);
            newCtx.globalAlpha = 1;
            newCtx.globalCompositeOperation = 'source-over';
        }
    });

    layers = [{
        id: generateId(),
        name: 'Об`єднаний шар',
        canvas: newCanvas,
        ctx: newCtx,
        visible: true,
        locked: false,
        opacity: 1,
        blendMode: 'source-over'
    }];
    activeLayerIndex = 0;

    updateLayersList();
    redrawAllLayers();
    saveScriptState();
}

function updateLayersList() {
    const layersList = document.getElementById('layers-list');
    layersList.innerHTML = '';

    layers.forEach((layer, index) => {
        const layerItem = document.createElement('div');
        layerItem.className = `layer-item ${index === activeLayerIndex ? 'active' : ''}`;
        layerItem.dataset.layerId = layer.id;
        layerItem.draggable = true;

        layerItem.innerHTML = `
            <div class="layer-controls">
                <input type="checkbox" ${layer.visible ? 'checked' : ''} class="visibility-toggle">
                <input type="checkbox" ${layer.locked ? 'checked' : ''} class="lock-toggle">
                <span class="layer-name">${layer.name}</span>
                <input type="range" min="0" max="1" step="0.01" value="${layer.opacity}" class="layer-opacity">
                <select class="blend-mode">
                    <option value="source-over" ${layer.blendMode === 'source-over' ? 'selected' : ''}>Normal</option>
                    <option value="multiply" ${layer.blendMode === 'multiply' ? 'selected' : ''}>Multiply</option>
                    <option value="screen" ${layer.blendMode === 'screen' ? 'selected' : ''}>Screen</option>
                </select>
            </div>
        `;

        layerItem.addEventListener('click', (e) => {
            if (!e.target.classList.contains('visibility-toggle') && !e.target.classList.contains('lock-toggle') &&
                !e.target.classList.contains('layer-opacity') && !e.target.classList.contains('blend-mode')) {
                setActiveLayer(index);
            }
        });

        layerItem.addEventListener('dblclick', () => renameLayer(index));

        const visibilityToggle = layerItem.querySelector('.visibility-toggle');
        visibilityToggle.addEventListener('change', (e) => {
            e.stopPropagation();
            layer.visible = e.target.checked;
            redrawAllLayers();
            saveScriptState();
        });

        const lockToggle = layerItem.querySelector('.lock-toggle');
        lockToggle.addEventListener('change', (e) => {
            e.stopPropagation();
            layer.locked = e.target.checked;
        });

        const opacitySlider = layerItem.querySelector('.layer-opacity');
        opacitySlider.addEventListener('input', (e) => {
            layer.opacity = parseFloat(e.target.value);
            redrawAllLayers();
            saveScriptState();
        });

        const blendModeSelect = layerItem.querySelector('.blend-mode');
        blendModeSelect.addEventListener('change', (e) => {
            layer.blendMode = e.target.value;
            redrawAllLayers();
            saveScriptState();
        });

        layersList.appendChild(layerItem);
    });

    setupLayerDragAndDrop();
}

function renameLayer(index) {
    const newName = prompt('Введіть нову назву шару:', layers[index].name);
    if (newName && newName.trim() !== '') {
        layers[index].name = newName.trim();
        updateLayersList();
        saveScriptState();
    }
}

function setActiveLayer(index) {
    if (layers[index].locked) return;
    activeLayerIndex = index;
    updateLayersList();
}

function setupLayerDragAndDrop() {
    const layerItems = document.querySelectorAll('.layer-item');
    layerItems.forEach(item => {
        item.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', item.dataset.layerId);
            item.classList.add('dragging');
        });
        item.addEventListener('dragend', () => item.classList.remove('dragging'));
    });

    const layersList = document.getElementById('layers-list');
    layersList.addEventListener('dragover', e => {
        e.preventDefault();
        const draggingElement = document.querySelector('.layer-item.dragging');
        const targetElement = e.target.closest('.layer-item');
        if (targetElement && draggingElement !== targetElement) {
            const rect = targetElement.getBoundingClientRect();
            const next = e.clientY > rect.top + rect.height / 2;
            layersList.insertBefore(draggingElement, next ? targetElement.nextSibling : targetElement);
        }
    });

    layersList.addEventListener('drop', e => {
        e.preventDefault();
        const layerId = e.dataTransfer.getData('text/plain');
        const layerIndex = layers.findIndex(l => l.id === layerId);
        if (layerIndex === -1) return;

        const newOrder = [];
        document.querySelectorAll('.layer-item').forEach(item => {
            const id = item.dataset.layerId;
            const layer = layers.find(l => l.id === id);
            if (layer) newOrder.push(layer);
        });

        layers = newOrder;
        activeLayerIndex = layers.findIndex(l => l.id === layerId);
        redrawAllLayers();
        saveScriptState();
    });
}

function redrawAllLayers() {
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    layers.forEach((layer) => {
        if (layer.visible) {
            ctx.globalAlpha = layer.opacity;
            ctx.globalCompositeOperation = layer.blendMode;
            ctx.drawImage(layer.canvas, 0, 0);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }
    });
}

function getActiveContext() {
    return layers[activeLayerIndex].ctx;
}

function getActiveCanvas() {
    return layers[activeLayerIndex].canvas;
}

function drawOnActiveLayer(drawFunc) {
    const activeCtx = getActiveContext();
    drawFunc(activeCtx);
    redrawAllLayers();
}

export {
    layers,
    activeLayerIndex,
    createLayer,
    removeCurrentLayer,
    addNewLayer,
    updateLayersList,
    setActiveLayer,
    redrawAllLayers,
    getActiveContext,
    getActiveCanvas,
    drawOnActiveLayer,
    mergeLayers
};