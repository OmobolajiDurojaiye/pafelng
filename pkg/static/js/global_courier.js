"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("courierForm");

  // Error message elements
  const nameError = document.getElementById("nameError");
  const emailError = document.getElementById("emailError");
  const phoneError = document.getElementById("phoneError");
  const courierError = document.getElementById("courierError");
  const trackingError = document.getElementById("trackingError");

  // Input elements
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const courierSelect = document.getElementById("courier");
  const trackingInput = document.getElementById("tracking");

  // Function to validate email format
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Function to validate phone number format (basic validation)
  function isValidPhone(phone) {
    const phoneRegex = /^[0-9\s\-\+\(\)]{8,20}$/;
    return phoneRegex.test(phone);
  }

  // Function to validate tracking number (basic validation)
  function isValidTracking(tracking) {
    // Basic tracking number format (alphanumeric, min 8 chars)
    return tracking.length >= 8;
  }

  // Input validation on blur
  nameInput.addEventListener("blur", function () {
    if (!this.value.trim()) {
      nameError.textContent = "Name is required";
    } else if (this.value.trim().length < 3) {
      nameError.textContent = "Name must be at least 3 characters";
    } else {
      nameError.textContent = "";
    }
  });

  emailInput.addEventListener("blur", function () {
    if (!this.value.trim()) {
      emailError.textContent = "Email is required";
    } else if (!isValidEmail(this.value.trim())) {
      emailError.textContent = "Please enter a valid email address";
    } else {
      emailError.textContent = "";
    }
  });

  phoneInput.addEventListener("blur", function () {
    if (!this.value.trim()) {
      phoneError.textContent = "Phone number is required";
    } else if (!isValidPhone(this.value.trim())) {
      phoneError.textContent = "Please enter a valid phone number";
    } else {
      phoneError.textContent = "";
    }
  });

  courierSelect.addEventListener("change", function () {
    if (!this.value) {
      courierError.textContent = "Please select a courier company";
    } else {
      courierError.textContent = "";
    }
  });

  trackingInput.addEventListener("blur", function () {
    if (!this.value.trim()) {
      trackingError.textContent = "Tracking number is required";
    } else if (!isValidTracking(this.value.trim())) {
      trackingError.textContent = "Please enter a valid tracking number";
    } else {
      trackingError.textContent = "";
    }
  });

  // Form submission validation
  form.addEventListener("submit", function (event) {
    let isValid = true;

    if (!nameInput.value.trim()) {
      nameError.textContent = "Name is required";
      isValid = false;
    } else if (nameInput.value.trim().length < 3) {
      nameError.textContent = "Name must be at least 3 characters";
      isValid = false;
    }

    if (!emailInput.value.trim()) {
      emailError.textContent = "Email is required";
      isValid = false;
    } else if (!isValidEmail(emailInput.value.trim())) {
      emailError.textContent = "Please enter a valid email address";
      isValid = false;
    }

    // Phone validation
    if (!phoneInput.value.trim()) {
      phoneError.textContent = "Phone number is required";
      isValid = false;
    } else if (!isValidPhone(phoneInput.value.trim())) {
      phoneError.textContent = "Please enter a valid phone number";
      isValid = false;
    }

    // Courier validation
    if (!courierSelect.value) {
      courierError.textContent = "Please select a courier company";
      isValid = false;
    }

    // Tracking number validation
    if (!trackingInput.value.trim()) {
      trackingError.textContent = "Tracking number is required";
      isValid = false;
    } else if (!isValidTracking(trackingInput.value.trim())) {
      trackingError.textContent = "Please enter a valid tracking number";
      isValid = false;
    }

    // If validation fails, prevent form submission
    if (!isValid) {
      event.preventDefault();
    }
  });

  // Clear error messages when typing
  const inputs = [nameInput, emailInput, phoneInput, trackingInput];

  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      const errorElement = document.getElementById(`${this.id}Error`);
      errorElement.textContent = "";
    });
  });
});
