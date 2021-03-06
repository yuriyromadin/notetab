export const _defaults = {
  app: {
    gridSize: '0.5fr 0.5fr',
    gutter: {
      position: '50%'
    },
    theme: 'xcode',
    version: '1.0.0'
  },
  editor: {
    mode: 'text',
    tabSize: 2,
    input: 'Start writing something awesome....\n'
  },
  calculator: {
    input: '1 + 2 / 2'
  }
};

export const groupBy = (arr, keyGetter) => {
  return arr.reduce((acc, item) => {
    const key = keyGetter(item);

    if(!(key in acc)){
      acc[key] = [];
    }
    acc[key].push(item);

    return acc;
  }, {});
};
