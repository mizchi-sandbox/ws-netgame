{random,sqrt,min,max} = Math

randint = (from,to)->
  if not to?
    to = from
    from = 0
  ~~(random()*(to-from+1))+from

Array::remove = (obj)-> @splice(@indexOf(obj),1)
Array::size = ()-> @length
Array::first = ()-> @[0]
Array::last = ()-> @[@length-1]
Array::each = Array::forEach

exports.randint = randint
