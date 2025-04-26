"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // Create Preloader
  const preloader = document.createElement("div");
  preloader.className = "preloader";

  // Create logistics loader animation
  const logisticsLoader = document.createElement("div");
  logisticsLoader.className = "logistics-loader";

  const truck = document.createElement("div");
  truck.className = "truck";

  const wheelFront = document.createElement("div");
  wheelFront.className = "wheel front";

  const wheelBack = document.createElement("div");
  wheelBack.className = "wheel back";

  const wheelTrailerFront = document.createElement("div");
  wheelTrailerFront.className = "wheel trailer-front";

  const wheelTrailerBack = document.createElement("div");
  wheelTrailerBack.className = "wheel trailer-back";

  const road = document.createElement("div");
  road.className = "road";

  // Progress bar
  const progressTrack = document.createElement("div");
  progressTrack.className = "progress-track";

  const progress = document.createElement("div");
  progress.className = "progress";

  // Brand name
  const brandText = document.createElement("div");
  brandText.className = "brand-text";
  brandText.innerHTML = "PAFEL<span>NG</span>";

  // Assemble the preloader
  truck.appendChild(wheelFront);
  truck.appendChild(wheelBack);
  logisticsLoader.appendChild(truck);
  logisticsLoader.appendChild(wheelTrailerFront);
  logisticsLoader.appendChild(wheelTrailerBack);
  logisticsLoader.appendChild(road);

  progressTrack.appendChild(progress);

  preloader.appendChild(logisticsLoader);
  preloader.appendChild(progressTrack);
  preloader.appendChild(brandText);

  document.body.appendChild(preloader);

  // Handle preloader fadeout
  window.addEventListener("load", function () {
    // Simulate loading time for demonstration
    setTimeout(function () {
      preloader.classList.add("fade-out");

      // Remove preloader from DOM after animation completes
      setTimeout(function () {
        preloader.remove();
      }, 800);
    }, 2000);
  });
});
