// Listen for when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('Site Blocker extension installed');
});

// Listen for when the extension is updated
chrome.runtime.onUpdateAvailable.addListener(() => {
  console.log('Site Blocker extension updated');
});