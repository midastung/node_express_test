var
  expect = require('expect.js'),
  orderBy = require('./')

describe('orderBy', function () {
  describe('#query', function () {
    it('formats string', function () {
      expect(orderBy.query('id')).to.be('`id`')
    })
    it('formats object', function () {
      expect(orderBy.query({id: 'desc', name: 'asc'})).to.be('`id` desc, `name` asc')
    })
    it('formats array', function () {
      expect(orderBy.query(['id', {name: 'desc'}])).to.be('`id`, `name` desc')
    })
  })
  describe('#sort', function () {
    var fruit = [
      {id: 1, name: 'Banana'},
      {id: 2, name: 'Apple'},
      {id: 3, name: 'Apple'}
    ]
    it('sorts with string', function () {
      expect(fruit.sort(orderBy.sort('name'))[0].id).to.be(2)
    })
    it('sorts with object', function () {
      expect(fruit.sort(orderBy.sort({id: 'desc'}))[0].id).to.be(3)
    })
    it('sorts with array', function () {
      expect(fruit.sort(orderBy.sort(['name', {id: 'asc'}]))[0].id).to.be(2)
    })
  })
})
