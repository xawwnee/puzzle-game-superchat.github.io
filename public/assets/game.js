    // Game State
    const blocks = [20, 30, 40, 50, 60, 70, 80, 90];
    let currentBlock = 0;
    let peerConnection = null;
    
    // DOM Elements
    const puzzleEl = document.getElementById('puzzle');
    const logEl = document.getElementById('log');
    const connectionStatusEl = document.getElementById('connectionStatus');
    
    // Initialize game with configuration
    function initGame() {
      const config = window.gameConfig;
      
      console.log("Initializing with config:", {
        ...config,
        YOUTUBE_API_KEY: config.YOUTUBE_API_KEY ? "***REDACTED***" : undefined
      });
    
      setupPeerConnection(config);
      renderPuzzle();
    }

    // PeerJS Connection Setup
    function setupPeerConnection(config) {
      const peer = new Peer({
        host: config.PEER_HOST,
        port: config.PEER_PORT,
        path: config.PEER_PATH,
        secure: window.location.protocol === 'https:'
      });
    
      peer.on('open', (id) => {
        updateConnectionStatus(true, `Connected as ${id}`);
      });
    
      peer.on('connection', (conn) => {
        peerConnection = conn;
        conn.on('data', handleIncomingData);
        conn.on('close', handleConnectionClose);
      });
    
      peer.on('error', handlePeerError);
    }

    // Game Functions
    function processSuperChat(name, amount) {
      const expected = blocks[currentBlock];
      
      if (amount === expected) {
        playSound('success');
        addToLog(`✅ ${name} unlocked ₹${amount}`, '#4CAF50');
        showNotification(`✅ ${name} unlocked ₹${amount}`, '#4CAF50');
        currentBlock++;
        flipCurrentBlock();
        
        if (amount === 50 || amount === 90) {
          playSound('win');
          launchConfetti();
          addToLog(`🎉 ${name} won ₹${amount * 2}`, '#4CAF50');
          showNotification(`🎉 ${name} won ₹${amount * 2}`, '#4CAF50');
        }
      } else {
        playSound('error');
        addToLog(`❌ ${name} sent ₹${amount}`, '#F44336');
        showNotification(`❌ ${name} sent ₹${amount}`, '#F44336');
        showHint();
      }
    }

    function renderPuzzle() {
      puzzleEl.innerHTML = '';
      blocks.forEach((val, i) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'block';
        if (i < currentBlock) {
          wrapper.classList.add('flipped');
        }

        const inner = document.createElement('div');
        inner.className = 'block-inner';

        const front = document.createElement('div');
        front.className = 'block-front';
        front.textContent = '₹' + val;

        const back = document.createElement('div');
        back.className = 'block-back';
        back.textContent = '₹' + val;

        inner.appendChild(front);
        inner.appendChild(back);
        wrapper.appendChild(inner);
        puzzleEl.appendChild(wrapper);
      });
    }

    function flipCurrentBlock() {
      if (currentBlock > 0) {
        const blockToFlip = puzzleEl.children[currentBlock - 1];
        blockToFlip.classList.add('flipped');
      }
    }

    function showHint() {
      if (currentBlock < blocks.length) {
        const nextBlock = puzzleEl.children[currentBlock];
        nextBlock.classList.add('hint');
        setTimeout(() => {
          nextBlock.classList.remove('hint');
        }, 1000);
      }
    }

    function showNotification(msg, color) {
      const note = document.createElement('div');
      note.className = 'notification';
      note.style.background = color;
      note.innerText = msg;
      document.body.appendChild(note);
      setTimeout(() => note.remove(), 3000);
    }

    function addToLog(msg, color) {
      const li = document.createElement('li');
      li.style.color = color;
      li.textContent = msg;
      logEl.insertBefore(li, logEl.firstChild);
      
      // Keep only the last 5 messages
      if (logEl.children.length > 5) {
        logEl.removeChild(logEl.lastChild);
      }
    }

    function playSound(type) {
      const sound = document.getElementById(`${type}Sound`);
      sound.currentTime = 0;
      sound.play().catch(e => console.log("Audio play failed:", e));
    }

    function launchConfetti() {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Initialize game
    renderPuzzle();
    initPeerConnection();

    // Export for debugging
    window.game = {
      config,
      processSuperChat,
      currentBlock: () => currentBlock
    };

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', initGame);
