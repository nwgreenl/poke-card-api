export interface basicInfoType {
  name: string;
  image: string;
  artist: string;
};

export interface pokemonInfoType extends basicInfoType {
  weaknesses?: Array<weaknessInfoType>;
  attacks?: Array<attackInfoType>;
  resistances?: Array<resistanceInfoType>;
  abilities?: Array<abilityInfoType>;
  type: Array<string>;
  evolvesFrom: Array<string>;
  retreatTypes: Array<string>;
  retreatInfo: Array<any>;
  retreatCost: number;
  hp: number;
  number: number;
  id: string;
  superType: string;
  subType: string;
  seriesId: string;
  setName: string;
  setId: string;
  setNumber: string;
  rarity: string;
};

export interface attackInfoType {
  costTypes: string;
  cost: string;
  name: string;
  damage: string;
  text: string;
};

export interface weaknessInfoType {
  type: string;
  value: string;
};

export interface resistanceInfoType {
  type: string;
  value: string;
};

export interface abilityInfoType {
  type: string;
  name: string;
  text: string;
};