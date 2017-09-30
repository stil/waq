const oReq = new XMLHttpRequest();
oReq.addEventListener('load', function () {
  const wab = document.createElement('html');
  wab.innerHTML = this.responseText;

  const baseEl = document.createElement('base');
  baseEl.href = 'https://web.whatsapp.com';
  const headEl = wab.getElementsByTagName('head')[0];
  headEl.insertBefore(baseEl, headEl.firstChild);
});

oReq.addEventListener('error', function () {
  console.error(this.responseText);
});

oReq.addEventListener('abort', function () {
  console.error(this.responseText);
});

oReq.withCredentials = true;
oReq.open('GET', 'https://web.whatsapp.com/', true);
oReq.send();

const iframe = document.getElementById('iframe');
chrome.storage.local.get('waCache', (result) => {
  iframe.srcdoc = result.waCache;
});
