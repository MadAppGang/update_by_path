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
      const inArrayMatch = node.match(ARRAY_QUERY_REGEX);
      const byPropMatch = node.match(ARRAY_QUERY_BY_PROP_REGEX);

      if (inArrayMatch) {
        const query = inArrayMatch[1];

        if (h.isNumber(query)) {
          output[pureNode] = h.replaceByIndexQuery(arr, query, (currentValue) => {
            return h.getNextValue(currentValue, value);
          });
        } else {
          // searching by value
          const currentValue = arr.find(v => v === query);
          const nextValue = h.getNextValue(currentValue, value);
          output[pureNode] = h.replaceByValue(arr, query, nextValue);
        }
      }

      if (byPropMatch) {
        output[pureNode] = h.replaceByPropQuery(
          arr, byPropMatch, currentValue => h.getNextValue(currentValue, value),
        );

        return output;
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
      const inArrayMatch = node.match(ARRAY_QUERY_REGEX);
      const byPropMatch = node.match(ARRAY_QUERY_BY_PROP_REGEX);

      if (inArrayMatch) {
        const query = inArrayMatch[1];

        if (h.isNumber(query)) {
          output[pureNode] = h.replaceByIndexQuery(arr, query, (currentValue) => {
            return update(currentValue, h.reducePath(path), value);
          });
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

      if (byPropMatch) {
        output[pureNode] = h.replaceByPropQuery(
          arr,
          byPropMatch,
          currentValue => update(currentValue, h.reducePath(path), value),
        );

        return output;
      }

      nextSource = {};
    }
  }

  output[node] = update(nextSource, h.reducePath(path), value);

  return output;
};

export default update;
