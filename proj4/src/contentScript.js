'use strict';

import resemble from 'resemblejs';

const BLOCK_SIZE = 64;

// listen for messages from the background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === 'COMPARE_SCREENSHOTS') {
    // compare screenshots
    console.log("comparing screenshots");
    compareScreenshots(request.lastScreenshot, request.newScreenshot).then((diffBlocks) => {
      console.log("diffBlocks: ", diffBlocks);
    }
    );
  }
});

// Function to compare screenshots using resemblejs
async function compareScreenshots(lastScreenshot, newScreenshot) {
  var url = 'url(' + lastScreenshot + ')';
  console.log('%c ', 'font-size:300px; background: no-repeat center/contain ' + url + ';');
  url = 'url(' + newScreenshot + ')';
  console.log('%c ', 'font-size:300px; background: no-repeat center/contain ' + url + ';');
  let lastBlocks = await splitImageIntoBlocks(lastScreenshot, BLOCK_SIZE);
  let newBlocks = await splitImageIntoBlocks(newScreenshot, BLOCK_SIZE);
  let diffBlocks = await compareBlocks(lastBlocks, newBlocks);
  addOverlay(diffBlocks);
  return diffBlocks;
}

async function compareBlocks(lastBlocks, newBlocks) {
  // Function to compare blocks using resemblejs and return a promise
  function compareBlocksAsync(lastBlock, newBlock) {
    return new Promise((resolve) => {
      resemble(lastBlock)
        .compareTo(newBlock)
        .ignoreColors()
        .onComplete(function (data) {
          if (data.misMatchPercentage > 0) {
            resolve(data);
          } else {
            resolve(null);
          }
        });
    });
  }
  let diffBlocks = {};
  for (let i = 0; i < lastBlocks.length; i++) {
    let diffBlock = await compareBlocksAsync(lastBlocks[i], newBlocks[i]);
    if (diffBlock) {
      diffBlocks["block"+i] = diffBlock;
    }
  }
  return diffBlocks;
}


// Function to split an image into blocks
function splitImageIntoBlocks(imageData, blockSize) {
  function split(imageData, blockSize) {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.onload = () => {
        let imageParts = [];
        let rows = img.height / blockSize;
        let cols = img.width / blockSize;
        let x = 0;
        let y = 0;
        for (let i = 0; i < rows; i++) {
          y = i * blockSize;
          for (let j = 0; j < cols; j++) {
            x = j * blockSize;
            let canvas = document.createElement('canvas');
            let context = canvas.getContext('2d');
            canvas.width = blockSize;
            canvas.height = blockSize;
            context.drawImage(img, x, y, blockSize, blockSize, 0, 0, blockSize, blockSize);
            imageParts.push(canvas.toDataURL());
          }
        }
        resolve(imageParts);
      };
      img.onerror = (e) => reject(e);
      img.src = imageData;
    });
  }
  return split(imageData, blockSize);
}

// Function to create overlay for a specific block
function addOverlay(blocks) {
  // get height and width of the window
  let cols = window.innerHeight / BLOCK_SIZE;
  for (let block in blocks) {
    let blockIndex = parseInt(block.substring(5));
    let i = Math.floor(blockIndex / cols);
    let j = blockIndex % cols;
    let y = i * BLOCK_SIZE;
    let x = j * BLOCK_SIZE;
    let overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = y + 'px';
    overlay.style.left = x + 'px';
    overlay.style.width = BLOCK_SIZE + 'px';
    overlay.style.height = BLOCK_SIZE + 'px';
    overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
    overlay.style.zIndex = '9999';
    overlay.style.pointerEvents = 'none';

    document.body.appendChild(overlay);
  }
}

