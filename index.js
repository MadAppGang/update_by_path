const isObject = o => typeof o === 'object' 
const isFunction = f => typeof f === 'function';
const firstOf = arr => arr[0];
const copyOf = o => Object.assign({}, o);

const replaceInArray = (arr, currentValue, nextValue) => {
  return arr.map((value) => {
    if (value !== currentValue) {
      return value;
    }

    return nextValue;
  }).filter(value => typeof value !== 'undefined');
};

const replaceValue = (currentValue, _value) =>
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

  const arrayQueryMatch = node.match(arrayQueryRegex);

  node = node.replace(arrayQueryRegex, '');

  if (!reducedPath) {
    if (arrayQueryMatch && Array.isArray(output[node])) {
      const arr = output[node];
      const query = arrayQueryMatch[1];
      const currentValue = arr.find(v => v === query);

      output[node] =
        replaceInArray(arr, query, replaceValue(currentValue, value));
      return output;
    } else {
      output[node] = replaceValue(output[node], value);
      return output;
    }
  }

  const isLastNode = pathNodes.length === 1;

  const nextStepValue = isObject(source[node])
    ? copyOf(source[node])
    : !isLastNode ? {} : value;

  output[node] = update(nextStepValue, reducedPath, value);

  return output;
};

Object.defineProperty(exports, "__esModule", { value: true });

exports.default = update;

module.exports = update;
