"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // Get form elements
  const freightTypeRadios = document.querySelectorAll(
    'input[name="freight_type"]'
  );
  const importOptions = document.getElementById("importOptions");
  const importTypeRadios = document.querySelectorAll(
    'input[name="import_type"]'
  );
  const trackingFields = document.getElementById("trackingFields");
  const commonFields = document.getElementById("commonFields");
  const numBoxesInput = document.getElementById("num_boxes");
  const multipleBoxesField = document.getElementById("multipleBoxesField");

  // Function to toggle import options based on freight type
  function toggleImportOptions() {
    const isImport = document.getElementById("import").checked;

    if (isImport) {
      importOptions.classList.remove("hidden");
      // Check which import type is selected and show appropriate fields
      toggleImportFields();
    } else {
      importOptions.classList.add("hidden");
      trackingFields.classList.add("hidden");
      commonFields.classList.remove("hidden");
    }
  }

  // Function to toggle fields based on import type
  function toggleImportFields() {
    const isTracking = document.getElementById("tracking").checked;

    if (isTracking) {
      trackingFields.classList.remove("hidden");
      commonFields.classList.add("hidden");
    } else {
      trackingFields.classList.add("hidden");
      commonFields.classList.remove("hidden");
    }
  }

  // Function to toggle multiple boxes details field
  function toggleMultipleBoxesField() {
    const numBoxes = parseInt(numBoxesInput.value, 10);

    if (numBoxes > 1) {
      multipleBoxesField.classList.remove("hidden");
    } else {
      multipleBoxesField.classList.add("hidden");
    }
  }

  // Add event listeners
  freightTypeRadios.forEach((radio) => {
    radio.addEventListener("change", toggleImportOptions);
  });

  importTypeRadios.forEach((radio) => {
    radio.addEventListener("change", toggleImportFields);
  });

  numBoxesInput.addEventListener("change", toggleMultipleBoxesField);

  // Form validation
  const seaFreightForm = document.getElementById("seaFreightForm");

  seaFreightForm.addEventListener("submit", function (event) {
    let isValid = true;

    // Basic validation
    const requiredFields = [
      { id: "name", message: "Please enter a contact name" },
      { id: "email", message: "Please enter a valid email address" },
      { id: "phone", message: "Please enter a phone number" },
    ];

    // Add conditional validation based on the selected options
    if (document.getElementById("import").checked) {
      if (document.getElementById("tracking").checked) {
        requiredFields.push({
          id: "tracking_number",
          message: "Please enter a tracking number",
        });
      } else {
        // For pickup and delivery
        requiredFields.push(
          { id: "pickup_address", message: "Please enter a pickup address" },
          {
            id: "delivery_address",
            message: "Please enter a delivery address",
          },
          { id: "weight", message: "Please enter the weight" },
          {
            id: "volumetric_dimension",
            message: "Please enter the dimensions",
          },
          { id: "description", message: "Please enter a description" },
          { id: "invoice_value", message: "Please enter the invoice value" }
        );
      }
    } else {
      // For export
      requiredFields.push(
        { id: "pickup_address", message: "Please enter a pickup address" },
        { id: "delivery_address", message: "Please enter a delivery address" },
        { id: "weight", message: "Please enter the weight" },
        { id: "volumetric_dimension", message: "Please enter the dimensions" },
        { id: "description", message: "Please enter a description" },
        { id: "invoice_value", message: "Please enter the invoice value" }
      );
    }

    // Check each required field
    requiredFields.forEach((field) => {
      const element = document.getElementById(field.id);

      // Skip check if element is hidden
      if (element.closest(".hidden")) {
        return;
      }

      if (!element.value.trim()) {
        isValid = false;
        showError(element, field.message);
      } else {
        clearError(element);
      }
    });

    // Special validation for email format
    const emailElement = document.getElementById("email");
    if (emailElement.value && !isValidEmail(emailElement.value)) {
      isValid = false;
      showError(emailElement, "Please enter a valid email address");
    }

    // If the form is not valid, prevent submission
    if (!isValid) {
      event.preventDefault();

      // Scroll to the first error
      const firstError = document.querySelector(".error-message");
      if (firstError) {
        firstError.parentElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  });

  // Helper functions for validation
  function showError(element, message) {
    // Clear existing error first
    clearError(element);

    // Create and add error message
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    element.parentElement.appendChild(errorDiv);

    // Add error class to the input
    element.classList.add("input-error");
  }

  function clearError(element) {
    // Remove error message if exists
    const errorDiv = element.parentElement.querySelector(".error-message");
    if (errorDiv) {
      errorDiv.remove();
    }

    // Remove error class from input
    element.classList.remove("input-error");
  }

  function isValidEmail(email) {
    // Basic email validation
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Initialize form display based on default values
  toggleImportOptions();
  toggleMultipleBoxesField();
});
