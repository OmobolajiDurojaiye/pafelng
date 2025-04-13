"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("signup-form");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.querySelector(".toggle-password");
  const strengthProgress = document.querySelector(".strength-progress");
  const strengthLabel = document.querySelector(".strength-label");

  let currentStrength = 0;

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

  // Password strength checker
  passwordInput.addEventListener("input", function () {
    const password = this.value;
    currentStrength = checkPasswordStrength(password);
    updatePasswordStrengthIndicator(currentStrength);
  });

  // Prevent form submission if password is too weak
  form.addEventListener("submit", function (e) {
    if (currentStrength < 40) {
      e.preventDefault();
      strengthProgress.style.backgroundColor = "#dc3545";
      strengthLabel.textContent = "Password too weak to create account";
      passwordInput.focus();

      // Optional shake animation
      strengthLabel.style.animation = "shake 0.3s ease";
      setTimeout(() => (strengthLabel.style.animation = ""), 300);
    }
  });

  // Floating label effect
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    if (input.value) input.classList.add("has-value");

    input.addEventListener("focus", () => input.classList.add("has-value"));
    input.addEventListener("blur", () => {
      if (!input.value) input.classList.remove("has-value");
    });
  });

  // Input hover animation
  document.querySelectorAll(".input-container").forEach((container) => {
    container.addEventListener("mouseenter", function () {
      if (!this.classList.contains("error")) {
        const input = this.querySelector("input");
        if (!input.matches(":focus") && !input.value) {
          this.querySelector(".input-icon").style.color = "#42b0d5";
        }
      }
    });

    container.addEventListener("mouseleave", function () {
      if (!this.classList.contains("error")) {
        const input = this.querySelector("input");
        if (!input.matches(":focus") && !input.value) {
          this.querySelector(".input-icon").style.color = "#6c757d";
        }
      }
    });
  });

  // Password strength logic
  function checkPasswordStrength(password) {
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    return Math.min(Math.floor((strength / 6) * 100), 100);
  }

  function updatePasswordStrengthIndicator(strength) {
    strengthProgress.style.width = `${strength}%`;

    if (strength === 0) {
      strengthProgress.style.backgroundColor = "#e9ecef";
      strengthLabel.textContent = "Password strength";
    } else if (strength < 40) {
      strengthProgress.style.backgroundColor = "#dc3545";
      strengthLabel.textContent = "Weak";
    } else if (strength < 70) {
      strengthProgress.style.backgroundColor = "#ffc107";
      strengthLabel.textContent = "Medium";
    } else {
      strengthProgress.style.backgroundColor = "#28a745";
      strengthLabel.textContent = "Strong";
    }
  }
});
