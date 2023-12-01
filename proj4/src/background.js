'use strict';

console.log('background script loaded');

let screenshots = {};
let last_screenshots = {};

// Function to capture a screenshot of the active tab
async function captureScreenshot() {
  try {
    await chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const tabId = tabs[0].id;
        chrome.tabs.captureVisibleTab(null, { format: 'png' }, (screenshot) => {
          if (screenshots[tabId] === null) {
            last_screenshots[tabId] = screenshot;
          } else {
            last_screenshots[tabId] = screenshots[tabId];
          }
          screenshots[tabId] = screenshot;
          // console log the image url as a image 
          var url = 'url(' + screenshot + ')';
          console.log('%c ', 'font-size:300px; background: no-repeat center/contain ' + url + ';');
        });
      }
    });
  } catch (error) {
    console.error('Error capturing tab image:', error);
  }
}

// Start capturing screenshots at regular intervals
function startCapture() {
  setInterval(captureScreenshot, 2500);
}

// Initialize capturing when the service worker starts
startCapture();

// Listen for tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // capture a screenshot when the active tab changes
  let tabId = activeInfo.tabId;
  await captureScreenshot().then(() => {
    const newScreenshot = screenshots[tabId];
    // send a message to the content script
    chrome.tabs.sendMessage(tabId, {
      type: 'COMPARE_SCREENSHOTS',
      lastScreenshot: last_screenshots[tabId],
      newScreenshot: newScreenshot,
    });
  });
});