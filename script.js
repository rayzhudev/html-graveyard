let currentGravestone = null;
const gravestones = {};
let gravestoneIdCounter = 0;

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragIndicator = null;
let scene = null;

// Register A-Frame cursor listener component
AFRAME.registerComponent('cursor-listener', {
    init: function () {
        this.el.addEventListener('click', (e) => {
            if (this.el.classList.contains('gravestone-3d')) {
                openInscriptionModal(this.el);
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    scene = document.querySelector('a-scene');
    dragIndicator = document.getElementById('dragIndicator');
    
    scene.addEventListener('loaded', () => {
        generateDramaticTerrain();
        generateAtmosphericTrees();
        generateMagicalFlowers();
        generateDreamyClouds();
        loadGravestones();
        
        // Wait a bit more for canvas to be ready
        setTimeout(() => {
            setupDragAndDrop();
        }, 100);
    });
});

function generateDramaticTerrain() {
    const terrain = document.getElementById('terrain');
    
    // Create dramatic perspective terrain - from close to distant horizon
    for (let z = 15; z >= -80; z -= 0.4) { // Adjusted range for elevated view
        for (let x = -50; x <= 50; x += 0.6) {
            // Distance from camera affects everything
            const distance = Math.abs(z - 15) + 1;
            const distanceFactor = 1 / (distance * 0.03 + 1);
            
            // Progressive scaling - larger blocks up close, smaller far away
            const blockSize = Math.max(0.2, 2 * distanceFactor);
            
            // Skip blocks randomly based on distance for performance
            if (Math.random() > 0.4 + distanceFactor * 0.3) continue;
            
            // Create rolling hills with noise
            const noise = Math.sin(x * 0.03) * Math.cos(z * 0.03) * 2;
            const hillNoise = Math.sin(x * 0.008) * Math.sin(z * 0.008) * 6;
            const microNoise = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 0.3;
            const y = (noise + hillNoise + microNoise) * distanceFactor;
            
            // Create the block
            const block = document.createElement('a-box');
            block.setAttribute('position', `${x} ${y} ${z}`);
            block.setAttribute('width', blockSize);
            block.setAttribute('height', blockSize);
            block.setAttribute('depth', blockSize);
            
            // Atmospheric perspective - greener up close, bluer/grayer far away
            const atmosphericBlue = Math.min(1, distance * 0.008);
            const greenIntensity = Math.max(0.4, 1 - atmosphericBlue * 0.6);
            const redChannel = Math.floor(120 * atmosphericBlue + 70 * greenIntensity);
            const greenChannel = Math.floor(240 * greenIntensity + 120 * atmosphericBlue);
            const blueChannel = Math.floor(20 * greenIntensity + 160 * atmosphericBlue);
            
            const color = `#${redChannel.toString(16).padStart(2, '0')}${greenChannel.toString(16).padStart(2, '0')}${blueChannel.toString(16).padStart(2, '0')}`;
            block.setAttribute('color', color);
            block.setAttribute('shadow', 'receive: true');
            
            terrain.appendChild(block);
        }
    }
}

function generateAtmosphericTrees() {
    const trees = document.getElementById('trees');
    
    // Generate trees at various distances with proper scaling
    for (let i = 0; i < 25; i++) {
        const x = (Math.random() - 0.5) * 80;
        const z = Math.random() * -70 - 5; // From close to very far
        const distance = Math.abs(z - 15) + 1;
        const scale = Math.max(0.2, 1 / (distance * 0.025 + 1));
        
        const treeGroup = document.createElement('a-entity');
        const y = getTerrainHeight(x, z) + scale;
        
        // Trunk height scales with distance
        const trunkHeight = Math.max(1, 4 * scale);
        
        // Create trunk blocks
        for (let j = 0; j < Math.max(1, Math.floor(trunkHeight)); j++) {
            const trunk = document.createElement('a-box');
            trunk.setAttribute('position', `${x} ${y + j * scale} ${z}`);
            trunk.setAttribute('width', scale);
            trunk.setAttribute('height', scale);
            trunk.setAttribute('depth', scale);
            
            // Atmospheric color for trunk
            const atmosphericFactor = Math.min(1, distance * 0.008);
            const brownness = 1 - atmosphericFactor * 0.5;
            const trunkColor = `rgb(${Math.floor(139 * brownness + 100 * atmosphericFactor)}, ${Math.floor(69 * brownness + 100 * atmosphericFactor)}, ${Math.floor(19 * brownness + 150 * atmosphericFactor)})`;
            trunk.setAttribute('color', trunkColor);
            treeGroup.appendChild(trunk);
        }
        
        // Create leaf crown
        const leafPositions = [
            {x: 0, y: trunkHeight, z: 0}, {x: scale, y: trunkHeight, z: 0}, {x: -scale, y: trunkHeight, z: 0},
            {x: 0, y: trunkHeight, z: scale}, {x: 0, y: trunkHeight, z: -scale},
            {x: 0, y: trunkHeight + scale, z: 0}, {x: scale/2, y: trunkHeight + scale, z: 0}, {x: -scale/2, y: trunkHeight + scale, z: 0},
            {x: 0, y: trunkHeight + scale, z: scale/2}, {x: 0, y: trunkHeight + scale, z: -scale/2},
            {x: 0, y: trunkHeight + scale * 2, z: 0}
        ];
        
        leafPositions.forEach(leaf => {
            if (Math.random() > 0.3) { // Random leaf placement
                const leafBlock = document.createElement('a-box');
                leafBlock.setAttribute('position', `${x + leaf.x} ${y + leaf.y} ${z + leaf.z}`);
                leafBlock.setAttribute('width', scale * 0.8);
                leafBlock.setAttribute('height', scale * 0.8);
                leafBlock.setAttribute('depth', scale * 0.8);
                
                // Atmospheric color for leaves
                const atmosphericFactor = Math.min(1, distance * 0.008);
                const greenness = 1 - atmosphericFactor * 0.4;
                const leafColor = `rgb(${Math.floor(34 * greenness + 120 * atmosphericFactor)}, ${Math.floor(139 * greenness + 140 * atmosphericFactor)}, ${Math.floor(34 * greenness + 160 * atmosphericFactor)})`;
                leafBlock.setAttribute('color', leafColor);
                leafBlock.setAttribute('opacity', '0.9');
                treeGroup.appendChild(leafBlock);
            }
        });
        
        trees.appendChild(treeGroup);
    }
}

function generateMagicalFlowers() {
    const flowers = document.getElementById('flowers');
    
    // Generate flowers at various scales
    for (let i = 0; i < 35; i++) {
        const x = (Math.random() - 0.5) * 70;
        const z = Math.random() * -50 - 5; // From close to far
        const distance = Math.abs(z - 15) + 1;
        const scale = Math.max(0.1, 1 / (distance * 0.03 + 1));
        const y = getTerrainHeight(x, z) + scale * 0.5;
        
        const flowerGroup = document.createElement('a-entity');
        
        // Stem
        const stem = document.createElement('a-box');
        stem.setAttribute('position', `${x} ${y} ${z}`);
        stem.setAttribute('width', scale * 0.1);
        stem.setAttribute('height', scale * 0.8);
        stem.setAttribute('depth', scale * 0.1);
        stem.setAttribute('color', '#228B22');
        flowerGroup.appendChild(stem);
        
        // Flower petals
        const flowerColors = ['#FFD700', '#FF69B4', '#DDA0DD', '#87CEEB', '#FFA500', '#FF1493', '#BA55D3', '#F0E68C'];
        const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
        
        // Create multiple petals for larger flowers up close
        const petalCount = Math.max(4, Math.floor(8 * scale));
        for (let p = 0; p < petalCount; p++) {
            const angle = (Math.PI * 2 * p) / petalCount;
            const petalX = x + Math.cos(angle) * scale * 0.3;
            const petalZ = z + Math.sin(angle) * scale * 0.3;
            
            const petal = document.createElement('a-box');
            petal.setAttribute('position', `${petalX} ${y + scale * 0.8} ${petalZ}`);
            petal.setAttribute('width', scale * 0.4);
            petal.setAttribute('height', scale * 0.4);
            petal.setAttribute('depth', scale * 0.4);
            petal.setAttribute('color', color);
            flowerGroup.appendChild(petal);
        }
        
        flowers.appendChild(flowerGroup);
    }
}

function generateDreamyClouds() {
    const clouds = document.getElementById('clouds');
    
    // Create more dramatic cloud layers
    for (let i = 0; i < 8; i++) {
        const cloudGroup = document.createElement('a-entity');
        const x = (Math.random() - 0.5) * 120;
        const y = 12 + Math.random() * 15 + i * 2; // Multiple cloud layers
        const z = Math.random() * -40 - 20; // Various distances
        const distance = Math.abs(z) + 20;
        const scale = Math.max(0.3, 8 / (distance * 0.05 + 1));
        
        // Create cloud from multiple blocks
        const cloudBlocks = [
            {x: 0, y: 0, z: 0}, {x: 1, y: 0, z: 0}, {x: -1, y: 0, z: 0},
            {x: 0, y: 0, z: 1}, {x: 0, y: 0, z: -1}, {x: 2, y: 0, z: 0}, {x: -2, y: 0, z: 0},
            {x: 1, y: 0, z: 1}, {x: -1, y: 0, z: -1}, {x: 0, y: 1, z: 0},
            {x: 1, y: 1, z: 0}, {x: -1, y: 1, z: 0}
        ];
        
        cloudBlocks.forEach(block => {
            if (Math.random() > 0.2) {
                const cloudBlock = document.createElement('a-box');
                cloudBlock.setAttribute('position', `${x + block.x * scale} ${y + block.y * scale} ${z + block.z * scale}`);
                cloudBlock.setAttribute('width', scale * 2);
                cloudBlock.setAttribute('height', scale * 1.5);
                cloudBlock.setAttribute('depth', scale * 2);
                cloudBlock.setAttribute('color', '#FFFFFF');
                cloudBlock.setAttribute('opacity', Math.max(0.4, 0.9 - distance * 0.01));
                cloudGroup.appendChild(cloudBlock);
            }
        });
        
        // Animate cloud movement with different speeds
        const speed = 60000 + Math.random() * 60000;
        cloudGroup.setAttribute('animation', {
            property: 'position',
            to: `${x + 150} ${y} ${z}`,
            dur: speed,
            loop: true,
            easing: 'linear'
        });
        
        clouds.appendChild(cloudGroup);
    }
}

function getTerrainHeight(x, z) {
    const distance = Math.abs(z - 15) + 1;
    const distanceFactor = 1 / (distance * 0.03 + 1);
    
    const noise = Math.sin(x * 0.03) * Math.cos(z * 0.03) * 2;
    const hillNoise = Math.sin(x * 0.008) * Math.sin(z * 0.008) * 6;
    const microNoise = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 0.3;
    
    return (noise + hillNoise + microNoise) * distanceFactor;
}

function setupDragAndDrop() {
    const canvas = scene.canvas || scene.querySelector('canvas');
    
    if (canvas) {
        canvas.addEventListener('mousedown', handleMouseDown);
    } else {
        scene.addEventListener('mousedown', handleMouseDown);
    }
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (isDragging) {
                cancelDrag();
            } else {
                closeModal();
            }
        }
    });
}

function handleMouseDown(e) {
    if (e.target.closest('.modal') || e.target.closest('.gravestone-3d')) {
        return;
    }
    
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    
    dragIndicator.style.left = dragStartX + 'px';
    dragIndicator.style.top = dragStartY + 'px';
    dragIndicator.style.width = '0px';
    dragIndicator.style.height = '0px';
    dragIndicator.classList.add('active');
    
    e.preventDefault();
}

function handleMouseMove(e) {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const currentY = e.clientY;
    
    const width = Math.abs(currentX - dragStartX);
    const height = Math.abs(currentY - dragStartY);
    
    const left = Math.min(currentX, dragStartX);
    const top = Math.min(currentY, dragStartY);
    
    dragIndicator.style.left = left + 'px';
    dragIndicator.style.top = top + 'px';
    dragIndicator.style.width = width + 'px';
    dragIndicator.style.height = height + 'px';
}

function handleMouseUp(e) {
    if (!isDragging) return;
    
    const width = Math.abs(e.clientX - dragStartX);
    const height = Math.abs(e.clientY - dragStartY);
    
    if (width > 20 && height > 20) {
        const centerX = (e.clientX + dragStartX) / 2;
        const centerY = (e.clientY + dragStartY) / 2;
        
        createGravestone3D(centerX, centerY, width, height);
    }
    
    cancelDrag();
}

function cancelDrag() {
    isDragging = false;
    dragIndicator.classList.remove('active');
}

function createGravestone3D(screenX, screenY, width, height) {
    const canvas = scene.canvas || scene.querySelector('canvas');
    const rect = canvas ? canvas.getBoundingClientRect() : scene.getBoundingClientRect();
    const x = ((screenX - rect.left) / rect.width) * 2 - 1;
    const y = -((screenY - rect.top) / rect.height) * 2 + 1;
    
    // Map screen coordinates to world with dramatic perspective
    const worldX = x * 35;
    const worldZ = (y * 40) - 10; // Adjusted for elevated view
    const distance = Math.abs(worldZ - 15) + 1;
    const scale = Math.max(0.4, 2 / (distance * 0.025 + 1)); // Scale with distance
    const worldY = getTerrainHeight(worldX, worldZ) + scale;
    
    const id = `grave_${gravestoneIdCounter++}`;
    const gravestonesContainer = document.getElementById('gravestones-3d');
    
    const gravestone = document.createElement('a-entity');
    gravestone.setAttribute('id', id);
    gravestone.setAttribute('class', 'gravestone-3d');
    gravestone.setAttribute('position', `${worldX} ${worldY} ${worldZ}`);
    
    // Scale tombstone based on distance and drag size
    const finalScale = scale * Math.min(Math.max(width / 80, 0.5), 2);
    const stoneHeight = scale * Math.min(Math.max(height / 40, 1), 4);
    
    // Atmospheric color for stone
    const atmosphericFactor = Math.min(1, distance * 0.006);
    const stoneColor = `rgb(${Math.floor(192 + 50 * atmosphericFactor)}, ${Math.floor(192 + 50 * atmosphericFactor)}, ${Math.floor(192 + 60 * atmosphericFactor)})`;
    
    // Base
    const base = document.createElement('a-box');
    base.setAttribute('position', '0 0 0');
    base.setAttribute('width', finalScale);
    base.setAttribute('height', scale * 0.2);
    base.setAttribute('depth', scale * 0.5);
    base.setAttribute('color', stoneColor);
    base.setAttribute('shadow', 'cast: true; receive: true');
    gravestone.appendChild(base);
    
    // Main stone
    const mainStone = document.createElement('a-box');
    mainStone.setAttribute('position', `0 ${stoneHeight/2 + scale * 0.1} 0`);
    mainStone.setAttribute('width', finalScale * 0.8);
    mainStone.setAttribute('height', stoneHeight);
    mainStone.setAttribute('depth', scale * 0.3);
    mainStone.setAttribute('color', stoneColor);
    mainStone.setAttribute('shadow', 'cast: true; receive: true');
    gravestone.appendChild(mainStone);
    
    // Top stone
    const topStone = document.createElement('a-box');
    topStone.setAttribute('position', `0 ${stoneHeight + scale * 0.3} 0`);
    topStone.setAttribute('width', finalScale * 0.6);
    topStone.setAttribute('height', scale * 0.4);
    topStone.setAttribute('depth', scale * 0.3);
    topStone.setAttribute('color', stoneColor);
    topStone.setAttribute('shadow', 'cast: true; receive: true');
    gravestone.appendChild(topStone);
    
    // Text
    const text = document.createElement('a-text');
    text.setAttribute('value', 'Click to\ninscribe');
    text.setAttribute('position', `0 ${stoneHeight/2 + scale * 0.1} ${scale * 0.16}`);
    text.setAttribute('align', 'center');
    text.setAttribute('color', '#333333');
    text.setAttribute('width', Math.max(2, 4 * scale));
    text.setAttribute('wrap-count', 10);
    gravestone.appendChild(text);
    
    gravestonesContainer.appendChild(gravestone);
    
    // Add click handler
    gravestone.setAttribute('cursor-listener', '');
    
    // Store gravestone data
    gravestones[id] = {
        x: worldX,
        y: worldY,
        z: worldZ,
        scale: finalScale,
        height: stoneHeight,
        baseScale: scale,
        inscription: null
    };
    
    saveGravestones();
    animateGravestoneAppearance(gravestone);
}

function animateGravestoneAppearance(gravestone) {
    const pos = gravestone.getAttribute('position');
    const startY = pos.y - 2;
    gravestone.setAttribute('position', `${pos.x} ${startY} ${pos.z}`);
    gravestone.setAttribute('scale', '0 0 0');
    
    gravestone.setAttribute('animation__position', {
        property: 'position',
        to: `${pos.x} ${pos.y} ${pos.z}`,
        dur: 800,
        easing: 'easeOutBack'
    });
    
    gravestone.setAttribute('animation__scale', {
        property: 'scale',
        to: '1 1 1',
        dur: 800,
        easing: 'easeOutBack'
    });
}

function openInscriptionModal(gravestone) {
    currentGravestone = gravestone;
    const modal = document.getElementById('inscriptionModal');
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('inscriptionModal');
    modal.classList.remove('active');
    document.getElementById('inscriptionForm').reset();
}

document.getElementById('inscriptionForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('nameInput').value;
    const birthYear = document.getElementById('birthYear').value || '????';
    const deathYear = document.getElementById('deathYear').value || '????';
    const epitaph = document.getElementById('epitaphInput').value;
    
    const inscription = {
        name,
        birthYear,
        deathYear,
        epitaph,
        timestamp: Date.now()
    };
    
    const id = currentGravestone.getAttribute('id');
    if (gravestones[id]) {
        gravestones[id].inscription = inscription;
    }
    
    updateGravestone3D(currentGravestone, inscription);
    saveGravestones();
    closeModal();
    
    createFlowerBurst3D(currentGravestone);
});

function updateGravestone3D(gravestone, inscription) {
    const text = gravestone.querySelector('a-text');
    const textValue = `${inscription.name}\n${inscription.birthYear}-${inscription.deathYear}\n${inscription.epitaph}`;
    text.setAttribute('value', textValue);
    text.setAttribute('wrap-count', 15);
}

function createFlowerBurst3D(gravestone) {
    const pos = gravestone.getAttribute('position');
    const flowers = document.getElementById('flowers');
    const distance = Math.abs(parseFloat(pos.z) - 15) + 1;
    const scale = Math.max(0.1, 1 / (distance * 0.025 + 1));
    
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const distance = 2 * scale;
        const x = parseFloat(pos.x) + Math.cos(angle) * distance;
        const z = parseFloat(pos.z) + Math.sin(angle) * distance;
        const y = getTerrainHeight(x, z) + scale * 0.5;
        
        const flowerColors = ['#FFD700', '#FF69B4', '#DDA0DD', '#87CEEB', '#FFA500'];
        const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
        
        const flower = document.createElement('a-box');
        flower.setAttribute('position', `${x} ${y} ${z}`);
        flower.setAttribute('width', scale * 0.4);
        flower.setAttribute('height', scale * 0.4);
        flower.setAttribute('depth', scale * 0.4);
        flower.setAttribute('color', color);
        flower.setAttribute('scale', '0 0 0');
        
        flower.setAttribute('animation__scale', {
            property: 'scale',
            to: '1 1 1',
            dur: 500,
            delay: i * 50,
            easing: 'easeOutBack'
        });
        
        flowers.appendChild(flower);
    }
}

function saveGravestones() {
    localStorage.setItem('dramatic_gravestones', JSON.stringify(gravestones));
}

function loadGravestones() {
    const saved = localStorage.getItem('dramatic_gravestones');
    if (saved) {
        const loaded = JSON.parse(saved);
        Object.assign(gravestones, loaded);
        
        Object.entries(loaded).forEach(([id, data]) => {
            const gravestonesContainer = document.getElementById('gravestones-3d');
            
            // Recalculate atmospheric color
            const distance = Math.abs(data.z - 15) + 1;
            const atmosphericFactor = Math.min(1, distance * 0.006);
            const stoneColor = `rgb(${Math.floor(192 + 50 * atmosphericFactor)}, ${Math.floor(192 + 50 * atmosphericFactor)}, ${Math.floor(192 + 60 * atmosphericFactor)})`;
            
            const gravestone = document.createElement('a-entity');
            gravestone.setAttribute('id', id);
            gravestone.setAttribute('class', 'gravestone-3d');
            gravestone.setAttribute('position', `${data.x} ${data.y} ${data.z}`);
            
            // Base
            const base = document.createElement('a-box');
            base.setAttribute('position', '0 0 0');
            base.setAttribute('width', data.scale);
            base.setAttribute('height', data.baseScale * 0.2);
            base.setAttribute('depth', data.baseScale * 0.5);
            base.setAttribute('color', stoneColor);
            base.setAttribute('shadow', 'cast: true; receive: true');
            gravestone.appendChild(base);
            
            // Main stone
            const mainStone = document.createElement('a-box');
            mainStone.setAttribute('position', `0 ${data.height/2 + data.baseScale * 0.1} 0`);
            mainStone.setAttribute('width', data.scale * 0.8);
            mainStone.setAttribute('height', data.height);
            mainStone.setAttribute('depth', data.baseScale * 0.3);
            mainStone.setAttribute('color', stoneColor);
            mainStone.setAttribute('shadow', 'cast: true; receive: true');
            gravestone.appendChild(mainStone);
            
            // Top stone
            const topStone = document.createElement('a-box');
            topStone.setAttribute('position', `0 ${data.height + data.baseScale * 0.3} 0`);
            topStone.setAttribute('width', data.scale * 0.6);
            topStone.setAttribute('height', data.baseScale * 0.4);
            topStone.setAttribute('depth', data.baseScale * 0.3);
            topStone.setAttribute('color', stoneColor);
            topStone.setAttribute('shadow', 'cast: true; receive: true');
            gravestone.appendChild(topStone);
            
            // Text
            const text = document.createElement('a-text');
            if (data.inscription) {
                const textValue = `${data.inscription.name}\n${data.inscription.birthYear}-${data.inscription.deathYear}\n${data.inscription.epitaph}`;
                text.setAttribute('value', textValue);
            } else {
                text.setAttribute('value', 'Click to\ninscribe');
            }
            text.setAttribute('position', `0 ${data.height/2 + data.baseScale * 0.1} ${data.baseScale * 0.16}`);
            text.setAttribute('align', 'center');
            text.setAttribute('color', '#333333');
            text.setAttribute('width', Math.max(2, 4 * data.baseScale));
            text.setAttribute('wrap-count', 15);
            gravestone.appendChild(text);
            
            gravestonesContainer.appendChild(gravestone);
            
            // Add click handler
            gravestone.setAttribute('cursor-listener', '');
            
            const idNum = parseInt(id.split('_')[1]);
            if (idNum >= gravestoneIdCounter) {
                gravestoneIdCounter = idNum + 1;
            }
        });
    }
}