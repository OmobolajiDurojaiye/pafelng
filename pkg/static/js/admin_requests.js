"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // Close alert messages
  const closeAlerts = document.querySelectorAll(".close-alert");
  closeAlerts.forEach((button) => {
    button.addEventListener("click", function () {
      const alert = this.parentElement;
      alert.style.opacity = "0";
      setTimeout(() => {
        alert.style.display = "none";
      }, 300);
    });
  });

  // Search functionality
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      filterRequests();
    });
  }

  // Status filter functionality
  const statusFilter = document.getElementById("statusFilter");
  if (statusFilter) {
    statusFilter.addEventListener("change", function () {
      filterRequests();
    });
  }

  // Sort functionality
  const sortFilter = document.getElementById("sortFilter");
  if (sortFilter) {
    sortFilter.addEventListener("change", function () {
      sortRequests();
    });
  }

  // Combined filtering function
  function filterRequests() {
    const searchValue = searchInput ? searchInput.value.toLowerCase() : "";
    const statusValue = statusFilter ? statusFilter.value : "all";
    const requestCards = document.querySelectorAll(".request-card");
    let visibleCount = 0;

    requestCards.forEach((card) => {
      const cardText = card.textContent.toLowerCase();
      const cardStatus = card.dataset.status || "pending"; // Default to pending if not set

      const matchesSearch = cardText.includes(searchValue);
      const matchesStatus = statusValue === "all" || cardStatus === statusValue;

      if (matchesSearch && matchesStatus) {
        card.style.display = "block";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    // Check if no results and show message
    handleEmptyState(visibleCount, searchValue);
  }

  // Sorting function
  function sortRequests() {
    const sortValue = sortFilter.value;
    const requestCards = Array.from(document.querySelectorAll(".request-card"));
    const container = document.querySelector(".requests-container");

    requestCards.sort((a, b) => {
      const dateA = new Date(a.querySelector(".request-date").textContent);
      const dateB = new Date(b.querySelector(".request-date").textContent);

      if (sortValue === "newest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

    // Clear and re-append sorted cards
    requestCards.forEach((card) => container.appendChild(card));
  }

  // Handle empty state display
  function handleEmptyState(visibleCount, searchValue) {
    const emptyState = document.querySelector(".empty-state:not(.no-results)");
    let noResults = document.querySelector(".no-results");

    if (visibleCount === 0) {
      if (!noResults) {
        noResults = document.createElement("div");
        noResults.className = "empty-state no-results";
        noResults.innerHTML = `
          <i class="fas fa-search"></i>
          <h3>No Results Found</h3>
          <p>No requests matching "${searchValue}" were found.</p>
        `;

        const container = document.querySelector(".requests-container");
        container.appendChild(noResults);
      }

      if (emptyState) {
        emptyState.style.display = "none";
      }
    } else {
      if (noResults) {
        noResults.remove();
      }

      if (emptyState && document.querySelectorAll(".request-card").length > 0) {
        emptyState.style.display = "none";
      }
    }
  }

  // Add hover effect for request cards
  const requestCards = document.querySelectorAll(".request-card");
  requestCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)";
      this.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.1)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "0 3px 10px rgba(0, 0, 0, 0.05)";
    });
  });

  // Initial filter on page load
  if (statusFilter || searchInput) {
    filterRequests();
  }
});
