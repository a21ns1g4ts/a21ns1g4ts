// Matrix effect + countdown + phrases + explosion
(function () {
  const DURATION = 15; // Adjusted time for the game
  const HACKS_NEEDED = 3;

  let timeLeft = DURATION;
  let intervalId, clockSound;
  let hacksCount = 0;
  let gameActive = true;
  let glitches = []; // {x, y, char, life, maxLife}

  // Audio Context for generated sounds
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // Pre-create and attempt to play audio immediately
  clockSound = new Audio('/assets/clock-noise-188047.mp3');
  clockSound.loop = true;
  clockSound.volume = 0.5;

  function tryPlayAudio() {
    clockSound.play().catch((e) => {
      console.log('Clock audio playback failed:', e);
      // Autoplay policy fallback
      const playOnInteract = () => {
        if (gameActive)
          clockSound
            .play()
            .catch((err) => console.log('Retry play failed', err));
        if (audioCtx.state === 'suspended') audioCtx.resume();

        ['click', 'keydown', 'mousemove', 'touchstart'].forEach((evt) =>
          document.removeEventListener(evt, playOnInteract)
        );
      };

      ['click', 'keydown', 'mousemove', 'touchstart'].forEach((evt) =>
        document.addEventListener(evt, playOnInteract, { once: true })
      );
    });
  }

  tryPlayAudio();

  function $(s) {
    return document.querySelector(s);
  }

  function playBeep(freq = 600, type = 'square', dur = 0.1) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  }

  function initCanvas() {
    const canvas = $('#matrix-canvas');
    const ctx = canvas.getContext('2d');
    let cols = [];
    let fontSize = 16;

    function resize() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      const columns = Math.floor(canvas.width / fontSize);
      cols = new Array(columns).fill(0);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = fontSize + 'px monospace';
    }
    window.addEventListener('resize', resize);
    resize();

    // Custom cursors
    const AIM_CURSOR =
      'url(\'data:image/svg+xml;utf8,<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="12" stroke="%2339ff14" stroke-width="2" fill="none"/><line x1="16" y1="0" x2="16" y2="32" stroke="%2339ff14" stroke-width="2"/><line x1="0" y1="16" x2="32" y2="16" stroke="%2339ff14" stroke-width="2"/></svg>\') 16 16, crosshair';
    const AIM_CURSOR_HIT =
      'url(\'data:image/svg+xml;utf8,<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="12" stroke="%23ff0033" stroke-width="2" fill="none"/><line x1="16" y1="0" x2="16" y2="32" stroke="%23ff0033" stroke-width="2"/><line x1="0" y1="16" x2="32" y2="16" stroke="%23ff0033" stroke-width="2"/></svg>\') 16 16, crosshair';

    // Handle mouse move for cursor effect
    canvas.addEventListener('mousemove', (e) => {
      if (!gameActive) {
        canvas.style.cursor = 'default';
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const hitIndex = glitches.findIndex((g) => {
        return (
          Math.abs(mouseX - g.x) < fontSize * 2.5 &&
          Math.abs(mouseY - g.y) < fontSize * 2.5
        );
      });

      canvas.style.cursor = hitIndex !== -1 ? AIM_CURSOR_HIT : AIM_CURSOR;
    });

    // Handle clicks on canvas
    canvas.addEventListener('mousedown', (e) => {
      if (!gameActive) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Check collision with glitches
      // Hitbox is roughly fontSize x fontSize around the glitch
      const hitIndex = glitches.findIndex((g) => {
        return (
          Math.abs(clickX - g.x) < fontSize * 2.5 &&
          Math.abs(clickY - g.y) < fontSize * 2.5
        );
      });

      if (hitIndex !== -1) {
        // Hit!
        glitches.splice(hitIndex, 1);
        hacksCount++;
        playBeep(1200, 'sawtooth', 0.15); // High pitch success beep
        updateStatus();

        if (hacksCount >= HACKS_NEEDED) {
          disarmBomb();
        }
      }
    });

    const letters = '01     ZXCVBNMASDFGHJKLQWERTYUIOPzxcvbnm0123456789';

    function draw() {
      if (!gameActive && hacksCount < HACKS_NEEDED) return; // Stop drawing if exploded, keep drawing if won (maybe?)

      // Semi-transparent black to create trail
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Matrix Rain
      ctx.fillStyle = '#39ff14'; // Matrix Green
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < cols.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));
        const x = i * fontSize;
        const y = cols[i] * fontSize;

        // Randomly spawn a glitch here if none exists close by
        if (gameActive && Math.random() > 0.995 && glitches.length < 5) {
          glitches.push({
            x: x,
            y: y,
            char: '▓', // Glitch character
            life: 90, // frames
            maxLife: 90
          });
        }

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) cols[i] = 0;
        else cols[i]++;
      }

      // Draw Glitches
      if (gameActive) {
        for (let i = glitches.length - 1; i >= 0; i--) {
          const g = glitches[i];
          g.life--;
          if (g.life <= 0) {
            glitches.splice(i, 1);
            continue;
          }

          // Flicker effect
          ctx.fillStyle = Math.random() > 0.5 ? '#ff0033' : '#ffffff';
          ctx.font = 'bold ' + (fontSize + 2) + 'px monospace';
          ctx.fillText(g.char, g.x, g.y);

          // Reset font
          ctx.font = fontSize + 'px monospace';
        }
      }

      // Draw HUD
      if (gameActive) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(10, 10, 280, 70);
        ctx.strokeStyle = '#39ff14';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, 280, 70);

        ctx.fillStyle = '#39ff14';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(`SYSTEM HACKS: ${hacksCount}/${HACKS_NEEDED}`, 25, 35);

        ctx.fillStyle = '#ff0033';
        ctx.fillText(`MISSION: CLICK RED FLAGS`, 25, 60);
      }

      requestAnimationFrame(draw);
    }
    draw();
  }

  function updateStatus() {
    // Optional: Update HTML UI if we had one, currently using Canvas HUD
  }

  function disarmBomb() {
    gameActive = false;
    clearInterval(intervalId);
    if (clockSound) {
      clockSound.pause();
      clockSound.currentTime = 0;
    }

    playBeep(800, 'sine', 0.1);
    setTimeout(() => playBeep(1200, 'sine', 0.2), 100);
    setTimeout(() => playBeep(2000, 'sine', 0.4), 300);

    // Show Access Granted
    const ui = $('#matrix-ui');
    ui.innerHTML =
      '<h1 style="color:#39ff14; font-family:monospace; font-size: 3rem; text-shadow: 0 0 10px #39ff14;">ACCESS GRANTED</h1>';

    setTimeout(() => {
      const overlay = $('#matrix-overlay');
      overlay.style.transition = 'opacity 1s ease';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
        document.body.classList.remove('no-scroll'); // Re-enable scrolling
      }, 1000);
    }, 1500);
  }

  function startCountdown() {
    intervalId = setInterval(() => {
      if (!gameActive) return;
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(intervalId);
        if (clockSound) {
          clockSound.pause();
          clockSound.currentTime = 0;
        }
        triggerExplosion();
      }
    }, 1000);
  }

  function triggerExplosion() {
    gameActive = false;
    const ex = $('#explosion');
    ex.setAttribute('aria-hidden', 'false');
    ex.classList.add('explode');

    const explosionSound = new Audio(
      '/assets/large-underwater-explosion-190270.mp3'
    );
    explosionSound.volume = 0.7;
    explosionSound
      .play()
      .catch((e) => console.log('Audio playback failed:', e));

    // short flash effect on body
    document.body.style.transition = 'background .1s';
    document.body.style.background = '#ff0000'; // Red flash

    // Close/Redirect faster
    setTimeout(() => {
      try {
        window.close();
      } catch (e) {}
      setTimeout(() => {
        try {
          window.location.href = 'about:blank';
        } catch (e) {
          document.documentElement.innerHTML =
            '<div style="background:black;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace;">BOOM. Connection Lost.</div>';
        }
      }, 100);
    }, 0); // Immediate close
  }

  document.addEventListener('DOMContentLoaded', () => {
    const overlay = $('#matrix-overlay');
    if (!overlay) return;
    document.body.classList.add('no-scroll'); // Prevent scrolling during game
    initCanvas();
    startCountdown();
  });
})();
