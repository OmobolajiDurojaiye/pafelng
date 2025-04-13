"use strict";

const flashes = document.querySelectorAll(".flash");

flashes.forEach((flash) => {
  setTimeout(() => {
    flash.style.opacity = "0";
    flash.style.transform = "translateY(30px)";
    setTimeout(() => flash.remove(), 500);
  }, 5000);
});
