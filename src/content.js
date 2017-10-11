/**
 * Watch for favicon changes.
 */
const favicon = document.getElementById('favicon');
const faviconUrl = chrome.runtime.getURL('src/icons/icon.ico');

const observer = new MutationObserver(((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'href' && favicon.getAttribute('href') !== faviconUrl) {
      favicon.setAttribute('href', faviconUrl);
    }
  });
}));

observer.observe(favicon, { attributes: true });

favicon.setAttribute('href', faviconUrl);

/**
 * Watch for title changes (new notifications).
 */
new MutationObserver(((mutations) => {
  chrome.runtime.sendMessage({
    type: 'title_change',
    current_title: mutations[0].target.innerText,
  });
})).observe(
  document.querySelector('title'),
  { subtree: true, characterData: true, childList: true },
);
