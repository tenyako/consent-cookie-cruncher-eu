// Cookie banner detection and handling
class CookieBannerHandler {
  constructor() {
    this.commonSelectors = [
      // Accept buttons
      '[data-testid*="accept"]',
      '[class*="accept"]',
      '[id*="accept"]',
      'button[title*="Accept"]',
      'button[aria-label*="Accept"]',
      '[data-cy*="accept"]',
      
      // Consent buttons
      '[data-testid*="consent"]',
      '[class*="consent"]',
      '[id*="consent"]',
      'button[title*="Consent"]',
      
      // Cookie-specific selectors
      '[data-testid*="cookie"]',
      '[class*="cookie"]',
      '[id*="cookie"]',
      'button[title*="Cookie"]',
      
      // GDPR specific
      '[data-testid*="gdpr"]',
      '[class*="gdpr"]',
      '[id*="gdpr"]',
      
      // Common text patterns
      'button:contains("Accept all")',
      'button:contains("Accept All")',
      'button:contains("I agree")',
      'button:contains("I Agree")',
      'button:contains("OK")',
      'button:contains("Got it")',
      'button:contains("Continue")',
      'button:contains("Agree")',
      'button:contains("Allow all")',
      'button:contains("Accept cookies")',
      
      // European language variants
      'button:contains("Accepter")', // French
      'button:contains("Akzeptieren")', // German
      'button:contains("Aceptar")', // Spanish
      'button:contains("Accetta")', // Italian
      'button:contains("Aceitar")', // Portuguese
      'button:contains("Accepteren")', // Dutch
      'button:contains("Godta")', // Norwegian
      'button:contains("Godkänn")', // Swedish
      'button:contains("Hyväksy")', // Finnish
      'button:contains("Přijmout")', // Czech
      'button:contains("Zaakceptuj")', // Polish
      'button:contains("Elfogad")', // Hungarian
    ];

    this.bannerSelectors = [
      '[data-testid*="cookie"]',
      '[class*="cookie"]',
      '[id*="cookie"]',
      '[data-testid*="consent"]',
      '[class*="consent"]',
      '[id*="consent"]',
      '[data-testid*="gdpr"]',
      '[class*="gdpr"]',
      '[id*="gdpr"]',
      '[class*="banner"]',
      '[id*="banner"]',
      '.cookie-notice',
      '.cookie-bar',
      '.gdpr-banner',
      '.consent-banner',
      '#cookieConsent',
      '#cookie-consent',
      '#gdpr-consent',
      '.privacy-notice'
    ];

    this.isEnabled = true;
    this.delay = 1000; // 1 second delay
    this.maxRetries = 2; // Maximum attempts per domain
    this.attemptCount = 0; // Current attempt count
    this.domain = window.location.hostname;
    this.init();
  }

  async init() {
    // Get settings from storage including attempt count for this domain
    const result = await chrome.storage.sync.get(['enabled', 'delay', 'domainAttempts']);
    this.isEnabled = result.enabled !== false; // Default to true
    this.delay = result.delay || 1000;
    
    // Get attempt count for current domain
    const domainAttempts = result.domainAttempts || {};
    this.attemptCount = domainAttempts[this.domain] || 0;

    if (this.isEnabled && this.attemptCount < this.maxRetries) {
      this.startObserving();
      setTimeout(() => this.handleCookieBanners(), this.delay);
    } else if (this.attemptCount >= this.maxRetries) {
      console.log(`Cookie Banner Handler: Max attempts (${this.maxRetries}) reached for ${this.domain}, stopping`);
    }
  }

  startObserving() {
    // Observe DOM changes to catch dynamically loaded banners
    const observer = new MutationObserver((mutations) => {
      if (this.isEnabled && this.attemptCount < this.maxRetries) {
        setTimeout(() => this.handleCookieBanners(), 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  async updateAttemptCount() {
    // Increment attempt count for this domain
    this.attemptCount++;
    
    const result = await chrome.storage.sync.get(['domainAttempts']);
    const domainAttempts = result.domainAttempts || {};
    domainAttempts[this.domain] = this.attemptCount;
    
    await chrome.storage.sync.set({ domainAttempts });
    console.log(`Cookie Banner Handler: Attempt ${this.attemptCount}/${this.maxRetries} for ${this.domain}`);
  }

  async handleCookieBanners() {
    // Check if we've exceeded max attempts
    if (this.attemptCount >= this.maxRetries) {
      console.log(`Cookie Banner Handler: Max attempts reached for ${this.domain}`);
      return;
    }

    // Find and click accept buttons
    for (const selector of this.commonSelectors) {
      const elements = this.findElementsWithText(selector);
      
      for (const element of elements) {
        if (this.isVisibleElement(element) && this.isInCookieBanner(element)) {
          console.log('Cookie Banner Handler: Found accept button', element);
          
          // Update attempt count before clicking
          await this.updateAttemptCount();
          
          element.click();
          
          // Log the action
          chrome.runtime.sendMessage({
            action: 'bannerHandled',
            url: window.location.href,
            selector: selector,
            attempt: this.attemptCount
          });
          
          return; // Exit after first successful click
        }
      }
    }
  }

  findElementsWithText(selector) {
    try {
      // Handle text-based selectors
      if (selector.includes(':contains')) {
        const text = selector.match(/contains\("([^"]+)"\)/)?.[1];
        if (text) {
          const elements = Array.from(document.querySelectorAll('button, a, [role="button"]'));
          return elements.filter(el => 
            el.textContent?.toLowerCase().includes(text.toLowerCase())
          );
        }
      }
      
      // Handle regular CSS selectors
      return Array.from(document.querySelectorAll(selector));
    } catch (e) {
      return [];
    }
  }

  isVisibleElement(element) {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return rect.width > 0 && 
           rect.height > 0 && 
           style.display !== 'none' && 
           style.visibility !== 'hidden' &&
           style.opacity !== '0';
  }

  isInCookieBanner(element) {
    // Check if element is within a cookie banner
    let parent = element.parentElement;
    let depth = 0;
    
    while (parent && depth < 10) {
      const classList = parent.className?.toLowerCase() || '';
      const id = parent.id?.toLowerCase() || '';
      const dataTestId = parent.getAttribute('data-testid')?.toLowerCase() || '';
      
      if (classList.includes('cookie') || 
          classList.includes('consent') || 
          classList.includes('gdpr') ||
          classList.includes('banner') ||
          id.includes('cookie') || 
          id.includes('consent') || 
          id.includes('gdpr') ||
          dataTestId.includes('cookie') ||
          dataTestId.includes('consent') ||
          dataTestId.includes('gdpr')) {
        return true;
      }
      
      parent = parent.parentElement;
      depth++;
    }
    
    return false;
  }
}

// Initialize the handler
new CookieBannerHandler();
