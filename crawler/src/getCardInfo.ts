import { JSDOM } from 'jsdom';
import { getBasicInfo, getPokemonInfo } from './getCardInfoByType';
import getCardsUrls from './getCardUrls';

const getCardInfo = async (url: string) => {
  const dom = await JSDOM.fromURL(url);
  // console.log(dom.window.location.href);
  const cardTypeDiv = dom.window.document.querySelector('.card-type');

  let cardInfo = { ...getBasicInfo(dom) };

  // if super type = pokemon
  if (cardTypeDiv.children[0].textContent.match(/(^Pokémon)|(Pokémon$)/))
    cardInfo = { ...cardInfo, ...getPokemonInfo(dom) };

  return cardInfo;
};

export default async function getCardsInfo(url: string, pageLimit: number) {
  const cardUrls = await getCardsUrls(url, pageLimit);
  const cardsInfo = await Promise.all(cardUrls.map((cardUrl) => getCardInfo(cardUrl)));

  // console.log(cardsInfo);
  return cardsInfo
}
