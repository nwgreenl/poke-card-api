import camelToSnake from './camelToSnake';

// create a new obj with camelCase keys
// from an obj with snake_case keys
export default function (obj: any) {
  return Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      ...{ [camelToSnake(key)]: obj[key] },
    }),
    {}
  );
}
