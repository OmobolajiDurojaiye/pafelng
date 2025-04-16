"use strict";


document.addEventListener("DOMContentLoaded", function () {
  // Close alert messages
  setupAlertClosers();

  // Setup file input display
  setupFileInputs();

  // Setup filtering and search functionality
  setupFilters();

  // Form validation
  setupFormValidation();

  // Initialize any other UI components
  initUI();
});


function setupAlertClosers() {
  const closeButtons = document.querySelectorAll(".close-alert");

  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const alert = this.parentElement;
      alert.style.opacity = "0";
      setTimeout(() => {
        alert.style.display = "none";
      }, 300);
    });
  });
}


function setupFileInputs() {
  const fileInputs = document.querySelectorAll(".file-input");

  fileInputs.forEach((input) => {
    input.addEventListener("change", function () {
      const fileName = this.files[0]?.name || "No file chosen";
      const fileNameElement = this.parentElement.querySelector(".file-name");

      if (fileNameElement) {
        fileNameElement.textContent = fileName;
      }

      // Validate file size and type
      validateFile(this);
    });
  });
}


function validateFile(fileInput) {
  if (!fileInput.files || !fileInput.files[0]) return;

  const file = fileInput.files[0];
  const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  // Check file size
  if (file.size > maxSizeInBytes) {
    showValidationError(fileInput, "File size must be less than 5MB");
    fileInput.value = ""; // Clear the input
    const fileNameElement = fileInput.parentElement.querySelector(".file-name");
    if (fileNameElement) {
      fileNameElement.textContent = "No file chosen";
    }
    return;
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    showValidationError(fileInput, "Only PDF, JPG, and PNG files are allowed");
    fileInput.value = ""; // Clear the input
    const fileNameElement = fileInput.parentElement.querySelector(".file-name");
    if (fileNameElement) {
      fileNameElement.textContent = "No file chosen";
    }
    return;
  }
}


function showValidationError(element, message) {
  // Create error message element if it doesn't exist
  let errorElement = element.parentElement.querySelector(".error-message");

  if (!errorElement) {
    errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.style.color = "var(--declined-color)";
    errorElement.style.fontSize = "0.8rem";
    errorElement.style.marginTop = "5px";
    element.parentElement.appendChild(errorElement);
  }

  errorElement.textContent = message;

  // Clear the error after 3 seconds
  setTimeout(() => {
    errorElement.textContent = "";
  }, 3000);
}


function setupFilters() {
  const searchInput = document.getElementById("quoteSearch");
  const serviceFilter = document.getElementById("serviceFilter");
  const statusFilter = document.getElementById("statusFilter");

  // If not on quotes page, return
  if (!searchInput || !serviceFilter || !statusFilter) return;

  // Set up search functionality
  searchInput.addEventListener("input", filterQuotes);

  // Set up filter functionality
  serviceFilter.addEventListener("change", filterQuotes);
  statusFilter.addEventListener("change", filterQuotes);

  // Initial filter on page load
  filterQuotes();
}

/**
 * Filter quotes based on search term and selected filters
 */
function filterQuotes() {
  const searchInput = document.getElementById("quoteSearch");
  const serviceFilter = document.getElementById("serviceFilter");
  const statusFilter = document.getElementById("statusFilter");

  // If not on quotes page, return
  if (!searchInput || !serviceFilter || !statusFilter) return;

  const searchTerm = searchInput.value.toLowerCase();
  const selectedService = serviceFilter.value;
  const selectedStatus = statusFilter.value;

  const quoteCards = document.querySelectorAll(".quote-card");

  quoteCards.forEach((card) => {
    const cardService = card.getAttribute("data-service");
    const cardStatus = card.getAttribute("data-status");
    const cardText = card.textContent.toLowerCase();

    let matchService =
      selectedService === "all" || cardService === selectedService;
    let matchStatus = selectedStatus === "all" || cardStatus === selectedStatus;
    let matchSearch = searchTerm === "" || cardText.includes(searchTerm);

    if (matchService && matchStatus && matchSearch) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });

  // Show/hide empty state
  const quotesGrid = document.querySelector(".quotes-grid");
  const emptyState = document.querySelector(".empty-state");

  if (!quotesGrid || !emptyState) return;

  let visibleCount = 0;
  quoteCards.forEach((card) => {
    if (card.style.display !== "none") {
      visibleCount++;
    }
  });

  if (visibleCount === 0) {
    quotesGrid.style.display = "none";
    // Create and display a filtered empty state
    if (!document.getElementById("filtered-empty-state")) {
      const filteredEmptyState = document.createElement("div");
      filteredEmptyState.id = "filtered-empty-state";
      filteredEmptyState.className = "empty-state";
      filteredEmptyState.innerHTML = `
          <i class="fas fa-filter empty-icon"></i>
          <h3>No Matching Quotes</h3>
          <p>No quotes match your current filter and search criteria. Try adjusting your filters or search term.</p>
        `;
      quotesGrid.parentElement.appendChild(filteredEmptyState);
    } else {
      document.getElementById("filtered-empty-state").style.display = "block";
    }
  } else {
    quotesGrid.style.display = "grid";
    const filteredEmptyState = document.getElementById("filtered-empty-state");
    if (filteredEmptyState) {
      filteredEmptyState.style.display = "none";
    }
  }
}

/**
 * Set up form validation
 */
function setupFormValidation() {
  const replyForm = document.querySelector(".reply-form");

  if (!replyForm) return;

  replyForm.addEventListener("submit", function (event) {
    const messageInput = this.querySelector("#message");
    const messageValue = messageInput.value.trim();

    if (!messageValue) {
      event.preventDefault();
      showValidationError(messageInput, "Message content is required");
      return false;
    }

    return true;
  });
}

/**
 * Initialize UI components and animations
 */
function initUI() {
  // Animate status badges
  animateStatusBadges();

  // Add hover effects to clickable elements
  addHoverEffects();

  // Add fade-in animation to elements
  addFadeInEffects();

  // Setup auto-resize for textareas
  setupTextareaAutoResize();
}


function animateStatusBadges() {
  const processingBadges = document.querySelectorAll(
    ".status-badge.processing"
  );

  processingBadges.forEach((badge) => {
    const icon = badge.querySelector("i");
    if (icon && !icon.classList.contains("fa-spin")) {
      icon.classList.add("fa-spin");
    }
  });
}


function addHoverEffects() {
  const clickableElements = document.querySelectorAll(
    ".quote-card, .document-link, .attachment-link"
  );

  clickableElements.forEach((element) => {
    element.addEventListener("mouseover", function () {
      this.style.transition = "transform 0.3s ease";
      if (this.classList.contains("quote-card")) {
        this.style.transform = "translateY(-5px)";
      } else {
        this.style.opacity = "0.8";
      }
    });

    element.addEventListener("mouseout", function () {
      if (this.classList.contains("quote-card")) {
        this.style.transform = "translateY(0)";
      } else {
        this.style.opacity = "1";
      }
    });
  });
}


function addFadeInEffects() {
  const elements = document.querySelectorAll(
    ".quote-card, .message-card, .details-card"
  );

  elements.forEach((element, index) => {
    element.style.opacity = "0";
    element.style.transition = "opacity 0.3s ease";

    setTimeout(() => {
      element.style.opacity = "1";
    }, 100 + index * 50);
  });
}


function setupTextareaAutoResize() {
  const textareas = document.querySelectorAll("textarea");

  textareas.forEach((textarea) => {
    textarea.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
    });

    // Initial height
    textarea.style.height = textarea.scrollHeight + "px";
  });
}


function formatDate(date) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(date).toLocaleDateString("en-US", options);
}
