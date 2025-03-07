/**
 * Profile component for Piggypost.
 * Displays user profile information and provides
 * functionality to edit the profile.
 */
export class PiggyProfile extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  // Called when element is inserted into the DOM
  connectedCallback() {
    this.setupEventListeners();
  }

  // Called when element is removed from the DOM
  disconnectedCallback() {
    this.removeEventListeners();
  }

  setupEventListeners() {
    const editButton = this.querySelector('#edit-profile');
    if (editButton) {
      // Store the bound function to be able to remove it later
      this.boundEditClick = this.handleEditClick.bind(this);
      editButton.addEventListener('click', this.boundEditClick);
    }
  }

  removeEventListeners() {
    const editButton = this.querySelector('#edit-profile');
    if (editButton && this.boundEditClick) {
      editButton.removeEventListener('click', this.boundEditClick);
    }
  }

  render() {
    const name = localStorage.getItem('name') || 'n00b';
    const about = localStorage.getItem('about') || 'i keep my coins on the exchange';

    this.innerHTML = `
      <div class="p-4 bg-gray-200 sticky top-0">
        <div id="profile-info">
          <strong class="text-lg">${name}</strong>
          <p class="text-sm text-gray-600">${about}</p>
        </div>
        <button id="edit-profile" class="mt-2 text-blue-500 underline">Edit Profile</button>
      </div>
    `;
  }

  handleEditClick() {
    this.promptProfile();
  }

  promptProfile() {
    const currentName = localStorage.getItem('name') || '';
    const currentAbout = localStorage.getItem('about') || '';

    const name = prompt("Enter your name:", currentName) || currentName || "n00b";
    const about = prompt("Enter your bio:", currentAbout) || currentAbout || "i keep my coins on the exchange";

    if (name !== currentName || about !== currentAbout) {
      localStorage.setItem('name', name);
      localStorage.setItem('about', about);

      this.render();

      // Dispatch an event when the profile changes
      this.dispatchEvent(new CustomEvent('profile-changed', {
        detail: { name, about },
        bubbles: true
      }));
    }
  }

  // Public method to update the profile display
  updateProfile(name, about) {
    localStorage.setItem('name', name);
    localStorage.setItem('about', about);
    this.render();
  }
}

// Define the custom element
customElements.define('piggy-profile', PiggyProfile);
