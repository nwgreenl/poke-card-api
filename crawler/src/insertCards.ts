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
    for(let id of series) db.run(`insert into ${DB_TABLE_SERIES} values ('${id}')`)
    for(let id of Object.keys(sets)) db.run(`insert into ${DB_TABLE_SETS} values('${id}', '${sets[id][0]}', '${sets[id][1]}')`)
    
    // TODO - json stringify objs/arrs & change db type
    for(let obj of pokemon) {
      const pokemonColNames = Object.keys(obj).map(((key: any) => key)).join(',')
      db.run(`insert into ${DB_TABLE_POKEMON}(${pokemonColNames}) values (${Object.values(obj).map((value: any) => `'${value}'`).join(',')})`)
    }
    db.close()
  })
  
}