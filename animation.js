document.addEventListener('DOMContentLoaded', function () {
  const fadeElements = document.querySelectorAll('.fade-in');

  if (!fadeElements.length) return;

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
});
