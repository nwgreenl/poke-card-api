import { JSDOM } from 'jsdom';

const getAllCardsFromPage = async (dom: JSDOM): Promise<Array<string>> => {
  let cardUrls = [];

  const cards = [...dom.window.document.querySelector('#cardResults').children];

  for (let card of cards) cardUrls.push(card.children[0].href);

  return cardUrls;
};

export default async function getCardsUrls(url: string, limit: number): Promise<Array<string>> {
  const dom = await JSDOM.fromURL(url);
  const { document } = dom.window;

  let allCardUrls: any = await getAllCardsFromPage(dom);

  let nextPageBtn = document.querySelector('#cards-load-more').children[0].children[2];

  let i = 0;

  while (nextPageBtn.className !== 'disabled' && (!limit || (limit && i <= limit))) {
    const nextPageUrl = nextPageBtn.href;
    const nextPageDom = await JSDOM.fromURL(nextPageUrl);
    nextPageBtn = nextPageDom.window.document.querySelector('#cards-load-more').children[0]
      .children[2];

    const nextCardUrls = await getAllCardsFromPage(nextPageDom);

    allCardUrls.push(nextCardUrls);

    i++;
  }

  return allCardUrls.flat();
}
