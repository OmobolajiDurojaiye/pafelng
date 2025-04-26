"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // Preloader
  const preloader = document.createElement("div");
  preloader.className = "preloader";
  preloader.innerHTML = '<div class="loader"></div>';
  document.body.appendChild(preloader);

  window.addEventListener("load", function () {
    setTimeout(function () {
      preloader.classList.add("fade-out");
    }, 500);
  });
});
