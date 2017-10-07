let waTabId = null;
let previousTabId;

function ensureWhatsAppRunning() {
  chrome.tabs.query({
    url: 'https://web.whatsapp.com/*',
  }, (result) => {
    if (result.length > 0) {
      chrome.tabs.update(result[0].id, {
        pinned: true,
      });
      waTabId = result[0].id;
    } else {
      chrome.tabs.create({
        index: 0,
        pinned: true,
        url: 'https://web.whatsapp.com/*',
        active: false,
      }, (tab) => {
        waTabId = tab.id;
      });
    }
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

ensureWhatsAppRunning();

chrome.browserAction.onClicked.addListener(onTabSwitchRequested);

chrome.commands.onCommand.addListener((command) => {
  if (command === 'wa-toggle') {
    onTabSwitchRequested();
  }
});
