document.addEventListener('DOMContentLoaded', function () {

  /* ============================
     Number Counter
  ============================ */

  function animateCounter(counter) {
    if (counter.dataset.counterStarted === 'true') return;

    const originalText = counter.textContent.trim();

    // Skip fractions such as 24/7
    if (originalText.includes('/')) {
      counter.dataset.counterStarted = 'true';
      return;
    }

    // Separate the numeric value from +, %, K, etc.
    const match = originalText.match(/^([\d,.]+)(.*)$/);

    if (!match) return;

    const numberText = match[1];
    const suffix = match[2] || '';

    const target = parseFloat(
      numberText.replace(/,/g, '')
    );

    if (Number.isNaN(target)) return;

    counter.dataset.counterStarted = 'true';

    const decimals = numberText.includes('.')
      ? numberText.split('.')[1].length
      : 0;

    const usesCommas = numberText.includes(',');
    const duration = 1100;
    const startTime = performance.now();

    function formatValue(value) {
      const formatted = value.toFixed(decimals);

      if (!usesCommas) return formatted;

      const parts = formatted.split('.');

      parts[0] = Number(parts[0]).toLocaleString('en-US');

      return parts.join('.');
    }

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;

      const progress = Math.min(
        elapsed / duration,
        1
      );

      // Smooth ease-out
      const eased =
        1 - Math.pow(1 - progress, 3);

      const currentValue = target * eased;

      counter.textContent =
        formatValue(currentValue) + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = originalText;
      }
    }

    requestAnimationFrame(updateCounter);
  }


  /* ============================
     Start Nested Counters
  ============================ */

  function startCounters(element) {
    const counters = [];

    // The animated element is also the counter
    if (element.classList.contains('number-counter')) {
      counters.push(element);
    }

    // Counters nested inside the animated element
    element
      .querySelectorAll('.number-counter')
      .forEach(function (counter) {
        counters.push(counter);
      });

    counters.forEach(function (counter) {
      animateCounter(counter);
    });
  }


  /* ============================
     Fade In
  ============================ */

  const fadeSections =
    document.querySelectorAll('.fade-section');

  fadeSections.forEach(function (section) {
    const fadeElements =
      section.querySelectorAll('.fade-in');

    if (!fadeElements.length) return;

    // Apply a 150ms stagger
    fadeElements.forEach(function (element, index) {
      const delay = index * 150;

      element.style.transitionDelay =
        delay + 'ms';

      element.dataset.animationDelay =
        String(delay);
    });

    const fadeObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          const element = entry.target;

          element.classList.add(
            'fade-in-active'
          );

          const delay = Number(
            element.dataset.animationDelay || 0
          );

          // Start counters when the element starts fading
          window.setTimeout(function () {
            startCounters(element);
          }, delay);

          observer.unobserve(element);
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px 100px 0px'
      }
    );

    fadeElements.forEach(function (element) {
      fadeObserver.observe(element);
    });
  });


  /* ============================
     Focus In
  ============================ */

  const focusElements =
    document.querySelectorAll('.focus-in');

  if (focusElements.length) {
    // Apply a 150ms delay between each item
    focusElements.forEach(function (element, index) {
      const delay = index * 150;

      element.style.transitionDelay =
        delay + 'ms';

      element.dataset.animationDelay =
        String(delay);
    });

    const focusObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          const element = entry.target;

          element.classList.add(
            'focus-in-active'
          );

          const delay = Number(
            element.dataset.animationDelay || 0
          );

          // Start counters when the card begins focusing
          window.setTimeout(function () {
            startCounters(element);
          }, delay);

          observer.unobserve(element);
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px 60px 0px'
      }
    );

    focusElements.forEach(function (element) {
      focusObserver.observe(element);
    });
  }


  /* ============================
     Standalone Number Counters
  ============================ */

  const standaloneCounters = Array.from(
    document.querySelectorAll('.number-counter')
  ).filter(function (counter) {
    return (
      !counter.closest('.fade-in') &&
      !counter.closest('.focus-in')
    );
  });

  if (standaloneCounters.length) {
    const counterObserver =
      new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;

            animateCounter(entry.target);
            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.35
        }
      );

    standaloneCounters.forEach(function (counter) {
      counterObserver.observe(counter);
    });
  }


  /* ============================
     Character Fade
  ============================ */

  const characterFadeElements =
    document.querySelectorAll('.character-fade');

  if (characterFadeElements.length) {
    characterFadeElements.forEach(function (element) {
      // Prevent duplicate initialization
      if (
        element.dataset.characterFadeInitialized === 'true'
      ) {
        return;
      }

      element.dataset.characterFadeInitialized = 'true';

      // Normalize spaces from the original text
      const text = element.textContent
        .trim()
        .replace(/\s+/g, ' ');

      const words = text.split(' ');

      let characterIndex = 0;

      element.innerHTML = words
        .map(function (word) {
          const characters = Array.from(word)
            .map(function (character) {
              const span =
                '<span class="character-fade-char" ' +
                'style="--character-index:' +
                characterIndex +
                '">' +
                character +
                '</span>';

              characterIndex++;

              return span;
            })
            .join('');

          return (
            '<span class="character-fade-word">' +
            characters +
            '</span>'
          );
        })
        .join('');
    });

    const characterFadeObserver =
      new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;

            entry.target.classList.add(
              'character-fade-active'
            );

            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.05,
          rootMargin: '0px 0px 100px 0px'
        }
      );

    characterFadeElements.forEach(function (element) {
      characterFadeObserver.observe(element);
    });
  }


  /* ============================
     Mask Reveal Up
  ============================ */

  const revealGroups =
    document.querySelectorAll('.reveal-up-group');

  revealGroups.forEach(function (group) {
    const revealElements =
      group.querySelectorAll('.reveal-up');

    if (!revealElements.length) return;

    // Apply a 150ms delay between each item
    revealElements.forEach(function (element, index) {
      element.style.transitionDelay =
        (index * 150) + 'ms';
    });

    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          revealElements.forEach(function (element) {
            element.classList.add(
              'reveal-up-active'
            );
          });

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px 60px 0px'
      }
    );

    revealObserver.observe(group);
  });

});
