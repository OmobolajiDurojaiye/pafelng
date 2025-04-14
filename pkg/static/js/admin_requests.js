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
      const searchValue = this.value.toLowerCase();
      const requestCards = document.querySelectorAll(".request-card");

      requestCards.forEach((card) => {
        const cardText = card.textContent.toLowerCase();
        if (cardText.includes(searchValue)) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });

      // Check if no results and show message
      const visibleCards = document.querySelectorAll(
        '.request-card[style="display: block"]'
      );
      const emptyState = document.querySelector(".empty-state");

      if (visibleCards.length === 0 && !document.querySelector(".no-results")) {
        const noResults = document.createElement("div");
        noResults.className = "empty-state no-results";
        noResults.innerHTML = `
                    <i class="fas fa-search"></i>
                    <h3>No Results Found</h3>
                    <p>No requests matching "${searchValue}" were found.</p>
                `;

        const container = document.querySelector(".requests-container");
        if (emptyState) {
          emptyState.style.display = "none";
        }
        container.appendChild(noResults);
      } else if (visibleCards.length > 0) {
        const noResults = document.querySelector(".no-results");
        if (noResults) {
          noResults.remove();
        }
        if (emptyState) {
          emptyState.style.display = "none";
        }
      }
    });
  }

  // Sort functionality
  const sortFilter = document.getElementById("sortFilter");
  if (sortFilter) {
    sortFilter.addEventListener("change", function () {
      const sortValue = this.value;
      const requestCards = Array.from(
        document.querySelectorAll(".request-card")
      );
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
    });
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
});
