const update = require('../src').default;

let input = null;

beforeEach(() => {
  input = {
    name: {
      first: 'John',
      last: 'Doe',
    },
    job: {
      since: {
        year: 2018,
        month: 2,
      },
      skills: [
        {
          name: 'css',
        },
        {
          name: 'html',
          level: 5,
        },
        'javascript',
      ],
    },
  };
});


test('creates a copy of the source object', () => {
  const output = update(input, '', null);

  expect(output).not.toBe(input);
});

test('deep value three-argument function call to update', () => {
  const name = 'JOHN';
  const output = update(input, 'name.first', name);

  expect(output.name.first).toEqual(name);
});

test('deep value three argument function call to insert', () => {
  const day = 5;
  const output = update(input, 'job.since.day', day);

  expect(output.job.since.day).toEqual(day);
});

test('3 levels deep value update', () => {
  const output = update(input, 'job.since.year', year => year - 1);

  expect(output.job.since.year).toEqual(input.job.since.year - 1);
});

describe('multiple paths support', () => {
  const firstName = 'JOHN';
  const lastName = 'DOE';

  const config = {
    'name.first': firstName,
    'name.last': lastName,
  };

  const output = update(input, config);

  test('updated the source accordingly to the first path', () => {
    expect(output.name.first).toBe(firstName);
  });

  test('updated the source accordingly to the second path', () => {
    expect(output.name.last).toBe(lastName);
  });
});

test('accepts a function as a value', () => {
  const output = update(input, 'name.first', name => name.toUpperCase());

  expect(output.name.first).toEqual(input.name.first.toUpperCase());
});

test('accepts a function as a value in config-like notation', () => {
  const output = update(input, { 'name.first': name => name.toUpperCase() });

  expect(output.name.first).toEqual(input.name.first.toUpperCase());
});

test('allows to override values', () => {
  const fullName = 'John Doe';
  const output = update(input, 'name', fullName);

  expect(output.name).toBe(fullName);
});

test('allows to search arrays by primitive values', () => {
  const output = update(input, 'job.skills[javascript]', v => v.toUpperCase());

  expect(output.job.skills).toContain('JAVASCRIPT');
});

test('allows to insert field of arrays elements found by primitive values', () => {
  const output = update(input, 'job.skills[javascript].name', 'javascript');

  expect(output.job.skills[2].name).toBe('javascript');
});

test('allows to search arrays by index', () => {
  const output = update(input, 'job.skills[1].level', level => level * 2);

  expect(output.job.skills[1].level).toEqual(input.job.skills[1].level * 2);
});

test('allows to search arrays by property value', () => {
  const output = update(input, 'job.skills[name=html].name', 'HTML');

  expect(output.job.skills[1].name).toEqual('HTML');
});

test('allows to add fields to array element found by property value', () => {
  const output = update(input, 'job.skills[name=html].newField', 'NEW_FIELD');

  expect(output.job.skills[1].newField).toEqual('NEW_FIELD');
});

test('allows to override array element found by property value', () => {
  let nextValue = { id: 1 };
  const output = update(input, 'job.skills[name=html]', nextValue);

  expect(output.job.skills[1]).toEqual(nextValue);
});

test('allows to override an array property', () => {
  const output = update(input, 'job.skills', null);

  expect(output.job.skills).toBe(null);
});

test('source remains intact if there was no matches by prop query', () => {
  const output = update(input, 'job.skills[name=4]', null);
  expect(output).toBe(output);
});

test('source remains intact if there was no matches by value query', () => {
  const output = update(input, 'job.skills[fake]', null);
  expect(output).toBe(output);
});

test('source remains intact if there was no matches by index', () => {
  const output = update(input, 'job.skills[11]', null);
  expect(output).toBe(output);
});

test('allows to override an array element found by index', () => {
  const output = update(input, 'job.skills[0]', () => 'Hello');
  expect(output.job.skills[0]).toBe('Hello');
});

test('allows to replace a non-object field', () => {
  const output = update(input, 'name.first', name => name.toUpperCase());
  expect(output.name.first).toBe(input.name.first.toUpperCase());
});
