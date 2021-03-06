hasClass = (el, className) ->
  new RegExp(" " + className + " ").test " " + el.className + " "

addClass = (el, className) ->
  el.className += " " + className  unless hasClass el, className
  el

removeClass = (el, className) ->
  if !className
    el.className = ""
  else
    newClass = " " + el.className.replace(/[\t\r\n]/g, " ") + " "
    if hasClass el, className
      while newClass.indexOf(" " + className + " ") >= 0
        newClass = newClass.replace(" " + className + " ", " ")
      el.className = newClass.replace(/^\s+|\s+$/g, "")
  el

removeClassAll = (arr, className) ->
  i = 0
  while i < arr.length
    removeClass arr[i], className
    i++
  arr

find = (selector, scope) ->
  el = document.querySelector selector
  if scope?
    el = scope.querySelector selector
  el

findAll = (selector, scope) ->
  el = document.querySelectorAll selector
  if scope?
    el = scope.querySelectorAll selector
  el

unique = (arr) ->
  comparer = compareObject = (a, b) ->
    if a.x is b.x
      if a.pitch < b.pitch
        -1
      else if a.x > b.x
        1
      else
        0
    else
      if a.pitch < b.pitch
        -1
      else
        1

  arr.sort comparer
  end = undefined
  i = 0

  while i < arr.length - 1
    if comparer(arr[i], arr[i + 1]) is 0
      arr.splice i, 1
    ++i
  arr

throttle = (func, wait, options) ->
  context = undefined
  args = undefined
  result = undefined
  timeout = null
  previous = 0
  options = {}  unless options
  later = ->
    previous = (if options.leading is false then 0 else new Date().getTime())
    timeout = null
    result = func.apply(context, args)
    context = args = null  unless timeout
    return

  ->
    now = new Date().getTime()
    previous = now  if not previous and options.leading is false
    remaining = wait - (now - previous)
    context = this
    args = arguments
    if remaining <= 0 or remaining > wait
      clearTimeout timeout
      timeout = null
      previous = now
      result = func.apply(context, args)
      context = args = null  unless timeout
    else timeout = setTimeout(later, remaining)  if not timeout and options.trailing isnt false
    result
