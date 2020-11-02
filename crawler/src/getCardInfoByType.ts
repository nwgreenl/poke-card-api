import { JSDOM } from 'jsdom';
import { basicInfoType, pokemonInfoType, resistanceInfoType, weaknessInfoType } from './types';

export const getBasicInfo = (dom: JSDOM): basicInfoType => {
  const { document } = dom.window;

  const name = document.querySelector('.card-description').children[0].textContent.trim();
  const image = document.querySelector('.card-image > img').src;
  const artist = document.querySelector('.highlight').children[0].textContent;

  return { name, image, artist };
};

export const getTrainerInfo = (dom: JSDOM) => {
  // TODO
}

export const getEnergyInfo = (dom: JSDOM) => {
  // TODO
}

export const getPokemonInfo = (dom: JSDOM): pokemonInfoType => {
  const { document } = dom.window;

  let cardInfo = {};

  const statsFooterDiv = document.querySelector('.stats-footer');
  const cardTypeDiv = document.querySelector('.card-type');
  const typeIcon = document.querySelector('div.card-basic-info > div.right > a > i.energy');
  const statDivs = [...document.querySelectorAll('.stat')];
  const abilitiesDiv = [...document.querySelector('.pokemon-abilities').children];
  const urlPath = dom.window.location.pathname
    .replace('/us/pokemon-tcg/pokemon-cards/', '')
    .split('/');

  const superType = 'Pokemon';
  const subType = cardTypeDiv.children[0].textContent.replace('Pokémon', '').trim();
  const evolvesFrom = cardTypeDiv.children[1]
    ? cardTypeDiv.children[1].children[0].textContent.trim()
    : ['base'];
  const isPromo = statsFooterDiv.textContent.match(/(.+)—/);
  const seriesId = isPromo
    ? statsFooterDiv.textContent.match(/(.+)—/)[1].trim()
    : statsFooterDiv.textContent.trim().split('\n')[0];
  const setName = isPromo ? statsFooterDiv.textContent.match(/—(.+)/)[1].trim() : seriesId;
  const setNumber = isPromo
    ? statsFooterDiv.textContent.trim().split('\n')[1].trim()
    : statsFooterDiv.textContent.match(/\d+\/\d+/)[0];
  const rarity = isPromo ? 'Promo' : statsFooterDiv.textContent.match(/\d+\/\d+\s(\w+)/)[1];
  const hp = parseInt(document.querySelector('.card-hp').textContent.trim().substr(2));
  const setId = urlPath[1];
  const number = parseInt(urlPath[2]);
  const id = `${setId}-${number}`;
  let abilities = [];
  let attacks = [];

  for (let i = 0; i < abilitiesDiv.length; i++) {
    let ability = abilitiesDiv[i];

    if (ability.children[0].className === 'left' && ability.children[0].children.length) {
      let costTypes = [...ability.children[0].children].map(
        (type: { title: string }) => type.title
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
      const weaknesses: Array<weaknessInfoType> = weaknessLists.map(
        (weakness: { title: string; textContent: string }) => ({
          type: weakness.title,
          value: weakness.textContent.trim(),
        })
      );

      cardInfo = { ...cardInfo, weaknesses };
    } else if (statDiv.textContent.includes('Resistance') && statDiv.children.length > 1) {
      const resistanceLists = [...statDiv.children[1].children];
      const resistances: Array<resistanceInfoType> = resistanceLists.map(
        (resistance: { title: string; textContent: string }) => ({
          type: resistance.title,
          value: resistance.textContent.trim(),
        })
      )

      cardInfo = { ...cardInfo, resistances };
    } else if (statDiv.textContent.includes('Retreat')) {
      if (statDiv.children[1]) {
        const retreatLists = [...statDiv.children[1].children];
        let retreatTypes: Array<string> = [];
        let retreatInfo: Array<any> = [];
        retreatLists.forEach((retreat) => {
          retreatTypes.push(retreat.title);
          retreatInfo.push({
            [retreat.title]: retreatInfo[retreat.title] ? (retreatInfo[retreat.title] += 1) : 1,
          });
        });
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
    : [...new Set(attacks.map((attack) => attack.costTypes))];

  cardInfo = {
    ...cardInfo,
    id,
    superType,
    subType,
    type,
    evolvesFrom,
    hp,
    seriesId,
    setName,
    setId,
    setNumber,
    number,
    rarity,
    abilities,
    attacks,
  };

  return <pokemonInfoType>cardInfo;
};
