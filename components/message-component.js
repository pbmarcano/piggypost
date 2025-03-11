/**
 * Message component for Piggypost.
 * Displays a single chat message with user information and timestamp.
 */
export class MessageComponent extends HTMLElement {
  constructor() {
    super();
    // Initialize properties
    this._pubkey = '';
    this._content = '';
    this._timestamp = 0;
    this._userName = '';
    this._isEncrypted = false;
    this._isForCurrentUser = false;
  }

  // Web component lifecycle method - called when element is added to DOM
  connectedCallback() {
    this.render();
    this.attachUsernameClickHandler();
    // Start a timer to update the timestamp every minute
    this.startTimestampRefresh();
  }

  // Web component lifecycle method - called when element is removed from DOM
  disconnectedCallback() {
    // Clean up the timer when the element is removed
    this.stopTimestampRefresh();
  }

  // Start a timer to update timestamps
  startTimestampRefresh() {
    // Update timestamp every minute (60000 ms)
    this.timestampTimer = setInterval(() => {
      this.updateTimestamp();
    }, 60000);
  }

  // Stop the timestamp refresh timer
  stopTimestampRefresh() {
    if (this.timestampTimer) {
      clearInterval(this.timestampTimer);
      this.timestampTimer = null;
    }
  }

  // Update just the timestamp without re-rendering the entire component
  updateTimestamp() {
    if (!this._timestamp) return;

    const timestampElement = this.querySelector('.message-timestamp');
    if (timestampElement) {
      timestampElement.textContent = this.formatRelativeTime(this._timestamp);
    }
  }

  // Attach click handler to username
  attachUsernameClickHandler() {
    const usernameElement = this.querySelector('.message-username');
    if (usernameElement && this._pubkey) {
      usernameElement.style.cursor = 'pointer';
      usernameElement.addEventListener('click', () => {
        // Dispatch event when username is clicked
        this.dispatchEvent(new CustomEvent('username-click', {
          detail: { 
            pubkey: this._pubkey,
            name: this._userName
          },
          bubbles: true
        }));
      });
    }
  }

  // Getters and setters for properties
  get pubkey() {
    return this._pubkey;
  }

  set pubkey(value) {
    this._pubkey = value;
    this.render();
  }

  get content() {
    return this._content;
  }

  set content(value) {
    this._content = value;
    this.render();
  }

  get timestamp() {
    return this._timestamp;
  }

  set timestamp(value) {
    this._timestamp = value;

    // If the component is already rendered, just update the timestamp
    const timestampElement = this.querySelector('.message-timestamp');
    if (timestampElement) {
      timestampElement.textContent = this.formatRelativeTime(value);
    } else {
      // Otherwise render the whole component
      this.render();
    }

    // Make sure we're refreshing timestamps if we have one
    if (value && !this.timestampTimer) {
      this.startTimestampRefresh();
    }
  }

  get userName() {
    return this._userName;
  }

  set userName(value) {
    this._userName = value;
    this.render();
  }

  get isEncrypted() {
    return this._isEncrypted;
  }

  set isEncrypted(value) {
    this._isEncrypted = value;
    this.render();
  }

  get isForCurrentUser() {
    return this._isForCurrentUser;
  }

  set isForCurrentUser(value) {
    this._isForCurrentUser = value;
    this.render();
  }

  // Format timestamp to relative time (e.g., "5 minutes ago")
  formatRelativeTime(timestamp) {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;

    if (diff < 60) {
      return `${diff} seconds ago`;
    } else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diff / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

  // Render the message
  render() {
    // Determine message background color based on encryption status
    let bgColorClass = 'bg-white border border-gray-100'; // Default for public messages
    let encryptionClass = '';

    if (this._isEncrypted) {
      if (this._isForCurrentUser) {
        bgColorClass = 'bg-pink-50 border border-pink-100'; // Pink for recipient
        encryptionClass = 'text-pink-600';
      } else {
        bgColorClass = 'bg-gray-50 border border-gray-100'; // Light gray for others
        encryptionClass = 'text-gray-600';
      }
    }

    // Create timestamp string
    const timeString = this._timestamp ? this.formatRelativeTime(this._timestamp) : '';

    // Create short name for pubkey if userName is not available
    const displayName = this._userName || (this._pubkey ? `${this._pubkey.substring(0, 10)}...` : 'King Piggy');

    this.innerHTML = `
      <div class="mb-3 p-3 ${bgColorClass} rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 w-full max-w-full">
        <div class="flex justify-between items-start">
          <span class="font-medium text-gray-900 hover:text-pink-600 transition-colors duration-150 message-username">${displayName}</span>
          <span class="text-xs text-gray-400 message-timestamp">${timeString}</span>
        </div>
        <p class="mt-2 text-gray-800 break-words whitespace-normal overflow-wrap-anywhere" style="word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; max-width: 100%;">${this._content}</p>
        ${this._isEncrypted ? 
          `<div class="text-xs ${encryptionClass} mt-2 flex items-center">
              <span class="mr-1">${this._isForCurrentUser ? '🥓' : '🐽'}</span>
              <span>encrypted message</span>
            </div>` 
            : ''}
      </div>
    `;

    // Attach click handlers after rendering
    this.attachUsernameClickHandler();
  }

  // Static method to create a message from a Nostr event
  static fromNostrEvent(event, userName, isEncrypted = false, isForCurrentUser = false) {
    const message = new MessageComponent();
    message.pubkey = event.pubkey;
    message.content = event.content;
    message.userName = userName;
    message.isEncrypted = isEncrypted;
    message.isForCurrentUser = isForCurrentUser;

    // Set timestamp last to ensure the timer starts
    message.timestamp = event.created_at;

    return message;
  }
}

// Define the custom element
customElements.define('piggy-message', MessageComponent);
