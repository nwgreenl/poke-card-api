import camelToSnake from './camelToSnake';

export default function (obj: any) {
  return Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      ...{ [camelToSnake(key)]: typeof obj[key] === 'number' || obj[key] === 'string' ? obj[key] : JSON.stringify(obj[key]) },
    }),
    {}
  );
}
