document.addEventListener("DOMContentLoaded", function () {
  // Form validation
  const form = document.getElementById("admin-login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");

  // Toggle password visibility
  const togglePassword = document.getElementById("toggle-password");

  togglePassword.addEventListener("click", function () {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePassword.classList.remove("fa-eye");
      togglePassword.classList.add("fa-eye-slash");
    } else {
      passwordInput.type = "password";
      togglePassword.classList.remove("fa-eye-slash");
      togglePassword.classList.add("fa-eye");
    }
  });

  // Input validation functions
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
    if (passwordInput.value === "") {
      passwordError.textContent = "Password is required";
      return false;
    } else {
      passwordError.textContent = "";
      return true;
    }
  }

  // Add event listeners for real-time validation
  emailInput.addEventListener("blur", validateEmail);
  passwordInput.addEventListener("blur", validatePassword);

  // Form submission validation
  form.addEventListener("submit", function (event) {
    // Validate all fields
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    // Prevent form submission if validation fails
    if (!isEmailValid || !isPasswordValid) {
      event.preventDefault();
    }
  });

  // Add subtle animations
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    input.addEventListener("focus", function () {
      if (this.parentElement.classList.contains("input-group")) {
        this.parentElement.style.transform = "translateY(-5px)";
      }
    });

    input.addEventListener("blur", function () {
      if (this.parentElement.classList.contains("input-group")) {
        this.parentElement.style.transform = "translateY(0)";
      }
    });
  });
});
