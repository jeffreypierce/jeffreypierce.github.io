# shared variables
canvas = null
context = null
window.AudioContext = window.AudioContext || window.webkitAudioContext
audioContext = new AudioContext()

img = null
offsetX = 0
offsetY = 0
colors = ['#F07464', '#9BAAB9', '#99704B',
          '#495867', '#F2C66D', '#FBE6E1',
          '#BCBDC1', '#A0C2BB', '#F3A471'
          '#FFFFFF']

color = ''
pitch = 110
size = 0
points = []
cursor = null
tempo = 100
plucks = []
interval = undefined
canvasRatio = 0


bindColoringEvents = (colorFlags, sizeFlags, colorLinks, sizeLinks) ->
  # dom elements, etc...
  isDrawing = false
  colorFlags = find '.colors'
  colorLinks = findAll '.colors__color'
  sizeFlags = find '.sizes'
  sizeLinks = findAll '.sizes__size'

  # set inital selections
  addClass sizeLinks[1], 'active'
  size = 16

  addClass colorLinks[0], 'active'
  color = colors[0]

  # mouse events
  colorFlags.addEventListener 'mouseup', (e) ->
    selected = e.target
    colorIndex = /\d+/.exec selected.className
    color = colors[colorIndex - 1]
    pitch = pitches[colorIndex - 1]
    makeCursor()
    removeClassAll colorLinks, 'active'
    addClass selected, 'active'
    pluck(2, size / 100, pitches[colorIndex - 1])

  sizeFlags.addEventListener 'mouseup', (e) ->
    selected = e.target
    sizeIndex = /\d+/.exec selected.className
    size = sizeIndex[0]
    makeCursor()
    removeClassAll sizeLinks, 'active'
    addClass selected, 'active'
    pluck(2, size / 100, pitch)

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

# canvas drawing functions
addPoint = (x, y, dragging) ->
  point = x: x, y: y, drag: dragging, color: color, size: size, pitch: pitch
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

makeCursor = ->
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
  cursor = document.createElement 'canvas'

  canvas.width = 700
  canvas.height = 2000

  bindColoringEvents()
  bindPlaybackEvents()

  window.dispatchEvent new Event 'resize'

  img = new Image()
  img.src = 'assets/InternetBad.png'

  makeCursor()

window.addEventListener 'load', (e) -> init()
