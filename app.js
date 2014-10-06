(function() {
  var addClass, addPoint, bindEvents, canvas, color, colors, context, drawPoints, find, findAll, hasClass, img, init, makeCursor, offsetX, offsetY, points, removeClass, removeClassAll, size;

  hasClass = function(el, className) {
    return new RegExp(" " + className + " ").test(" " + el.className + " ");
  };

  addClass = function(el, className) {
    console.log(className);
    if (!hasClass(el, className)) {
      el.className += " " + className;
    }
    return el;
  };

  removeClass = function(el, className) {
    var newClass;
    if (!className) {
      el.className = "";
    } else {
      newClass = " " + el.className.replace(/[\t\r\n]/g, " ") + " ";
      if (hasClass(el, className)) {
        while (newClass.indexOf(" " + className + " ") >= 0) {
          newClass = newClass.replace(" " + className + " ", " ");
        }
        el.className = newClass.replace(/^\s+|\s+$/g, "");
      }
    }
    return el;
  };

  removeClassAll = function(arr, className) {
    var i;
    i = 0;
    while (i < arr.length) {
      removeClass(arr[i], className);
      i++;
    }
    return arr;
  };

  find = function(selector, scope) {
    var el;
    el = document.querySelector(selector);
    if (scope != null) {
      el = scope.querySelector(selector);
    }
    return el;
  };

  findAll = function(selector, scope) {
    var el;
    el = document.querySelectorAll(selector);
    if (scope != null) {
      el = scope.querySelectorAll(selector);
    }
    return el;
  };

  canvas = null;

  context = null;

  img = null;

  offsetX = 0;

  offsetY = 0;

  colors = ['#F07464', '#9BAAB9', '#99704B', '#495867', '#F2C66D', '#FBE6E1', '#BCBDC1', '#A0C2BB', '#F3A471', '#FFFFFF'];

  color = '';

  size = 0;

  points = [];

  bindEvents = function(colorFlags, sizeFlags, colorLinks, sizeLinks) {
    var isDrawing;
    isDrawing = false;
    colorFlags.addEventListener('mouseup', function(e) {
      var colorIndex, selected;
      selected = e.target;
      console.log(selected);
      colorIndex = /\d+/.exec(selected.className);
      color = colors[colorIndex - 1];
      makeCursor();
      removeClassAll(colorLinks, 'active');
      return addClass(selected, 'active');
    });
    sizeFlags.addEventListener('mouseup', function(e) {
      var selected, sizeIndex;
      selected = e.target;
      console.log(selected);
      sizeIndex = /\d+/.exec(selected.className);
      size = sizeIndex[0];
      makeCursor();
      removeClassAll(sizeLinks, 'active');
      return addClass(selected, 'active');
    });
    canvas.addEventListener('mousedown', function(e) {
      isDrawing = true;
      addPoint(e.pageX - offsetX + (size / 2), e.pageY - offsetY + (size / 2), false);
      return drawPoints();
    });
    canvas.addEventListener('mousemove', function(e) {
      if (isDrawing) {
        addPoint(e.pageX - offsetX + (size / 2), e.pageY - offsetY + (size / 2), true);
        return drawPoints();
      }
    });
    canvas.addEventListener('mouseup', function(e) {
      return isDrawing = false;
    });
    canvas.addEventListener('mouseleave', function(e) {
      return isDrawing = false;
    });
    return window.onresize = function(e) {
      offsetX = (document.documentElement.clientWidth - canvas.width) / 2;
      return offsetY = (document.documentElement.clientHeight - canvas.height) / 2;
    };
  };

  addPoint = function(x, y, dragging) {
    var point;
    point = {
      x: x,
      y: y,
      drag: dragging,
      color: color,
      size: size
    };
    return points.push(point);
  };

  drawPoints = function() {
    var i;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineJoin = "round";
    context.globalAlpha = 0.5;
    i = 0;
    while (i < points.length) {
      context.beginPath();
      if (points[i].drag && i) {
        context.moveTo(points[i - 1].x, points[i - 1].y);
      } else {
        context.moveTo(points[i].x - 1, points[i].y);
      }
      context.lineTo(points[i].x, points[i].y);
      context.closePath();
      context.lineWidth = points[i].size;
      context.strokeStyle = points[i].color;
      context.stroke();
      i++;
    }
    return context.drawImage(img, (canvas.width - img.width) / 2, (canvas.height - img.height) / 2, img.width, img.height);
  };

  makeCursor = function() {
    var cursor, cursorContext;
    cursor = document.createElement('canvas');
    cursorContext = cursor.getContext('2d');
    cursor.width = size;
    cursor.height = size;
    cursorContext.beginPath();
    cursorContext.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI, false);
    cursorContext.closePath();
    cursorContext.fillStyle = color;
    cursorContext.fill();
    return canvas.style.cursor = 'url(' + cursor.toDataURL() + '), auto';
  };

  init = function() {
    var colorFlags, colorLinks, sizeFlags, sizeLinks;
    canvas = find('canvas');
    context = canvas.getContext("2d");
    context.globalAlpha = 0.5;
    colorFlags = find('.colors');
    colorLinks = findAll('.colors__color');
    sizeFlags = find('.sizes');
    sizeLinks = findAll('.sizes__size');
    canvas.width = 1000;
    canvas.height = 1000;
    bindEvents(colorFlags, sizeFlags, colorLinks, sizeLinks);
    window.dispatchEvent(new Event('resize'));
    img = new Image();
    img.src = 'assets/InternetBad.png';
    addClass(sizeLinks[1], 'active');
    size = 16;
    addClass(colorLinks[0], 'active');
    color = colors[0];
    return makeCursor();
  };

  init();

}).call(this);
