let currentGravestone = null;
const inscriptions = {};

document.addEventListener('DOMContentLoaded', () => {
    loadInscriptions();
    setupGravestones();
    updateVisitorCount();
    addSpookyEffects();
});

function setupGravestones() {
    const gravestones = document.querySelectorAll('.gravestone');
    gravestones.forEach(stone => {
        stone.addEventListener('click', () => openInscriptionModal(stone));
        
        const id = stone.dataset.id;
        if (inscriptions[id]) {
            updateGravestone(stone, inscriptions[id]);
        }
    });
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
    inscriptions[id] = inscription;
    
    updateGravestone(currentGravestone, inscription);
    saveInscriptions();
    closeModal();
    
    playSound('inscribe');
    createParticles(currentGravestone);
});

function updateGravestone(stone, inscription) {
    const epitaphElement = stone.querySelector('.epitaph');
    const datesElement = stone.querySelector('.dates');
    
    epitaphElement.innerHTML = `${inscription.name}<br>${inscription.epitaph}`;
    datesElement.textContent = `${inscription.birthYear}-${inscription.deathYear}`;
    
    stone.classList.add('inscribed');
}

function saveInscriptions() {
    localStorage.setItem('graveyard_inscriptions', JSON.stringify(inscriptions));
}

function loadInscriptions() {
    const saved = localStorage.getItem('graveyard_inscriptions');
    if (saved) {
        Object.assign(inscriptions, JSON.parse(saved));
    }
}

function updateVisitorCount() {
    let count = parseInt(localStorage.getItem('visitor_count') || '666');
    count++;
    localStorage.setItem('visitor_count', count);
    document.getElementById('visitorCount').textContent = count.toString().padStart(5, '0');
}

function addSpookyEffects() {
    setInterval(() => {
        const random = Math.random();
        if (random < 0.1) {
            flicker();
        }
    }, 3000);
    
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        document.querySelectorAll('.gravestone').forEach((stone, index) => {
            const offsetX = (x - 0.5) * 10 * (index % 2 ? 1 : -1);
            const offsetY = (y - 0.5) * 5;
            stone.style.transform = `translateX(${offsetX}px) translateY(${offsetY}px)`;
        });
    });
}

function flicker() {
    document.body.style.filter = 'brightness(0.8)';
    setTimeout(() => {
        document.body.style.filter = 'brightness(1)';
    }, 100);
}

function createParticles(element) {
    const rect = element.getBoundingClientRect();
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = rect.left + rect.width / 2 + 'px';
        particle.style.top = rect.top + rect.height / 2 + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = '#7FFF00';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '3000';
        document.body.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 2 + Math.random() * 3;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let opacity = 1;
        let x = 0;
        let y = 0;
        
        const animate = () => {
            x += vx;
            y += vy;
            opacity -= 0.02;
            
            particle.style.transform = `translate(${x}px, ${y}px)`;
            particle.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
}

function playSound(type) {
    const audio = new Audio();
    audio.volume = 0.3;
    
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