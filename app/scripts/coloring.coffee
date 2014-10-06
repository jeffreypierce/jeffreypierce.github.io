# shared variables
canvas = null
context = null
img = null
offsetX = 0
offsetY = 0
colors = ['#F07464', '#9BAAB9', '#99704B',
          '#495867', '#F2C66D', '#FBE6E1',
          '#BCBDC1', '#A0C2BB', '#F3A471'
          '#FFFFFF']

color = ''
size = 0
points = []

# bind events
bindEvents = (colorFlags, sizeFlags, colorLinks, sizeLinks) ->
  isDrawing = false

  colorFlags.addEventListener 'mouseup', (e) ->

    selected = e.target
    console.log selected
    colorIndex = /\d+/.exec selected.className
    color = colors[colorIndex - 1]
    makeCursor()
    removeClassAll colorLinks, 'active'
    addClass selected, 'active'

  sizeFlags.addEventListener 'mouseup', (e) ->
    selected = e.target
    console.log selected
    sizeIndex = /\d+/.exec selected.className
    size = sizeIndex[0]
    makeCursor()
    removeClassAll sizeLinks, 'active'
    addClass selected, 'active'

  canvas.addEventListener 'mousedown', (e) ->
    isDrawing = true
    addPoint e.pageX - offsetX + (size / 2),
      e.pageY - offsetY + (size / 2),
      false

    drawPoints()

  canvas.addEventListener 'mousemove', (e) ->
    if isDrawing
      addPoint e.pageX - offsetX + (size / 2),
        e.pageY - offsetY + (size / 2),
        true

      drawPoints()

  canvas.addEventListener 'mouseup', (e) ->
    isDrawing = false

  canvas.addEventListener 'mouseleave', (e) ->
    isDrawing = false

  window.onresize = (e) ->
    offsetX = (document.documentElement.clientWidth - canvas.width) / 2
    offsetY = (document.documentElement.clientHeight - canvas.height) / 2

# canvas functions
addPoint = (x, y, dragging) ->
  point = x: x, y: y, drag: dragging, color: color, size: size
  points.push point

drawPoints = ->
  context.clearRect 0, 0, canvas.width, canvas.height

  context.lineJoin = "round"
  context.globalAlpha = 0.5

  i = 0
  while i < points.length
    context.beginPath()
    if points[i].drag and i
      context.moveTo points[i - 1].x, points[i - 1].y
    else
      context.moveTo points[i].x- 1, points[i].y
    context.lineTo points[i].x, points[i].y
    context.closePath()
    context.lineWidth = points[i].size
    context.strokeStyle = points[i].color
    context.stroke()
    i++

  context.drawImage img,
    (canvas.width - img.width) / 2,
    (canvas.height - img.height) / 2,
    img.width,
    img.height

makeCursor = ->
  cursor = document.createElement 'canvas'
  cursorContext = cursor.getContext '2d'

  cursor.width = size
  cursor.height = size

  cursorContext.beginPath()
  cursorContext.arc size / 2, size / 2, size / 2, 0, 2 * Math.PI, false
  cursorContext.closePath()
  cursorContext.fillStyle = color
  cursorContext.fill()

  canvas.style.cursor = 'url(' + cursor.toDataURL() + '), auto'

init = ->
  canvas = find 'canvas'
  context = canvas.getContext "2d"
  context.globalAlpha = 0.5
  colorFlags = find '.colors'
  colorLinks = findAll '.colors__color'
  sizeFlags = find '.sizes'
  sizeLinks = findAll '.sizes__size'

  canvas.width = 1000
  canvas.height = 1000

  bindEvents colorFlags, sizeFlags, colorLinks, sizeLinks

  window.dispatchEvent new Event('resize')

  img = new Image()
  img.src = 'assets/InternetBad.png'

# set inital selections
  addClass sizeLinks[1], 'active'
  size = 16

  addClass colorLinks[0], 'active'
  color = colors[0]

  makeCursor()

init()