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
      if (hamburger) {
        hamburger.classList.remove("active");
      }
      if (navLinks) {
        navLinks.classList.remove("active");
      }
    });
  });

  // Hero slider - check if elements exist before working with them
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  let currentSlide = 0;
  let slideInterval;

  // Function to change slide
  function changeSlide(n) {
    if (!slides.length || !dots.length) return;

    slides[currentSlide].classList.remove("active");
    dots[currentSlide].classList.remove("active");

    currentSlide = (n + slides.length) % slides.length;

    slides[currentSlide].classList.add("active");
    dots[currentSlide].classList.add("active");
  }

  // Initialize slider controls
  if (prevBtn && nextBtn && slides.length > 0 && dots.length > 0) {
    // Initialize first slide to be active if none are
    if (!document.querySelector(".slide.active")) {
      slides[0].classList.add("active");
      dots[0].classList.add("active");
    }

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
    if (countStarted || !statNumbers.length) return;

    countStarted = true;

    statNumbers.forEach(function (stat) {
      const target = parseInt(stat.getAttribute("data-count") || "0");
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
    // Check if IntersectionObserver is supported
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) {
            startCounter();
          }
        },
        { threshold: 0.3 }
      );

      observer.observe(statsSection);
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      startCounter(); // Just start it immediately
    }
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
    if (!testimonialCards.length || !testimonialDots.length) return;

    testimonialCards[currentTestimonial].classList.remove("active");
    testimonialDots[currentTestimonial].classList.remove("active");

    currentTestimonial =
      (n + testimonialCards.length) % testimonialCards.length;

    testimonialCards[currentTestimonial].classList.add("active");
    testimonialDots[currentTestimonial].classList.add("active");
  }

  // Initialize testimonial controls
  if (
    testimonialPrev &&
    testimonialNext &&
    testimonialCards.length > 0 &&
    testimonialDots.length > 0
  ) {
    // Initialize first testimonial to be active if none are
    if (!document.querySelector(".testimonial-card.active")) {
      testimonialCards[0].classList.add("active");
      testimonialDots[0].classList.add("active");
    }

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

  if (animateElements.length > 0) {
    // Check if IntersectionObserver is supported
    if ("IntersectionObserver" in window) {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      };

      const appearOnScroll = new IntersectionObserver(function (
        entries,
        observer
      ) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("fade-in");
          observer.unobserve(entry.target);
        });
      },
      observerOptions);

      animateElements.forEach(function (element) {
        appearOnScroll.observe(element);
      });
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      animateElements.forEach(function (element) {
        element.classList.add("fade-in");
      });
    }
  }

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

  // Service section background effects - limit on mobile
  const serviceSections = document.querySelectorAll(".service-section");
  const isMobile = window.innerWidth < 768;

  serviceSections.forEach(function (section) {
    const bgElement = section.querySelector(".service-bg-element");

    // Don't apply mousemove effect on mobile devices
    if (!isMobile && bgElement) {
      section.addEventListener("mousemove", function (e) {
        const x = (e.clientX / window.innerWidth) * 20;
        const y = (e.clientY / window.innerHeight) * 20;

        bgElement.style.transform = `translate(${x}px, ${y}px)`;
      });
    }
  });

  // Add parallax effect to CTA section - disable on mobile
  const ctaSection = document.querySelector(".cta-section");

  if (ctaSection && !isMobile) {
    window.addEventListener("scroll", function () {
      const scrollPosition = window.pageYOffset;
      ctaSection.style.backgroundPositionY = scrollPosition * 0.05 + "px";
    });
  }

  // Initialize any sliders that may not be active
  if (slides.length > 0 && !document.querySelector(".slide.active")) {
    slides[0].classList.add("active");
    if (dots.length > 0) {
      dots[0].classList.add("active");
    }
  }

  if (
    testimonialCards.length > 0 &&
    !document.querySelector(".testimonial-card.active")
  ) {
    testimonialCards[0].classList.add("active");
    if (testimonialDots.length > 0) {
      testimonialDots[0].classList.add("active");
    }
  }

  // Fix for viewport height issues on mobile browsers
  function setVh() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }

  setVh();
  window.addEventListener("resize", setVh);
});
