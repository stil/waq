let waTabId = null;
let previousTabId;

function findWhatsAppTab(foundCallback, notFoundCallback) {
  chrome.tabs.query(
    { url: 'https://web.whatsapp.com/*' },
    (result) => {
      if (result.length > 0) {
        foundCallback(result[0]);
      } else {
        notFoundCallback();
      }
    },
  );
}

function ensureWhatsAppRunning() {
  findWhatsAppTab((tab) => {
    waTabId = tab.id;
    if (!tab.pinned) {
      chrome.tabs.update(tab.id, {
        pinned: true,
      });
    }
  }, () => {
    chrome.tabs.create({
      index: 0,
      pinned: true,
      url: 'https://web.whatsapp.com/',
      active: false,
    }, (tab) => {
      // tab is undefined in situation when all windows all closed.
      if (typeof tab === 'object') {
        waTabId = tab.id;
      }
    });
  });
}

function onTabSwitchRequested() {
  chrome.tabs.query({ active: true }, (tabs) => {
    let tabToActivateId;
    if (tabs[0].id !== waTabId) {
      previousTabId = tabs[0].id;
      tabToActivateId = waTabId;
    } else {
      tabToActivateId = previousTabId;
    }

    chrome.tabs.update(tabToActivateId, {
      active: true,
    });
  });
}

// Race condition, tab restoring takes place at same time background script is executed.
// https://bugzilla.mozilla.org/show_bug.cgi?id=1411603
window.setTimeout(ensureWhatsAppRunning, 2000);

chrome.browserAction.onClicked.addListener(onTabSwitchRequested);

chrome.commands.onCommand.addListener((command) => {
  if (command === 'wa-toggle') {
    onTabSwitchRequested();
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === waTabId) {
    window.setTimeout(ensureWhatsAppRunning, 2000);
  }
});

/**
 * Handle WhatsApp tab title change (possibly a notification).
 */
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'title_change') {
    const match = message.current_title.match(/\((\d+)\)/);
    chrome.browserAction.setBadgeText({ text: match === null ? '' : match[1] });
  }
});
