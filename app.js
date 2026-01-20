/**
 * Interactive Terminal
 * 
 * Features:
 * - Command parsing and routing
 * - Typing effect for output
 * - Boot sequence animation
 * - Command history (↑/↓)
 * - Tab autocomplete
 * - URL hash support
 * - Easter eggs
 */

(function() {
  'use strict';

  // ==========================================================================
  // Configuration
  // ==========================================================================

  const COMMANDS = ['help', 'now', 'writing', 'work', 'life', 'links', 'about', 'clear', 'ls'];
  const ALIASES = {
    'cat now.txt': 'now',
    'cat ~/now.txt': 'now',
    'cat writing.txt': 'writing',
    'cat ~/writing.txt': 'writing',
    'cat work.txt': 'work',
    'cat ~/work.txt': 'work',
    'cat life.txt': 'life',
    'cat ~/life.txt': 'life',
    'cat links.txt': 'links',
    'cat ~/links.txt': 'links',
    'cat bookmarks.txt': 'links',
    'cat ~/bookmarks.txt': 'links',
    'cat about.txt': 'about',
    'cat ~/about.txt': 'about',
    'ls': 'help',
    'ls -la': 'help',
    'ls -a': 'help',
    '?': 'help',
    'home': 'boot',
    'whoami': 'boot'
  };

  const TYPING_SPEED = 5; // ms per character
  const BOOT_LINE_DELAY = 150; // ms between boot lines

  // ==========================================================================
  // State
  // ==========================================================================

  const state = {
    history: [],
    historyIndex: -1,
    isTyping: false,
    hasBooted: false
  };

  // ==========================================================================
  // DOM Elements
  // ==========================================================================

  const output = document.getElementById('output');
  const input = document.getElementById('cmd-input');

  // ==========================================================================
  // Utilities
  // ==========================================================================

  function getTemplate(id) {
    const tpl = document.getElementById(`tpl-${id}`);
    return tpl ? tpl.innerHTML.trim() : null;
  }

  function scrollToBottom() {
    output.scrollTop = output.scrollHeight;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==========================================================================
  // Typing Effect
  // ==========================================================================

  async function typeOutput(html, speed = TYPING_SPEED) {
    state.isTyping = true;
    
    // Create a temporary container to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // For complex HTML, we'll fade in sections instead of character-by-character
    const container = document.createElement('div');
    container.style.opacity = '0';
    container.innerHTML = html;
    output.appendChild(container);
    
    // Fade in effect
    await sleep(50);
    container.style.transition = 'opacity 0.3s ease';
    container.style.opacity = '1';
    
    scrollToBottom();
    state.isTyping = false;
  }

  async function typeText(text, speed = TYPING_SPEED) {
    state.isTyping = true;
    const span = document.createElement('span');
    output.appendChild(span);
    
    for (let i = 0; i < text.length; i++) {
      span.textContent += text[i];
      scrollToBottom();
      await sleep(speed);
    }
    
    state.isTyping = false;
  }

  // ==========================================================================
  // Boot Sequence
  // ==========================================================================

  const ASCII_HELLO = `
 _          _  _         _  _                        _             
| |__   ___| || | ___   (_)( )_ __ ___     __ _ _ __(_) __ _ _ __  
| '_ \\ / _ \\ || |/ _ \\   | ||/| '_ \` _ \\   / _\` | '__| |/ _\` | '_ \\ 
| | | |  __/ || | (_) |  | |  | | | | | | | (_| | |  | | (_| | | | |
|_| |_|\\___|_||_|\\___( ) |_|  |_| |_| |_|  \\__,_|_|  |_|\\__,_|_| |_|
                     |/                                             
`;

  const INTRO_TEXT = "welcome to my corner of the internet — a place for thoughts, projects, and curiosity.";
  const HELP_TEXT = "type 'help' for available commands.";

  async function typeTextChar(element, text, speed = 15) {
    for (let i = 0; i < text.length; i++) {
      element.textContent += text[i];
      scrollToBottom();
      await sleep(speed);
    }
  }

  async function runBootSequence() {
    // Center the boot content
    output.classList.add('boot-centered');
    
    // Container for centered content
    const bootContainer = document.createElement('div');
    bootContainer.className = 'boot-container';
    output.appendChild(bootContainer);
    
    // ASCII banner with typing effect
    const banner = document.createElement('pre');
    banner.className = 'ascii-banner';
    bootContainer.appendChild(banner);
    
    // Type ASCII art faster (character by character)
    const lines = ASCII_HELLO.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) banner.textContent += '\n';
      for (let j = 0; j < lines[i].length; j++) {
        banner.textContent += lines[i][j];
        // Only scroll every few characters for performance
        if (j % 10 === 0) scrollToBottom();
      }
      await sleep(30); // Small pause between lines
    }
    scrollToBottom();
    await sleep(300);

    // Intro message with typing
    const intro = document.createElement('p');
    intro.className = 'intro-msg';
    bootContainer.appendChild(intro);
    await typeTextChar(intro, INTRO_TEXT, 20);
    await sleep(400);

    // Help hint with typing
    const welcome = document.createElement('p');
    welcome.className = 'welcome-msg';
    bootContainer.appendChild(welcome);
    await typeTextChar(welcome, HELP_TEXT, 25);
    scrollToBottom();

    state.hasBooted = true;
  }

  // ==========================================================================
  // Command Execution
  // ==========================================================================

  function clearOutput() {
    output.innerHTML = '';
    output.classList.remove('boot-centered');
  }

  async function runCommand(cmd) {
    const trimmedCmd = cmd.trim().toLowerCase();
    
    if (!trimmedCmd) return;
    
    // Add to history
    if (state.history[state.history.length - 1] !== cmd) {
      state.history.push(cmd);
    }
    state.historyIndex = state.history.length;

    // Clear output (replace mode)
    clearOutput();

    // Resolve aliases
    let resolvedCmd = ALIASES[trimmedCmd] || trimmedCmd;

    // Handle commands
    let template = null;

    switch (resolvedCmd) {
      case 'clear':
        // Already cleared
        return;
      
      case 'boot':
        await runBootSequence();
        return;
      
      case 'help':
      case 'now':
      case 'writing':
      case 'work':
      case 'life':
      case 'links':
      case 'about':
        template = getTemplate(resolvedCmd);
        break;
      
      case 'sudo':
      case 'sudo su':
      case 'sudo -i':
      case 'su':
        template = getTemplate('sudo');
        break;
      
      default:
        // Unknown command
        template = getTemplate('unknown');
        if (template) {
          template = template.replace(/\{cmd\}/g, escapeHtml(trimmedCmd));
        }
    }

    if (template) {
      await typeOutput(template);
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ==========================================================================
  // Command History (↑/↓)
  // ==========================================================================

  function navigateHistory(direction) {
    if (state.history.length === 0) return;

    if (direction === 'up') {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        input.value = state.history[state.historyIndex];
      }
    } else if (direction === 'down') {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        input.value = state.history[state.historyIndex];
      } else {
        state.historyIndex = state.history.length;
        input.value = '';
      }
    }

    // Move cursor to end
    setTimeout(() => {
      input.selectionStart = input.selectionEnd = input.value.length;
    }, 0);
  }

  // ==========================================================================
  // Tab Autocomplete
  // ==========================================================================

  function autocomplete() {
    const value = input.value.trim().toLowerCase();
    if (!value) return;

    const matches = COMMANDS.filter(cmd => cmd.startsWith(value));
    
    if (matches.length === 1) {
      input.value = matches[0];
    } else if (matches.length > 1) {
      // Find common prefix
      let prefix = matches[0];
      for (const match of matches) {
        while (!match.startsWith(prefix)) {
          prefix = prefix.slice(0, -1);
        }
      }
      if (prefix.length > value.length) {
        input.value = prefix;
      }
    }
  }

  // ==========================================================================
  // Event Listeners
  // ==========================================================================

  input.addEventListener('keydown', async (e) => {
    if (state.isTyping) {
      e.preventDefault();
      return;
    }

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        const cmd = input.value;
        input.value = '';
        await runCommand(cmd);
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        navigateHistory('up');
        break;
      
      case 'ArrowDown':
        e.preventDefault();
        navigateHistory('down');
        break;
      
      case 'Tab':
        e.preventDefault();
        autocomplete();
        break;
      
      case 'l':
        if (e.ctrlKey) {
          e.preventDefault();
          clearOutput();
        }
        break;
      
      case 'c':
        if (e.ctrlKey) {
          e.preventDefault();
          input.value = '';
          const cancelled = document.createElement('p');
          cancelled.className = 'cmd-echo';
          cancelled.textContent = '^C';
          output.appendChild(cancelled);
          scrollToBottom();
        }
        break;
    }
  });

  // Focus input when clicking anywhere in terminal
  document.querySelector('.terminal').addEventListener('click', () => {
    input.focus();
  });

  // ==========================================================================
  // URL Hash Support
  // ==========================================================================

  function handleHash() {
    const hash = window.location.hash.slice(1);
    if (hash && COMMANDS.includes(hash)) {
      runCommand(hash);
    }
  }

  window.addEventListener('hashchange', handleHash);

  // ==========================================================================
  // Initialize
  // ==========================================================================

  async function init() {
    // Check for hash first
    const hash = window.location.hash.slice(1);
    if (hash && (COMMANDS.includes(hash) || Object.keys(ALIASES).some(a => a === hash))) {
      await runCommand(hash);
    } else {
      // Run boot sequence on first load
      await runBootSequence();
    }
    
    input.focus();
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
