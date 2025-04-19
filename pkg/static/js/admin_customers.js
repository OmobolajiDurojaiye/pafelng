"use strict";

// DOM Elements
document.addEventListener("DOMContentLoaded", function () {
  // Search and filter elements
  const customerSearch = document.getElementById("customerSearch");
  const sortFilter = document.getElementById("sortFilter");
  const statusFilter = document.getElementById("statusFilter");

  // Table elements
  const customersTable = document.querySelector(".customers-table");
  const customerRows = document.querySelectorAll(".customers-table tbody tr");

  // Modal elements
  const customerModal = document.getElementById("customerModal");
  const modalCustomerName = document.getElementById("modalCustomerName");
  const modalCustomerEmail = document.getElementById("modalCustomerEmail");
  const modalCustomerJoined = document.getElementById("modalCustomerJoined");
  const modalCustomerRequests = document.getElementById(
    "modalCustomerRequests"
  );
  const modalCustomerStatus = document.getElementById("modalCustomerStatus");
  const modalActivityList = document.getElementById("modalActivityList");

  // Pagination elements
  const paginationButtons = document.querySelectorAll(".pagination-btn");
  const paginationInfo = document.querySelector(".pagination-info");

  // Tab elements
  const navTabs = document.querySelectorAll(".nav-tab");

  // Current state variables
  let currentPage = 1;
  const itemsPerPage = 10;
  let filteredRows = Array.from(customerRows);

  // Search functionality
  if (customerSearch) {
    customerSearch.addEventListener("input", function () {
      filterTable();
    });
  }

  // Sorting functionality
  if (sortFilter) {
    sortFilter.addEventListener("change", function () {
      filterTable();
    });
  }

  // Status filter functionality
  if (statusFilter) {
    statusFilter.addEventListener("change", function () {
      filterTable();
    });
  }

  // Tab navigation
  navTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Remove active class from all tabs
      navTabs.forEach((t) => t.classList.remove("active"));

      // Add active class to clicked tab
      this.classList.add("active");

      // Get the tab value (All, Active, Inactive)
      const tabValue = this.textContent.trim().toLowerCase();

      // Set status filter based on tab
      if (tabValue === "active") {
        statusFilter.value = "active";
      } else if (tabValue === "inactive") {
        statusFilter.value = "inactive";
      } else {
        statusFilter.value = "all";
      }

      // Apply filters
      filterTable();
    });
  });

  // View customer details functionality
  document.querySelectorAll(".view-btn").forEach((btn, index) => {
    btn.addEventListener("click", function () {
      const row = this.closest("tr");
      openCustomerModal(row);
    });
  });

  // Edit functionality
  document.querySelectorAll(".action-btn:nth-child(2)").forEach((btn) => {
    btn.addEventListener("click", function () {
      const row = this.closest("tr");
      const customerName = row.querySelector(
        ".customer-info div:first-child"
      ).textContent;
      alert(`Edit functionality for ${customerName} will be implemented soon.`);
    });
  });

  // Delete functionality with confirmation
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const row = this.closest("tr");
      const customerName = row.querySelector(
        ".customer-info div:first-child"
      ).textContent;
      if (
        confirm(
          `Are you sure you want to delete customer ${customerName}? This action cannot be undone.`
        )
      ) {
        alert(
          `Delete functionality for ${customerName} will be implemented soon.`
        );
      }
    });
  });

  // Pagination functionality
  paginationButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      if (this.classList.contains("disabled")) {
        return;
      }

      // If it's a number button
      if (!isNaN(parseInt(this.textContent))) {
        currentPage = parseInt(this.textContent);
      }
      // If it's next button
      else if (this.querySelector(".fa-chevron-right")) {
        currentPage++;
      }
      // If it's previous button
      else if (this.querySelector(".fa-chevron-left")) {
        currentPage--;
      }

      updateTable();
    });
  });

  // Filter table function
  function filterTable() {
    const searchTerm = customerSearch ? customerSearch.value.toLowerCase() : "";
    const statusValue = statusFilter ? statusFilter.value : "all";
    const sortValue = sortFilter ? sortFilter.value : "name";

    // Filter based on search and status
    filteredRows = Array.from(customerRows).filter((row) => {
      const customerName = row
        .querySelector(".customer-name")
        .textContent.toLowerCase();
      const customerEmail = row
        .querySelector(".customer-email")
        .textContent.toLowerCase();
      const customerStatus = row
        .querySelector(".badge")
        .textContent.toLowerCase();

      const matchesSearch =
        customerName.includes(searchTerm) || customerEmail.includes(searchTerm);
      const matchesStatus =
        statusValue === "all" || customerStatus === statusValue;

      return matchesSearch && matchesStatus;
    });

    // Sort the data
    filteredRows.sort((a, b) => {
      if (sortValue === "name") {
        const nameA = a
          .querySelector(".customer-info div:first-child")
          .textContent.toLowerCase();
        const nameB = b
          .querySelector(".customer-info div:first-child")
          .textContent.toLowerCase();
        return nameA.localeCompare(nameB);
      } else if (sortValue === "date") {
        const dateA = new Date(a.querySelectorAll("td")[1].textContent);
        const dateB = new Date(b.querySelectorAll("td")[1].textContent);
        return dateB - dateA; // Most recent first
      } else if (sortValue === "requests") {
        const requestsA =
          parseInt(a.querySelectorAll("td")[2].textContent) +
          parseInt(a.querySelectorAll("td")[3].textContent) +
          parseInt(a.querySelectorAll("td")[4].textContent) +
          parseInt(a.querySelectorAll("td")[5].textContent);
        const requestsB =
          parseInt(b.querySelectorAll("td")[2].textContent) +
          parseInt(b.querySelectorAll("td")[3].textContent) +
          parseInt(b.querySelectorAll("td")[4].textContent) +
          parseInt(b.querySelectorAll("td")[5].textContent);
        return requestsB - requestsA; // Most requests first
      }
      return 0;
    });

    // Reset to first page
    currentPage = 1;

    // Update the table
    updateTable();
  }

  // Update table display based on filters and pagination
  function updateTable() {
    // Hide all rows
    customerRows.forEach((row) => {
      row.style.display = "none";
    });

    // Calculate start and end index
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredRows.length);

    // Display current page rows
    for (let i = startIndex; i < endIndex; i++) {
      filteredRows[i].style.display = "table-row";
    }

    // Update pagination info
    if (paginationInfo) {
      paginationInfo.innerHTML = `Showing <span>${
        filteredRows.length > 0 ? startIndex + 1 : 0
      }</span> to <span>${endIndex}</span> of <span>${
        filteredRows.length
      }</span> entries`;
    }

    // Update pagination buttons
    updatePaginationButtons();
  }

  // Update pagination buttons based on current page and total pages
  function updatePaginationButtons() {
    const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

    // Clear pagination controls
    const paginationControls = document.querySelector(".pagination-controls");
    paginationControls.innerHTML = "";

    // Previous button
    const prevBtn = document.createElement("button");
    prevBtn.className = `pagination-btn ${currentPage === 1 ? "disabled" : ""}`;
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    if (currentPage > 1) {
      prevBtn.addEventListener("click", () => {
        currentPage--;
        updateTable();
      });
    }
    paginationControls.appendChild(prevBtn);

    // Page buttons
    const maxVisibleButtons = 5;
    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisibleButtons / 2)
    );
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.className = `pagination-btn ${i === currentPage ? "active" : ""}`;
      pageBtn.textContent = i;
      pageBtn.addEventListener("click", () => {
        currentPage = i;
        updateTable();
      });
      paginationControls.appendChild(pageBtn);
    }

    // Ellipsis
    if (endPage < totalPages) {
      const ellipsisBtn = document.createElement("button");
      ellipsisBtn.className = "pagination-btn";
      ellipsisBtn.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
      paginationControls.appendChild(ellipsisBtn);
    }

    // Next button
    const nextBtn = document.createElement("button");
    nextBtn.className = `pagination-btn ${
      currentPage === totalPages || totalPages === 0 ? "disabled" : ""
    }`;
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    if (currentPage < totalPages) {
      nextBtn.addEventListener("click", () => {
        currentPage++;
        updateTable();
      });
    }
    paginationControls.appendChild(nextBtn);
  }

  // Open customer modal with data
  function openCustomerModal(row) {
    // Extract customer data from the row
    const customerName = row.querySelector(
      ".customer-info div:first-child"
    ).textContent;
    const customerEmail = row.querySelector(".customer-email").textContent;
    const joinedDate = row.querySelectorAll("td")[1].textContent;

    // Count total requests
    const vehicleVerifications = parseInt(
      row.querySelectorAll("td")[2].textContent
    );
    const globalCouriers = parseInt(row.querySelectorAll("td")[3].textContent);
    const airFreights = parseInt(row.querySelectorAll("td")[4].textContent);
    const seaFreights = parseInt(row.querySelectorAll("td")[5].textContent);
    const totalRequests =
      vehicleVerifications + globalCouriers + airFreights + seaFreights;

    const status = row.querySelector(".badge").textContent;
    const statusClass = row
      .querySelector(".badge")
      .classList.contains("badge-active")
      ? "badge-active"
      : "badge-inactive";

    // Populate modal with data
    modalCustomerName.textContent = customerName;
    modalCustomerEmail.textContent = customerEmail;
    modalCustomerJoined.textContent = joinedDate;
    modalCustomerRequests.textContent = `${totalRequests} total requests`;
    modalCustomerStatus.textContent = status;
    modalCustomerStatus.className = `badge ${statusClass}`;

    // Create activity items based on service usage
    modalActivityList.innerHTML = "";

    if (vehicleVerifications > 0) {
      const activityItem = createActivityItem(
        "Vehicle Verification",
        `${customerName} has ${vehicleVerifications} vehicle verification requests.`
      );
      modalActivityList.appendChild(activityItem);
    }

    if (globalCouriers > 0) {
      const activityItem = createActivityItem(
        "Global Courier",
        `${customerName} has ${globalCouriers} global courier requests.`
      );
      modalActivityList.appendChild(activityItem);
    }

    if (airFreights > 0) {
      const activityItem = createActivityItem(
        "Air Freight",
        `${customerName} has ${airFreights} air freight requests.`
      );
      modalActivityList.appendChild(activityItem);
    }

    if (seaFreights > 0) {
      const activityItem = createActivityItem(
        "Sea Freight",
        `${customerName} has ${seaFreights} sea freight requests.`
      );
      modalActivityList.appendChild(activityItem);
    }

    // If no activities, show message
    if (modalActivityList.children.length === 0) {
      const noActivity = document.createElement("div");
      noActivity.className = "activity-item";
      noActivity.innerHTML =
        '<div class="activity-details">No activity recorded for this customer.</div>';
      modalActivityList.appendChild(noActivity);
    }

    // Show modal
    customerModal.style.display = "flex";
  }

  // Create activity item element
  function createActivityItem(type, details) {
    const item = document.createElement("div");
    item.className = "activity-item";

    const header = document.createElement("div");
    header.className = "activity-header";

    const typeSpan = document.createElement("span");
    typeSpan.className = "activity-type";
    typeSpan.textContent = type;

    const dateSpan = document.createElement("span");
    dateSpan.className = "activity-date";
    // Generate a random date within the last month
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
    dateSpan.textContent = randomDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    header.appendChild(typeSpan);
    header.appendChild(dateSpan);

    const activityDetails = document.createElement("div");
    activityDetails.className = "activity-details";
    activityDetails.textContent = details;

    item.appendChild(header);
    item.appendChild(activityDetails);

    return item;
  }

  // Close modal function
  window.closeModal = function () {
    customerModal.style.display = "none";
  };

  // Close modal when clicking outside
  window.addEventListener("click", function (event) {
    if (event.target === customerModal) {
      closeModal();
    }
  });

  // Initialize the table
  updateTable();
});
