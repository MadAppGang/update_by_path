const update = require('../index').default;

const input = {
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

  console.log(JSON.stringify(output, null, 2));

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
