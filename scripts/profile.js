/**
 * Profile management script for Piggypost.
 * Prompts the user for a username and bio when the page loads,
 * displays them in the header, and provides a way to update them.
 */

var username;
var bio;

/**
 * Updates the profile display in the header.
 */
function updateProfileDisplay() {
  const profileInfoEl = document.getElementById('profile-info');
  if (profileInfoEl) {
    profileInfoEl.innerHTML = `<strong>${username}</strong><br>${bio}`;
  }
}

/**
 * Prompts the user to input profile information and updates the display.
 */
function promptProfile() {
  username = prompt("Enter your username:", username || "DefaultUser") || username || "DefaultUser";
  bio = prompt("Enter your bio:", bio || "Hello, I'm new here!") || bio || "Hello, I'm new here!";
  updateProfileDisplay();
}

// Initialize profile when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Prompt for initial profile info
  promptProfile();

  // Set up the event listener for changing profile info
  const editButton = document.getElementById('edit-profile');
  if (editButton) {
    editButton.addEventListener('click', promptProfile);
  }
});

