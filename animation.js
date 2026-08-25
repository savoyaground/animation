document.addEventListener('DOMContentLoaded', function () {

  /* ============================
     Number Counter
  ============================ */

  function animateCounter(counter) {
    // Prevent duplicate animation
    if (counter.dataset.counterStarted === 'true') return;

    const originalText = counter.textContent.trim();

    // Skip fractions such as 24/7
    if (originalText.includes('/')) {
      counter.dataset.counterStarted = 'true';
      return;
    }

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
    const duration = 1400;
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
     Start Counters
  ============================ */

  function startCounters(fadeElement) {
    const counters = [];

    // Same element has both classes
    if (fadeElement.classList.contains('number-counter')) {
      counters.push(fadeElement);
    }

    // Counters nested inside the fade element
    fadeElement
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

    /*
     * Three elements per row:
     *
     * Row 1: 0ms, 150ms, 300ms
     * Row 2: 100ms, 250ms, 400ms
     */
    fadeElements.forEach(function (element, index) {
      const column = index % 3;
      const row = Math.floor(index / 3);

      const delay =
        (column * 150) + (row * 100);

      element.style.transitionDelay =
        delay + 'ms';
    });

    const fadeObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          const fadeElement = entry.target;

          fadeElement.classList.add(
            'fade-in-active'
          );

          /*
           * Start the number counter when the
           * corresponding fade animation begins.
           */
          requestAnimationFrame(function () {
            startCounters(fadeElement);
          });

          observer.unobserve(fadeElement);
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
     Character Fade
  ============================ */

  const characterFadeElements =
    document.querySelectorAll('.character-fade');

  if (characterFadeElements.length) {
    characterFadeElements.forEach(function (element) {

      // Prevent duplicate initialization
      if (
        element.dataset.characterFadeInitialized
      ) {
        return;
      }

      element.dataset.characterFadeInitialized =
        'true';

      const text = element.textContent.trim();
      const words = text.split(/\s+/);

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
        .join(' ');
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

});
