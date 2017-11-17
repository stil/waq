function writeDebug(...args) {
  const currentTime = new Date().toISOString();
  console.debug(['WAQ', currentTime].concat(args));
}

let waTabId = null;
let previousTabId;

function spareWhatsAppTabCheck(foundCallback, notFoundCallback) {
  // Sometimes addon is loaded before browser restores all tabs.
  // When tabs are not fully restored, URL property is "about:blank".
  // It means we need to use other method to check if WhatsApp tab has been restored.
  // Here we compare favicon URLs, which is hacky but apparently works.

  chrome.tabs.query(
    { },
    (result) => {
      writeDebug('Spare check all tabs', result);
      const faviconUrl = chrome.runtime.getURL('src/icons/icon.ico');
      const waTab = result.find(t => t.favIconUrl === faviconUrl);
      if (waTab) {
        writeDebug('Spare check successful!', waTab);
        foundCallback(waTab);
      } else {
        writeDebug('Spare check failed.');
        notFoundCallback();
      }
    },
  );
}

function findWhatsAppTab(foundCallback, notFoundCallback) {
  chrome.tabs.query(
    { url: 'https://web.whatsapp.com/*' },
    (result) => {
      if (result.length > 0) {
        writeDebug('WhatsApp tab is running in background.');
        foundCallback(result[0]);
      } else {
        writeDebug('WhatsApp has not been found running in background.');
        spareWhatsAppTabCheck(foundCallback, notFoundCallback);
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
writeDebug('Addon has been loaded.');
window.setTimeout(ensureWhatsAppRunning, 2000);

chrome.browserAction.onClicked.addListener(onTabSwitchRequested);

chrome.commands.onCommand.addListener((command) => {
  if (command === 'wa-toggle') {
    onTabSwitchRequested();
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === waTabId) {
    const reopenIntervalMs = 2000;
    writeDebug(`Pinned tab has been closed. Reopening in ${reopenIntervalMs} ms.`);
    window.setTimeout(ensureWhatsAppRunning, reopenIntervalMs);
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
