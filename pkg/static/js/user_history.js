"use strict";

// user_history.js

/**
 * Handle animation effects for elements
 */
function initAnimations() {
  // Animate stat cards on page load
  const statCards = document.querySelectorAll(".stat-card");
  setTimeout(() => {
    statCards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, index * 100);
    });
  }, 300);

  // Animate table rows on page load
  const tableRows = document.querySelectorAll("#historyTableBody tr");
  setTimeout(() => {
    tableRows.forEach((row, index) => {
      setTimeout(() => {
        row.style.opacity = "1";
        row.style.transform = "translateY(0)";
      }, index * 50);
    });
  }, 500);
}

/**
 * Form validation for message submission
 */
function validateMessageForm() {
  const messageForm = document.getElementById("messageForm");
  if (!messageForm) return;

  messageForm.addEventListener("submit", function (e) {
    const messageInput = document.getElementById("messageContent");
    if (!messageInput.value.trim()) {
      e.preventDefault();
      showFormError(messageInput, "Please enter a message");
    }
  });
}

/**
 * Show form error for a given input element
 */
function showFormError(inputElement, message) {
  // Clear any existing error message
  const existingError =
    inputElement.parentElement.querySelector(".error-message");
  if (existingError) {
    existingError.remove();
  }

  // Create and insert error message
  const errorElement = document.createElement("div");
  errorElement.className = "error-message";
  errorElement.textContent = message;
  errorElement.style.color = "#f44336";
  errorElement.style.fontSize = "0.8rem";
  errorElement.style.marginTop = "0.25rem";

  inputElement.style.borderColor = "#f44336";
  inputElement.parentElement.appendChild(errorElement);

  // Remove error when input changes
  inputElement.addEventListener("input", function () {
    inputElement.style.borderColor = "";
    const error = inputElement.parentElement.querySelector(".error-message");
    if (error) error.remove();
  });
}

/**
 * Initialize table row hover effects
 */
function initTableEffects() {
  const tableRows = document.querySelectorAll("#historyTableBody tr");

  tableRows.forEach((row) => {
    row.addEventListener("mouseenter", function () {
      this.style.backgroundColor = "var(--primary-light)";
      this.style.transition = "background-color 0.2s ease";
    });

    row.addEventListener("mouseleave", function () {
      this.style.backgroundColor = "";
    });
  });
}

/**
 * Handle attachment preview for file inputs
 */
function initAttachmentPreview() {
  const fileInput = document.getElementById("attachment");
  if (!fileInput) return;

  const previewContainer = document.createElement("div");
  previewContainer.className = "attachment-preview";
  previewContainer.style.marginTop = "10px";
  previewContainer.style.display = "none";

  fileInput.parentElement.appendChild(previewContainer);

  fileInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      const file = this.files[0];
      previewContainer.style.display = "block";

      // Clear previous preview
      previewContainer.innerHTML = "";

      // Create preview based on file type
      if (file.type.startsWith("image/")) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.style.maxWidth = "100%";
        img.style.maxHeight = "200px";
        img.style.borderRadius = "8px";
        previewContainer.appendChild(img);
      } else {
        const fileInfo = document.createElement("div");
        fileInfo.innerHTML = `<i class="fas fa-file"></i> ${
          file.name
        } (${formatFileSize(file.size)})`;
        fileInfo.style.padding = "10px";
        fileInfo.style.backgroundColor = "var(--light-gray)";
        fileInfo.style.borderRadius = "8px";
        previewContainer.appendChild(fileInfo);
      }

      // Add remove button
      const removeBtn = document.createElement("button");
      removeBtn.innerHTML = '<i class="fas fa-times"></i> Remove';
      removeBtn.className = "remove-file-btn";
      removeBtn.style.marginTop = "5px";
      removeBtn.style.backgroundColor = "#f44336";
      removeBtn.style.color = "white";
      removeBtn.style.border = "none";
      removeBtn.style.borderRadius = "4px";
      removeBtn.style.padding = "5px 10px";
      removeBtn.style.cursor = "pointer";

      removeBtn.addEventListener("click", function (e) {
        e.preventDefault();
        fileInput.value = "";
        previewContainer.style.display = "none";
      });

      previewContainer.appendChild(removeBtn);
    } else {
      previewContainer.style.display = "none";
    }
  });
}

/**
 * Format file size in readable format
 */
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Handle responsive behavior for mobile devices
 */
function handleResponsive() {
  const filterGroup = document.querySelector(".filter-group");
  const sortSelect = document.getElementById("sortSelect");

  // For smaller screens, create a dropdown for filter instead of buttons
  function checkScreenSize() {
    if (window.innerWidth < 768) {
      // If screen is small and a mobile dropdown doesn't exist yet
      if (!document.getElementById("filterMobileSelect")) {
        createMobileFilterDropdown();
      }
    } else {
      // If screen is large and a mobile dropdown exists, show regular buttons
      const mobileDropdown = document.getElementById("filterMobileSelect");
      if (mobileDropdown) {
        mobileDropdown.style.display = "none";
        filterGroup.style.display = "flex";
      }
    }
  }

  function createMobileFilterDropdown() {
    const mobileSelect = document.createElement("select");
    mobileSelect.id = "filterMobileSelect";
    mobileSelect.className = "sort-select";

    const options = [
      { value: "all", text: "All Services" },
      { value: "vehicle_verification", text: "Vehicle Verification" },
      { value: "global_courier", text: "Global Courier" },
      { value: "air_freight", text: "Air Freight" },
      { value: "sea_freight", text: "Sea Freight" },
    ];

    options.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt.value;
      option.textContent = opt.text;
      mobileSelect.appendChild(option);
    });

    mobileSelect.addEventListener("change", function () {
      const filterValue = this.value;
      const tableRows = document.querySelectorAll("#historyTableBody tr");

      tableRows.forEach((row) => {
        if (filterValue === "all") {
          row.style.display = "";
        } else {
          const serviceType = row.getAttribute("data-service-type");
          row.style.display = serviceType === filterValue ? "" : "none";
        }
      });
    });

    filterGroup.style.display = "none";
    filterGroup.parentNode.insertBefore(mobileSelect, filterGroup);
  }

  // Call initially and add resize listener
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
}

/**
 * Update status badges with appropriate colors
 */
function updateStatusBadges() {
  const statusBadges = document.querySelectorAll(".status-badge");

  statusBadges.forEach((badge) => {
    const status = badge.textContent.trim().toLowerCase();
    badge.classList.add(`status-${status}`);
  });
}

/**
 * Handle date formatting
 */
function formatDates() {
  const dateCells = document.querySelectorAll(
    "#historyTableBody tr td:nth-child(4)"
  );

  dateCells.forEach((cell) => {
    const date = new Date(cell.textContent);
    if (!isNaN(date.getTime())) {
      const options = { year: "numeric", month: "short", day: "numeric" };
      cell.textContent = date.toLocaleDateString(undefined, options);
    }
  });
}

/**
 * Handle message notification counts
 */
function updateMessageCounts() {
  const actionButtons = document.querySelectorAll(".action-btn");

  actionButtons.forEach((btn) => {
    const countBadge = btn.querySelector(".unread-badge");
    if (countBadge && parseInt(countBadge.textContent) > 0) {
      btn.style.fontWeight = "bold";
    }
  });
}

/**
 * Initialize the page
 */
function initPage() {
  initAnimations();
  validateMessageForm();
  initTableEffects();
  initAttachmentPreview();
  handleResponsive();
  updateStatusBadges();
  formatDates();
  updateMessageCounts();
}

// Initialize everything when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", initPage);
