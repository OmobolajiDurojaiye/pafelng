"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // Sidebar Toggle
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", function () {
      sidebar.classList.toggle("collapsed");
      mainContent.classList.toggle("expanded");
    });
  }

  // Add click event to service cards
  const serviceCards = document.querySelectorAll(".service-card");
  serviceCards.forEach((card) => {
    card.addEventListener("click", function () {
      const service = this.getAttribute("data-service");
      // For demonstration purposes only - you would navigate to the service view
      console.log(`Navigate to ${service} view`);
    });
  });

  // Add hover effects for table rows
  const tableRows = document.querySelectorAll("tbody tr");
  tableRows.forEach((row) => {
    row.addEventListener("mouseover", function () {
      this.style.backgroundColor = "var(--primary-light)";
    });

    row.addEventListener("mouseout", function () {
      this.style.backgroundColor = "";
    });
  });

  // Action buttons event listeners
  const actionButtons = document.querySelectorAll(".action-btn");
  actionButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.stopPropagation(); // Prevent triggering row click
      const action = this.classList.contains("view")
        ? "view"
        : this.classList.contains("process")
        ? "process"
        : this.classList.contains("update")
        ? "update"
        : "invoice";

      const quoteId =
        this.closest("tr").querySelector("td:first-child").textContent;
      // For demonstration purposes only
      console.log(`${action} action on ${quoteId}`);
    });
  });

  // Add responsiveness for sidebar
  window.addEventListener("resize", function () {
    if (window.innerWidth <= 1200) {
      sidebar.classList.add("collapsed");
      mainContent.classList.add("expanded");
    } else {
      sidebar.classList.remove("collapsed");
      mainContent.classList.remove("expanded");
    }
  });

  // Initial check for screen size
  if (window.innerWidth <= 1200) {
    sidebar.classList.add("collapsed");
    mainContent.classList.add("expanded");
  }
});
