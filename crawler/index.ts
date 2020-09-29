const jsdom = require('jsdom');

const { JSDOM } = jsdom;
const BASE_URL_SETS = 'http://pokellector.com/sets';

interface cardInfoObj {
  name: string;
  rarity: string;
  set: string;
  num: string;
  img: string;
}

const getAllSetLinks = async (allSetsLink = BASE_URL_SETS): Promise<Array<string>> => {
  try {
    const allSetsPage = await JSDOM.fromURL(allSetsLink);
    const allSetsAnchorTags = allSetsPage.window.document.querySelectorAll('a.button');

    return [...allSetsAnchorTags].map((a) => a.href);
  } catch (e) {
    console.log(e);
    throw new Error('getAllSetLinks');
  }
};

const getSetCardLinks = async (setLink: string): Promise<Array<string>> => {
  try {
    const setPage = await JSDOM.fromURL(setLink);
    const setPageAnchorTags = setPage.window.document.querySelectorAll('a > img.card');

    return [...setPageAnchorTags].map((img) => img.parentElement.href);
  } catch (e) {
    console.log(e);
    throw new Error('getSetCardLinks');
  }
};

const getAllCardLinks = async (): Promise<Array<string>> => {
  try {
    const setLinks = await getAllSetLinks();

    const setCardLinks = await Promise.all(
      setLinks.map((setLink: string) => getSetCardLinks(setLink))
    );
    return setCardLinks.flat();
  } catch (e) {
    console.log(e);
    throw new Error('getAllCardLinks');
  }
};

const getCardInfo = async (cardUrl: string): Promise<cardInfoObj> => {
  try {
    const cardPage = await JSDOM.fromURL(cardUrl);
    const { document } = cardPage.window;

    console.log(cardUrl);

    // 'Rarity: Rare \n Set: Champion's Path \n Card: 32/73'
    const cardInfo =
      document
        .querySelector('.infoblurb')
        .textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ')
        .trim()
        .split('  ') || undefined;
    cardInfo.forEach((item: string) => item.trim());
    const rarity = cardInfo[0].replace(/rarity: /i, '') || undefined;
    const set = cardInfo[1].replace(/set: /i, '') || undefined;
    const num = cardInfo[2].replace(/card: /i, '') || undefined;

    const cardImg = document.querySelector('.card img');
    const nameRe = new RegExp(`\\s-\\s${set} #\\d+`, 'i');

    const name = cardImg.title.replace(nameRe, ''); // 'Grapploct V - Champion's Path #32'
    const img = cardImg.src;

    return {
      name,
      rarity,
      set,
      num,
      img,
    };
  } catch (e) {
    console.log(e);
    throw new Error('getCardInfo');
  }
};

const getAllCardsInfo = async (): Promise<Array<cardInfoObj>> => {
  try {
    const cardLinks = await getAllCardLinks();

    const cardsInfo = await Promise.all(cardLinks.map((cardLink) => getCardInfo(cardLink)));

    return cardsInfo.flat();
  } catch (e) {
    console.log(e);
    throw new Error('getAllCardsInfo');
  }
};

// getAllCardsInfo();
