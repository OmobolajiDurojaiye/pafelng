document.addEventListener("DOMContentLoaded", function () {
  // Form validation
  const form = document.getElementById("verification-form");
  const codeInput = document.getElementById("verification_code");
  const codeError = document.getElementById("code-error");

  // Validate verification code format
  function validateVerificationCode() {
    const code = codeInput.value.trim();
    if (code === "") {
      codeError.textContent = "Verification code is required";
      return false;
    } else if (code.length !== 6) {
      codeError.textContent = "Verification code must be 6 digits";
      return false;
    } else if (!/^\d+$/.test(code)) {
      codeError.textContent = "Verification code must contain only numbers";
      return false;
    } else {
      codeError.textContent = "";
      return true;
    }
  }

  // Add event listeners for real-time validation
  codeInput.addEventListener("blur", validateVerificationCode);
  codeInput.addEventListener("input", function () {
    // Only allow digits
    this.value = this.value.replace(/[^\d]/g, "");

    // Auto-submit when 6 digits are entered
    if (this.value.length === 6) {
      validateVerificationCode();
    }
  });

  // Form submission validation
  form.addEventListener("submit", function (event) {
    const isCodeValid = validateVerificationCode();

    // Prevent form submission if validation fails
    if (!isCodeValid) {
      event.preventDefault();
    }
  });

  // Add focus to code input
  codeInput.focus();

  // Add animation for verification code input
  codeInput.addEventListener("focus", function () {
    this.style.transform = "scale(1.02)";
  });

  codeInput.addEventListener("blur", function () {
    this.style.transform = "scale(1)";
  });
});
