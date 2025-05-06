document.addEventListener("DOMContentLoaded", function () {
  // Get elements
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");

  // Create mobile hamburger for main content area if it doesn't exist
  if (!document.querySelector(".main-menu-toggle")) {
    const mainMenuToggle = document.createElement("div");
    mainMenuToggle.className = "main-menu-toggle";
    mainMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';

    // Insert at the beginning of the header-content
    const headerContent = document.querySelector(".header-content");
    if (headerContent) {
      headerContent.insertBefore(mainMenuToggle, headerContent.firstChild);

      // Add click event to toggle sidebar
      mainMenuToggle.addEventListener("click", toggleSidebar);
    }
  }

  // Function to check if we're on mobile
  function isMobile() {
    return window.innerWidth <= 992;
  }

  // Create overlay if it doesn't exist
  function createOverlay() {
    if (!document.querySelector(".sidebar-overlay")) {
      const overlay = document.createElement("div");
      overlay.className = "sidebar-overlay";
      document.body.appendChild(overlay);

      // Add click event to close sidebar when overlay is clicked
      overlay.addEventListener("click", function () {
        sidebar.classList.remove("active");
        setTimeout(() => {
          overlay.remove();
        }, 300); // Matches the CSS transition time
      });

      // Add a small delay before showing overlay for smoother animation
      setTimeout(() => {
        overlay.style.opacity = "1";
      }, 10);

      return overlay;
    }
    return document.querySelector(".sidebar-overlay");
  }

  // Function to toggle sidebar with improved animation
  function toggleSidebar() {
    sidebar.classList.toggle("active");

    // Add overlay when sidebar is active on mobile
    if (sidebar.classList.contains("active") && isMobile()) {
      createOverlay();
    } else {
      // Remove overlay if it exists
      const overlay = document.querySelector(".sidebar-overlay");
      if (overlay) {
        overlay.style.opacity = "0";
        setTimeout(() => {
          overlay.remove();
        }, 300); // Match the CSS transition time
      }
    }
  }

  // Toggle sidebar when hamburger icon is clicked
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar);
  }

  // Close sidebar when clicking a sidebar link on mobile
  const sidebarLinks = document.querySelectorAll(".sidebar-nav ul li a");
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", function () {
      if (isMobile() && sidebar.classList.contains("active")) {
        toggleSidebar();
      }
    });
  });

  // Handle window resize with debounce for performance
  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      // If window is resized to desktop view and sidebar was hidden, show it
      if (!isMobile() && !sidebar.classList.contains("active")) {
        sidebar.classList.add("active");
      }

      // If window is resized to mobile view and overlay exists but sidebar is not active, remove overlay
      const overlay = document.querySelector(".sidebar-overlay");
      if (isMobile() && overlay && !sidebar.classList.contains("active")) {
        overlay.remove();
      }

      // If window is resized to desktop view and overlay exists, remove it
      if (!isMobile() && overlay) {
        overlay.remove();
      }
    }, 250);
  });

  // Initialize sidebar state based on current viewport
  if (isMobile()) {
    sidebar.classList.remove("active");
  } else {
    sidebar.classList.add("active");
  }

  // Optional: Add smooth scrolling for mobile
  if (isMobile()) {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        if (targetId === "#") return;

        const target = document.querySelector(targetId);
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
          });
        }
      });
    });
  }

  // Optional: Handle bottom navigation if present
  const bottomNavLinks = document.querySelectorAll(".mobile-bottom-nav a");
  bottomNavLinks.forEach((link) => {
    link.addEventListener("click", function () {
      bottomNavLinks.forEach((item) => item.classList.remove("active"));
      this.classList.add("active");
    });
  });
});
