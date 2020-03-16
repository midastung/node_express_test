var
  _ = require('underscore'),
  sqlString = require('sqlstring')

var app = module.exports = {
  order: 'asc',
  query: function (d) {
    var r
    if (_.isString(d))
      return sqlString.escapeId(d)
    if (_.isArray(d))
      return d.map(app.query).join(', ')
    if (_.isObject(d))
      return _.map(d, function (value, key) {return sqlString.escapeId(key) + ' ' + value}).join(', ')
  },
  sort: function (d) {
    if (!_.isArray(d))
      d = [d]
    return function (a, b) {
      var r = 0
      _.find(d, function (rule) {
        var key
        var order = app.order
        if (_.isString(rule))
          key = rule
        else {
          key = _.keys(rule)[0]
          order = rule[key]
        }
        if (a[key] > b[key])
          r = (order == app.order)? 1: -1
        if (a[key] < b[key])
          r = (order == app.order)? -1: 1
        return !!r
      })
      return r
    }
  }
}
