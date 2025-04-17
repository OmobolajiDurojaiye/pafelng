"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // Lazy load images
  const lazyImages = document.querySelectorAll(".post-image");

  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
          }
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach((img) => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers without IntersectionObserver support
    lazyImages.forEach((img) => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
      }
    });
  }

  // Add smooth scrolling to internal links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Search form enhancement
  const searchForm = document.querySelector(".search-form");
  const searchInput = searchForm ? searchForm.querySelector("input") : null;

  if (searchForm && searchInput) {
    // Clear input on focus
    searchInput.addEventListener("focus", function () {
      if (this.value === "Search blogs...") {
        this.value = "";
      }
    });

    // Restore placeholder on blur if empty
    searchInput.addEventListener("blur", function () {
      if (this.value === "") {
        this.value = "Search blogs...";
      }
    });

    // Prevent empty searches
    searchForm.addEventListener("submit", function (e) {
      if (
        searchInput.value.trim() === "" ||
        searchInput.value === "Search blogs..."
      ) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  // Add animations on scroll
  const animatedElements = document.querySelectorAll(
    ".post-card, .blog-header, .blog-cover, .blog-content"
  );

  if ("IntersectionObserver" in window) {
    const animationObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            animationObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    animatedElements.forEach((element) => {
      element.classList.add("pre-animation");
      animationObserver.observe(element);
    });
  }

  // Handle share buttons
  const shareButtons = document.querySelectorAll(".share-button");

  shareButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const url = this.href;
      window.open(url, "share-dialog", "width=800,height=600");
    });
  });

  // Add animation to the featured post
  const featuredPost = document.querySelector(".featured-post-link");
  if (featuredPost) {
    setTimeout(() => {
      featuredPost.classList.add("animate-in");
    }, 100);
  }

  // Add animation to the search form
  if (searchForm) {
    setTimeout(() => {
      searchForm.classList.add("animate-in");
    }, 300);
  }
});

// Add animation classes to CSS
document.head.insertAdjacentHTML(
  "beforeend",
  `
<style>
    .pre-animation {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .search-form {
        opacity: 0;
        transform: translateY(-10px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .search-form.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .featured-post-link {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.8s ease, transform 0.8s ease;
    }
    
    .featured-post-link.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
</style>
`
);
