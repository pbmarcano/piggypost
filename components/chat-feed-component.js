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

    // Force initial scroll to bottom
    setTimeout(() => this.scrollToBottom(), 100);
  }

  // Called when element is removed from the DOM
  disconnectedCallback() {
    this.removeEventListeners();
  }

  render() {
    // Set the component to take full height
    this.style.display = 'flex';
    this.style.flexDirection = 'column';
    this.style.flex = '1';
    this.style.minHeight = '0'; // Important for Firefox
    this.style.height = '100%';

    // Create the basic structure
    this.innerHTML = `
      <div class="h-full w-full p-4 overflow-y-auto flex flex-col space-y-1" id="messages-container">
        <!-- Messages will be displayed here -->
        <div class="text-center p-4">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 mb-3">
            <span class="text-3xl">🐷</span>
          </div>
          <h3 class="text-lg font-medium text-gray-900">Welcome to PiggyPost</h3>
          <p class="text-sm text-gray-500 mt-1">A secure, pig-themed crypto chat room</p>
        </div>
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

      // Calculate if we should auto-scroll
      // Default to true for first few messages to ensure visibility
      const messageCount = container.children.length;
      const shouldScroll = this._autoScroll || messageCount < 10;

      // Auto-scroll if enabled or we have very few messages
      if (shouldScroll) {
        // Slight delay to ensure DOM update
        setTimeout(() => this.scrollToBottom(), 10);
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
      // Log heights for debugging
      console.log('Container clientHeight:', container.clientHeight);
      console.log('Container scrollHeight:', container.scrollHeight);

      // Use setTimeout to ensure the DOM has updated
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
        console.log('Set scrollTop to:', container.scrollHeight);
        console.log('Current scrollTop:', container.scrollTop);
      }, 0);
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
