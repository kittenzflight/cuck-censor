// List of keywords that might indicate NSFW content
const nsfwKeywords = [
  'porn', 'xxx', 'sex', 'nude', 'nsfw', 'adult', 'explicit',
  'naked', 'erotic', 'hentai', 'fetish', 'webcam', 'onlyfans',
  'sexual', 'boobs', 'ass', 'penis', 'vagina', 'dick'
];

// List of NSFW domains
const nsfwDomains = [
  'pornhub.com', 'xvideos.com', 'redtube.com', 'youporn.com',
  'xnxx.com', 'xhamster.com', 'onlyfans.com', 'chaturbate.com',
  'e621.net'
];

// Whitelist of trusted domains that should never be filtered
const whitelistedDomains = [
  'discord.com',
  'discordapp.com',
  'cdn.discordapp.com',
  'media.discordapp.net',
  'youtube.com',
  'youtu.be',
  'twitter.com',
  'x.com',
  'reddit.com',
  'imgur.com',
  'facebook.com',
  'instagram.com',
  'tiktok.com',
  'twitch.tv',
  'github.com',
  'stackoverflow.com',
  'wikipedia.org',
  'amazon.com'
];

// Check if current site is whitelisted
function isWhitelistedSite() {
  const currentDomain = window.location.hostname.toLowerCase();
  return whitelistedDomains.some(domain => currentDomain.includes(domain));
}

// Check if URL contains NSFW keywords
function isNSFWUrl(url) {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  
  // Check domain
  for (const domain of nsfwDomains) {
    if (lowerUrl.includes(domain)) return true;
  }
  
  // Check keywords
  for (const keyword of nsfwKeywords) {
    if (lowerUrl.includes(keyword)) return true;
  }
  
  return false;
}

// Check if image element should be blocked
function shouldBlockImage(img) {
  // Check src
  if (isNSFWUrl(img.src)) return true;
  
  // Check alt text
  if (img.alt && isNSFWUrl(img.alt)) return true;
  
  // Check title
  if (img.title && isNSFWUrl(img.title)) return true;
  
  // Check parent link
  const parentLink = img.closest('a');
  if (parentLink && isNSFWUrl(parentLink.href)) return true;
  
  return false;
}

// Block an image
function blockImage(img) {
  if (img.dataset.blocked) return; // Already blocked
  
  img.dataset.blocked = 'true';
  img.classList.add('nsfw-blocked');
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'nsfw-overlay';
  overlay.innerHTML = `
    <div class="nsfw-overlay-content">
      <span class="nsfw-icon">🚫</span>
      <span class="nsfw-text">Content Blocked</span>
    </div>
  `;
  
  // Wrap image
  const wrapper = document.createElement('div');
  wrapper.className = 'nsfw-wrapper';
  wrapper.style.width = img.width ? `${img.width}px` : '100%';
  wrapper.style.height = img.height ? `${img.height}px` : 'auto';
  wrapper.style.minHeight = '100px';
  
  img.parentNode.insertBefore(wrapper, img);
  wrapper.appendChild(img);
  wrapper.appendChild(overlay);
}

// Scan all images on page
function scanImages() {
  // Don't scan if on a whitelisted site
  if (isWhitelistedSite()) {
    return;
  }
  
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (shouldBlockImage(img)) {
      blockImage(img);
    }
  });
}

// Exit early if on whitelisted site
if (isWhitelistedSite()) {
  console.log('Site Blocker: Skipping filtering on whitelisted domain');
} else {
  // Initial scan
  scanImages();

  // Watch for new images (for dynamically loaded content)
  const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.tagName === 'IMG') {
        if (shouldBlockImage(node)) {
          blockImage(node);
        }
      } else if (node.querySelectorAll) {
        const images = node.querySelectorAll('img');
        images.forEach(img => {
          if (shouldBlockImage(img)) {
            blockImage(img);
          }
        });
      }
    });
  });
});

  // Start observing
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Also scan when images load
  document.addEventListener('load', (e) => {
    if (e.target.tagName === 'IMG') {
      if (shouldBlockImage(e.target)) {
        blockImage(e.target);
      }
    }
  }, true);

  console.log('Site Blocker: Image filtering active');
}

