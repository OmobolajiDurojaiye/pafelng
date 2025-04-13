"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.querySelector(".toggle-password");

  // Toggle password visibility
  togglePassword.addEventListener("click", function () {
    const eyeIcon = this.querySelector(".eye-icon");
    const eyeOffIcon = this.querySelector(".eye-off-icon");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      eyeIcon.classList.add("hidden");
      eyeOffIcon.classList.remove("hidden");
    } else {
      passwordInput.type = "password";
      eyeIcon.classList.remove("hidden");
      eyeOffIcon.classList.add("hidden");
    }
  });

  // Form validation
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    let isValid = true;

    // Validate email
    if (!validateEmail(emailInput.value)) {
      showError(emailInput, "Please enter a valid email address");
      isValid = false;
    } else {
      hideError(emailInput);
    }

    // Validate password
    if (!passwordInput.value) {
      showError(passwordInput, "Please enter your password");
      isValid = false;
    } else {
      hideError(passwordInput);
    }

    if (isValid) {
      form.submit();
    }
  });

  // Helper functions
  function validateEmail(email) {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  }

  function showError(input, message) {
    const inputContainer = input.closest(".input-container");
    const errorMessage = inputContainer.querySelector(".error-message");

    inputContainer.classList.add("error");
    errorMessage.textContent = message;
  }

  function hideError(input) {
    const inputContainer = input.closest(".input-container");
    inputContainer.classList.remove("error");
  }

  // Add floating label effect
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    // Initial state check (for browser autofill)
    if (input.value) {
      input.classList.add("has-value");
    }

    input.addEventListener("focus", () => {
      input.classList.add("has-value");
    });

    input.addEventListener("blur", () => {
      if (!input.value) {
        input.classList.remove("has-value");
      }
    });
  });
});
