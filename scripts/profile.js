/**
 * Profile management script for Piggypost.
 * Prompts the user for a name and about when the page loads,
 * displays them in the header, and provides a way to update them.
 */

import { sendKind0Profile } from "./nostr-events.js";

/**
 * Updates the profile display in the header.
 */
function updateProfileDisplay() {
  const profileInfoEl = document.getElementById('profile-info');
  if (profileInfoEl) {
    profileInfoEl.innerHTML = `<strong>${localStorage.getItem('name')}</strong><br>${localStorage.getItem('about')}`;
  }
}

/**
 * Prompts the user to input profile information and updates the display.
 */
function promptProfile() {
  const name = prompt("Enter your name:", localStorage.getItem('name') || "") || localStorage.getItem('name') || "n00b";
  const about = prompt("Enter your bio:", localStorage.getItem('about') || "") || localStorage.getItem('about') || "i keep my coins on the exchange";

  localStorage.setItem('name', name);
  localStorage.setItem('about', about);

  updateProfileDisplay();

  // Send the profile info as a kind 0 event
  if (typeof sendKind0Profile === "function") {
    sendKind0Profile(name, about);
  }
}

// Initialize profile when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Prompt for initial profile info

  let storedName = localStorage.getItem('name');
  if (!storedName) {
    promptProfile();
  }

  updateProfileDisplay();


  // Set up the event listener for changing profile info
  const editButton = document.getElementById('edit-profile');
  if (editButton) {
    editButton.addEventListener('click', promptProfile);
  }
});

