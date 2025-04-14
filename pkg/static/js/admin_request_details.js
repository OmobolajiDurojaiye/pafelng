"use strict";

// Handle close alert button
document.addEventListener("DOMContentLoaded", function () {
  // Close alert messages
  const alertCloseButtons = document.querySelectorAll(".close-alert");

  alertCloseButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const alert = this.parentElement;
      alert.style.opacity = "0";
      setTimeout(() => {
        alert.style.display = "none";
      }, 300);
    });
  });

  // File input handling
  const fileInput = document.getElementById("attachment");
  const fileNameDisplay = document.querySelector(".file-name");

  if (fileInput && fileNameDisplay) {
    fileInput.addEventListener("change", function () {
      if (this.files.length > 0) {
        fileNameDisplay.textContent = this.files[0].name;
      } else {
        fileNameDisplay.textContent = "No file chosen";
      }
    });
  }

  // Smooth scrolling for messages container
  const messagesContainer = document.querySelector(".messages-container");
  if (messagesContainer) {
    // Scroll to bottom of messages container on page load
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Form validation
  const replyForm = document.querySelector(".reply-form");
  if (replyForm) {
    replyForm.addEventListener("submit", function (event) {
      const messageInput = document.getElementById("message");

      if (!messageInput.value.trim()) {
        event.preventDefault();
        // Create a temporary error message
        const errorMsg = document.createElement("div");
        errorMsg.className = "form-error";
        errorMsg.textContent = "Please enter a message before sending";
        errorMsg.style.color = "#d9534f";
        errorMsg.style.fontSize = "0.9rem";
        errorMsg.style.marginTop = "0.5rem";

        // Insert error message after textarea
        messageInput.parentNode.appendChild(errorMsg);

        // Remove error message after 3 seconds
        setTimeout(() => {
          errorMsg.remove();
        }, 3000);

        // Focus on message input
        messageInput.focus();
      }
    });
  }

  // Status change confirmation
  const statusForm = document.querySelector(".status-form");
  if (statusForm) {
    statusForm.addEventListener("submit", function (event) {
      const statusSelect = document.getElementById("status");
      const currentStatus = statusSelect.getAttribute("data-current-status");
      const newStatus = statusSelect.value;

      if (currentStatus && newStatus !== currentStatus) {
        if (
          !confirm(
            `Are you sure you want to change the status from "${currentStatus}" to "${newStatus}"?`
          )
        ) {
          event.preventDefault();
        }
      }
    });

    // Set current status as data attribute for comparison
    const statusSelect = document.getElementById("status");
    if (statusSelect) {
      const selectedOption = statusSelect.options[statusSelect.selectedIndex];
      statusSelect.setAttribute("data-current-status", selectedOption.value);
    }
  }

  // Add animation effects to messages
  const messageCards = document.querySelectorAll(".message-card");
  if (messageCards.length > 0) {
    messageCards.forEach((card, index) => {
      // Add a slight delay to each card for a staggered effect
      setTimeout(() => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, index * 100);
    });
  }
});
