const iframe = document.getElementById('iframe');
chrome.storage.local.get('waCache', (result) => {
  iframe.srcdoc = result.waCache;
});
