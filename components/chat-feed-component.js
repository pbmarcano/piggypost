/**
 * Chat feed component for Piggypost.
 * Displays the message feed and handles auto-scrolling.
 */
export class ChatFeedComponent extends HTMLElement {
  constructor() {
    super();
    this._messages = [];
    this._autoScroll = true;
  }

  // Called when element is inserted into the DOM
  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  // Called when element is removed from the DOM
  disconnectedCallback() {
    this.removeEventListeners();
  }

  render() {
    // Create the basic structure
    this.innerHTML = `
      <div class="flex-1 p-4 overflow-y-scroll flex flex-col min-h-0" id="messages-container">
        <!-- Messages will be displayed here -->
      </div>
    `;
  }

  setupEventListeners() {
    // Get the container element
    const container = this.querySelector('#messages-container');

    // Add scroll event listener to detect when user manually scrolls
    if (container) {
      this.boundScrollHandler = this.handleScroll.bind(this);
      container.addEventListener('scroll', this.boundScrollHandler);
    }
  }

  removeEventListeners() {
    const container = this.querySelector('#messages-container');
    if (container && this.boundScrollHandler) {
      container.removeEventListener('scroll', this.boundScrollHandler);
    }
  }

  // Handle scroll events to determine whether to auto-scroll
  handleScroll(event) {
    const container = event.target;

    // Check if user has scrolled up (disable auto-scroll)
    // or if they've scrolled to the bottom (enable auto-scroll)
    const isAtBottom = (container.scrollHeight - container.scrollTop - container.clientHeight) < 10;

    this._autoScroll = isAtBottom;
  }

  // Add a message to the feed
  addMessage(messageElement) {
    const container = this.querySelector('#messages-container');
    if (container) {
      // Add the message to the DOM
      container.appendChild(messageElement);

      // Auto-scroll if enabled
      if (this._autoScroll) {
        this.scrollToBottom();
      }
    }
  }

  // Add a system message to the feed
  addSystemMessage(content, timestamp) {
    const systemMessage = document.createElement('piggy-system-message');
    systemMessage.content = content;
    systemMessage.timestamp = timestamp || Math.floor(Date.now() / 1000);
    this.addMessage(systemMessage);
  }

  // Add a user message from a Nostr event
  addUserMessage(event, userName, isEncrypted = false, isForCurrentUser = false) {
    const message = document.createElement('piggy-message');
    message.pubkey = event.pubkey;
    message.content = event.content;
    message.timestamp = event.created_at;
    message.userName = userName;
    message.isEncrypted = isEncrypted;
    message.isForCurrentUser = isForCurrentUser;

    this.addMessage(message);
  }

  // Clear all messages from the feed
  clearMessages() {
    const container = this.querySelector('#messages-container');
    if (container) {
      container.innerHTML = '';
    }
  }

  // Scroll to the bottom of the feed
  scrollToBottom() {
    const container = this.querySelector('#messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  // Public method to announce a user has joined
  announceUserJoined(username, timestamp) {
    this.addSystemMessage(`${username} has entered the chat`, timestamp);
  }

  // Public method to announce a username change
  announceUsernameChanged(oldName, newName, timestamp) {
    this.addSystemMessage(`${oldName} changed their name to ${newName}`, timestamp);
  }
}

// Define the custom element
customElements.define('piggy-chat-feed', ChatFeedComponent);
