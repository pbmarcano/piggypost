/**
 * Profile management script for Piggypost.
 * Handles profile data storage and retrieval.
 */

import { sendKind0Profile } from "./nostr-events.js";

/**
 * Stores a user's profile information in localStorage.
 * @param {string} pubkey - The user's public key.
 * @param {Object} profile - The user's profile information.
 */
export function storeUserProfile(pubkey, profile) {
  // get existing user profiles
  const profiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');

  // add or update a user's profile
  profiles[pubkey] = profile;

  // save back to localStorage
  localStorage.setItem('userProfiles', JSON.stringify(profiles));
}

/**
 * Gets a user's profile information from localStorage.
 * @param {string} pubkey - The user's public key.
 * @returns {Object|null} - The user's profile or null if not found.
 */
export function getUserProfile(pubkey) {
  const profiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
  return profiles[pubkey] || null;
}

// Initialize profile when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if the user already has a profile
  const hasProfile = localStorage.getItem('name');

  // Setup the profile component
  const profileComponent = document.querySelector('piggy-profile');
  if (profileComponent) {
    // Listen for profile changes
    profileComponent.addEventListener('profile-changed', (event) => {
      const { name, about } = event.detail;

      if (typeof sendKind0Profile === "function") {
        sendKind0Profile(name, about);
      } else {
        console.error("sendKind0Profile is not a function!", typeof sendKind0Profile);
      }
    });

    // If no profile exists, prompt for one
    if (!hasProfile) {
      profileComponent.promptProfile();
    }
  }
});
