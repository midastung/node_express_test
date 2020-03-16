var
  _ = require('underscore'),
  sqlString = require('sqlstring')

var app = module.exports = {
  query: function (d) {
    if (_.isNumber(d) || _.isString(d))
      d = {id: +d}
    return _.map(this.and(d), function (d) {
      if (_.isArray(d.value) && !d.value.length) {
        if (d.operator == '=')
          return 0
        if (d.operator == '!=')
          return 1
      }
      return sqlString.format('?? ', d.key) + app.queryOperator(d.operator, d.value) + ' ' + app.queryValue(d.value)
      sqlString.format(' ?', [d.value])
    }).join(' and ')
  },
  queryOperator: function (operator, value) {
    if (operator == '=') {
      if (_.isNull(value))
        return 'is'
      if (_.isArray(value))
        return 'in'
    }
    if (operator == '!=') {
      if (_.isNull(value))
        return 'is not'
      if (_.isArray(value))
        return 'not in'
    }
    return operator
  },
  queryValue: function (value) {
    if (_.isNaN(value) || _.isNull(value) || _.isUndefined(value))
      return 'null'
    if (_.isNumber(value))
      return value
    if (_.isBoolean(value))
      return +value
    if (_.isArray(value))
      return sqlString.format('(?)', [value])
    return sqlString.format('?', [value])
  },
  and: function (d) {
    var and = []
    _.each(d, function (value, key) {
      if (_.isNaN(value) || _.isNull(value) || _.isUndefined(value) || _.isNumber(value) || _.isBoolean(value) || _.isString(value) || _.isArray(value))
        return and.push({key: key, value: value, operator: '='})
      if (_.isObject(value)) {
        if (!_.isUndefined(value.from))
          and.push({key: key, value: value.from, operator: '>='})
        if (!_.isUndefined(value.to))
          and.push({key: key, value: value.to, operator: '<='})
        _.each(['=', '!=', '>', '<', '>=', '<='], function (operator) {
          if (!_.isUndefined(value[operator]))
            and.push({key: key, value: value[operator], operator: operator})
        })
      }
    })
    return and
  },
  filter: function (d) {
    return function (a) {
      return !_.find(app.and(d), function (d) {
        if (d.operator == '=') {
          if (!_.isArray(d.value))
            return a[d.key] !== d.value
          else
            return !_.contains(d.value, a[d.key])
        }
        if (d.operator == '!=') {
          if (!_.isArray(d.value))
            return a[d.key] === d.value
          else
            return _.contains(d.value, a[d.key])
        }
        if (d.operator == '>')
          return a[d.key] <= d.value
        if (d.operator == '<')
          return a[d.key] >= d.value
        if (d.operator == '>=')
          return a[d.key] < d.value
        if (d.operator == '<=')
          return a[d.key] > d.value
      })
    }
  }
}
