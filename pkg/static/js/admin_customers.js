"use strict";

// DOM Elements
document.addEventListener("DOMContentLoaded", function () {
  // Main elements
  const customerSearch = document.getElementById("customerSearch");
  const sortOptions = document.getElementById("sortOptions");
  const statusFilter = document.getElementById("statusFilter");
  const customersTable = document.getElementById("customersTable");
  const customerRows = document.querySelectorAll(".customer-row");

  // Modal elements
  const customerDetailsModal = document.getElementById("customerDetailsModal");
  const customerName = document.querySelector(".customer-name");
  const customerEmail = document.querySelector(".customer-email span");
  const customerJoined = document.querySelector(".customer-joined span");

  // Stats elements
  const vehicleRequestCount = document.getElementById("vehicleRequestCount");
  const courierRequestCount = document.getElementById("courierRequestCount");
  const airFreightCount = document.getElementById("airFreightCount");
  const seaFreightCount = document.getElementById("seaFreightCount");

  // Tables
  const vehicleVerificationsTable = document.querySelector(
    "#vehicleVerificationsTable tbody"
  );
  const globalCouriersTable = document.querySelector(
    "#globalCouriersTable tbody"
  );
  const airFreightsTable = document.querySelector("#airFreightsTable tbody");
  const seaFreightsTable = document.querySelector("#seaFreightsTable tbody");

  // Error messages
  const noVehicleData = document.getElementById("noVehicleData");
  const noCourierData = document.getElementById("noCourierData");
  const noAirData = document.getElementById("noAirData");
  const noSeaData = document.getElementById("noSeaData");

  // Search functionality
  customerSearch.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase().trim();

    customerRows.forEach((row) => {
      const name = row
        .querySelector("td:nth-child(2)")
        .textContent.toLowerCase();
      const email = row
        .querySelector("td:nth-child(3)")
        .textContent.toLowerCase();
      const date = row
        .querySelector("td:nth-child(4)")
        .textContent.toLowerCase();

      if (
        name.includes(searchTerm) ||
        email.includes(searchTerm) ||
        date.includes(searchTerm)
      ) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });

  // Status filter functionality
  statusFilter.addEventListener("change", function () {
    const selectedStatus = this.value;

    customerRows.forEach((row) => {
      const statusElement = row.querySelector("td:nth-child(5) .badge");
      const isActive = statusElement.classList.contains("badge-success");

      if (
        selectedStatus === "all" ||
        (selectedStatus === "active" && isActive) ||
        (selectedStatus === "inactive" && !isActive)
      ) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });

  // Sort functionality
  sortOptions.addEventListener("change", function () {
    const sortBy = this.value;
    const rows = Array.from(customerRows);

    rows.sort((a, b) => {
      if (sortBy === "name") {
        const nameA = a
          .querySelector("td:nth-child(2)")
          .textContent.toLowerCase();
        const nameB = b
          .querySelector("td:nth-child(2)")
          .textContent.toLowerCase();
        return nameA.localeCompare(nameB);
      } else if (sortBy === "date") {
        const dateA = new Date(a.querySelector("td:nth-child(4)").textContent);
        const dateB = new Date(b.querySelector("td:nth-child(4)").textContent);
        return dateB - dateA; // Newest first
      } else if (sortBy === "requests") {
        const requestsA = parseInt(
          a.querySelector("td:nth-child(6)").textContent
        );
        const requestsB = parseInt(
          b.querySelector("td:nth-child(6)").textContent
        );
        return requestsB - requestsA; // Most requests first
      }
      return 0;
    });

    // Remove existing rows
    rows.forEach((row) => row.remove());

    // Add sorted rows
    const tbody = customersTable.querySelector("tbody");
    rows.forEach((row) => tbody.appendChild(row));
  });

  // View details functionality
  document.querySelectorAll(".view-details-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent row click event from firing
      const userId = this.getAttribute("data-userid");
      openCustomerDetails(userId);
    });
  });

  customerRows.forEach((row) => {
    row.addEventListener("click", function () {
      const userId = this.getAttribute("data-userid");
      openCustomerDetails(userId);
    });
  });

  function openCustomerDetails(userId) {
    // In a real implementation, this would fetch data from the server
    // For design purposes, we'll simulate with the available data

    const userRow = document.querySelector(
      `.customer-row[data-userid="${userId}"]`
    );
    if (!userRow) return;

    const name = userRow.querySelector("td:nth-child(2)").textContent;
    const email = userRow.querySelector("td:nth-child(3)").textContent;
    const joinedDate = userRow.querySelector("td:nth-child(4)").textContent;
    const totalRequests = userRow.querySelector("td:nth-child(6)").textContent;

    // Set customer details in modal
    customerName.textContent = name;
    customerEmail.textContent = email;
    customerJoined.textContent = joinedDate;

    // For design purposes, distribute the total requests among the different services
    const totalReq = parseInt(totalRequests);
    const vehicleReq = Math.floor(totalReq * 0.4);
    const courierReq = Math.floor(totalReq * 0.3);
    const airReq = Math.floor(totalReq * 0.2);
    const seaReq = totalReq - vehicleReq - courierReq - airReq;

    // Update stats
    vehicleRequestCount.textContent = vehicleReq;
    courierRequestCount.textContent = courierReq;
    airFreightCount.textContent = airReq;
    seaFreightCount.textContent = seaReq;

    // Toggle empty states based on counts
    toggleEmptyState(
      noVehicleData,
      vehicleVerificationsTable,
      vehicleReq === 0
    );
    toggleEmptyState(noCourierData, globalCouriersTable, courierReq === 0);
    toggleEmptyState(noAirData, airFreightsTable, airReq === 0);
    toggleEmptyState(noSeaData, seaFreightsTable, seaReq === 0);

    // Simulate data for tables (for design purposes only)
    if (vehicleReq > 0)
      populateVehicleTable(vehicleVerificationsTable, vehicleReq, userId);
    if (courierReq > 0)
      populateCourierTable(globalCouriersTable, courierReq, userId);
    if (airReq > 0) populateAirTable(airFreightsTable, airReq, userId);
    if (seaReq > 0) populateSeaTable(seaFreightsTable, seaReq, userId);

    // Show modal
    $(customerDetailsModal).modal("show");
  }

  function toggleEmptyState(emptyStateElement, tableElement, isEmpty) {
    if (isEmpty) {
      tableElement.parentElement.style.display = "none";
      emptyStateElement.style.display = "block";
    } else {
      tableElement.parentElement.style.display = "block";
      emptyStateElement.style.display = "none";
    }
  }

  // Simulate populating tables for design purposes
  function populateVehicleTable(tableElement, count, userId) {
    tableElement.innerHTML = "";

    const statuses = ["pending", "completed", "in-progress"];
    const statusClasses = {
      pending: "badge-warning",
      completed: "badge-success",
      "in-progress": "badge-info",
    };

    for (let i = 1; i <= count; i++) {
      const randomStatus =
        statuses[Math.floor(Math.random() * statuses.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));

      const row = document.createElement("tr");
      row.innerHTML = `
          <td>V${userId}${i}</td>
          <td>${date.toLocaleDateString()}</td>
          <td>C-${Math.floor(1000000 + Math.random() * 9000000)}</td>
          <td>+234 ${Math.floor(7000000000 + Math.random() * 999999999)}</td>
          <td><span class="badge ${
            statusClasses[randomStatus]
          }">${randomStatus}</span></td>
          <td>
            <button class="btn btn-sm btn-primary action-btn">View</button>
          </td>
        `;
      tableElement.appendChild(row);
    }
  }

  function populateCourierTable(tableElement, count, userId) {
    tableElement.innerHTML = "";

    const companies = ["DHL", "FedEx", "UPS", "USPS", "TNT Express"];
    const statuses = ["pending", "delivered", "in-transit"];
    const statusClasses = {
      pending: "badge-warning",
      delivered: "badge-success",
      "in-transit": "badge-info",
    };

    for (let i = 1; i <= count; i++) {
      const randomCompany =
        companies[Math.floor(Math.random() * companies.length)];
      const randomStatus =
        statuses[Math.floor(Math.random() * statuses.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));

      const row = document.createElement("tr");
      row.innerHTML = `
          <td>C${userId}${i}</td>
          <td>${date.toLocaleDateString()}</td>
          <td>${randomCompany}</td>
          <td>${randomCompany.substring(0, 2)}${Math.floor(
        10000000 + Math.random() * 90000000
      )}</td>
          <td><span class="badge ${
            statusClasses[randomStatus]
          }">${randomStatus}</span></td>
          <td>
            <button class="btn btn-sm btn-primary action-btn">View</button>
          </td>
        `;
      tableElement.appendChild(row);
    }
  }

  function populateAirTable(tableElement, count, userId) {
    tableElement.innerHTML = "";

    const types = ["Import", "Export"];
    const statuses = ["pending", "cleared", "in-transit"];
    const statusClasses = {
      pending: "badge-warning",
      cleared: "badge-success",
      "in-transit": "badge-info",
    };

    for (let i = 1; i <= count; i++) {
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomStatus =
        statuses[Math.floor(Math.random() * statuses.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));

      const row = document.createElement("tr");
      row.innerHTML = `
          <td>A${userId}${i}</td>
          <td>${date.toLocaleDateString()}</td>
          <td>${randomType}</td>
          <td>${Math.floor(100000000 + Math.random() * 900000000)}</td>
          <td><span class="badge ${
            statusClasses[randomStatus]
          }">${randomStatus}</span></td>
          <td>
            <button class="btn btn-sm btn-primary action-btn">View</button>
          </td>
        `;
      tableElement.appendChild(row);
    }
  }

  function populateSeaTable(tableElement, count, userId) {
    tableElement.innerHTML = "";

    const types = ["Import", "Export"];
    const statuses = ["pending", "cleared", "in-transit"];
    const statusClasses = {
      pending: "badge-warning",
      cleared: "badge-success",
      "in-transit": "badge-info",
    };

    for (let i = 1; i <= count; i++) {
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomStatus =
        statuses[Math.floor(Math.random() * statuses.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));

      const row = document.createElement("tr");
      row.innerHTML = `
          <td>S${userId}${i}</td>
          <td>${date.toLocaleDateString()}</td>
          <td>${randomType}</td>
          <td>MSCU${Math.floor(1000000 + Math.random() * 9000000)}</td>
          <td><span class="badge ${
            statusClasses[randomStatus]
          }">${randomStatus}</span></td>
          <td>
            <button class="btn btn-sm btn-primary action-btn">View</button>
          </td>
        `;
      tableElement.appendChild(row);
    }
  }

  // Add form validation if needed
  function validateForm(form) {
    const inputs = form.querySelectorAll(
      "input[required], select[required], textarea[required]"
    );
    let isValid = true;

    inputs.forEach((input) => {
      if (!input.value.trim()) {
        input.classList.add("is-invalid");
        isValid = false;
      } else {
        input.classList.remove("is-invalid");
      }
    });

    return isValid;
  }

  // Add animation effects
  function addHoverAnimation() {
    document.querySelectorAll(".info-card").forEach((card) => {
      card.addEventListener("mouseenter", function () {
        this.style.animation = "pulse 1.5s infinite";
      });

      card.addEventListener("mouseleave", function () {
        this.style.animation = "";
      });
    });
  }

  // Initialize animations
  addHoverAnimation();
});
