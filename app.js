// Time Travel Message - Send messages through time

// State
let capsules = [];
let currentMode = 'send';

// Time quotes
const quotes = [
    { text: "The only reason for time is so that everything doesn't happen at once.", author: "Albert Einstein" },
    { text: "Time is what we want most, but what we use worst.", author: "William Penn" },
    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
    { text: "Yesterday is history, tomorrow is a mystery, today is a gift.", author: "Eleanor Roosevelt" },
    { text: "Time flies over us, but leaves its shadow behind.", author: "Nathaniel Hawthorne" },
    { text: "Lost time is never found again.", author: "Benjamin Franklin" },
];

// Initialize
function init() {
    loadCapsules();
    createStars();
    setRandomQuote();
    setupEventListeners();
    setDefaultDate();
    updateCapsuleStats();
    checkForReadyCapsules();
}

function createStars() {
    const container = document.getElementById('stars');
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = (Math.random() * 3 + 1) + 'px';
        star.style.height = star.style.width;
        star.style.animationDelay = Math.random() * 3 + 's';
        container.appendChild(star);
    }
}

function setRandomQuote() {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('time-quote').textContent = `"${quote.text}"`;
    document.querySelector('cite').textContent = `— ${quote.author}`;
}

function setDefaultDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30);
    document.getElementById('delivery-date').valueAsDate = tomorrow;
}

function setupEventListeners() {
    // Mode switching
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            switchMode(btn.dataset.mode);
        });
    });

    // Time presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const days = btn.dataset.days;
            if (days !== 'custom') {
                const date = new Date();
                date.setDate(date.getDate() + parseInt(days));
                document.getElementById('delivery-date').valueAsDate = date;
            }
        });
    });

    // Send message
    document.getElementById('send-btn').addEventListener('click', sendMessage);

    // Modal close
    document.getElementById('close-modal').addEventListener('click', closeModal);
}

function switchMode(mode) {
    currentMode = mode;
    document.getElementById('send-section').style.display = mode === 'send' ? 'block' : 'none';
    document.getElementById('receive-section').style.display = mode === 'receive' ? 'block' : 'none';
    document.getElementById('past-section').style.display = mode === 'past' ? 'block' : 'none';

    if (mode === 'receive') {
        renderCapsules();
    } else if (mode === 'past') {
        showPastMessages();
    }
}

function sendMessage() {
    const message = document.getElementById('message-input').value.trim();
    const deliveryDate = document.getElementById('delivery-date').value;
    const email = document.getElementById('email-input').value.trim();
    const surprise = document.getElementById('surprise-me').checked;

    if (!message) {
        alert('Please write a message first!');
        return;
    }

    if (!deliveryDate) {
        alert('Please select a delivery date!');
        return;
    }

    const capsule = {
        id: Date.now(),
        message,
        email,
        createdAt: new Date().toISOString(),
        deliveryDate,
        surprise,
        opened: false
    };

    capsules.push(capsule);
    saveCapsules();
    updateCapsuleStats();

    // Show confirmation
    const sentOverlay = document.getElementById('sent-overlay');
    const deliveryInfo = document.getElementById('delivery-info');
    
    if (surprise) {
        deliveryInfo.textContent = 'It will arrive when the time is right...';
    } else {
        const date = new Date(deliveryDate);
        deliveryInfo.textContent = `Arriving on ${date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}`;
    }
    
    sentOverlay.style.display = 'flex';

    // Clear form
    document.getElementById('message-input').value = '';
}

function closeSent() {
    document.getElementById('sent-overlay').style.display = 'none';
}
window.closeSent = closeSent;

function updateCapsuleStats() {
    const now = new Date();
    let waiting = 0, ready = 0, opened = 0;

    capsules.forEach(c => {
        if (c.opened) {
            opened++;
        } else if (new Date(c.deliveryDate) <= now) {
            ready++;
        } else {
            waiting++;
        }
    });

    document.getElementById('waiting-count').textContent = waiting;
    document.getElementById('ready-count').textContent = ready;
    document.getElementById('opened-count').textContent = opened;
}

function renderCapsules() {
    const list = document.getElementById('capsules-list');
    const now = new Date();

    if (capsules.length === 0) {
        list.innerHTML = '<p class="empty-state">No time capsules yet. Send a message to your future self!</p>';
        return;
    }

    // Sort by delivery date
    const sorted = [...capsules].sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));

    list.innerHTML = sorted.map(capsule => {
        const isReady = new Date(capsule.deliveryDate) <= now && !capsule.opened;
        const isOpened = capsule.opened;
        const deliveryDate = new Date(capsule.deliveryDate);
        
        let statusText, icon;
        if (isOpened) {
            statusText = `Opened on ${new Date(capsule.openedAt).toLocaleDateString()}`;
            icon = '📜';
        } else if (isReady) {
            statusText = '✨ Ready to open!';
            icon = '🎁';
        } else {
            if (capsule.surprise) {
                statusText = 'Traveling through time...';
            } else {
                const daysUntil = Math.ceil((deliveryDate - now) / (1000 * 60 * 60 * 24));
                statusText = `Arrives in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
            }
            icon = '⏳';
        }

        return `
            <div class="capsule ${isReady ? 'ready' : ''}">
                <span class="capsule-icon">${icon}</span>
                <div class="capsule-info">
                    <div class="capsule-preview">${capsule.message.substring(0, 50)}${capsule.message.length > 50 ? '...' : ''}</div>
                    <div class="capsule-status">${statusText}</div>
                </div>
                ${isReady || isOpened ? 
                    `<button class="capsule-btn open" onclick="openCapsule(${capsule.id})">📖 ${isOpened ? 'Read Again' : 'Open'}</button>` : 
                    `<button class="capsule-btn waiting" disabled>⏳ Wait</button>`
                }
                <button class="capsule-btn delete" onclick="deleteCapsule(${capsule.id})">🗑️</button>
            </div>
        `;
    }).join('');
}

function openCapsule(id) {
    const capsule = capsules.find(c => c.id === id);
    if (!capsule) return;

    // Mark as opened
    if (!capsule.opened) {
        capsule.opened = true;
        capsule.openedAt = new Date().toISOString();
        saveCapsules();
        updateCapsuleStats();
    }

    // Show in modal
    const createdDate = new Date(capsule.createdAt);
    document.getElementById('modal-date').textContent = createdDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('modal-body').textContent = capsule.message;
    document.getElementById('message-modal').classList.add('show');
}
window.openCapsule = openCapsule;

function deleteCapsule(id) {
    if (!confirm('Are you sure you want to delete this time capsule?')) return;
    capsules = capsules.filter(c => c.id !== id);
    saveCapsules();
    updateCapsuleStats();
    renderCapsules();
}
window.deleteCapsule = deleteCapsule;

function closeModal() {
    document.getElementById('message-modal').classList.remove('show');
}

function showPastMessages() {
    const container = document.getElementById('past-messages');
    const now = new Date();
    
    // Get opened capsules or ready-to-open ones
    const pastMessages = capsules.filter(c => 
        c.opened || new Date(c.deliveryDate) <= now
    ).sort((a, b) => new Date(b.deliveryDate) - new Date(a.deliveryDate));

    if (pastMessages.length === 0) {
        // Show "scanning" effect
        setTimeout(() => {
            container.innerHTML = `
                <div class="past-message">
                    <p class="date">From the quantum void...</p>
                    <p class="content">No messages have arrived yet. Your future self is waiting to hear from you!</p>
                </div>
            `;
        }, 2000);
        return;
    }

    // Simulate "receiving" effect
    setTimeout(() => {
        container.innerHTML = pastMessages.map(msg => `
            <div class="past-message">
                <p class="date">📅 Written on ${new Date(msg.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}</p>
                <p class="content">${msg.message}</p>
            </div>
        `).join('');
    }, 2000);
}

function checkForReadyCapsules() {
    const now = new Date();
    const ready = capsules.filter(c => !c.opened && new Date(c.deliveryDate) <= now);
    
    if (ready.length > 0) {
        // Could trigger notification here
        console.log(`${ready.length} time capsule(s) ready to open!`);
    }
}

// Persistence
function saveCapsules() {
    localStorage.setItem('timetravelmessage-capsules', JSON.stringify(capsules));
}

function loadCapsules() {
    const saved = localStorage.getItem('timetravelmessage-capsules');
    if (saved) {
        capsules = JSON.parse(saved);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', init);
