Update by path
===
[![Build Status](https://travis-ci.org/MadAppGang/update_by_path.svg?branch=master)](https://travis-ci.org/MadAppGang/update_by_path)
[![Coverage Status](https://coveralls.io/repos/github/MadAppGang/update_by_path/badge.svg?branch=master)](https://coveralls.io/github/MadAppGang/update_by_path?branch=master)

This function allows you to update fields of your object any level deep without mutating the original object. The reason this is awesome is because of simple string-based query language, that allowes you to reach deep values, even inside arrays.

### Features
- update a field of an object any level deep by using a simple path string;
- reach to deep values of array elements using a string query;
- insert new values any level deep (not existing path nodes will be created automatically);
- override fields, if they already exist;

### Installation
`npm install --save update-by-path`

Then using es6 import the function:
```javascript
import update from 'update-by-path';
```

### Usage
Lets say we have an object like down below:
```javascript
const person = {
  name: 'John Doe',
  job: {
    company: 'MadAppGang',
    position: 'Software engineer',
    since: {
      year: 2018,
      month: 8,
      day: 14,
    },
    skills: [
      {
	    proficiency: 5,
		name: "JavaScript",
	  },
	  {
	    proficiency: 4,
		name: "html",
	  },
	  {
	    proficiency: 2,
		name: "css",
	  }
	],
  },
};
```
If I wanted to update, for example, the month John started the position at MadAppGang, I would have to write something like this:

```javascript
const updatedPerson = {
  ...person,
  job: {
    ...person.job,
    since: {
      ...person.job.since,
      month: 7,
    },
  },
};
```
This does not look compact at all, so there is a way to get rid of that massive piece of code.

Using the shorthand function the code will look like the following:
```javascript
const updatedPerson = update(person, 'job.since.month', 7);
```

#### Path, or why it is extremely useful.

What we used up there is called path. Path is a string query that specifies a list of nested properties. Here's an example of a simple path:

`path.to.a.property.any.level.deep`

Sometimes objects contain arrays as properties, so the path notation allows to reach elements inside arrays by index:

`path.to.an.array[0]`

There are situations when you don't know the index, so you might want to find an element by a property value:

`path.to.an.array[name="html"]`

You can also continue the path chain getting into deep fields of an array element:

`path.to.an.array[name="html"].path.goes.deeper`

These are query types that you can use to alter deep array elements.


#### Examples

I can also update multiple fields at once using a slightly different notation:
```javascript
const updatedPerson = update(person, {
  'job.since.month': 7,
  'job.position': 'Software architect',
});
```

If you I need to apply more complex logic i can pass a function as a value. The function accepts the current value and should return a new one.

```javascript
const updatedPerson = update(person, {
  'job.since.month': month => month + 2,
  'job.position': 'Software architect',
});
```

There are a lot of situations when you have to update an element of array, that is a field of an object. There is an example of reaching one of John's skills using a path query:

```javascript
const updatedPerson = update(person, 'job.skills[0]', v => v.toUpperCase());
```

Not always you have a specific index to reach the element by, so you might want to find it by property value. You can then update any field of the array element any level deep, as you would with a plain property:

```javascript
const updatedPerson = update(person, {
  'job.skills[name=html].proficiency': value => value + 1,
});
```

##### Note: the function does not mutate the original object

If the original object does not contain properties, specified in the path string - they will be created for you automatically.

So the call
```javascript
update({}, 'any.level.deep', 'insertion');

```
will produce the next result: `{ any: { level: { deep: 'insertion' } } }`

### Why should I use this?
It really helps to reduce a huge amount of code, especially when you have to make a lot of updates to deep immutable objects. It can be very useful in Redux with its reducers.

### Parameters
- `original object` [String](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/String "String") The object to update;
- `path string`  [String](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/String "String") | [Object](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Object "Object") Path string, that consists of a list of properties joined by dot; Or it can be an object where keys are paths and values are values for the paths.
- `value` Any? The value to insert; You won't need to specify this if you use an object as a second argument.

Value can be a function that accepts current value (if present) and returns a new one.

Returns updated object;

### Contribute
First off, thanks for taking the time to contribute! Now, take a moment to be sure your contributions make sense to everyone else.

This is written with plain javascript so you will not need any additional environment to run this.