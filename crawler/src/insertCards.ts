import db from './db/index'
import getCardsInfo from './getCardInfo'
import objKeysCamelToSnake from './utils/objKeysCamelToSnake'
import { DB_TABLE_SERIES, DB_TABLE_SETS, DB_TABLE_POKEMON } from '../settings'

export default async function insertCards(url: string, pageLimit: number) {
  const cardsInfo = await getCardsInfo(url, pageLimit)
  const series = [...new Set(cardsInfo.map((obj: any) => obj.seriesId))]
  series.shift() // TODO - fix first val return undefiend

  let sets: any = {}
  cardsInfo.forEach((card: any) => {
    if(card.setId && !sets[card.setId]) sets[card.setId] = [card.setName, card.seriesId]
  })

  const pokemon = cardsInfo.filter((obj: any) => obj.superType === 'Pokemon').map((obj: any) => objKeysCamelToSnake(obj)).filter((obj: any) => obj !== undefined)
  
  db.serialize(() => {
    for(let id of series) db.run(`insert or replace into ${DB_TABLE_SERIES} values (?)`, id)
    for(let id of Object.keys(sets)) db.run(`insert or replace into ${DB_TABLE_SETS} values(?,?,?)`, id, sets[id][0], sets[id][1])
    
    for(let obj of pokemon) {
      const pokemonColNames = Object.keys(obj).map(((key: any) => key)).join(',')
      const pokemonPlaceholders = Object.keys(obj).map(((key: any) => '?')).join(',')
      db.run(`insert or replace into ${DB_TABLE_POKEMON}(${pokemonColNames}) values (${pokemonPlaceholders})`, Object.values(obj))
    }
    db.close()
  })
  
}