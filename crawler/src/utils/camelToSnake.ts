export default function (str: string) {
  return str.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`);
}
