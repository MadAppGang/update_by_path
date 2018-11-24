export const isObject = value => typeof value === 'object';

export const isFunction = f => typeof f === 'function';

export const isNumber = n => typeof Number(n) === 'number' && !isNaN(n);

export const isUndefined = v => typeof v === 'undefined';

export const firstOf = arr => arr[0];

export const copyOf = o => Object.assign({}, o);

export const reducePath = path => path.split('.').slice(1).join('.');

export const ensureObject = object => isObject(object) ? object : {};

export const filter = arr => arr.filter(v => !isUndefined(v));

export const purifyNode = node => node.replace(/\[.*\]/, '');

export const replaceByIndex = (arr, index, nextValue) =>
  filter(arr.map((value, i) => index !== i ? value : nextValue));

export const replaceByValue = (arr, currentValue, nextValue) =>
  filter(arr.map(value => value !== currentValue ? value : nextValue));

export const getNextValue = (currentValue, _value) =>
  isFunction(_value) ? _value(currentValue) : _value;

export const replaceByPropQuery = (arr, match, getNextValue) => {
  const [key, val] = match.slice(1, 3);
  const currentValue = arr.find(item => item[key] == val);

  if (!currentValue || !isFunction(getNextValue)) {
    return arr;
  }

  const nextValue = getNextValue(currentValue);

  return replaceByValue(arr, currentValue, nextValue);
};

export const replaceByIndexQuery = (arr, query, getNextValue) => {
  const index = Number(query);
  const currentValue = arr[index];

  if (!currentValue || !isFunction(getNextValue)) {
    return arr;
  }

  const nextValue = getNextValue(currentValue);

  return replaceByIndex(arr, index, nextValue);
};

export const replaceByValueQuery = (arr, query, getNextValue) => {

  let currentValue = arr.find(v => v === query);

  if (!currentValue || !isFunction(getNextValue)) {
    return arr;
  }

  const nextValue = getNextValue(currentValue);

  return replaceByValue(arr, query, nextValue);
};