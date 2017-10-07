document.getElementById('favicon').setAttribute('href', chrome.runtime.getURL('src/icons/icon.svg'));


window.setTimeout(() => {
  document.getElementById('favicon').setAttribute('href', chrome.runtime.getURL('src/icons/icon.svg'));
}, 5000);
