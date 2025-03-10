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
      <div class="p-4 bg-white shadow-sm sticky top-0 border-b border-gray-100">
        <div id="profile-info" class="flex items-center">
          <div class="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-xl mr-3">
            🐷
          </div>
          <div class="flex-1">
            <strong class="text-lg font-medium text-gray-900">${name}</strong>
            <p class="text-sm text-gray-500">${about}</p>
          </div>
        </div>
        <button id="edit-profile" class="mt-3 px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-md text-sm font-medium transition-colors duration-150">Edit Profile</button>
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
