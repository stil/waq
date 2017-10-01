chrome.browserAction.onClicked.addListener((e) => {
  console.log(e);
});

function handleCreated(tab) {
  console.log(tab);
}

chrome.tabs.onCreated.addListener(handleCreated);

chrome.webRequest.onHeadersReceived.addListener(
  (info) => {
    const headers = info.responseHeaders.filter(header => header.name !== 'x-frame-options' && header.name !== 'content-security-policy');
    return { responseHeaders: headers };
  },
  {
    urls: ['https://*.whatsapp.com/*'], // Pattern to match all http(s) pages
  },
  ['blocking', 'responseHeaders'],
);

// Fix "Origin" header.
chrome.webRequest.onBeforeSendHeaders.addListener(
  (info) => {
    const headers = info.requestHeaders;
    for (let i = headers.length - 1; i >= 0; --i) {
      const header = headers[i].name.toLowerCase();
      if (header === 'origin') {
        headers[i].value = 'https://web.whatsapp.com';
      }
    }
    return { requestHeaders: headers };
  },
  {
    urls: ['wss://*.web.whatsapp.com/*'],
    types: ['websocket'],
  },
  ['blocking', 'requestHeaders'],
);

// Watch for headers.
chrome.webRequest.onBeforeSendHeaders.addListener(
  (info) => {
    const headers = info.requestHeaders;
    for (let i = headers.length - 1; i >= 0; --i) {
      const header = headers[i].name.toLowerCase();
      if (header === 'origin') {
        headers[i].value = 'https://web.whatsapp.com';
      }
    }
    return { requestHeaders: headers };
  },
  {
    urls: ['https://web.whatsapp.com/*'],
  },
  ['blocking', 'requestHeaders'],
);


function reloadWhatsAppCache() {
  const oReq = new XMLHttpRequest();
  oReq.addEventListener('load', function () {
    const wab = new DOMParser().parseFromString(this.responseText, 'text/html');

    const baseEl = document.createElement('base');
    baseEl.href = 'https://web.whatsapp.com';
    const headEl = wab.getElementsByTagName('head')[0];
    headEl.insertBefore(baseEl, headEl.firstChild);

    console.log(wab);
    chrome.storage.local.set({ waCache: wab.documentElement.outerHTML });
    // const iframe = document.getElementById('iframe');
    // iframe.srcdoc = wab.outerHTML;
  });

  oReq.addEventListener('error', function () {
    console.log(this.responseText);
  });

  oReq.addEventListener('abort', function () {
    console.log(this.responseText);
  });

  oReq.withCredentials = true;
  oReq.open('GET', 'https://web.whatsapp.com/', true);
  oReq.send();
}

window.setInterval(() => {
  reloadWhatsAppCache();
}, 360 * 1000);

reloadWhatsAppCache();
