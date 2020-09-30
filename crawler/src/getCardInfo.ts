import { JSDOM } from 'jsdom';
import { attackInfoType } from './types';
import getCardsUrls from './getCardUrls';

const getCardInfo = async (url: string) => {
  const dom = await JSDOM.fromURL(url);
  const { document } = dom.window;
  // console.log(dom.window.location.href);

  const cardDescDiv = document.querySelector('.card-description');
  const statsFooterDiv = document.querySelector('.stats-footer');
  const cardTypeDiv = document.querySelector('.card-type');
  const typeIcon = document.querySelector('div.card-basic-info > div.right > a > i.energy');
  const statDivs = [...document.querySelectorAll('.stat')];
  const abilitiesDiv = [...document.querySelector('.pokemon-abilities').children];
  const urlPath = dom.window.location.pathname
    .replace('/us/pokemon-tcg/pokemon-cards/', '')
    .split('/');
  const name = cardDescDiv.children[0].textContent.trim();
  const image = document.querySelector('.card-image > img').src;
  const artist = document.querySelector('.highlight').children[0].textContent;

  let cardInfo = {};

  if (cardTypeDiv.children[0].textContent.match(/(^Pokémon)|(Pokémon$)/)) {
    const superType = 'Pokemon';
    const subType = cardTypeDiv.children[0].textContent.replace('Pokémon', '').trim();
    const evolvesFrom = cardTypeDiv.children[1]
      ? cardTypeDiv.children[1].children[0].textContent.trim()
      : ['base'];
    const isPromo = statsFooterDiv.textContent.match(/(.+)—/);
    const series = isPromo
      ? statsFooterDiv.textContent.match(/(.+)—/)[1].trim()
      : statsFooterDiv.textContent.trim().split('\n')[0];
    const setName = isPromo ? statsFooterDiv.textContent.match(/—(.+)/)[1].trim() : series;
    const setNumber = isPromo
      ? statsFooterDiv.textContent.trim().split('\n')[1].trim()
      : statsFooterDiv.textContent.match(/\d+\/\d+/)[0];
    const rarity = isPromo ? 'Promo' : statsFooterDiv.textContent.match(/\d+\/\d+\s(\w+)/)[1];
    const hp = document.querySelector('.card-hp').textContent.trim().substr(2);
    const setId = urlPath[1];
    const number = urlPath[2];
    const id = `${setId}-${number}`;
    let abilities = [];
    let attacks = [];

    for (let i = 0; i < abilitiesDiv.length; i++) {
      let ability = abilitiesDiv[i];

      if (ability.children[0].className === 'left' && ability.children[0].children.length) {
        let costTypes = [...ability.children[0].children].reduce(
          (acc: string, type: any) => [...acc, type.title],
          []
        );
        const cost = costTypes.length;
        if (!cost) costTypes = ['Free'];

        const name = ability.children[1].textContent;
        let damage = '',
          text = '';
        if (ability.children[2].textContent.match(/^\d/)) {
          damage = ability.children[2].textContent;
          text = ability.children[3].textContent;
        } else {
          damage = 'None';
          text = ability.children[2].textContent;
        }

        attacks.push({ costTypes, cost, name, damage, text });
      }
      if (ability.tagName === 'H3') {
        const type = ability.children[0].textContent;
        const name = ability.children[1].textContent;
        const text = abilitiesDiv[i + 1].textContent;
        i++;

        abilities.push({ type, name, text });
      }
    }

    for (let statDiv of statDivs) {
      if (statDiv.textContent.includes('Weakness')) {
        const weaknessLists = [...statDiv.children[1].children];
        const weaknesses = weaknessLists.reduce(
          (acc, weakness) => [...acc, { type: weakness.title, value: weakness.textContent.trim() }],
          []
        );

        cardInfo = { ...cardInfo, weaknesses };
      } else if (statDiv.textContent.includes('Resistance') && statDiv.children.length > 1) {
        const resistanceLists = [...statDiv.children[1].children];
        const resistances = resistanceLists.reduce(
          (acc, resistance) => [
            ...acc,
            { type: resistance.title, value: resistance.textContent.trim() },
          ],
          []
        );

        cardInfo = { ...cardInfo, resistances };
      } else if (statDiv.textContent.includes('Retreat')) {
        if (statDiv.children[1]) {
          const retreatLists = [...statDiv.children[1].children];
          let retreatTypes: Array<string> = [];
          const retreatInfo = retreatLists.reduce((acc, retreat) => {
            retreatTypes.push(retreat.title);
            return {
              ...acc,
              [retreat.title]: acc[retreat.title] ? (acc[retreat.title] += 1) : 1,
            };
          }, {});
          const retreatCost = retreatTypes.length;
          cardInfo = { ...cardInfo, retreatInfo, retreatTypes, retreatCost };
        } else {
          const retreatInfo = [{ Free: 0 }];
          const retreatTypes = ['Free'];
          const retreatCost = 0;
          cardInfo = { ...cardInfo, retreatInfo, retreatTypes, retreatCost };
        }
      }
    }

    let type = typeIcon
      ? [typeIcon.className.match(/icon-(\w+)/)[1]]
      : [
          ...new Set(
            attacks.reduce(
              (acc: Array<string>, attack: attackInfoType) => [...acc, ...attack.costTypes],
              []
            )
          ),
        ];

    cardInfo = {
      ...cardInfo,
      id,
      superType,
      subType,
      type,
      evolvesFrom,
      hp,
      series,
      setName,
      setId,
      setNumber,
      number,
      rarity,
      abilities,
      attacks,
    };
  }

  return { name, image, artist, ...cardInfo };
};

export default async function getCardsInfo(url: string, limit: number) {
  const cardUrls = await getCardsUrls(url, limit);
  const cardsInfo = await Promise.all(cardUrls.map((cardUrl: any) => getCardInfo(cardUrl)));

  console.log(cardsInfo);
}
