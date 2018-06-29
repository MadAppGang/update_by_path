const copyOf = object => ({ ...object });
const isObject = object => typeof object === 'object' 
const firstOf = arr => arr[0];
const lastOf = arr => arr[arr.length - 1];

const update = (source, path, value) => {
  if (isObject(path)) {
    const config = path;

    return Object.keys(config)
      .reduce((output, key) => update(output, key, config[key]), source);
  }

  if (source === value) {
    return value;
  }

  const output = copyOf(source);
  const pathNodes = path.split('.');
  const reducedPath = pathNodes.slice(1).join('.');
  const node = firstOf(pathNodes);

  if (!reducedPath) {
    output[node] = value;
    return output;
  }

  // TODO: do not compare nodes, they can duplicate. Compare indexes instead.
  const isLastNode = node === lastOf(pathNodes);

  const nextStepValue = isObject(source[node])
    ? copyOf(source[node])
    : !isLastNode ? {} : value;

  output[node] = update(nextStepValue, reducedPath, value);

  return output;
};
