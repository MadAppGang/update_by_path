import * as h from './helpers';

const ARRAY_QUERY_REGEX = /\[(\w+)\]/;
const ARRAY_QUERY_BY_PROP_REGEX = /\[(\w+)=(\w+)\]/;

const update = (source, path, value) => {
  if (h.isObject(path)) {
    const config = path;

    return Object.keys(config)
      .reduce((output, key) => update(output, key, config[key]), source);
  }

  const output = h.copyOf(source);
  const pathNodes = path.split('.');
  let node = h.firstOf(pathNodes);

  const isLastNode = pathNodes.length === 1;

  if (isLastNode) {
    const pureNode = h.purifyNode(node);

    if (Array.isArray(output[pureNode])) {
      const arr = output[pureNode];
      const arrayQueryMatch = node.match(ARRAY_QUERY_REGEX);
      const queryByPropMatch = node.match(ARRAY_QUERY_BY_PROP_REGEX);

      if (arrayQueryMatch) {
        const query = arrayQueryMatch[1];

        if (h.isNumber(query)) {
          // searching by index
          const index = Number(query);
          const currentValue = arr[index];
          const nextValue = h.getNextValue(currentValue, value);
          output[pureNode] = h.replaceByIndex(arr, index, nextValue);
        } else {
          // searching by value
          const currentValue = arr.find(v => v === query);
          const nextValue = h.getNextValue(currentValue, value);
          output[pureNode] = h.replaceByValue(arr, query, nextValue);
        }
      }

      if (queryByPropMatch) {
        const [key, val] = queryByPropMatch.slice(1, 3);
        const currentValue = arr.find(v => v[key] === val);
        const nextValue = h.getNextValue(currentValue, value);
        output[pureNode] = h.replaceByValue(arr, currentValue, nextValue);
      }

      return output;
    } else {
      output[pureNode] = h.getNextValue(output[pureNode], value);
      return output;
    }

  }

  const currentValue = output[node];

  let nextSource;

  if (h.isObject(currentValue)) {
    nextSource = h.copyOf(currentValue);
  } else {
    if (isLastNode) {
      nextSource = value;
    } else {
      const pureNode = h.purifyNode(node);
      const arr = output[pureNode];
      const arrayQueryMatch = node.match(ARRAY_QUERY_REGEX);
      const queryByPropMatch = node.match(ARRAY_QUERY_BY_PROP_REGEX);

      if (arrayQueryMatch) {
        const query = arrayQueryMatch[1];

        if (h.isNumber(query)) {
          // searching by index
          const index = Number(query);
          const currentValue = arr[index] || {};
          const nextValue = update(currentValue, h.reducePath(path), value);
          output[pureNode] = h.replaceByIndex(arr, index, nextValue);
        } else {
          // searching by value
          let currentValue = arr.find(v => v === query);

          if (!h.isObject(currentValue)) {
            currentValue = {};
          }

          const nextValue = update(currentValue, h.reducePath(path), value);
          output[pureNode] = h.replaceByValue(arr, query, nextValue);
        }

        return output;
      }

      if (queryByPropMatch) {
        const [key, val] = queryByPropMatch.slice(1, 3);
        const currentValue = arr.find(item => item[key] == val) || {};
        const nextValue = update(currentValue, h.reducePath(path), value);
        output[pureNode] = h.replaceByValue(arr, currentValue, nextValue);
        return output;
      }

      nextSource = {};
    }
  }

  output[node] = update(nextSource, h.reducePath(path), value);

  return output;
};

export default update;
