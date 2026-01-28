document.addEventListener('DOMContentLoaded', () => {
  // GSAP Setup
  gsap.registerPlugin(TextPlugin, ScrollTrigger);

  // Constants & Elements
  const card = document.getElementById('card');
  const openBtn = document.getElementById('open');
  const closeBtn = document.getElementById('close');
  const loader = document.getElementById('loader');
  const musicBtn = document.getElementById('music-toggle');
  const audio = document.getElementById('bg-music');
  const cursorLight = document.querySelector('.cursor-light');
  const endingScene = document.getElementById('ending-scene');
  const replayBtn = document.getElementById('replay-btn');
  const heartTrigger = document.getElementById('heart-trigger');
  const signature = document.getElementById('signature');

  const cardFront = document.getElementById('card-front');

  let isMusicPlaying = false;
  let isCardOpen = false;

  const colors = ['#ff4d6d', '#ff758f', '#ffb3c1', '#ffc8dd', '#fb6f92'];

  // 1. LOADING SCREEN
  window.addEventListener('load', () => {
    const tl = gsap.timeline();
    tl.to('.progress', { width: '100%', duration: 1.5, ease: 'power2.inOut' })
      .to(loader, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
          loader.style.display = 'none';
          startEntranceAnimations();
        }
      });
  });

  function startEntranceAnimations() {
    gsap.timeline()
      .from('.main-title', { y: 50, opacity: 0, duration: 1.2, ease: 'power4.out' })
      .from('.cake-container', { scale: 0, opacity: 0, duration: 1, ease: 'back.out(1.7)' }, "-=0.8")
      .from('.card-controls', { y: 20, opacity: 0, duration: 0.8 }, "-=0.5")
      .from('.audio-player', { x: -20, opacity: 0, duration: 0.8 }, "-=0.8");
  }

  // 2. 3D INTERACTION
  const handleMove = (x, y) => {
    if (window.innerWidth < 1024) return; // Only for desktop

    // Calculate rotation - less intense when card is open for better reading
    const factor = isCardOpen ? 60 : 40;
    const rx = (window.innerHeight / 2 - y) / factor;
    const ry = (x - window.innerWidth / 2) / factor;

    gsap.to(card, {
      rotationX: rx,
      rotationY: ry,
      duration: 0.7,
      ease: 'power2.out'
    });

    // Move light source
    gsap.to(cursorLight, { left: x, top: y, duration: 0.3 });

    // Subtle orb reaction
    gsap.to('.orb-1', { x: ry * 1.5, y: rx * 1.5, duration: 2 });
    gsap.to('.orb-2', { x: -ry * 1.5, y: -rx * 1.5, duration: 2 });
  };

  document.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));

  // Mobile Orientation
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
      if (!isCardOpen) {
        const x = (e.gamma || 0) * 2; // Left to right
        const y = (e.beta || 0) * 2;  // Front to back
        handleMove(window.innerWidth / 2 + x, window.innerHeight / 2 + y);
      }
    });
  }

  // 3. CARD OPEN/CLOSE (Human Flow)
  const openCard = () => {
    isCardOpen = true;
    card.classList.add('is-open');

    const tl = gsap.timeline();

    // SCALE UP: Make it "the whole page front of me"
    tl.to(card, { scale: 1.1, duration: 1.2, ease: 'power3.inOut' }, 0);

    // Animate the front cover specifically to reveal the inside
    tl.to(cardFront, { rotationY: -180, duration: 1.4, ease: 'power4.inOut' }, 0);

    // Reveal title
    tl.fromTo('.wish-title',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      "-=0.4"
    );

    // Staggered reveal of paragraphs
    tl.fromTo('.wish-text p',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.3, ease: 'power2.out' },
      "-=0.4"
    );

    // Signature
    tl.fromTo('#signature',
      { opacity: 0, scale: 0.9, filter: 'blur(5px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1, ease: 'back.out(2)' },
      "-=0.2"
    ).add(() => {
      heartTrigger.classList.add('heart-pulse');
      setTimeout(showFinalEnding, 3000);
    });
  };

  const closeCard = () => {
    isCardOpen = false;
    card.classList.remove('is-open');
    // Scale back down
    gsap.to(card, { scale: 1, duration: 1.2, ease: 'power3.inOut' });
    gsap.to(cardFront, { rotationY: 0, duration: 1.2, ease: 'power3.inOut' });
  };

  openBtn.addEventListener('click', openCard);
  closeBtn.addEventListener('click', closeCard);

  // 4. MODAL INTERACTIONS (LoveFunCode)
  const funModal = document.getElementById('fun-modal');
  const launchBtn = document.getElementById('launch-fun');
  const closeModalBtn = document.getElementById('close-modal');

  launchBtn.addEventListener('click', () => {
    funModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Disable scroll
  });

  closeModalBtn.addEventListener('click', () => {
    funModal.classList.remove('active');
    document.body.style.overflow = ''; // Enable scroll
    // Force reset iframe to stop music if any
    const iframe = document.getElementById('fun-iframe');
    const src = iframe.src;
    iframe.src = '';
    iframe.src = src;
  });

  // 5. SCROLL REVEAL FOR SURPRISE SECTION
  const surpriseSection = document.getElementById('fun-surprise');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        surpriseSection.classList.add('visible');
      }
    });
  }, { threshold: 0.2 });

  observer.observe(surpriseSection);

  // 6. MICRO-INTERACTIONS
  heartTrigger.addEventListener('click', () => {
    gsap.to(heartTrigger, {
      scale: 1.8,
      color: '#ff0000',
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        const msg = document.createElement('div');
        msg.innerText = "You are my everything! ✨";
        msg.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; background: #ff4d6d; padding: 15px 30px; border-radius: 50px; z-index: 3000; font-weight: 600; box-shadow: 0 10px 25px rgba(255, 77, 109, 0.4);`;
        document.body.appendChild(msg);
        gsap.from(msg, { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' });
        gsap.to(msg, { y: -40, opacity: 0, delay: 1.5, duration: 0.8, onComplete: () => msg.remove() });
      }
    });

    for (let i = 0; i < 10; i++) createSparkle(window.innerWidth / 2, window.innerHeight / 2);
  });

  // 5. FINAL SCENE TRIGGER
  function showFinalEnding() {
    if (!isCardOpen) return;
    endingScene.classList.add('active');
    gsap.from('.ending-content > *', {
      y: 20,
      opacity: 0,
      stagger: 0.2,
      duration: 0.8,
      ease: 'power3.out'
    });
  }

  replayBtn.addEventListener('click', () => {
    endingScene.classList.remove('active');
  });

  // 6. DECORATIONS
  function createParticles() {
    const container = document.getElementById('particles-container');
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.cssText = `position: absolute; width: ${Math.random() * 3 + 2}px; height: ${Math.random() * 3 + 2}px; background: white; opacity: ${Math.random() * 0.3 + 0.1}; border-radius: 50%; top: ${Math.random() * 100}%; left: ${Math.random() * 100}%; pointer-events: none;`;
      container.appendChild(p);
      animateParticle(p);
    }
  }

  function animateParticle(p) {
    gsap.to(p, {
      y: "-=150",
      x: `+=${Math.random() * 40 - 20}`,
      opacity: 0,
      duration: Math.random() * 5 + 3,
      onComplete: () => {
        p.style.top = '110%';
        p.style.left = `${Math.random() * 100}%`;
        p.style.opacity = Math.random() * 0.3 + 0.1;
        animateParticle(p);
      }
    });
  }

  function createSparkle(x, y) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    document.body.appendChild(s);
    const size = Math.random() * 6 + 4;
    gsap.set(s, { x, y, width: size, height: size, backgroundColor: colors[Math.floor(Math.random() * colors.length)], borderRadius: '50%', position: 'absolute', pointerEvents: 'none', zIndex: 9999 });
    gsap.to(s, { x: x + (Math.random() * 200 - 100), y: y + (Math.random() * 200 - 100), opacity: 0, scale: 0, duration: 1.2, ease: 'power2.out', onComplete: () => s.remove() });
  }

  createParticles();
  document.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
      createSparkle(e.pageX, e.pageY);
    }
  });

  // Music
  musicBtn.addEventListener('click', () => {
    const text = musicBtn.querySelector('.music-text');
    if (!isMusicPlaying) {
      audio.play().catch(() => { });
      text.textContent = 'Pause Music';
      musicBtn.classList.add('playing');
      isMusicPlaying = true;
    } else {
      audio.pause();
      text.textContent = 'Play Music';
      musicBtn.classList.remove('playing');
      isMusicPlaying = false;
    }
  });
});

