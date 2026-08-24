document.addEventListener('DOMContentLoaded', function () {

  /* ============================
     Fade In
  ============================ */

  const fadeElements = document.querySelectorAll('.fade-section .fade-in');

  if (fadeElements.length) {
    const fadeObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          entry.target.classList.add('fade-in-active');
          observer.unobserve(entry.target);
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
              'style="--character-index:' + characterIndex + '">' +
              character +
              '</span>';

            characterIndex++;

            return span;
          })
          .join('');

        return '<span class="character-fade-word">' +
          characters +
          '</span>';
      })
      .join(' ');
  });


  const characterFadeObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('character-fade-active');
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
