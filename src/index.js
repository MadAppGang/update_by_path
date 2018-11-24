import * as util from './helpers';

const ARRAY_QUERY_REGEX = /\[(\w+)\]/;
const ARRAY_QUERY_BY_PROP_REGEX = /\[(\w+)=(\w+)\]/;

const update = (source, path, value) => {
  if (util.isObject(path)) {
    return Object.keys(path)
      .reduce((output, key) => update(output, key, path[key]), source);
  }

  const output = util.copyOf(source);
  const pathNodes = path.split('.');
  let node = util.firstOf(pathNodes);

  const isLastNode = pathNodes.length === 1;

  if (isLastNode) {
    const pureNode = util.purifyNode(node);

    if (Array.isArray(output[pureNode])) {
      const arr = output[pureNode];
      const inArrayMatch = node.match(ARRAY_QUERY_REGEX);
      const byPropMatch = node.match(ARRAY_QUERY_BY_PROP_REGEX);

      if (inArrayMatch) {
        const query = inArrayMatch[1];

        const replace = util.isNumber(query)
          ? util.replaceByIndexQuery
          : util.replaceByValueQuery

        output[pureNode] = replace(arr, query, (curentValue) => {
          return util.getNextValue(curentValue, value);
        });
        return output;
      }

      if (byPropMatch) {
        const replace = currentValue => util.getNextValue(currentValue, value);
        output[pureNode] = util.replaceByPropQuery(arr, byPropMatch, replace);
        return output;
      }
    }

    output[pureNode] = util.getNextValue(output[pureNode], value);
    return output;
  }

  const currentValue = output[node];

  let nextSource;

  if (util.isObject(currentValue)) {
    nextSource = util.copyOf(currentValue);
    output[node] = update(nextSource, util.reducePath(path), value);
    return output;
  }

  const pureNode = util.purifyNode(node);
  const arr = output[pureNode];
  const inArrayMatch = node.match(ARRAY_QUERY_REGEX);
  const byPropMatch = node.match(ARRAY_QUERY_BY_PROP_REGEX);

  if (inArrayMatch) {
    const query = inArrayMatch[1];

    if (util.isNumber(query)) {
      output[pureNode] = util.replaceByIndexQuery(arr, query, (currentValue) => {
        return update(currentValue, util.reducePath(path), value);
      });
      return output;
    }

    output[pureNode] = util.replaceByValueQuery(arr, query, (currentValue) => {
      return update(util.ensureObject(currentValue), util.reducePath(path), value);
    });

    return output;
  }

  if (byPropMatch) {
    const reducedPath = util.reducePath(path);
    const replacer = curVal => update(curVal, reducedPath, value);
    output[pureNode] = util.replaceByPropQuery(arr, byPropMatch, replacer);
    return output;
  }

  output[node] = update(nextSource, util.reducePath(path), value);
  return output;
};

export default update;
