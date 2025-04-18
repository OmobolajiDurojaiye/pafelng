"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("modal");
  const reportBtn = document.getElementById("reportBtn");
  const closeBtn = document.querySelector(".close-btn");
  const reportForm = document.getElementById("reportForm");

  // Show modal when report button is clicked
  reportBtn.addEventListener("click", function () {
    modal.style.display = "flex";
  });

  // Close modal when close button is clicked
  closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });

  // Close modal when clicking outside the modal content
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // Form validation and submission
  reportForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const description = document.getElementById("description").value;

    // Validate email
    if (!validateEmail(email)) {
      showFormError("email", "Please enter a valid email address");
      return;
    }

    // Validate description
    if (description.trim().length < 10) {
      showFormError(
        "description",
        "Please provide a more detailed description (at least 10 characters)"
      );
      return;
    }
  });

  // Email validation function
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Show form error message
  function showFormError(fieldId, message) {
    const field = document.getElementById(fieldId);

    // Remove any existing error message
    const existingError = field.parentNode.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }

    // Add error class to field
    field.classList.add("error");

    // Create and append error message
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.style.color = "#e74c3c";
    errorDiv.style.fontSize = "0.85rem";
    errorDiv.style.marginTop = "5px";
    errorDiv.style.textAlign = "left";
    errorDiv.textContent = message;

    field.parentNode.appendChild(errorDiv);

    // Remove error state when field is focused
    field.addEventListener(
      "focus",
      function () {
        field.classList.remove("error");
        const errorMsg = field.parentNode.querySelector(".error-message");
        if (errorMsg) {
          errorMsg.remove();
        }
      },
      { once: true }
    );
  }

  // Add some animation to the page elements
  animateElement(".error-container", "fadeInUp");
  animateElement(".error-code", "fadeIn", 300);
  animateElement(".error-title", "fadeIn", 500);
  animateElement(".error-message", "fadeIn", 700);
  animateElement(".buttons", "fadeIn", 900);

  // Animation helper function
  function animateElement(selector, animation, delay = 0) {
    const element = document.querySelector(selector);
    if (element) {
      setTimeout(() => {
        element.style.opacity = "0";
        element.style.animation = `${animation} 0.8s forwards`;
      }, delay);
    }
  }

  // Add keyframe animations if they don't exist
  if (!document.querySelector("#error-animations")) {
    const styleSheet = document.createElement("style");
    styleSheet.id = "error-animations";
    styleSheet.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(40px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
    document.head.appendChild(styleSheet);
  }
});
