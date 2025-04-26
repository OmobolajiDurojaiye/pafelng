"use strict";

// Wait for DOM to fully load
document.addEventListener("DOMContentLoaded", function () {
  // Navbar scroll effect
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Mobile menu toggle
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger) {
    hamburger.addEventListener("click", function () {
      hamburger.classList.toggle("active");
      navLinks.classList.toggle("active");
    });
  }

  // Close mobile menu when clicking on a link
  document.querySelectorAll(".nav-links a").forEach(function (link) {
    link.addEventListener("click", function () {
      hamburger.classList.remove("active");
      navLinks.classList.remove("active");
    });
  });

  // Hero slider
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  let currentSlide = 0;
  let slideInterval;

  // Function to change slide
  function changeSlide(n) {
    slides[currentSlide].classList.remove("active");
    dots[currentSlide].classList.remove("active");

    currentSlide = (n + slides.length) % slides.length;

    slides[currentSlide].classList.add("active");
    dots[currentSlide].classList.add("active");
  }

  // Initialize slider controls
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", function () {
      changeSlide(currentSlide - 1);
      resetInterval();
    });

    nextBtn.addEventListener("click", function () {
      changeSlide(currentSlide + 1);
      resetInterval();
    });

    // Dot navigation
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        changeSlide(index);
        resetInterval();
      });
    });

    // Auto slide
    function startInterval() {
      slideInterval = setInterval(function () {
        changeSlide(currentSlide + 1);
      }, 5000);
    }

    function resetInterval() {
      clearInterval(slideInterval);
      startInterval();
    }

    startInterval();
  }

  // Stats counter animation
  const statNumbers = document.querySelectorAll(".stat-number");
  let countStarted = false;

  function startCounter() {
    if (countStarted) return;

    countStarted = true;

    statNumbers.forEach(function (stat) {
      const target = parseInt(stat.getAttribute("data-count"));
      const duration = 2000; // 2 seconds
      const step = target / (duration / 16); // 60fps
      let current = 0;

      const updateCounter = function () {
        current += step;
        if (current < target) {
          stat.textContent = Math.floor(current);
          requestAnimationFrame(updateCounter);
        } else {
          stat.textContent = target;
        }
      };

      updateCounter();
    });
  }

  // Start counter when stats section comes into view
  const statsSection = document.querySelector(".stats-section");
  if (statsSection) {
    const observer = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          startCounter();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(statsSection);
  }

  // Testimonial slider
  const testimonialCards = document.querySelectorAll(".testimonial-card");
  const testimonialDots = document.querySelectorAll(".testimonial-dot");
  const testimonialPrev = document.querySelector(".testimonial-prev");
  const testimonialNext = document.querySelector(".testimonial-next");
  let currentTestimonial = 0;
  let testimonialInterval;

  // Function to change testimonial
  function changeTestimonial(n) {
    testimonialCards[currentTestimonial].classList.remove("active");
    testimonialDots[currentTestimonial].classList.remove("active");

    currentTestimonial =
      (n + testimonialCards.length) % testimonialCards.length;

    testimonialCards[currentTestimonial].classList.add("active");
    testimonialDots[currentTestimonial].classList.add("active");
  }

  // Initialize testimonial controls
  if (testimonialPrev && testimonialNext) {
    testimonialPrev.addEventListener("click", function () {
      changeTestimonial(currentTestimonial - 1);
      resetTestimonialInterval();
    });

    testimonialNext.addEventListener("click", function () {
      changeTestimonial(currentTestimonial + 1);
      resetTestimonialInterval();
    });

    // Testimonial dot navigation
    testimonialDots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        changeTestimonial(index);
        resetTestimonialInterval();
      });
    });

    // Auto slide testimonials
    function startTestimonialInterval() {
      testimonialInterval = setInterval(function () {
        changeTestimonial(currentTestimonial + 1);
      }, 6000);
    }

    function resetTestimonialInterval() {
      clearInterval(testimonialInterval);
      startTestimonialInterval();
    }

    startTestimonialInterval();
  }

  // Animate elements on scroll
  const animateElements = document.querySelectorAll(
    ".service-icon, .service-text h2, .service-text p, .service-features, .quote-btn, .service-image"
  );

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const appearOnScroll = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("fade-in");
      observer.unobserve(entry.target);
    });
  }, observerOptions);

  animateElements.forEach(function (element) {
    appearOnScroll.observe(element);
  });

  // Scroll to top button
  const scrollTopBtn = document.createElement("div");
  scrollTopBtn.className = "scroll-top";
  scrollTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
  document.body.appendChild(scrollTopBtn);

  window.addEventListener("scroll", function () {
    if (window.scrollY > 500) {
      scrollTopBtn.classList.add("active");
    } else {
      scrollTopBtn.classList.remove("active");
    }
  });

  scrollTopBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");

      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        e.preventDefault();

        const headerOffset = 90;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // Service section background effects
  const serviceSections = document.querySelectorAll(".service-section");

  serviceSections.forEach(function (section) {
    section.addEventListener("mousemove", function (e) {
      const bgElement = section.querySelector(".service-bg-element");

      if (bgElement) {
        const x = (e.clientX / window.innerWidth) * 20;
        const y = (e.clientY / window.innerHeight) * 20;

        bgElement.style.transform = `translate(${x}px, ${y}px)`;
      }
    });
  });

  // Add parallax effect to CTA section
  const ctaSection = document.querySelector(".cta-section");

  if (ctaSection) {
    window.addEventListener("scroll", function () {
      const scrollPosition = window.pageYOffset;
      ctaSection.style.backgroundPositionY = scrollPosition * 0.05 + "px";
    });
  }
});
