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
  let result = res?.MediaContainer?.Video;

  if (!result) {
    console.log('No film results found');

    // if there are no video results, check for directory results
    result = res?.MediaContainer?.Directory;

    if (!result) {
      console.log('No TV show results found');
      return;
    }
  }

  let media = {};

  // check if there are multiple results
  if (result.length > 1) {
    // loop through the results and find the one with the correct title
    for (const r of result) {
      if (r.$.title.toLowerCase() === title.toLowerCase()) {
        // if the title matches, use that result
        media = r;
        break;
      }
    }
  } else {
    media = result;
  }

  if (Object.keys(media).length === 0 && res?.MediaContainer?.Video) {
    result = res?.MediaContainer?.Directory;
    if (!result) {
      console.log('No TV show results found');
      return;
    }
    // check if there are multiple results
    if (result.length > 1) {
      // loop through the results and find the one with the correct title
      for (const r of result) {
        if (r.$.title.toLowerCase() === title.toLowerCase()) {
          // if the title matches, use that result
          media = r;
          break;
        }
      }
    } else {
      media = result;
    }
    if (Object.keys(media).length === 0) {
      console.log('No results found');
      return;
    }
  }

  // plex link
  const plexLink = `https://app.plex.tv/desktop/#!/server/${plexDetails.machineIdentifier}/details?key=${media.$.key.replace('/children', '')}`;
  const plexLogoLink = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT656utHA6hUMTGTosn8CkO7NCLpt3q79IWqZVo9rMTDaMoZEB5FVW8TnbtvA&s'

  // create the plex link element
  const plexEl = document.createElement('div');
  plexEl.classList.add('fOYFme');

  const plexLinkEl = document.createElement('a');
  plexLinkEl.href = plexLink;
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
  plexLinkIconImg.src = plexLogoLink;

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

  let allWatchServices = document.querySelector('.xTWr4e span');
  let allWatchServicesQuery = '.xTWr4e span';


  if (!allWatchServices) {
    allWatchServices = document.querySelector('.nGOerd');
    allWatchServicesQuery = '.nGOerd';
  } else if (!allWatchServices.querySelector('.dSPY6 .F3p6q')?.innerText || allWatchServices.querySelector('.dSPY6 .F3p6q')?.innerText !== 'Available on') {
    allWatchServices = document.querySelector('.nGOerd');
    allWatchServicesQuery = '.nGOerd';
  }

  if (!allWatchServices) {
    return;
  }

  // add plex to the list of watch services
  const plexWatchServiceEl = document.createElement('div');

  const plexWatchServiceLinkEl = document.createElement('a');
  plexWatchServiceLinkEl.href = plexLink;

  const plexWatchServiceWrapperEl = document.createElement('div');
  plexWatchServiceWrapperEl.classList.add('o0DLIc', 'w6bhBd');

  const plexWatchServiceIconGimg = document.createElement('g-img');
  plexWatchServiceIconGimg.classList.add('hvFKJe', 'mTMorf');

  const plexWatchServiceIconImg = document.createElement('img');
  plexWatchServiceIconImg.classList.add('YQ4gaf', 'zr758c', 'wA1Bge');
  plexWatchServiceIconImg.width = '28';
  plexWatchServiceIconImg.height = '28';
  plexWatchServiceIconImg.style.borderRadius = '9999px';
  plexWatchServiceIconImg.src = plexLogoLink;

  plexWatchServiceIconGimg.appendChild(plexWatchServiceIconImg);
  plexWatchServiceWrapperEl.appendChild(plexWatchServiceIconGimg);

  const plexWatchServiceTextWrapperEl = document.createElement('div');
  plexWatchServiceTextWrapperEl.classList.add('ellip', 'phXTff');

  const plexWatchServiceTextEl = document.createElement('div');
  plexWatchServiceTextEl.classList.add('ellip', 'bclEt');
  plexWatchServiceTextEl.textContent = 'Plex';

  const plexWatchServicePriceEl = document.createElement('div');
  plexWatchServicePriceEl.classList.add('ellip', 'rsj3fb');
  plexWatchServicePriceEl.textContent = 'Free';

  plexWatchServiceTextWrapperEl.appendChild(plexWatchServiceTextEl);
  plexWatchServiceTextWrapperEl.appendChild(plexWatchServicePriceEl);
  plexWatchServiceWrapperEl.appendChild(plexWatchServiceTextWrapperEl);

  const watchButtonWrapperEl = document.createElement('div');
  watchButtonWrapperEl.classList.add('vH8Jjc', 'CYJS5e', 'plognb', 'k0Jjg', 'fCrZyc', 'LwdV0e', 'FR7ZSc', 'eFSWxd', 'PrjL8c');

  const watchButtonEl = document.createElement('div');
  watchButtonEl.classList.add('niO4u', 'VDgVie', 'SlP8xc');

  const watchButtonInnerEl = document.createElement('div');
  watchButtonInnerEl.classList.add('kHtcsd');

  const watchButtonIconWrapperEl = document.createElement('span');
  watchButtonIconWrapperEl.classList.add('d3o3Ad');

  const watchButtonIconEl = document.createElement('span');
  watchButtonIconEl.classList.add('z1asCe', 'KXvzXb');
  watchButtonIconEl.style.height = '18px';
  watchButtonIconEl.style.lineHeight = '18px';
  watchButtonIconEl.style.width = '18px';
  watchButtonIconEl.innerHTML='<svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></svg>';

  watchButtonIconWrapperEl.appendChild(watchButtonIconEl);
  watchButtonInnerEl.appendChild(watchButtonIconWrapperEl);

  const watchButtonTextEl = document.createElement('span');
  watchButtonTextEl.classList.add('clOx1e', 'sjVJQd');
  watchButtonTextEl.textContent = 'Watch';

  watchButtonInnerEl.appendChild(watchButtonTextEl);
  watchButtonEl.appendChild(watchButtonInnerEl);
  watchButtonWrapperEl.appendChild(watchButtonEl);
  plexWatchServiceWrapperEl.appendChild(watchButtonWrapperEl);
  plexWatchServiceLinkEl.appendChild(plexWatchServiceWrapperEl);
  plexWatchServiceEl.appendChild(plexWatchServiceLinkEl);

  if (allWatchServicesQuery === '.xTWr4e span') {
    allWatchServices.insertBefore(plexWatchServiceEl, allWatchServices.children[1]);
    allWatchServices.children[2].querySelector('.o0DLIc').classList.remove('o0DLIc');
    return;
  }

  allWatchServices.insertBefore(plexWatchServiceEl, allWatchServices.children[0]);
}

checkGoogleSearch();
