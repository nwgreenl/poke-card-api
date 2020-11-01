require('dotenv').config();

export const BASE_URL =
  'https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/?cardName=&cardText=&evolvesFrom=&format=unpageLimited&hitPointsMin=0&hitPointsMax=340&retreatCostMin=0&retreatCostMax=5&totalAttackCostMin=0&totalAttackCostMax=5&particularArtist=&sort=name&sort=name';
export const PAGE_LIMIT = 5; // 0 = none
export const DB_PATH = process.env.DB_PATH
export const DB_NAME = process.env.DB_NAME