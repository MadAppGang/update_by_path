import * as helpers from './helpers';

const ARRAY_QUERY_REGEX = /\[(\w+)\]/;
const ARRAY_QUERY_BY_PROP_REGEX = /\[(\w+)=(\w+)\]/;

const update = (source, path, value) => {
  if (helpers.isObject(path)) {
    const config = path;

    return Object.keys(config)
      .reduce((output, key) => update(output, key, config[key]), source);
  }

  const output = helpers.copyOf(source);
  const pathNodes = path.split('.');
  let node = helpers.firstOf(pathNodes);

  const isLastNode = pathNodes.length === 1;

  if (isLastNode) {
    const pureNode = helpers.purifyNode(node);

    if (Array.isArray(output[pureNode])) {
      const arr = output[pureNode];
      const inArrayMatch = node.match(ARRAY_QUERY_REGEX);
      const byPropMatch = node.match(ARRAY_QUERY_BY_PROP_REGEX);

      if (inArrayMatch) {
        const query = inArrayMatch[1];

        if (helpers.isNumber(query)) {
          output[pureNode] = helpers.replaceByIndexQuery(arr, query, (curValue) => {
            return helpers.getNextValue(curValue, value);
          });
          return output;
        } else {
          output[pureNode] = helpers.replaceByValueQuery(arr, query, (curValue) => {
            return helpers.getNextValue(curValue, value);
          });
          return output;
        }
      }

      if (byPropMatch) {
        output[pureNode] = helpers.replaceByPropQuery(
          arr, byPropMatch, curValue => helpers.getNextValue(curValue, value),
        );

        return output;
      }
    }

    output[pureNode] = helpers.getNextValue(output[pureNode], value);
    return output;
  }

  const currentValue = output[node];

  let nextSource;

  if (helpers.isObject(currentValue)) {
    nextSource = helpers.copyOf(currentValue);
  } else {
    if (isLastNode) {
      nextSource = value;
    } else {
      const pureNode = helpers.purifyNode(node);
      const arr = output[pureNode];
      const inArrayMatch = node.match(ARRAY_QUERY_REGEX);
      const byPropMatch = node.match(ARRAY_QUERY_BY_PROP_REGEX);

      if (inArrayMatch) {
        const query = inArrayMatch[1];

        if (helpers.isNumber(query)) {
          output[pureNode] = helpers.replaceByIndexQuery(arr, query, (curValue) => {
            return update(curValue, helpers.reducePath(path), value);
          });
        } else {
          output[pureNode] = helpers.replaceByValueQuery(arr, query, (curValue) => {
            let nextSource = {};

            if (helpers.isObject(curValue)) {
              nextSource = curValue;
            }

            return update(nextSource, helpers.reducePath(path), value);
          });
        }

        return output;
      }

      if (byPropMatch) {
        output[pureNode] = helpers.replaceByPropQuery(
          arr,
          byPropMatch,
          currentValue => update(currentValue, helpers.reducePath(path), value),
        );

        return output;
      }

      nextSource = {};
    }
  }

  output[node] = update(nextSource, helpers.reducePath(path), value);

  return output;
};

export default update;
