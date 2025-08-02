let currentGravestone = null;
const gravestones = {};
let gravestoneIdCounter = 0;

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragPreview = null;

document.addEventListener('DOMContentLoaded', () => {
    loadGravestones();
    setupDragAndDrop();
    addBirds();
});

function setupDragAndDrop() {
    const cemetery = document.querySelector('.cemetery');
    dragPreview = document.getElementById('dragPreview');
    
    cemetery.addEventListener('mousedown', handleMouseDown);
    cemetery.addEventListener('mousemove', handleMouseMove);
    cemetery.addEventListener('mouseup', handleMouseUp);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isDragging) {
            cancelDrag();
        }
    });
}

function handleMouseDown(e) {
    if (e.target.closest('.gravestone') || e.target.closest('.modal') || e.target.closest('header')) {
        return;
    }
    
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    
    dragPreview.style.left = dragStartX + 'px';
    dragPreview.style.top = dragStartY + 'px';
    dragPreview.style.width = '0px';
    dragPreview.style.height = '0px';
    dragPreview.classList.add('active');
}

function handleMouseMove(e) {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const currentY = e.clientY;
    
    const width = Math.abs(currentX - dragStartX);
    const height = Math.abs(currentY - dragStartY);
    
    const left = Math.min(currentX, dragStartX);
    const top = Math.min(currentY, dragStartY);
    
    dragPreview.style.left = left + 'px';
    dragPreview.style.top = top + 'px';
    dragPreview.style.width = width + 'px';
    dragPreview.style.height = height + 'px';
}

function handleMouseUp(e) {
    if (!isDragging) return;
    
    const width = Math.abs(e.clientX - dragStartX);
    const height = Math.abs(e.clientY - dragStartY);
    
    if (width > 50 && height > 50) {
        createGravestone(
            Math.min(e.clientX, dragStartX),
            Math.min(e.clientY, dragStartY),
            Math.min(Math.max(width, 80), 200),
            Math.min(Math.max(height, 100), 250)
        );
    }
    
    cancelDrag();
}

function cancelDrag() {
    isDragging = false;
    dragPreview.classList.remove('active');
}

function createGravestone(x, y, width, height) {
    const id = `grave_${gravestoneIdCounter++}`;
    const container = document.getElementById('gravestones-container');
    
    const gravestone = document.createElement('div');
    gravestone.className = 'gravestone';
    gravestone.dataset.id = id;
    gravestone.style.left = x + 'px';
    gravestone.style.top = y + 'px';
    gravestone.style.width = width + 'px';
    gravestone.style.height = height + 'px';
    
    const stoneTop = document.createElement('div');
    stoneTop.className = 'stone-top';
    
    const stoneBody = document.createElement('div');
    stoneBody.className = 'stone-body';
    stoneBody.innerHTML = `
        <p class="epitaph">Click to inscribe...</p>
        <p class="dates">????-????</p>
    `;
    
    gravestone.appendChild(stoneTop);
    gravestone.appendChild(stoneBody);
    container.appendChild(gravestone);
    
    gravestone.addEventListener('click', () => openInscriptionModal(gravestone));
    
    gravestones[id] = {
        x, y, width, height,
        inscription: null
    };
    
    saveGravestones();
    animateGravestoneAppearance(gravestone);
}

function animateGravestoneAppearance(gravestone) {
    gravestone.style.transform = 'scale(0) translateY(20px)';
    gravestone.style.opacity = '0';
    
    setTimeout(() => {
        gravestone.style.transition = 'all 0.5s ease-out';
        gravestone.style.transform = 'scale(1) translateY(0)';
        gravestone.style.opacity = '1';
    }, 10);
}

function openInscriptionModal(gravestone) {
    currentGravestone = gravestone;
    const modal = document.getElementById('inscriptionModal');
    modal.classList.add('active');
    
    playSound('open');
}

function closeModal() {
    const modal = document.getElementById('inscriptionModal');
    modal.classList.remove('active');
    document.getElementById('inscriptionForm').reset();
    
    playSound('close');
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
    
    const id = currentGravestone.dataset.id;
    if (gravestones[id]) {
        gravestones[id].inscription = inscription;
    }
    
    updateGravestone(currentGravestone, inscription);
    saveGravestones();
    closeModal();
    
    playSound('inscribe');
    createFlowerBurst(currentGravestone);
});

function updateGravestone(stone, inscription) {
    const epitaphElement = stone.querySelector('.epitaph');
    const datesElement = stone.querySelector('.dates');
    
    epitaphElement.innerHTML = `${inscription.name}<br>${inscription.epitaph}`;
    datesElement.textContent = `${inscription.birthYear}-${inscription.deathYear}`;
    
    stone.classList.add('inscribed');
}

function saveGravestones() {
    localStorage.setItem('garden_gravestones', JSON.stringify(gravestones));
}

function loadGravestones() {
    const saved = localStorage.getItem('garden_gravestones');
    if (saved) {
        const loaded = JSON.parse(saved);
        Object.assign(gravestones, loaded);
        
        Object.entries(loaded).forEach(([id, data]) => {
            const container = document.getElementById('gravestones-container');
            
            const gravestone = document.createElement('div');
            gravestone.className = 'gravestone';
            gravestone.dataset.id = id;
            gravestone.style.left = data.x + 'px';
            gravestone.style.top = data.y + 'px';
            gravestone.style.width = data.width + 'px';
            gravestone.style.height = data.height + 'px';
            
            const stoneTop = document.createElement('div');
            stoneTop.className = 'stone-top';
            
            const stoneBody = document.createElement('div');
            stoneBody.className = 'stone-body';
            
            if (data.inscription) {
                stoneBody.innerHTML = `
                    <p class="epitaph">${data.inscription.name}<br>${data.inscription.epitaph}</p>
                    <p class="dates">${data.inscription.birthYear}-${data.inscription.deathYear}</p>
                `;
                gravestone.classList.add('inscribed');
            } else {
                stoneBody.innerHTML = `
                    <p class="epitaph">Click to inscribe...</p>
                    <p class="dates">????-????</p>
                `;
            }
            
            gravestone.appendChild(stoneTop);
            gravestone.appendChild(stoneBody);
            container.appendChild(gravestone);
            
            gravestone.addEventListener('click', () => openInscriptionModal(gravestone));
            
            const idNum = parseInt(id.split('_')[1]);
            if (idNum >= gravestoneIdCounter) {
                gravestoneIdCounter = idNum + 1;
            }
        });
    }
}

function createFlowerBurst(element) {
    const rect = element.getBoundingClientRect();
    const flowerCount = 8;
    
    for (let i = 0; i < flowerCount; i++) {
        const flower = document.createElement('div');
        flower.style.position = 'fixed';
        flower.style.left = rect.left + rect.width / 2 + 'px';
        flower.style.top = rect.top + rect.height / 2 + 'px';
        flower.style.width = '20px';
        flower.style.height = '20px';
        flower.style.background = `radial-gradient(circle, ${getRandomFlowerColor()} 30%, ${getRandomFlowerColor()} 100%)`;
        flower.style.borderRadius = '50%';
        flower.style.pointerEvents = 'none';
        flower.style.zIndex = '3000';
        document.body.appendChild(flower);
        
        const angle = (Math.PI * 2 * i) / flowerCount;
        const velocity = 2 + Math.random() * 2;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity - 2;
        
        let opacity = 1;
        let x = 0;
        let y = 0;
        let rotation = 0;
        
        const animate = () => {
            x += vx;
            y += vy + 0.5;
            opacity -= 0.015;
            rotation += 5;
            
            flower.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
            flower.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                flower.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
}

function getRandomFlowerColor() {
    const colors = ['#FFD700', '#FF69B4', '#DDA0DD', '#87CEEB', '#FFA500', '#FF1493', '#BA55D3', '#F0E68C'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function addBirds() {
    const birdSounds = ['tweet', 'chirp', 'whistle'];
    
    setInterval(() => {
        if (Math.random() < 0.3) {
            const bird = document.createElement('div');
            bird.style.position = 'fixed';
            bird.style.left = '-50px';
            bird.style.top = Math.random() * window.innerHeight * 0.3 + 'px';
            bird.style.width = '20px';
            bird.style.height = '10px';
            bird.style.background = '#333';
            bird.style.borderRadius = '50%';
            bird.style.zIndex = '500';
            bird.style.pointerEvents = 'none';
            document.body.appendChild(bird);
            
            const speed = 2 + Math.random() * 2;
            const waveAmplitude = 20 + Math.random() * 20;
            const waveFrequency = 0.01 + Math.random() * 0.02;
            let x = -50;
            const startY = parseFloat(bird.style.top);
            
            const fly = () => {
                x += speed;
                const y = startY + Math.sin(x * waveFrequency) * waveAmplitude;
                
                bird.style.left = x + 'px';
                bird.style.top = y + 'px';
                
                if (x < window.innerWidth + 50) {
                    requestAnimationFrame(fly);
                } else {
                    bird.remove();
                }
            };
            
            requestAnimationFrame(fly);
        }
    }, 5000);
}

function playSound(type) {
    const audio = new Audio();
    audio.volume = 0.2;
    
    const sounds = {
        open: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=',
        close: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=',
        inscribe: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA='
    };
    
    if (sounds[type]) {
        audio.src = sounds[type];
        audio.play().catch(() => {});
    }
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});