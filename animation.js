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

    // Capture the number and suffix separately
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
     Start Counters After Fade
  ============================ */

  function startCountersAfterFade(fadeElement) {
    const counters = [];

    // The same element has both classes
    if (fadeElement.classList.contains('number-counter')) {
      counters.push(fadeElement);
    }

    // Counters nested inside the fade-in element
    fadeElement
      .querySelectorAll('.number-counter')
      .forEach(function (counter) {
        counters.push(counter);
      });

    if (!counters.length) return;

    let countersStarted = false;

    function startCounters() {
      if (countersStarted) return;

      countersStarted = true;

      fadeElement.removeEventListener(
        'transitionend',
        handleTransitionEnd
      );

      counters.forEach(function (counter) {
        animateCounter(counter);
      });
    }

    function handleTransitionEnd(event) {
      if (event.target !== fadeElement) return;

      if (
        event.propertyName !== 'opacity' &&
        event.propertyName !== 'transform'
      ) {
        return;
      }

      startCounters();
    }

    fadeElement.addEventListener(
      'transitionend',
      handleTransitionEnd
    );

    // Fallback if transitionend does not fire
    const styles = window.getComputedStyle(fadeElement);

    const durations = styles.transitionDuration
      .split(',')
      .map(function (value) {
        return value.includes('ms')
          ? parseFloat(value)
          : parseFloat(value) * 1000;
      });

    const delays = styles.transitionDelay
      .split(',')
      .map(function (value) {
        return value.includes('ms')
          ? parseFloat(value)
          : parseFloat(value) * 1000;
      });

    const totalTransitionTime = Math.max(
      ...durations.map(function (duration, index) {
        return duration +
          (delays[index] || delays[0] || 0);
      }),
      0
    );

    window.setTimeout(
      startCounters,
      totalTransitionTime + 50
    );
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

    // Assign sequential delays
    fadeElements.forEach(function (element, index) {
      element.style.transitionDelay =
        (index * 150) + 'ms';
    });

    const fadeObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          const fadeElement = entry.target;

          // Prepare counters before activating the fade
          startCountersAfterFade(fadeElement);

          fadeElement.classList.add(
            'fade-in-active'
          );

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
