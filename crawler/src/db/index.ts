import sqlite3 from 'sqlite3'
import { DB_PATH, DB_NAME } from '../../settings'

export default new sqlite3.Database(<string>DB_PATH, sqlite3.OPEN_READWRITE, (err: any) => {
  if (err) {
    console.error(err.message);
  }
  console.log(`Connected to the '${DB_NAME}' database.`);
});