/**
 * System message component for Piggypost.
 * Displays announcements like user joins, profile changes, etc.
 */
export class SystemMessageComponent extends HTMLElement {
  constructor() {
    super();
    // Initialize properties
    this._content = '';
    this._timestamp = 0;
  }

  // Web component lifecycle method - called when element is added to DOM
  connectedCallback() {
    this.render();
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

  // Getters and setters for properties
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

  // Render the system message
  render() {
    // Create timestamp string
    const timeString = this._timestamp ? this.formatRelativeTime(this._timestamp) : '';

    this.innerHTML = `
      <div class="mb-3 p-3 bg-gray-50 rounded-lg shadow-sm border-l-4 border-pink-300 w-full max-w-full">
        <div class="flex justify-between items-start">
          <span class="text-gray-500 text-sm font-medium flex items-center">
            <span class="mr-1">🐷</span>System
          </span>
          <span class="text-xs text-gray-400 message-timestamp">${timeString}</span>
        </div>
        <p class="mt-1 text-gray-600 italic break-words whitespace-normal" style="word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; max-width: 100%;">${this._content}</p>
      </div>
    `;
  }

  // Static method to create a system message
  static createMessage(content, timestamp) {
    const message = new SystemMessageComponent();
    message.content = content;
    message.timestamp = timestamp || Math.floor(Date.now() / 1000);
    return message;
  }

  // Static method to create a user join message
  static userJoined(username, timestamp) {
    const message = new SystemMessageComponent();
    message.content = `${username} has entered the chat`;
    message.timestamp = timestamp || Math.floor(Date.now() / 1000);
    return message;
  }

  // Static method to create a username change message
  static usernameChanged(oldName, newName, timestamp) {
    const message = new SystemMessageComponent();
    message.content = `${oldName} changed their name to ${newName}`;
    message.timestamp = timestamp || Math.floor(Date.now() / 1000);
    return message;
  }
}

// Define the custom element
customElements.define('piggy-system-message', SystemMessageComponent);
