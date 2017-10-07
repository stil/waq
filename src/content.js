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
