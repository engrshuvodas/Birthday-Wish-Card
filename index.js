document.addEventListener('DOMContentLoaded', () => {
  // GSAP Setup
  gsap.registerPlugin(TextPlugin, ScrollTrigger);

  const card = document.getElementById('card');
  const openBtn = document.getElementById('open');
  const closeBtn = document.getElementById('close');
  const loader = document.getElementById('loader');
  const musicBtn = document.getElementById('music-toggle');
  const audio = document.getElementById('bg-music');
  let isMusicPlaying = false;

  // Loading Screen Animation
  window.addEventListener('load', () => {
    const tl = gsap.timeline();

    tl.to('.progress', {
      width: '100%',
      duration: 1.5,
      ease: 'power2.inOut'
    })
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
    const tl = gsap.timeline();

    tl.from('.main-title', {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    })
      .from('.cake-container', {
        scale: 0,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.7)'
      }, "-=0.5")
      .from('.card-controls', {
        y: 20,
        opacity: 0,
        duration: 0.5
      }, "-=0.3")
      .from('.audio-player', {
        x: -20,
        opacity: 0,
        duration: 0.5
      }, "-=0.5");
  }

  // Card Interaction
  openBtn.addEventListener('click', () => {
    card.classList.add('is-open');

    // Staggered text reveal inside the card
    gsap.from('.wish-title', {
      y: 20,
      opacity: 0,
      duration: 0.8,
      delay: 0.5
    });

    gsap.from('.wish-text p', {
      y: 20,
      opacity: 0,
      stagger: 0.2,
      duration: 0.8,
      delay: 0.8
    });

    gsap.from('.signed', {
      opacity: 0,
      scale: 0.8,
      duration: 1,
      delay: 1.5,
      ease: 'back.out(2)'
    });
  });

  closeBtn.addEventListener('click', () => {
    card.classList.remove('is-open');
  });

  // 3D Tilt Effect on Mouse Move
  const cardWrapper = document.getElementById('card-wrapper');

  document.addEventListener('mousemove', (e) => {
    if (window.innerWidth < 850) return; // Disable on mobile

    const xAxis = (window.innerWidth / 2 - e.pageX) / 40;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 40;

    gsap.to(card, {
      rotationY: xAxis,
      rotationX: -yAxis,
      duration: 1,
      ease: 'power2.out'
    });

    // Move background orbs slightly for depth
    gsap.to('.orb-1', { x: xAxis * 2, y: yAxis * 2, duration: 2 });
    gsap.to('.orb-2', { x: -xAxis * 2, y: -yAxis * 2, duration: 2 });
  });

  // Reset rotation when mouse leaves
  cardWrapper.addEventListener('mouseleave', () => {
    gsap.to(card, {
      rotationY: 0,
      rotationX: 0,
      duration: 1.5,
      ease: 'elastic.out(1, 0.3)'
    });
  });

  // Music Control
  musicBtn.addEventListener('click', () => {
    const text = musicBtn.querySelector('.music-text');

    if (!isMusicPlaying) {
      audio.play().catch(e => console.log("Audio play blocked", e));
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

  // Simple Particles
  function createParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;

    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.cssText = `
                position: absolute;
                width: ${Math.random() * 5 + 2}px;
                height: ${Math.random() * 5 + 2}px;
                background: white;
                opacity: ${Math.random() * 0.5 + 0.2};
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                pointer-events: none;
            `;
      container.appendChild(p);

      animateParticle(p);
    }
  }

  function animateParticle(p) {
    gsap.to(p, {
      y: "-=100",
      x: `+=${Math.random() * 50 - 25}`,
      opacity: 0,
      duration: Math.random() * 3 + 2,
      ease: 'none',
      onComplete: () => {
        p.style.top = '100%';
        p.style.left = `${Math.random() * 100}%`;
        p.style.opacity = Math.random() * 0.5 + 0.2;
        animateParticle(p);
      }
    });
  }

  createParticles();

  // Click Sparkles
  document.addEventListener('click', (e) => {
    for (let i = 0; i < 8; i++) {
      createSparkle(e.pageX, e.pageY);
    }
  });

  function createSparkle(x, y) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    document.body.appendChild(s);

    const size = Math.random() * 10 + 5;
    const color = colors[Math.floor(Math.random() * colors.length)];

    gsap.set(s, {
      x: x,
      y: y,
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: '50%',
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: 9999
    });

    gsap.to(s, {
      x: x + (Math.random() * 200 - 100),
      y: y + (Math.random() * 200 - 100),
      opacity: 0,
      scale: 0,
      duration: Math.random() * 1 + 0.5,
      ease: 'power2.out',
      onComplete: () => s.remove()
    });
  }
  const colors = ['#ff4d6d', '#ff758f', '#ffb3c1', '#ffc8dd', '#fb6f92'];
});
