<script>
document.addEventListener('DOMContentLoaded', function () {

  /* ============================
     Number Counter
  ============================ */

  function startCounter(counter) {
    // Prevent duplicate animation
    if (counter.dataset.counterStarted === 'true') return;
    counter.dataset.counterStarted = 'true';

    const originalText = counter.textContent.trim();

    // Skip fractions such as 24/7
    if (originalText.includes('/')) return;

    // Separate the number from suffixes such as %, +, K, etc.
    const match = originalText.match(/^([\d,.]+)(.*)$/);

    if (!match) return;

    const target = parseFloat(
      match[1].replace(/,/g, '')
    );

    if (Number.isNaN(target)) return;

    const suffix = match[2] || '';

    const decimals = match[1].includes('.')
      ? match[1].split('.')[1].length
      : 0;

    const usesCommas = match[1].includes(',');
    const duration = 1400;
    const startTime = performance.now();

    function formatValue(value) {
      const fixedValue = value.toFixed(decimals);

      if (!usesCommas) return fixedValue;

      const parts = fixedValue.split('.');

      parts[0] = Number(parts[0]).toLocaleString('en-US');

      return parts.join('.');
    }

    function animateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = target * eased;

      counter.textContent =
        formatValue(currentValue) + suffix;

      if (progress < 1) {
        requestAnimationFrame(animateCounter);
      } else {
        counter.textContent = originalText;
      }
    }

    requestAnimationFrame(animateCounter);
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

    // Assign sequential fade delays
    fadeElements.forEach(function (element, index) {
      element.style.transitionDelay =
        (index * 150) + 'ms';
    });

    const fadeObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          const fadeElement = entry.target;

          fadeElement.classList.add('fade-in-active');
          observer.unobserve(fadeElement);

          const counters = [];

          // Counter and fade-in may be the same element
          if (fadeElement.matches('.number-counter')) {
            counters.push(fadeElement);
          }

          // Find counters nested inside the fade-in element
          fadeElement
            .querySelectorAll('.number-counter')
            .forEach(function (counter) {
              counters.push(counter);
            });

          if (!counters.length) return;

          let hasStarted = false;

          function startCountersAfterFade() {
            if (hasStarted) return;
            hasStarted = true;

            counters.forEach(function (counter) {
              startCounter(counter);
            });
          }

          // Start when the fade transition completes
          fadeElement.addEventListener(
            'transitionend',
            startCountersAfterFade,
            { once: true }
          );

          // Fallback in case transitionend doesn't fire
          const styles = window.getComputedStyle(fadeElement);

          const durations = styles.transitionDuration
            .split(',')
            .map(function (value) {
              return parseFloat(value) * (
                value.includes('ms') ? 1 : 1000
              );
            });

          const delays = styles.transitionDelay
            .split(',')
            .map(function (value) {
              return parseFloat(value) * (
                value.includes('ms') ? 1 : 1000
              );
            });

          const totalTransitionTime = Math.max(
            ...durations.map(function (duration, index) {
              return duration +
                (delays[index] || delays[0] || 0);
            }),
            0
          );

          window.setTimeout(
            startCountersAfterFade,
            totalTransitionTime + 50
          );
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
     Standalone Number Counters
  ============================ */

  // Fallback for counters not associated with a fade-in element
  const standaloneCounters = Array.from(
    document.querySelectorAll('.number-counter')
  ).filter(function (counter) {
    return !counter.closest('.fade-in');
  });

  if (standaloneCounters.length) {
    const counterObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          startCounter(entry.target);
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
      if (element.dataset.characterFadeInitialized) return;

      element.dataset.characterFadeInitialized = 'true';

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
</script>
