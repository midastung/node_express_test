[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Linux Build][travis-image]][travis-url]

### Usage
```js
var orderBy = require('db3-order-by')
orderBy.query(sortingRule)
//returns corresponding sql `order by` clause
orderBy.sort(sortingRule)
//returns compare function, usable for Array.sort
```
#### SQL order by
```js
orderBy.query('id')
// returns `id`
orderBy.query({id: 'desc'})
// returns `id` desc
orderBy.query({id: 'desc', name: 'asc'})
// returns `id` desc, `name` asc
orderBy.query(['id', {name: 'desc'}])
// returns `id`, `name` desc
```
#### Array.sort
```js
var fruit = [
  {id: 1, name: 'Banana'},
  {id: 2, name: 'Apple'},
  {id: 3, name: 'Apple'}
]
fruit.sort(orderBy.sort('name'))
// fruit will be
// [{id: 2, name: 'Apple'}, {id: 3, name: 'Apple'}, {id: 1, name: 'Banana'}]
fruit.sort(orderBy.sort({id: 'desc'}))
// fruit will be
// [{id: 3, name: 'Apple'}, {id: 2, name: 'Apple'}, {id: 1, name: 'Banana'}]
fruit.sort(orderBy.sort(['name', {id: 'asc'}]))
// fruit will be
// [{id: 2, name: 'Apple'}, {id: 3, name: 'Apple'}, {id: 1, name: 'Banana'}]
```

### When is this useful?
If you want to use the same sorting rules for js `Array.sort` and SQL `order by`.

[downloads-image]: https://img.shields.io/npm/dm/db3-order-by.svg
[downloads-url]: https://npmjs.org/package/db3-order-by
[node-version-image]: http://img.shields.io/node/v/db3-order-by.svg
[node-version-url]: http://nodejs.org/download/
[travis-image]: https://img.shields.io/travis/afanasy/db3-order-by/master.svg
[travis-url]: https://travis-ci.org/afanasy/db3-order-by
