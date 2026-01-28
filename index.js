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
  const revealSurpriseBtn = document.getElementById('reveal-surprise-btn');

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
    if (!isCardOpen) {
      // Very subtle hover effect when closed
      const rx = (window.innerHeight / 2 - y) / 50;
      const ry = (x - window.innerWidth / 2) / 50;
      gsap.to(card, {
        rotationX: rx,
        rotationY: ry,
        duration: 0.7,
        ease: 'power2.out'
      });
    } else {
      // Even subtler when open to keep text readable
      const rx = (window.innerHeight / 2 - y) / 100;
      const ry = (x - window.innerWidth / 2) / 100;
      gsap.to(card, {
        rotationX: rx + 5, // 5deg base tilt
        rotationY: ry,
        duration: 0.7,
        ease: 'power2.out'
      });
    }

    // Move light source
    gsap.to(cursorLight, { left: x, top: y, duration: 0.3 });

    // Subtle orb reaction
    gsap.to('.orb-1', { x: (x - window.innerWidth / 2) * 0.05, y: (y - window.innerHeight / 2) * 0.05, duration: 2 });
    gsap.to('.orb-2', { x: (window.innerWidth / 2 - x) * 0.05, y: (window.innerHeight / 2 - y) * 0.05, duration: 2 });
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
  // Typing Animation Configuration
  const typingConfig = {
    lines: [
      "You've been with me through my best days and my hardest ones — and I can't imagine life without you.",
      "On your special day, I just want you to feel how deeply loved and appreciated you truly are.",
      "You deserve all the joy in the world, today and always."
    ],
    duration: 1.5, // Faster typing for better UX
    pauseBetweenLines: 0.4
  };

  function startTypingAnimation() {
    const tl = gsap.timeline({
      onComplete: () => {
        // Show the manual surprise button after typing is done
        gsap.to(revealSurpriseBtn, {
          display: 'flex',
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'back.out(1.7)'
        });
      }
    });

    typingConfig.lines.forEach((line, index) => {
      const elementId = `line-${index + 1}`;
      const el = document.getElementById(elementId);

      tl.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out'
      })
        .add(() => el.classList.add('typing-active'))
        .to(el, {
          duration: line.length * 0.04, // Dynamic duration based on length
          text: line,
          ease: 'none'
        })
        .add(() => el.classList.remove('typing-active'), `+=${typingConfig.pauseBetweenLines}`);
    });

    return tl;
  }

  const openCard = () => {
    isCardOpen = true;
    card.classList.add('is-open');
    document.body.classList.add('card-is-open');

    const tl = gsap.timeline(); // Remove delay for instant response

    // SCALE UP & OPEN: Smooth 1.4 second duration for a premium feel
    tl.to(card, { scale: 1.1, duration: 1.4, ease: 'power3.inOut' }, 0);
    tl.to(cardFront, { rotationY: -180, duration: 1.4, ease: 'power4.inOut' }, 0);

    // Reveal title
    tl.fromTo('.wish-title',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      "-=0.4"
    );

    // Start typing animation
    tl.add(() => {
      startTypingAnimation();
    }, "-=0.2");

    // Signature (reveals after title, but before typing finishes)
    tl.fromTo('.signed',
      { opacity: 0, y: 10, filter: 'blur(5px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power2.out' },
      "-=0.2"
    ).add(() => {
      heartTrigger.classList.add('heart-pulse');
    });
  };

  const closeCard = () => {
    isCardOpen = false;
    card.classList.remove('is-open');
    document.body.classList.remove('card-is-open');
    // Scale back down instantly but smoothly (1.4s)
    gsap.to(card, { scale: 1, duration: 1.4, ease: 'power3.inOut' });
    gsap.to(cardFront, { rotationY: 0, duration: 1.4, ease: 'power3.inOut' });
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

  revealSurpriseBtn.addEventListener('click', () => {
    window.location.href = 'bbd.html';
  });

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

