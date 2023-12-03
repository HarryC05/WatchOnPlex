// require xml2js to parse xml response from plex api
const xml2js = require('xml2js');

// get plex details from chrome.storage
const getPlexDetails = () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      {
        plexURL: '',
        plexToken: '',
        machineIdentifier: '',
      },
      function (items) {
        resolve(items);
      }
    );
  });
};

const searchPlexApi = async (title) => {
  const plexDetails = await getPlexDetails();

  if (!plexDetails.plexURL || !plexDetails.plexToken) {
    return;
  }
  
  const searchUrl = `https://${plexDetails.plexURL}/search?query=${title}&X-Plex-Token=${plexDetails.plexToken}`;

  const response = await fetch(searchUrl);

  const xml = await response.text();

  let data = {};

  await xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
    if (err) {
      console.error(err);
      return;
    }
    data = result;
  });

  console.log(data);
  

  return data;
}

// check to see if the current google search is a movie or tv show
const checkGoogleSearch = async () => {
  const plexDetails = await getPlexDetails();

  const mediaHeader = document.getElementsByClassName('KsRP6');

  if (mediaHeader.length === 0) {
    return;
  }

  const title = document.getElementsByClassName('ssJ7i')?.[0]?.textContent;

  if (!title) {
    return;
  }

  // search plex api for the media title
  const res = await searchPlexApi(title);

  if (!res || res.length === 0) {
    console.log('No results found');
    return;
  }

  // get the first result
  const result = res?.MediaContainer?.Video;

  if (!result) {
    console.log('No results found');
    return;
  }

  console.log('result', result);

  // create the plex link element
  const plexEl = document.createElement('div');
  plexEl.classList.add('fOYFme');

  const plexLinkEl = document.createElement('a');
  plexLinkEl.href = `https://app.plex.tv/desktop/#!/server/${plexDetails.machineIdentifier}/details?key=${result.$.key}`;
  plexLinkEl.target = '_blank';
  plexLinkEl.rel = 'noopener noreferrer';

  const plexLinkWrapperEl = document.createElement('div');
  plexLinkWrapperEl.classList.add('Fjeoze');

  const plexLinkIconWrapperEl = document.createElement('div');
  plexLinkIconWrapperEl.classList.add('mNte6b');

  const plexLinkIconGimg = document.createElement('g-img');
  plexLinkIconGimg.classList.add('PTsTab');

  const plexLinkIconImg = document.createElement('img');
  plexLinkIconImg.id = 'dimg_3';
  plexLinkIconImg.classList.add('YQ4gaf', 'zr758c');
  plexLinkIconImg.width = '40';
  plexLinkIconImg.height = '40';
  plexLinkIconImg.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT656utHA6hUMTGTosn8CkO7NCLpt3q79IWqZVo9rMTDaMoZEB5FVW8TnbtvA&s';

  plexLinkIconGimg.appendChild(plexLinkIconImg);
  plexLinkIconWrapperEl.appendChild(plexLinkIconGimg);
  plexLinkWrapperEl.appendChild(plexLinkIconWrapperEl);

  const plexLinkTextEl = document.createElement('div');
  plexLinkTextEl.classList.add('esuhec', 'sjVJQd');
  plexLinkTextEl.textContent = 'Watch now';

  plexLinkWrapperEl.appendChild(plexLinkTextEl);

  const plexLinkPrice = document.createElement('div');
  plexLinkPrice.classList.add('ZYHQ7e', 'hWgrdb', 'ApHyTb');
  plexLinkPrice.textContent = 'Free';

  plexLinkWrapperEl.appendChild(plexLinkPrice);

  plexLinkEl.appendChild(plexLinkWrapperEl);
  plexEl.appendChild(plexLinkEl);

  const watchServices = document.getElementsByClassName('ynrNJf')[0];

  if (watchServices.length === 0) {
    return;
  }

  if (watchServices.childElementCount === 3) {
    // replace the first watch service with the plex link element
    watchServices.replaceChild(plexEl, watchServices.children[0]);
  } else {
    // insert the plex link element before the first watch service
    watchServices.insertBefore(plexEl, watchServices.firstChild);
  }
}

checkGoogleSearch();
