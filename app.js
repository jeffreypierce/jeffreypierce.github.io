(function() {
  var addClass, addPoint, audioContext, bindColoringEvents, bindPlaybackEvents, canvas, canvasRatio, color, colors, context, cursor, drawPoints, find, findAll, hasClass, img, init, interval, makeCursor, offsetX, offsetY, pitch, pitches, pluck, plucks, points, removeClass, removeClassAll, size, tempo, throttle, unique;

  hasClass = function(el, className) {
    return new RegExp(" " + className + " ").test(" " + el.className + " ");
  };

  addClass = function(el, className) {
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

  unique = function(arr) {
    var compareObject, comparer, end, i;
    comparer = compareObject = function(a, b) {
      if (a.x === b.x) {
        if (a.pitch < b.pitch) {
          return -1;
        } else if (a.x > b.x) {
          return 1;
        } else {
          return 0;
        }
      } else {
        if (a.pitch < b.pitch) {
          return -1;
        } else {
          return 1;
        }
      }
    };
    arr.sort(comparer);
    end = void 0;
    i = 0;
    while (i < arr.length - 1) {
      if (comparer(arr[i], arr[i + 1]) === 0) {
        arr.splice(i, 1);
      }
      ++i;
    }
    return arr;
  };

  throttle = function(func, wait, options) {
    var args, context, later, previous, result, timeout;
    context = void 0;
    args = void 0;
    result = void 0;
    timeout = null;
    previous = 0;
    if (!options) {
      options = {};
    }
    later = function() {
      previous = (options.leading === false ? 0 : new Date().getTime());
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) {
        context = args = null;
      }
    };
    return function() {
      var now, remaining;
      now = new Date().getTime();
      if (!previous && options.leading === false) {
        previous = now;
      }
      remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        if (!timeout) {
          context = args = null;
        }
      } else {
        if (!timeout && options.trailing !== false) {
          timeout = setTimeout(later, remaining);
        }
      }
      return result;
    };
  };

  canvas = null;

  context = null;

  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  audioContext = new AudioContext();

  img = null;

  offsetX = 0;

  offsetY = 0;

  colors = ['#F07464', '#9BAAB9', '#99704B', '#495867', '#F2C66D', '#FBE6E1', '#BCBDC1', '#A0C2BB', '#F3A471', '#FFFFFF'];

  color = '';

  pitch = 110;

  size = 0;

  points = [];

  cursor = null;

  tempo = 100;

  plucks = [];

  interval = void 0;

  canvasRatio = 0;

  bindColoringEvents = function(colorFlags, sizeFlags, colorLinks, sizeLinks) {
    var isDrawing;
    isDrawing = false;
    colorFlags = find('.colors');
    colorLinks = findAll('.colors__color');
    sizeFlags = find('.sizes');
    sizeLinks = findAll('.sizes__size');
    addClass(sizeLinks[1], 'active');
    size = 16;
    addClass(colorLinks[0], 'active');
    color = colors[0];
    colorFlags.addEventListener('mouseup', function(e) {
      var colorIndex, selected;
      selected = e.target;
      colorIndex = /\d+/.exec(selected.className);
      color = colors[colorIndex - 1];
      pitch = pitches[colorIndex - 1];
      makeCursor();
      removeClassAll(colorLinks, 'active');
      addClass(selected, 'active');
      return pluck(2, size / 100, pitches[colorIndex - 1]);
    });
    sizeFlags.addEventListener('mouseup', function(e) {
      var selected, sizeIndex;
      selected = e.target;
      sizeIndex = /\d+/.exec(selected.className);
      size = sizeIndex[0];
      makeCursor();
      removeClassAll(sizeLinks, 'active');
      addClass(selected, 'active');
      return pluck(2, size / 100, pitch);
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
      size: size,
      pitch: pitch
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
    return context.drawImage(img, (canvas.width - img.width) / 2, (canvas.height - img.height) / 2);
  };

  makeCursor = function() {
    var cursorContext;
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
    canvas = find('canvas');
    context = canvas.getContext("2d");
    context.globalAlpha = 0.5;
    cursor = document.createElement('canvas');
    canvas.width = 700;
    canvas.height = 2000;
    bindColoringEvents();
    bindPlaybackEvents();
    window.dispatchEvent(new Event('resize'));
    img = new Image();
    img.src = 'assets/InternetBad.png';
    return makeCursor();
  };

  window.addEventListener('load', function(e) {
    return init();
  });

  pitches = [110, 146.832, 164.814, 174.614, 195.998, 220, 246.942, 261.626, 293.665, 329.628];

  bindPlaybackEvents = function() {
    var clearButton, i, isPlaying, playback, tempoSlider, _playback, _stopPlaying;
    isPlaying = false;
    playback = find('.play__button');
    tempoSlider = find('.tempo__slider');
    clearButton = find('.clear__button');
    _stopPlaying = function() {
      drawPoints();
      clearInterval(interval);
      removeClass(playback, 'playing');
      return isPlaying = false;
    };
    i = 0;
    _playback = function() {
      var j, playbackPoints;
      playbackPoints = unique(JSON.parse(JSON.stringify(points)));
      if (i < canvas.width) {
        j = 0;
        drawPoints();
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, canvas.height);
        context.closePath();
        context.lineWidth = 1;
        context.strokeStyle = colors[0];
        context.stroke();
        while (j < playbackPoints.length) {
          if (i === Math.floor(playbackPoints[j].x)) {
            pluck((playbackPoints[j].y / 250) - 1, playbackPoints[j].size / 100, playbackPoints[j].pitch);
          }
          j = j + 4;
        }
        return i++;
      } else {
        return _stopPlaying();
      }
    };
    clearButton.addEventListener('mouseup', function(e) {
      points = [];
      return _stopPlaying();
    });
    tempoSlider.addEventListener('change', function(e) {
      tempo = 165 - this.value;
      if (isPlaying) {
        clearInterval(interval);
        return interval = setInterval(_playback, tempo);
      }
    });
    return playback.addEventListener('mouseup', function(e) {
      if (isPlaying) {
        return _stopPlaying();
      } else {
        addClass(this, 'playing');
        i = 0;
        interval = setInterval(_playback, tempo);
        return isPlaying = true;
      }
    });
  };

  pluck = function(length, volume, frequency) {
    var audioBuffer, begin, dry, end, masterVol, pluckSound, reverb, sampleRate, samples, wet, _generateImpulse, _karplusStrong, _noise;
    if (length == null) {
      length = 2;
    }
    if (volume == null) {
      volume = 0.6;
    }
    if (frequency == null) {
      frequency = 440;
    }
    begin = audioContext.currentTime;
    end = begin + length;
    sampleRate = audioContext.sampleRate;
    _noise = function() {
      return 2 * Math.random() - 1;
    };
    _karplusStrong = function(freq) {
      var amp, decay, i, j, noise, period, prevIndex, samples, _generateSample;
      noise = [];
      samples = new Float32Array(sampleRate);
      period = Math.floor(sampleRate / freq);
      i = 0;
      while (i < period) {
        noise[i] = _noise();
        i++;
      }
      prevIndex = 0;
      _generateSample = function() {
        var index, sample;
        index = noise.shift();
        sample = (index + prevIndex) / 2;
        prevIndex = sample;
        noise.push(sample);
        return sample;
      };
      amp = (Math.random() * 0.5) + 0.4;
      j = 0;
      while (j < sampleRate) {
        samples[j] = _generateSample();
        decay = amp - (j / sampleRate) * amp;
        samples[j] = samples[j] * decay;
        j++;
      }
      return samples;
    };
    _generateImpulse = function(length, decay) {
      var i, impulse, impulseChannel, rate;
      if (length == null) {
        length = 3;
      }
      if (decay == null) {
        decay = 20;
      }
      rate = sampleRate;
      length = rate * length;
      impulse = audioContext.createBuffer(1, length, rate);
      impulseChannel = impulse.getChannelData(0);
      i = 0;
      while (i < length) {
        impulseChannel[i] = _noise() * Math.pow(1 - i / length, decay);
        i++;
      }
      return impulse;
    };
    masterVol = audioContext.createGain();
    wet = audioContext.createGain();
    dry = audioContext.createGain();
    pluckSound = audioContext.createBufferSource();
    reverb = audioContext.createConvolver();
    samples = _karplusStrong(frequency);
    audioBuffer = audioContext.createBuffer(1, samples.length, sampleRate);
    audioBuffer.getChannelData(0).set(samples);
    pluckSound.buffer = audioBuffer;
    reverb.buffer = _generateImpulse();
    wet.gain.value = 0.8;
    dry.gain.value = 0.6;
    masterVol.gain.value = volume;
    pluckSound.connect(reverb);
    pluckSound.connect(dry);
    reverb.connect(wet);
    wet.connect(masterVol);
    dry.connect(masterVol);
    masterVol.connect(audioContext.destination);
    pluckSound.start(begin);
    return pluckSound.stop(end);
  };

}).call(this);
