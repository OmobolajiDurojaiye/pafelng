"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("vehicleForm");

  // Toggle buttons
  const numberBtn = document.getElementById("numberBtn");
  const uploadBtn = document.getElementById("uploadBtn");
  const numberContent = document.getElementById("numberContent");
  const uploadContent = document.getElementById("uploadContent");

  // Form elements
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const cNumberInput = document.getElementById("cNumber");
  const documentInput = document.getElementById("document");
  const fileName = document.getElementById("fileName");

  // Error message elements
  const nameError = document.getElementById("nameError");
  const emailError = document.getElementById("emailError");
  const phoneError = document.getElementById("phoneError");
  const cNumberError = document.getElementById("cNumberError");
  const documentError = document.getElementById("documentError");
  const paymentError = document.getElementById("paymentError");

  // Modified toggle functionality: only toggles display but both inputs remain required
  numberBtn.addEventListener("click", function () {
    numberBtn.classList.add("active");
    uploadBtn.classList.remove("active");
    numberContent.classList.remove("hidden");
    uploadContent.classList.add("hidden");

    // Both fields remain required
    cNumberInput.setAttribute("required", "");
    documentInput.setAttribute("required", "");
  });

  uploadBtn.addEventListener("click", function () {
    uploadBtn.classList.add("active");
    numberBtn.classList.remove("active");
    uploadContent.classList.remove("hidden");
    numberContent.classList.add("hidden");

    // Both fields remain required
    documentInput.setAttribute("required", "");
    cNumberInput.setAttribute("required", "");
  });

  // Update file name when selecting a file
  documentInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      fileName.textContent = this.files[0].name;

      // File size validation (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (this.files[0].size > maxSize) {
        documentError.textContent = "File size must be less than 5MB";
        this.value = ""; // Clear the file selection
        fileName.textContent = "Choose file";
      } else {
        documentError.textContent = "";
      }

      // File type validation
      const validTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];
      if (!validTypes.includes(this.files[0].type)) {
        documentError.textContent = "File must be PDF, JPG, or PNG";
        this.value = ""; // Clear the file selection
        fileName.textContent = "Choose file";
      }
    } else {
      fileName.textContent = "Choose file";
    }
  });

  // Function to validate email format
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Function to validate phone number format (basic validation)
  function isValidPhone(phone) {
    // Allow digits, spaces, dashes, plus, and parentheses
    const phoneRegex = /^[0-9\s\-\+\(\)]{8,20}$/;
    return phoneRegex.test(phone);
  }

  // Function to validate C-Number (basic pattern validation)
  function isValidCNumber(cNumber) {
    // Assuming C-Number is alphanumeric and at least 5 characters
    const cNumberRegex = /^[A-Za-z0-9-]{5,}$/;
    return cNumberRegex.test(cNumber);
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

  cNumberInput.addEventListener("blur", function () {
    if (!this.value.trim()) {
      cNumberError.textContent = "C-Number is required";
    } else if (!isValidCNumber(this.value.trim())) {
      cNumberError.textContent = "Please enter a valid C-Number";
    } else {
      cNumberError.textContent = "";
    }
  });

  // Clear error messages when typing
  const inputs = [nameInput, emailInput, phoneInput, cNumberInput];

  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      const errorElement = document.getElementById(`${this.id}Error`);
      errorElement.textContent = "";
    });
  });

  // Main form submission interception for payment
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submit
    let isValid = true;

    // Validation code
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

    if (!phoneInput.value.trim()) {
      phoneError.textContent = "Phone number is required";
      isValid = false;
    } else if (!isValidPhone(phoneInput.value.trim())) {
      phoneError.textContent = "Please enter a valid phone number";
      isValid = false;
    }

    if (!cNumberInput.value.trim()) {
      cNumberError.textContent = "C-Number is required";
      isValid = false;
    } else if (!isValidCNumber(cNumberInput.value.trim())) {
      cNumberError.textContent = "Please enter a valid C-Number";
      isValid = false;
    }

    if (!documentInput.files || !documentInput.files[0]) {
      documentError.textContent = "Please upload an assessment document";
      isValid = false;
    }

    const paymentMethod = document.querySelector(
      'input[name="paymentMethod"]:checked'
    );
    if (!paymentMethod) {
      paymentError.textContent = "Please select a payment method";
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    if (paymentMethod.value === "paystack") {
      payWithPaystack();
    } else {
      alert("Bank transfer is currently disabled. Please use Paystack.");
    }
  });

  function payWithPaystack() {
    const email = emailInput.value.trim();
    const amount = 10 * 100; // Kobo

    const handler = PaystackPop.setup({
      key: "pk_live_ca0a35a5213903cc49738af8e6061386b5e8503e",
      email: email,
      amount: amount,
      currency: "NGN",
      ref: "PX-" + Math.floor(Math.random() * 1000000000),

      callback: function (response) {
        // Inject transaction ref to form
        const refInput = document.createElement("input");
        refInput.type = "hidden";
        refInput.name = "paystack_ref";
        refInput.value = response.reference;
        form.appendChild(refInput);

        form.submit(); // Now submit with payment ref
      },

      onClose: function () {
        alert("Payment popup closed. Please complete payment to proceed.");
      },
    });

    handler.openIframe();
  }

  // Re-include cNumber & document as required
  cNumberInput.setAttribute("required", "");
  documentInput.setAttribute("required", "");
});
