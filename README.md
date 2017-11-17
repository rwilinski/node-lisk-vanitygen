Node LISK Vanitygen
===================

Fast Vanity LISK address generator.

Getting Started
---------------

Install `node-lisk-vanitygen` into your project:

```bash
$ npm install node-lisk-vanitygen --save
```

Create a `app.js` file and add the following:

```js
const LiskVanitygen = require('node-lisk-vanitygen');

let liskVanitygen = new LiskVanitygen({
    pattern: 123456
});

liskVanitygen.run((data) => {
    console.log('found: ', data);
}, (data) => {
    console.log('status: ', data);
});
```
Run your `app.js` file:

```bash
$ node app.js
```

API
---

```js
let liskVanitygen = new LiskVanitygen(config);
```

`config` properties:

Name            | Default | Type                       | Required | Description
----------------|---------|----------------------------|----------|------------
pattern         | -       | number or array of numbers | Yes      | Pattern(s) to find.
continue        | true    | boolean                    | No       | Should continue after first found?
messageInterval | 1000    | number                     | No       | Interval in ms between status callback.

```js
liskVanitygen.run(foundCallback, statusCallback);
```

Name           | Type     | Required | Description
---------------|----------|----------|------------
foundCallback  | function | Yes      | Callback when key was found.
statusCallback | function | No       | Callback with status information.

Example
-------

```js
const LiskVanitygen = require('node-lisk-vanitygen');
const fs = require('fs');

let liskVanitygen = new LiskVanitygen({
    pattern: [123456, 987654, 555555],
    continue: true,
    messageInterval: 5000
});

liskVanitygen.run((data) => {
    let txt = `
Pattern:    ${data.pattern}
Address:    ${data.address}
Passphrase: ${data.passphrase}
`;

    fs.appendFileSync('found.txt', txt, (error) => {});
}, (data) => {
    let txt = `\r\rCount: ${data.count} | Time: ${data.time} s. | Avg: ${data.avg} keys/s | Found: ${data.foundCount}`;
    process.stdout.write(txt); // to back cursor to the start of the line (in console.log doesn't work)
});
```

License
-------

MIT © [Radosław Wiliński](https://github.com/rwilinski)