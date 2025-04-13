"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // Mobile Navigation Toggle
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger) {
    hamburger.addEventListener("click", function () {
      hamburger.classList.toggle("active");
      navLinks.classList.toggle("active");
    });
  }

  // Close mobile menu when clicking a link
  const navItems = document.querySelectorAll(".nav-links li a");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navLinks.classList.remove("active");
    });
  });

  // Navbar scroll effect
  window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar");
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Image Slider
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  let currentSlide = 0;

  // Initialize slider
  function initSlider() {
    slides[currentSlide].classList.add("active");
    dots[currentSlide].classList.add("active");
  }

  // Change slide
  function changeSlide(n) {
    slides[currentSlide].classList.remove("active");
    dots[currentSlide].classList.remove("active");

    currentSlide = (n + slides.length) % slides.length;

    slides[currentSlide].classList.add("active");
    dots[currentSlide].classList.add("active");
  }

  // Previous slide
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      changeSlide(currentSlide - 1);
    });
  }

  // Next slide
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      changeSlide(currentSlide + 1);
    });
  }

  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      changeSlide(index);
    });
  });

  // Auto slide
  let slideInterval = setInterval(() => {
    changeSlide(currentSlide + 1);
  }, 5000);

  // Reset interval when manually changing slides
  function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
      changeSlide(currentSlide + 1);
    }, 5000);
  }

  // Reset interval on manual navigation
  if (prevBtn) prevBtn.addEventListener("click", resetInterval);
  if (nextBtn) nextBtn.addEventListener("click", resetInterval);
  dots.forEach((dot) => {
    dot.addEventListener("click", resetInterval);
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const navbarHeight = document.querySelector(".navbar").offsetHeight;
        const targetPosition =
          targetElement.getBoundingClientRect().top +
          window.pageYOffset -
          navbarHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // Animation on scroll
  const serviceElements = document.querySelectorAll(".service-section");

  function checkVisibility() {
    const triggerBottom = window.innerHeight * 0.8;

    serviceElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;

      if (elementTop < triggerBottom) {
        element.style.opacity = "1";
        element.style.transform = "translateY(0)";
      }
    });
  }

  // Set initial state for animations
  serviceElements.forEach((element) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(50px)";
    element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  });

  // Check visibility on load
  window.addEventListener("load", checkVisibility);

  // Check visibility on scroll
  window.addEventListener("scroll", checkVisibility);

  // Initialize the slider
  initSlider();
});
