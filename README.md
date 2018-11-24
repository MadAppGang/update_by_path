Update by path
===
[![Build Status](https://travis-ci.org/MadAppGang/update_by_path.svg?branch=master)](https://travis-ci.org/MadAppGang/update_by_path)
[![Coverage Status](https://coveralls.io/repos/github/MadAppGang/update_by_path/badge.svg?branch=master)](https://coveralls.io/github/MadAppGang/update_by_path?branch=master)

## Intent

It is a function that allows to make immutable alterations to objects. It's meant to reduce the code needed to update a deep value without any mutations. It brings readability by reducing the verbosity.


## Installation
As simple as that

`npm i --save update-by-path`

```javascript
import update from 'update-by-path';
```

## Real-world example
I find this package extremely useful with redux reducers, so I'm going to use one of those as an example.

First off, let's take a look at what a simple reducer would look like without this package.

```javascript
  const INITIAL_STATE = {
    isFetching: false,
    list: [],
    error: null,
  };

  export default (state = INITIAL_STATE, action) => {
    const { type, payload } = action;

    switch (type) {
      case types.FETCH_ATTEMPT:
        return {
          ...state,
          isFetching: true,
        };
      case types.FETCH_SUCCESS:
        return {
          ...state,
          isFetching: false,
          list: payload,
        };
      default:
        return state;
    }
  };
```

It can be a lot shorter if we used **update** from the package

```javascript
...

case types.FETCH_ATTEMPT:
  return update(state, { isFetching: true });
case types.FETCH_SUCCESS:
  return update(state, { isFetching: false, list: payload });
default:
  return state;

...
};
```

Same result. What about a bit more complex alterations?

Here we got to replace a list element by id:
```javascript
...

case types.REPLACE_BY_ID
  return {
    ...state,
    list: state.list.map((element) => {
      if (element.id === payload.id) {
        return payload;
      }
      return element;
    });
  };

...
```

Let's apply the **update** function:

```javascript
...

case types.REPLACE_BY_ID:
  return update(state, `list[id=${payload.id}]`, payload);

...
```

Still a single line, and still completely immutable.

## API

It accepts eihter 2, or 3 arguments.
```javascript
update(object, 'deep.path.to.prop', valueToInsert);

update(object, {
  'deep.path.to.props': valueToInsert,
  'another.path': valueToInsert',
});
```
They are completely identical, though the second option allows to make multiple insertions at a time.

### Create new nodes
If the path contains nodes that do not exist in the source object, they are going to be created
```javascript
update({}, 'deep.path', 'value');
// { deep: { path: 'value' } }
```

### Use function as a value
If you need to generate next value based on the previous one, use a function
```javascript
const user = {
  name: 'John',
};

update(user, {
  name: name => name.toUpperCase(),
});
// { name: 'JOHN' }
```

### Go deep inside arrays
By value
```javascript
const user = {
  skills: ['html', 'javascript'],
};

update(user, `skills[javascript]`, 'JavaScript');
// { skills: ['html', 'JavaScript' ] }
```

By index
```javascript
const user = {
  skills: ['html', 'javascript'],
};

update(user, `skills[0]`, skill => skill.toUpperCase());
// { skills: ['HTML', 'javascript' ] }
```

By property value
```javascript
const user = {
  skills: [{ name: 'html'}, { name: 'javascript' }],
};

update(user, `skills[name=javascript]`, { name: 'JavaScript' });
// { skills: [{ name: 'html'}, { name: 'JavaScript' }] },
```

If there were no matches for your query the source object remains intact.

### Go even deeper inside array elements.
Alter a property of the matching array element. It doesn't metter which kind of query to use to match the element.
```javascript
const user = {
  skills: [{ name: 'html'}, { name: 'javascript' }],
};

update(user, `skills[name=html].name`, name => name.toUpperCase());
// { skills: [{ name: 'HTML'}, { name: 'javascript' }] },
```

## Contribute
First off, thanks for taking the time to contribute! Now, take a moment to be sure your contributions make sense to everyone else.

## LICENSE
This project is licensed under the MIT License - see the LICENSE file for details.