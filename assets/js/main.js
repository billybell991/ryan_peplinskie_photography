/* ============================================================
   Ryan Peplinskie Photography — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Navbar scroll effect ---- */
  const navbar = document.getElementById('navbar');
  if (navbar && !navbar.classList.contains('scrolled')) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* ---- Mobile hamburger ---- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  /* ---- Scroll reveal animations ---- */
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealElements.forEach(el => revealObserver.observe(el));
  }

  /* ---- Hero particles (subtle gold dots) ---- */
  const particleCanvas = document.getElementById('heroParticles');
  if (particleCanvas) {
    const ctx = particleCanvas.getContext('2d');
    let particles = [];
    const resize = () => {
      particleCanvas.width = window.innerWidth;
      particleCanvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.4 + 0.1
      });
    }

    function animateParticles() {
      ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 168, 83, ${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > particleCanvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > particleCanvas.height) p.dy *= -1;
      });
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  /* ============================================================
     REVIEWS
     ============================================================ */

  /* ---- Floating review toasts on homepage ---- */
  const floatingContainer = document.getElementById('floatingReviews');
  if (floatingContainer) {
    const floatingReviews = [
      { stars: 5, text: "Ryan captured our day perfectly — every photo is a treasure.", author: "Jessica & Marcus" },
      { stars: 5, text: "The most patient, talented photographer we've ever worked with.", author: "Sarah & David" },
      { stars: 5, text: "His eye for light is unreal. 11/10 would book Ryan again!", author: "Alyssa & Trevor" },
      { stars: 5, text: "Ryan made our crazy family of five look like a magazine cover.", author: "Karen L." },
      { stars: 5, text: "Professional, warm, and incredibly fast turnaround.", author: "Nicole B." },
      { stars: 5, text: "Golden-hour magic. These photos will be on our walls forever.", author: "Rachel & James" },
    ];

    let floatingIndex = 0;
    function showFloatingReview() {
      const review = floatingReviews[floatingIndex];
      const toast = document.createElement('div');
      toast.className = 'floating-review-toast';
      toast.innerHTML = `
        <div class="fr-stars">${'&#9733;'.repeat(review.stars)}</div>
        <p class="fr-text">"${review.text}"</p>
        <span class="fr-author">— ${review.author}</span>
      `;
      floatingContainer.appendChild(toast);

      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 5500);

      floatingIndex = (floatingIndex + 1) % floatingReviews.length;
    }

    // Show first after 3s, then every 8s
    setTimeout(() => {
      showFloatingReview();
      setInterval(showFloatingReview, 8000);
    }, 3000);
  }

  /* ---- Leave a Review form ---- */
  const leaveReviewForm = document.getElementById('leaveReviewForm');
  if (leaveReviewForm) {
    leaveReviewForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('reviewName').value.trim();
      const event = document.getElementById('reviewEvent').value.trim();
      const ratingInput = document.querySelector('input[name="rating"]:checked');
      const message = document.getElementById('reviewMessage').value.trim();

      if (!name || !event || !ratingInput || !message) return;

      const rating = parseInt(ratingInput.value, 10);

      // Build a new review card and prepend it
      const grid = document.getElementById('reviewsGrid');
      if (grid) {
        const initials = name.split(/[\s&]+/).map(w => w[0]).join('').toUpperCase().slice(0, 3);
        const card = document.createElement('div');
        card.className = 'review-card reveal visible';
        card.innerHTML = `
          <span class="review-quote-icon">&ldquo;</span>
          <div class="review-stars">${'&#9733;'.repeat(rating)}${'&#9734;'.repeat(5 - rating)}</div>
          <p class="review-text">${escapeHtml(message)}</p>
          <div class="review-author">
            <div class="review-avatar">${escapeHtml(initials)}</div>
            <div class="review-author-info">
              <h4>${escapeHtml(name)}</h4>
              <span>${escapeHtml(event)}</span>
            </div>
          </div>
        `;
        grid.insertBefore(card, grid.firstChild);
      }

      // Store in localStorage
      const stored = JSON.parse(localStorage.getItem('pep_reviews') || '[]');
      stored.unshift({ name, event, rating, message, date: new Date().toISOString() });
      localStorage.setItem('pep_reviews', JSON.stringify(stored));

      // Show success
      leaveReviewForm.style.display = 'none';
      document.getElementById('reviewSuccess').style.display = 'block';

      // Reset after 3 seconds
      setTimeout(() => {
        leaveReviewForm.style.display = 'block';
        document.getElementById('reviewSuccess').style.display = 'none';
        leaveReviewForm.reset();
      }, 3000);
    });

    // Load any previously stored reviews
    const stored = JSON.parse(localStorage.getItem('pep_reviews') || '[]');
    const grid = document.getElementById('reviewsGrid');
    if (grid && stored.length) {
      stored.forEach(r => {
        const initials = r.name.split(/[\s&]+/).map(w => w[0]).join('').toUpperCase().slice(0, 3);
        const card = document.createElement('div');
        card.className = 'review-card reveal';
        card.innerHTML = `
          <span class="review-quote-icon">&ldquo;</span>
          <div class="review-stars">${'&#9733;'.repeat(r.rating)}${'&#9734;'.repeat(5 - r.rating)}</div>
          <p class="review-text">${escapeHtml(r.message)}</p>
          <div class="review-author">
            <div class="review-avatar">${escapeHtml(initials)}</div>
            <div class="review-author-info">
              <h4>${escapeHtml(r.name)}</h4>
              <span>${escapeHtml(r.event)}</span>
            </div>
          </div>
        `;
        grid.appendChild(card);
      });
    }
  }

  /* ============================================================
     PORTFOLIO — FILTERS & LIGHTBOX
     ============================================================ */

  /* ---- Filter buttons ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  if (filterBtns.length && portfolioItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        portfolioItems.forEach(item => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  /* ---- Lightbox ---- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  if (lightbox && portfolioItems.length) {
    let currentIndex = 0;
    const getVisibleItems = () => Array.from(portfolioItems).filter(i => i.style.display !== 'none');

    portfolioItems.forEach((item, idx) => {
      item.addEventListener('click', () => {
        const visible = getVisibleItems();
        currentIndex = visible.indexOf(item);
        const img = item.querySelector('img');
        if (img) {
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt;
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      lightboxImg.src = '';
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    const navigate = (dir) => {
      const visible = getVisibleItems();
      if (!visible.length) return;
      currentIndex = (currentIndex + dir + visible.length) % visible.length;
      const img = visible[currentIndex].querySelector('img');
      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
      }
    };

    if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
    if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });
  }

  /* ============================================================
     CONTACT FORM
     ============================================================ */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactForm.style.display = 'none';
      document.getElementById('contactSuccess').style.display = 'block';

      setTimeout(() => {
        contactForm.style.display = 'block';
        document.getElementById('contactSuccess').style.display = 'none';
        contactForm.reset();
      }, 4000);
    });
  }

  /* ============================================================
     BOOKING WIZARD
     ============================================================ */
  const bookingStep1 = document.getElementById('bookingStep1');
  const bookingStep2 = document.getElementById('bookingStep2');
  const bookingStep3 = document.getElementById('bookingStep3');
  const bookingSuccess = document.getElementById('bookingSuccess');

  if (bookingStep1) {
    const sessionRadios = document.querySelectorAll('input[name="sessionType"]');
    const toStep2Btn = document.getElementById('toStep2');
    const toStep3Btn = document.getElementById('toStep3');
    const backToStep1Btn = document.getElementById('backToStep1');
    const backToStep2Btn = document.getElementById('backToStep2');
    const bookingForm = document.getElementById('bookingForm');

    const stepIndicators = document.querySelectorAll('.booking-step');

    function setActiveStep(num) {
      stepIndicators.forEach(s => {
        const sNum = parseInt(s.dataset.step, 10);
        s.classList.remove('active', 'completed');
        if (sNum === num) s.classList.add('active');
        else if (sNum < num) s.classList.add('completed');
      });
    }

    // Step 1: enable continue when a session type is selected
    sessionRadios.forEach(r => {
      r.addEventListener('change', () => {
        toStep2Btn.disabled = false;
      });
    });

    toStep2Btn.addEventListener('click', () => {
      bookingStep1.style.display = 'none';
      bookingStep2.style.display = '';
      setActiveStep(2);
      window.scrollTo({ top: bookingStep2.offsetTop - 120, behavior: 'smooth' });
    });

    // Step 2: enable continue when date & time selected
    const bookingDate = document.getElementById('bookingDate');
    const bookingTime = document.getElementById('bookingTime');
    const bookingDuration = document.getElementById('bookingDuration');

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    if (bookingDate) bookingDate.min = today;

    function checkStep2() {
      toStep3Btn.disabled = !(bookingDate.value && bookingTime.value && bookingDuration.value);
    }
    [bookingDate, bookingTime, bookingDuration].forEach(el => {
      if (el) el.addEventListener('change', checkStep2);
    });

    backToStep1Btn.addEventListener('click', () => {
      bookingStep2.style.display = 'none';
      bookingStep1.style.display = '';
      setActiveStep(1);
    });

    toStep3Btn.addEventListener('click', () => {
      bookingStep2.style.display = 'none';
      bookingStep3.style.display = '';
      setActiveStep(3);
      populateSummary();
      window.scrollTo({ top: bookingStep3.offsetTop - 120, behavior: 'smooth' });
    });

    backToStep2Btn.addEventListener('click', () => {
      bookingStep3.style.display = 'none';
      bookingStep2.style.display = '';
      setActiveStep(2);
    });

    function populateSummary() {
      const sessionType = document.querySelector('input[name="sessionType"]:checked');
      document.getElementById('summarySession').textContent = sessionType ? sessionType.parentElement.querySelector('h4').textContent : '—';
      document.getElementById('summaryDate').textContent = bookingDate.value || '—';
      document.getElementById('summaryTime').textContent = bookingTime.options[bookingTime.selectedIndex]?.text || '—';
      document.getElementById('summaryDuration').textContent = bookingDuration.options[bookingDuration.selectedIndex]?.text || '—';
      document.getElementById('summaryLocation').textContent = document.getElementById('bookingLocation').value || 'To be discussed';
    }

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      bookingStep3.style.display = 'none';
      bookingSuccess.style.display = '';
      // Hide step indicators
      document.querySelector('.booking-steps').style.display = 'none';
      window.scrollTo({ top: bookingSuccess.offsetTop - 120, behavior: 'smooth' });
    });
  }

  /* ============================================================
     QUOTE FORM
     ============================================================ */
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      quoteForm.style.display = 'none';
      document.getElementById('quoteSuccess').style.display = 'block';

      setTimeout(() => {
        quoteForm.style.display = 'block';
        document.getElementById('quoteSuccess').style.display = 'none';
        quoteForm.reset();
      }, 5000);
    });
  }

  /* ============================================================
     ADMIN PANEL
     ============================================================ */
  const loginForm = document.getElementById('loginForm');
  const adminLogin = document.getElementById('adminLogin');
  const adminPanel = document.getElementById('adminPanel');

  if (loginForm && adminLogin && adminPanel) {
    // Simple client-side gate — replace with real auth when backend exists
    const ADMIN_PASS = 'pep2026';

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pw = document.getElementById('adminPassword').value;
      if (pw === ADMIN_PASS) {
        adminLogin.style.display = 'none';
        adminPanel.style.display = 'block';
        loadCurrentPhotos();
      } else {
        document.getElementById('loginError').style.display = 'block';
      }
    });

    // Upload area interactions
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadPreview = document.getElementById('uploadPreview');
    const uploadBtn = document.getElementById('uploadBtn');
    let selectedFiles = [];

    if (uploadArea && fileInput) {
      uploadArea.addEventListener('click', () => fileInput.click());

      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
      });
      uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
      });

      fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
        fileInput.value = '';
      });
    }

    function handleFiles(files) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];

      Array.from(files).forEach(file => {
        if (!allowed.includes(file.type)) return;
        if (file.size > maxSize) return;

        selectedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const div = document.createElement('div');
          div.className = 'upload-preview-item';
          const img = document.createElement('img');
          img.src = e.target.result;
          img.alt = file.name;
          const removeBtn = document.createElement('button');
          removeBtn.className = 'remove-btn';
          removeBtn.textContent = '×';
          removeBtn.addEventListener('click', () => {
            const idx = selectedFiles.indexOf(file);
            if (idx > -1) selectedFiles.splice(idx, 1);
            div.remove();
            uploadBtn.disabled = selectedFiles.length === 0;
          });
          div.appendChild(img);
          div.appendChild(removeBtn);
          uploadPreview.appendChild(div);
        };
        reader.readAsDataURL(file);
      });

      uploadBtn.disabled = selectedFiles.length === 0;
    }

    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => {
        if (!selectedFiles.length) return;

        // Store in localStorage as base64 (demo only — real app would upload to server/cloud)
        const stored = JSON.parse(localStorage.getItem('pep_portfolio') || '[]');
        const category = document.getElementById('uploadCategory').value;

        let processed = 0;
        selectedFiles.forEach(file => {
          const reader = new FileReader();
          reader.onload = (e) => {
            stored.push({
              data: e.target.result,
              name: file.name,
              category: category,
              date: new Date().toISOString()
            });
            processed++;
            if (processed === selectedFiles.length) {
              localStorage.setItem('pep_portfolio', JSON.stringify(stored));
              selectedFiles = [];
              uploadPreview.innerHTML = '';
              uploadBtn.disabled = true;
              document.getElementById('uploadSuccess').style.display = 'block';
              setTimeout(() => {
                document.getElementById('uploadSuccess').style.display = 'none';
              }, 3000);
              loadCurrentPhotos();
            }
          };
          reader.readAsDataURL(file);
        });
      });
    }

    function loadCurrentPhotos() {
      const container = document.getElementById('currentPhotos');
      if (!container) return;
      container.innerHTML = '';

      const stored = JSON.parse(localStorage.getItem('pep_portfolio') || '[]');
      stored.forEach((photo, i) => {
        const div = document.createElement('div');
        div.className = 'upload-preview-item';
        const img = document.createElement('img');
        img.src = photo.data;
        img.alt = photo.name;
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => {
          stored.splice(i, 1);
          localStorage.setItem('pep_portfolio', JSON.stringify(stored));
          loadCurrentPhotos();
        });
        div.appendChild(img);
        div.appendChild(removeBtn);
        container.appendChild(div);
      });

      if (!stored.length) {
        container.innerHTML = '<p style="color:var(--text-dim); font-size:0.85rem; grid-column:1/-1;">No uploaded photos yet. Use the upload area above to add photos.</p>';
      }
    }
  }

  /* ============================================================
     UTILITY
     ============================================================ */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

});
