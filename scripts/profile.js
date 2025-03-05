/**
 * Profile management script for Piggypost.
 * Prompts the user for a username and bio when the page loads,
 * displays them in the header, and provides a way to update them.
 */

/**
 * Updates the profile display in the header.
 */
function updateProfileDisplay() {
  const profileInfoEl = document.getElementById('profile-info');
  if (profileInfoEl) {
    profileInfoEl.innerHTML = `<strong>${localStorage.getItem('username')}</strong><br>${localStorage.getItem('bio')}`;
  }
}

/**
 * Prompts the user to input profile information and updates the display.
 */
function promptProfile() {
  const username = prompt("Enter your username:", localStorage.getItem('username') || "") || localStorage.getItem('username') || "newbie";
  const bio = prompt("Enter your bio:", localStorage.getItem('bio') || "Hello, I'm new here!") || localStorage.getItem('bio') || "Hello, I'm new here!";

  localStorage.setItem('username', username);
  localStorage.setItem('bio', bio);

  updateProfileDisplay();

  // Send the profile info as a kind 0 event
  if (typeof sendKind0Profile === "function") {
    sendKind0Profile(username, bio);
  }
}

// Initialize profile when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Prompt for initial profile info

  let storedUsername = localStorage.getItem('username');
  if (!storedUsername) {
    promptProfile();
  }

  updateProfileDisplay();


  // Set up the event listener for changing profile info
  const editButton = document.getElementById('edit-profile');
  if (editButton) {
    editButton.addEventListener('click', promptProfile);
  }
});

