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

    // Insert before the first child of main-header
    const mainHeader = document.querySelector(".main-header");
    if (mainHeader) {
      mainHeader.insertBefore(mainMenuToggle, mainHeader.firstChild);

      // Add click event to toggle sidebar
      mainMenuToggle.addEventListener("click", toggleSidebar);
    }
  }

  // Function to check if we're on mobile
  function isMobile() {
    return window.innerWidth <= 992;
  }

  // Function to toggle sidebar
  function toggleSidebar() {
    sidebar.classList.toggle("active");

    // Add overlay when sidebar is active on mobile
    if (sidebar.classList.contains("active") && isMobile()) {
      // Create overlay if it doesn't exist
      if (!document.querySelector(".sidebar-overlay")) {
        const overlay = document.createElement("div");
        overlay.className = "sidebar-overlay";
        document.body.appendChild(overlay);

        // Add click event to close sidebar when overlay is clicked
        overlay.addEventListener("click", function () {
          sidebar.classList.remove("active");
          overlay.remove();
        });
      }
    } else {
      // Remove overlay if it exists
      const overlay = document.querySelector(".sidebar-overlay");
      if (overlay) {
        overlay.remove();
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

  // Handle window resize
  window.addEventListener("resize", function () {
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
  });

  // Initialize sidebar state based on current viewport
  if (isMobile()) {
    sidebar.classList.remove("active");
  } else {
    sidebar.classList.add("active");
  }
});
