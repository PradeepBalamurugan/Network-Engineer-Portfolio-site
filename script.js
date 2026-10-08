/**
 * PRADEEP BALAMURUGAN - NETWORK ENGINEER PORTFOLIO
 * Vanilla JavaScript (ES6+) - Zero External Dependencies
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. Dynamic Year in Footer
  // -------------------------------------------------------------------------
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // -------------------------------------------------------------------------
  // 2. Sticky Header Styling on Scroll
  // -------------------------------------------------------------------------
  const header = document.getElementById('site-header');
  const handleHeaderScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // -------------------------------------------------------------------------
  // 3. Mobile Navigation Menu Toggle
  // -------------------------------------------------------------------------
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navbar = document.getElementById('navbar');
  const navBackdrop = document.getElementById('nav-backdrop');
  const navLinks = document.querySelectorAll('.nav-link');

  const openMobileMenu = () => {
    hamburgerBtn.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    navbar.classList.add('open');
    navBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileMenu = () => {
    hamburgerBtn.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    navbar.classList.remove('open');
    navBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (hamburgerBtn && navbar) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = navbar.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    if (navBackdrop) {
      navBackdrop.addEventListener('click', closeMobileMenu);
    }

    // Auto-close menu when clicking any nav link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Close on Escape key press
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navbar.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }

  // -------------------------------------------------------------------------
  // 4. Active Navigation State Tracking via IntersectionObserver
  // -------------------------------------------------------------------------
  const trackedSections = document.querySelectorAll('section[id]');
  const navLinksMap = new Map();

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      const id = href.substring(1);
      navLinksMap.set(id, link);
    }
  });

  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -65% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach(link => link.classList.remove('active'));
          
          if (navLinksMap.has(currentId)) {
            navLinksMap.get(currentId).classList.add('active');
          }
        }
      });
    }, observerOptions);

    trackedSections.forEach(section => {
      sectionObserver.observe(section);
    });
  }

  // -------------------------------------------------------------------------
  // 5. Scroll Reveal Animations via IntersectionObserver
  // -------------------------------------------------------------------------
  const elementsToReveal = document.querySelectorAll(
    '.tech-card, .role-card, .timeline-item, .goal-highlight-box, .section-header, .resume-cta-box'
  );

  elementsToReveal.forEach(el => {
    el.classList.add('reveal-on-scroll');
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    elementsToReveal.forEach(el => {
      revealObserver.observe(el);
    });
  } else {
    // Fallback for older browsers
    elementsToReveal.forEach(el => el.classList.add('is-revealed'));
  }

  // -------------------------------------------------------------------------
  // 6. Scroll-To-Top Button
  // -------------------------------------------------------------------------
  const scrollToTopBtn = document.getElementById('scroll-to-top');
  if (scrollToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // -------------------------------------------------------------------------
  // 7. Contact Form Handling (Resend Email Integration)
  // -------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');
  const submitBtnText = document.getElementById('submit-btn-text');

  if (contactForm) {
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    const honeypotInput = document.getElementById('contact-hp');

    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const messageError = document.getElementById('message-error');

    const validateEmail = (email) => {
      return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(email);
    };

    const showStatus = (message, type) => {
      if (!formStatus) return;
      formStatus.className = `form-status ${type}`;
      formStatus.textContent = message;
      formStatus.style.display = 'flex';
    };

    const clearStatus = () => {
      if (!formStatus) return;
      formStatus.className = 'form-status';
      formStatus.textContent = '';
      formStatus.style.display = 'none';
    };

    // Clear status and field errors as user corrects inputs
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        clearStatus();
        if (nameInput.value.trim().length >= 2) nameError?.classList.remove('active');
      });
    }

    if (emailInput) {
      emailInput.addEventListener('input', () => {
        clearStatus();
        if (validateEmail(emailInput.value.trim())) emailError?.classList.remove('active');
      });
    }

    if (messageInput) {
      messageInput.addEventListener('input', () => {
        clearStatus();
        if (messageInput.value.trim().length >= 10) messageError?.classList.remove('active');
      });
    }

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearStatus();

      const nameVal = nameInput ? nameInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const messageVal = messageInput ? messageInput.value.trim() : '';
      const gotchaVal = honeypotInput ? honeypotInput.value.trim() : '';

      let isValid = true;

      // Validate Name (Required, 2 - 100 characters)
      if (!nameVal || nameVal.length < 2 || nameVal.length > 100) {
        if (nameError) {
          nameError.textContent = !nameVal ? 'Please enter your name.' : 'Name must be between 2 and 100 characters.';
          nameError.classList.add('active');
        }
        isValid = false;
      } else {
        nameError?.classList.remove('active');
      }

      // Validate Email (Required, valid email format)
      if (!emailVal || !validateEmail(emailVal)) {
        if (emailError) {
          emailError.textContent = 'Please enter a valid email address.';
          emailError.classList.add('active');
        }
        isValid = false;
      } else {
        emailError?.classList.remove('active');
      }

      // Validate Message (Required, 10 - 5000 characters)
      if (!messageVal || messageVal.length < 10 || messageVal.length > 5000) {
        if (messageError) {
          messageError.textContent = !messageVal ? 'Please enter a message.' : 'Message must be at least 10 characters.';
          messageError.classList.add('active');
        }
        isValid = false;
      } else {
        messageError?.classList.remove('active');
      }

      if (!isValid) return;

      // Show Sending... and disable button
      const originalText = submitBtnText ? submitBtnText.textContent : 'Send Message';
      if (submitBtn) submitBtn.disabled = true;
      if (submitBtnText) submitBtnText.textContent = 'Sending...';

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: nameVal,
            email: emailVal,
            message: messageVal,
            _gotcha: gotchaVal
          })
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok && result.success) {
          // Success message: Thanks! Your message has been sent successfully.
          showStatus('Thanks! Your message has been sent successfully.', 'success');
          // Clear form only on success
          contactForm.reset();
        } else {
          // Error message: Sorry, your message could not be sent. Please try again.
          const errorMsg = result.message || 'Sorry, your message could not be sent. Please try again.';
          showStatus(errorMsg, 'error');
        }
      } catch (err) {
        // Network or fetch failure
        showStatus('Sorry, your message could not be sent. Please try again.', 'error');
      } finally {
        // Re-enable button and restore label
        if (submitBtn) submitBtn.disabled = false;
        if (submitBtnText) submitBtnText.textContent = originalText;
      }
    });
  }

  // -------------------------------------------------------------------------
  // 8. Subtle Network Topology Background Canvas (Pure Vanilla JS)
  // -------------------------------------------------------------------------
  const canvas = document.getElementById('network-canvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let animationFrameId = null;
    let isCanvasVisible = true;

    // Node configuration
    const nodes = [];
    const NODE_COUNT_DESKTOP = 42;
    const NODE_COUNT_MOBILE = 20;
    const MAX_DISTANCE = 140;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      const count = width < 768 ? NODE_COUNT_MOBILE : NODE_COUNT_DESKTOP;
      nodes.length = 0;

      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: Math.random() * 1.8 + 1,
          isHub: i % 7 === 0 // occasional larger router hub
        });
      }
    };

    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();

    const drawNetwork = () => {
      if (!isCanvasVisible) return;

      ctx.clearRect(0, 0, width, height);

      // Draw links between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];

        // Move node
        nodeA.x += nodeA.vx;
        nodeA.y += nodeA.vy;

        // Bounce at boundaries
        if (nodeA.x < 0 || nodeA.x > width) nodeA.vx *= -1;
        if (nodeA.y < 0 || nodeA.y > height) nodeA.vy *= -1;

        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MAX_DISTANCE) {
            const alpha = (1 - dist / MAX_DISTANCE) * 0.22;
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.strokeStyle = `rgba(14, 165, 233, ${alpha})`;
            ctx.lineWidth = nodeA.isHub || nodeB.isHub ? 1.2 : 0.75;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.isHub ? n.radius + 1.5 : n.radius, 0, Math.PI * 2);
        
        if (n.isHub) {
          ctx.fillStyle = '#10b981'; // Green hub
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#10b981';
        } else {
          ctx.fillStyle = '#38bdf8'; // Sky cyan node
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#38bdf8';
        }
        
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      animationFrameId = requestAnimationFrame(drawNetwork);
    };

    // Pause animation when page is not visible to conserve battery/CPU
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isCanvasVisible = false;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      } else {
        isCanvasVisible = true;
        animationFrameId = requestAnimationFrame(drawNetwork);
      }
    });

    animationFrameId = requestAnimationFrame(drawNetwork);
  }

  // -------------------------------------------------------------------------
  // 9. Graceful Image Error Fallbacks
  // -------------------------------------------------------------------------
  const allImages = document.querySelectorAll('img');
  allImages.forEach(img => {
    img.addEventListener('error', function() {
      // In case an image file is moved or deleted, provide a styled fallback
      this.style.display = 'none';
      const parent = this.parentElement;
      if (parent && !parent.querySelector('.img-missing-fallback')) {
        const fallback = document.createElement('div');
        fallback.className = 'img-missing-fallback';
        fallback.style.padding = '30px';
        fallback.style.textAlign = 'center';
        fallback.style.backgroundColor = '#0b1120';
        fallback.style.border = '1px dashed #38bdf8';
        fallback.style.borderRadius = '6px';
        fallback.style.color = '#94a3b8';
        fallback.style.fontSize = '0.85rem';
        fallback.style.fontFamily = 'monospace';
        fallback.innerHTML = `[ Placeholder: ${this.getAttribute('src')} ]<br><span style="color:#38bdf8;font-size:0.75rem;">Place file in workspace</span>`;
        parent.appendChild(fallback);
      }
    });
  });

});
