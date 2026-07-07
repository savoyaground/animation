document.addEventListener('DOMContentLoaded', function () {
  const fadeSections = document.querySelectorAll('.fade-section');

  if (!fadeSections.length) return;

  const fadeObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        const fadeElements = entry.target.querySelectorAll('.fade-in');

        fadeElements.forEach(function (element, index) {
          const delay = entry.target.classList.contains('is-hero') ? 0 : index * 25;

          setTimeout(function () {
            element.classList.add('fade-in-active');
          }, delay);
        });

        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  fadeSections.forEach(function (section) {
    fadeObserver.observe(section);
  });
});
