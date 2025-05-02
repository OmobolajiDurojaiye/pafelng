"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // Theme toggling functionality
  const themeSwitch = document.getElementById("theme-switch");
  const currentTheme = localStorage.getItem("theme");

  // Set initial theme based on localStorage or system preference
  if (currentTheme) {
    document.documentElement.setAttribute("data-theme", currentTheme);
  } else if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
  }

  // Toggle theme when button is clicked
  if (themeSwitch) {
    themeSwitch.addEventListener("click", function () {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";

      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
    });
  }

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

      // Handle copy link button separately
      if (button.classList.contains("copy")) {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
          const originalText = button.textContent;
          button.textContent = "Copied!";
          setTimeout(() => {
            button.innerHTML = originalText;
          }, 2000);
        });
        return;
      }

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

  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  let mobileMenu = document.querySelector(".mobile-menu");

  // Create mobile menu if it doesn't exist
  if (!mobileMenu) {
    mobileMenu = document.createElement("div");
    mobileMenu.className = "mobile-menu";

    // Clone navigation links
    const mainNav = document.querySelector(".main-nav");
    if (mainNav) {
      const navLinks = mainNav.querySelector("ul").cloneNode(true);
      mobileMenu.appendChild(navLinks);
    }

    document.querySelector(".header .container").appendChild(mobileMenu);
  }

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("active");

      // Toggle search on mobile
      if (searchForm && window.innerWidth <= 768) {
        searchForm.classList.toggle("active");
      }
    });
  }

  // Handle view options for blog posts
  const viewOptions = document.querySelectorAll(".view-option");
  const postsContainer = document.getElementById("posts-container");

  if (viewOptions.length && postsContainer) {
    viewOptions.forEach((option) => {
      option.addEventListener("click", function () {
        // Remove active class from all options
        viewOptions.forEach((opt) => opt.classList.remove("active"));

        // Add active class to clicked option
        this.classList.add("active");

        const viewType = this.getAttribute("data-view");

        // Clear existing view classes
        postsContainer.classList.remove("list-view", "grid-view");

        // Add the selected view class
        postsContainer.classList.add(viewType + "-view");

        // Save the view preference
        localStorage.setItem("blog-view", viewType);
      });
    });

    // Set initial view from localStorage
    const savedView = localStorage.getItem("blog-view");
    if (savedView) {
      viewOptions.forEach((option) => {
        if (option.getAttribute("data-view") === savedView) {
          option.click();
        }
      });
    }
  }

  // Handle newsletter forms
  const newsletterForms = document.querySelectorAll(
    "#newsletter-form, #newsletter-form-footer, #newsletter-form-article"
  );

  newsletterForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const emailInput = this.querySelector('input[type="email"]');
      const messageContainer =
        this.nextElementSibling || this.querySelector(".form-message");

      if (!emailInput || !messageContainer) return;

      const email = emailInput.value.trim();

      if (!email) {
        showFormMessage(
          messageContainer,
          "Please enter your email address",
          "error"
        );
        return;
      }
    });
  });

  function showFormMessage(container, message, type = "") {
    container.textContent = message;
    container.className = "form-message";

    if (type) {
      container.classList.add(type);
    }
  }

  // Progress bar for blog post reading
  const progressBar = document.querySelector(".progress-bar");

  if (progressBar && document.querySelector(".blog-content")) {
    window.addEventListener("scroll", function () {
      const windowHeight = window.innerHeight;
      const documentHeight =
        document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;

      const progress = (scrollTop / documentHeight) * 100;
      progressBar.style.width = progress + "%";
    });
  }

  // Scroll to top button
  const scrollToTopBtn = document.querySelector(".scroll-to-top");

  if (!scrollToTopBtn) {
    // Create scroll to top button if it doesn't exist
    const scrollBtn = document.createElement("div");
    scrollBtn.className = "scroll-to-top";
    scrollBtn.innerHTML = `<button aria-label="Scroll to top"><i class="fas fa-arrow-up"></i></button>`;
    document.body.appendChild(scrollBtn);

    scrollBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });

    window.addEventListener("scroll", function () {
      if (window.scrollY > 300) {
        scrollBtn.classList.add("visible");
      } else {
        scrollBtn.classList.remove("visible");
      }
    });
  }

  // Estimated reading time calculation
  const articleContent = document.querySelector(".blog-content");
  const readingTimeElement = document.querySelector(".reading-time");

  if (articleContent && readingTimeElement) {
    const text = articleContent.textContent;
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    readingTimeElement.textContent = readingTime + " min read";
  }

  // Add random blobs in background for modern look
  const heroSection = document.querySelector(".featured-post");

  if (heroSection) {
    const blobBackground = document.createElement("div");
    blobBackground.className = "blob-background";

    const blob1 = document.createElement("div");
    blob1.className = "blob blob-1";

    const blob2 = document.createElement("div");
    blob2.className = "blob blob-2";

    blobBackground.appendChild(blob1);
    blobBackground.appendChild(blob2);

    heroSection.appendChild(blobBackground);
  }

  // Add accessibility skip link
  if (!document.querySelector(".skip-link")) {
    const skipLink = document.createElement("a");
    skipLink.className = "skip-link";
    skipLink.href = "#main";
    skipLink.textContent = "Skip to content";

    document.body.insertBefore(skipLink, document.body.firstChild);
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
    
    .table-of-contents a.active {
        color: var(--accent-color);
        font-weight: 500;
        transform: translateX(3px);
    }
    
    .mobile-menu {
        transition: all 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .fade-in {
        animation: fadeIn 0.5s ease forwards;
    }
</style>
`
);
