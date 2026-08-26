document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const observeOnce = (elements, callback, options) => {
    if (!elements.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach(callback);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        callback(entry.target);
        observer.unobserve(entry.target);
      });
    }, options);

    elements.forEach((element) => observer.observe(element));
  };

  const setStagger = (elements, interval = 150) => {
    elements.forEach((element, index) => {
      const delay = prefersReducedMotion ? 0 : index * interval;

      element.style.transitionDelay = `${delay}ms`;
      element.dataset.animationDelay = String(delay);
    });
  };

  /* ==================================================
     Number Counters
     ================================================== */

  const animateCounter = (counter) => {
    if (counter.dataset.counterStarted === 'true') return;

    const originalText = counter.textContent.trim();

    // Fractions such as 24/7 should remain unchanged.
    if (originalText.includes('/')) {
      counter.dataset.counterStarted = 'true';
      return;
    }

    const match = originalText.match(/^([\d,.]+)(.*)$/);
    if (!match) return;

    const numberText = match[1];
    const suffix = match[2] || '';
    const target = Number.parseFloat(numberText.replace(/,/g, ''));

    if (Number.isNaN(target)) return;

    counter.dataset.counterStarted = 'true';

    if (prefersReducedMotion) return;

    const decimalPosition = numberText.indexOf('.');
    const decimals = decimalPosition === -1
      ? 0
      : numberText.length - decimalPosition - 1;
    const usesCommas = numberText.includes(',');
    const duration = 1100;
    const startTime = performance.now();

    const formatValue = (value) => {
      const formatted = value.toFixed(decimals);

      if (!usesCommas) return formatted;

      const [integer, decimal] = formatted.split('.');
      const localizedInteger = Number(integer).toLocaleString('en-US');

      return decimal === undefined
        ? localizedInteger
        : `${localizedInteger}.${decimal}`;
    };

    const updateCounter = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      counter.textContent = `${formatValue(target * easedProgress)}${suffix}`;

      if (progress < 1) {
        window.requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = originalText;
      }
    };

    window.requestAnimationFrame(updateCounter);
  };

  const startCounters = (element) => {
    const counters = new Set(element.querySelectorAll('.number-counter'));

    if (element.classList.contains('number-counter')) {
      counters.add(element);
    }

    counters.forEach(animateCounter);
  };

  const startNestedCountersAfterDelay = (element) => {
    const delay = Number(element.dataset.animationDelay || 0);

    if (delay > 0) {
      window.setTimeout(() => startCounters(element), delay);
    } else {
      startCounters(element);
    }
  };

  /* ==================================================
     Fade In
     ================================================== */

  const fadeElements = [];

  document.querySelectorAll('.fade-section').forEach((section) => {
    const sectionElements = Array.from(section.querySelectorAll('.fade-in'));

    setStagger(sectionElements);
    fadeElements.push(...sectionElements);
  });

  observeOnce(
    fadeElements,
    (element) => {
      element.classList.add('fade-in-active');
      startNestedCountersAfterDelay(element);
    },
    {
      threshold: 0.05,
      rootMargin: '0px 0px 100px 0px'
    }
  );

  /* ==================================================
     Focus In
     ================================================== */

  const focusElements = Array.from(document.querySelectorAll('.focus-in'));

  // Restart the stagger for each parent instead of increasing it page-wide.
  const focusGroups = new Map();

  focusElements.forEach((element) => {
    const group = element.parentElement;

    if (!focusGroups.has(group)) focusGroups.set(group, []);
    focusGroups.get(group).push(element);
  });

  focusGroups.forEach((elements) => setStagger(elements));

  observeOnce(
    focusElements,
    (element) => {
      element.classList.add('focus-in-active');
      startNestedCountersAfterDelay(element);
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px 60px 0px'
    }
  );

  /* ==================================================
     Standalone Number Counters
     ================================================== */

  const standaloneCounters = Array.from(
    document.querySelectorAll('.number-counter')
  ).filter(
    (counter) => !counter.closest('.fade-in, .focus-in')
  );

  observeOnce(standaloneCounters, animateCounter, { threshold: 0.35 });

  /* ==================================================
     Character Fade
     ================================================== */

  const characterFadeElements = Array.from(
    document.querySelectorAll('.character-fade')
  );

  characterFadeElements.forEach((element) => {
    if (element.dataset.characterFadeInitialized === 'true') return;

    element.dataset.characterFadeInitialized = 'true';

    const words = element.textContent.trim().replace(/\s+/g, ' ').split(' ');
    const fragment = document.createDocumentFragment();
    let characterIndex = 0;

    words.forEach((word) => {
      const wordElement = document.createElement('span');
      wordElement.className = 'character-fade-word';

      Array.from(word).forEach((character) => {
        const characterElement = document.createElement('span');

        characterElement.className = 'character-fade-char';
        characterElement.style.setProperty(
          '--character-index',
          String(characterIndex)
        );
        characterElement.textContent = character;

        wordElement.appendChild(characterElement);
        characterIndex += 1;
      });

      fragment.appendChild(wordElement);
    });

    element.replaceChildren(fragment);
  });

  observeOnce(
    characterFadeElements,
    (element) => element.classList.add('character-fade-active'),
    {
      threshold: 0.05,
      rootMargin: '0px 0px 100px 0px'
    }
  );

  /* ==================================================
     Mask Reveal Up
     ================================================== */

  const revealGroups = Array.from(
    document.querySelectorAll('.reveal-up-group')
  );

  revealGroups.forEach((group) => {
    setStagger(Array.from(group.querySelectorAll('.reveal-up')));
  });

  observeOnce(
    revealGroups,
    (group) => {
      group.querySelectorAll('.reveal-up').forEach((element) => {
        element.classList.add('reveal-up-active');
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px 60px 0px'
    }
  );

  /* ==================================================
     Vertical Line Reveal
     ================================================== */

  const verticalLines = Array.from(document.querySelectorAll('.v-line'));

  observeOnce(
    verticalLines,
    (line) => line.classList.add('is-visible'),
    { threshold: 0.1 }
  );

  /* ==================================================
     Smooth Sticky Columns
     ================================================== */

  const stickySections = Array.from(
    document.querySelectorAll('.js-sticky-section')
  );

  if (!stickySections.length) return;

  const desktopQuery = window.matchMedia('(min-width: 992px)');
  const stickyStates = new Map();
  let animationFrame = null;
  let previousTime = performance.now();

  stickySections.forEach((section) => {
    const column = section.querySelector('.js-sticky-left');

    if (!column) return;

    stickyStates.set(section, {
      column,
      current: 0,
      target: 0
    });
  });

  const calculateStickyTargets = () => {
    stickyStates.forEach((state, section) => {
      if (!desktopQuery.matches) {
        state.current = 0;
        state.target = 0;
        state.column.style.transform = '';
        state.column.style.willChange = '';
        return;
      }

      const offset = Number.parseFloat(section.dataset.stickyOffset || '120');
      const maximumTravel = Math.max(
        section.offsetHeight - state.column.offsetHeight,
        0
      );
      const requestedTravel = offset - section.getBoundingClientRect().top;

      state.target = Math.min(Math.max(requestedTravel, 0), maximumTravel);
    });
  };

  const renderStickyColumn = (state) => {
    state.column.style.transform = `translate3d(0, ${state.current.toFixed(2)}px, 0)`;
  };

  const animateStickyColumns = (currentTime) => {
    const elapsed = Math.min(currentTime - previousTime, 64);
    const smoothing = prefersReducedMotion
      ? 1
      : 1 - Math.exp(-0.018 * elapsed);
    let stillAnimating = false;

    previousTime = currentTime;

    stickyStates.forEach((state) => {
      if (!desktopQuery.matches) return;

      const difference = state.target - state.current;

      if (Math.abs(difference) > 0.1) {
        state.current += difference * smoothing;
        stillAnimating = true;
      } else {
        state.current = state.target;
      }

      state.column.style.willChange = 'transform';
      renderStickyColumn(state);
    });

    if (stillAnimating) {
      animationFrame = window.requestAnimationFrame(animateStickyColumns);
    } else {
      stickyStates.forEach((state) => {
        state.column.style.willChange = '';
      });
      animationFrame = null;
    }
  };

  const requestStickyUpdate = () => {
    calculateStickyTargets();

    if (animationFrame !== null) return;

    previousTime = performance.now();
    animationFrame = window.requestAnimationFrame(animateStickyColumns);
  };

  window.addEventListener('scroll', requestStickyUpdate, { passive: true });
  window.addEventListener('resize', requestStickyUpdate);
  desktopQuery.addEventListener('change', requestStickyUpdate);

  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(requestStickyUpdate);

    stickyStates.forEach((state, section) => {
      resizeObserver.observe(section);
      resizeObserver.observe(state.column);
    });
  }

  calculateStickyTargets();

  stickyStates.forEach((state) => {
    state.current = state.target;
    renderStickyColumn(state);
  });
});
