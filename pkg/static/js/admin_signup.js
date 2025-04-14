"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // Form validation
  const form = document.getElementById("admin-signup-form");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm_password");

  const nameError = document.getElementById("name-error");
  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");
  const confirmPasswordError = document.getElementById(
    "confirm-password-error"
  );

  // Toggle password visibility
  const togglePassword = document.getElementById("toggle-password");
  const toggleConfirmPassword = document.getElementById(
    "toggle-confirm-password"
  );

  togglePassword.addEventListener("click", function () {
    togglePasswordVisibility(passwordInput, togglePassword);
  });

  toggleConfirmPassword.addEventListener("click", function () {
    togglePasswordVisibility(confirmPasswordInput, toggleConfirmPassword);
  });

  function togglePasswordVisibility(inputField, toggleIcon) {
    if (inputField.type === "password") {
      inputField.type = "text";
      toggleIcon.classList.remove("fa-eye");
      toggleIcon.classList.add("fa-eye-slash");
    } else {
      inputField.type = "password";
      toggleIcon.classList.remove("fa-eye-slash");
      toggleIcon.classList.add("fa-eye");
    }
  }

  // Input validation functions
  function validateName() {
    if (nameInput.value.trim() === "") {
      nameError.textContent = "Name is required";
      return false;
    } else if (nameInput.value.trim().length < 3) {
      nameError.textContent = "Name must be at least 3 characters";
      return false;
    } else {
      nameError.textContent = "";
      return true;
    }
  }

  function validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput.value.trim() === "") {
      emailError.textContent = "Email is required";
      return false;
    } else if (!emailRegex.test(emailInput.value.trim())) {
      emailError.textContent = "Please enter a valid email address";
      return false;
    } else {
      emailError.textContent = "";
      return true;
    }
  }

  function validatePassword() {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (passwordInput.value === "") {
      passwordError.textContent = "Password is required";
      return false;
    } else if (passwordInput.value.length < 8) {
      passwordError.textContent = "Password must be at least 8 characters";
      return false;
    } else if (!passwordRegex.test(passwordInput.value)) {
      passwordError.textContent =
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
      return false;
    } else {
      passwordError.textContent = "";
      return true;
    }
  }

  function validateConfirmPassword() {
    if (confirmPasswordInput.value === "") {
      confirmPasswordError.textContent = "Please confirm your password";
      return false;
    } else if (confirmPasswordInput.value !== passwordInput.value) {
      confirmPasswordError.textContent = "Passwords do not match";
      return false;
    } else {
      confirmPasswordError.textContent = "";
      return true;
    }
  }

  // Add event listeners for real-time validation
  nameInput.addEventListener("blur", validateName);
  emailInput.addEventListener("blur", validateEmail);
  passwordInput.addEventListener("blur", validatePassword);
  confirmPasswordInput.addEventListener("blur", validateConfirmPassword);

  // Form submission validation
  form.addEventListener("submit", function (event) {
    // Validate all fields
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    // Prevent form submission if validation fails
    if (
      !isNameValid ||
      !isEmailValid ||
      !isPasswordValid ||
      !isConfirmPasswordValid
    ) {
      event.preventDefault();
    }
  });

  // Add subtle animations
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentElement.style.transform = "translateY(-5px)";
    });

    input.addEventListener("blur", function () {
      this.parentElement.style.transform = "translateY(0)";
    });
  });
});
