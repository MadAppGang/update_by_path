const isObject = o => typeof o === 'object' 
const isFunction = f => typeof f === 'function';
const isNumber = n => typeof Number(n) === 'number';
const firstOf = arr => arr[0];
const copyOf = o => Object.assign({}, o);

const replaceByIndex = (arr, index, nextValue) => {
  return arr.map((value, i) => {
    if (index !== i) {
      return value;
    }

    return nextValue;
  }).filter(value => typeof value !== 'undefined');
};

const replaceByValue = (arr, currentValue, nextValue) => {
  return arr.map((value) => {
    if (value !== currentValue) {
      return value;
    }

    return nextValue;
  }).filter(value => typeof value !== 'undefined');
};

const getNextValue = (currentValue, _value) =>
  isFunction(_value) ? _value(currentValue) : _value;

const arrayQueryRegex = /\[(.*)\]/;

const update = (source, path, value) => {
  if (isObject(path)) {
    const config = path;

    return Object.keys(config)
      .reduce((output, key) => update(output, key, config[key]), source);
  }

  const output = copyOf(source);
  const pathNodes = path.split('.');
  const reducedPath = pathNodes.slice(1).join('.');

  let node = firstOf(pathNodes);

  // contains array query?
  const arrayQueryMatch = node.match(arrayQueryRegex);

  // remove array query
  node = node.replace(arrayQueryRegex, '');

  const isLastNode = pathNodes.length === 1;

  if (isLastNode) {
    if (arrayQueryMatch && Array.isArray(output[node])) {
      const arr = output[node];
      const query = arrayQueryMatch[1];

      if (isNumber(query)) {
        // searching by index
        const index = Number(query);
        const currentValue = arr[index];
        const nextValue = getNextValue(currentValue, value);
        output[node] = replaceByIndex(arr, index, nextValue);
      } else {
        // searching by value
        const currentValue = arr.find(v => v === query);
        const nextValue = getNextValue(currentValue, value);
        output[node] = replaceByValue(arr, query, nextValue);
      }

      return output;
    } else {
      output[node] = getNextValue(output[node], value);
      return output;
    }
  }

  const nextStepValue = isObject(source[node])
    ? copyOf(output[node])
    : !isLastNode ? {} : value;

  output[node] = update(nextStepValue, reducedPath, value);

  return output;
};

Object.defineProperty(exports, "__esModule", { value: true });

exports.default = update;

module.exports = update;
