class GradientRamp {
  constructor(stops) {
    this.stops = stops;

    this.validateGradient();
  }

  validateGradient() {
    // Validate that the gradient has at least 2 stops
    if (this.stops.length < 2) {
      if (this.stops.length == 0) {
        // This gradient has no stops, add two default stops
        this.stops = [
          new GradientStop(0, color("black")),
          new GradientStop(1, color("white")),
        ];
      } else {
        // This gradient has only 1 stop, duplicate the current stop and move it to the end or beginning
        let newStop;
        if (this.stops[0].position == 0) {
          newStop = new GradientStop(1, this.stops[0].stopColor);
        } else {
          newStop = new GradientStop(0, this.stops[0].stopColor);
        }

        this.stops.push(newStop);
      }
    }

    // Sort the stops by their positions
    this.stops.sort((a, b) => (a.position < b.position ? -1 : 1));
  }

  sampleColor(samplePosition, withNoise, noiseAmount, noiseArea, withOffsets) {
    if (withNoise === undefined || withNoise == false) {
      noiseAmount = 0;
      noiseArea = 0;
    }
    if (noiseAmount === undefined) {
      noiseAmount = 0.25;
    }
    if (noiseArea === undefined) {
      noiseArea = 0.25;
    }
    noiseAmount = Clamp(noiseAmount, 0, 1);

    let previousStop;
    let nextStop;

    // Iterate over the stops and find the closest stops to the position
    for (let s = 0; s < this.stops.length; s++) {
      if (this.stops[s].position <= samplePosition) {
        previousStop = this.stops[s];
      }

      if (this.stops[s].position >= samplePosition) {
        nextStop = this.stops[s];
        break;
      }
    }

    // Test for undefined stops and fill in the gaps
    if (previousStop === undefined) {
      previousStop = this.stops[0];
    }
    if (nextStop === undefined) {
      nextStop = this.stops[this.stops.length - 1];
    }

    // Interpolate the two stops
    let interpolationValue =
      (nextStop.position - samplePosition) /
      (nextStop.position - previousStop.position);
    if (nextStop.position - previousStop.position == 0) {
      interpolationValue = 0;
    }

    // Add noise to the sampled color
    if (withNoise) {
      // Roll a dice for a random chance of having noise
      if (random(0, 1) <= noiseAmount) {
        // The sample will be choosen from a noisy(offset) position
        let randomSample = randomGaussian(0, 0.5) - noiseArea;
        let noisyOffset = interpolationValue + randomSample;
        interpolationValue += noisyOffset;
        interpolationValue = Clamp(interpolationValue, 0, 1);
      }
    }

    // Add Sine Wave Offsets
    if (withOffsets) {
      interpolationValue += this.sineWave(0.5, 1, 0, 0, 0.5);
      interpolationValue = this.clamp(interpolationValue, 0, 1);
    }

    let sampledColor = lerpColor(
      nextStop.stopColor,
      previousStop.stopColor,
      interpolationValue
    );

    return sampledColor;
  }

  getColorSamples(count, withNoise, noiseAmount, noiseArea, withOffsets) {
    // Returns an array of color samples from the gradient
    let colors = [];
    for (let c = 0; c < count; c++) {
      let gradientColor = this.sampleColor(
        c / count,
        withNoise,
        noiseAmount,
        noiseArea,
        withOffsets
      );
      colors.push(gradientColor);
    }

    return colors;
  }

  sineWave(amplitude, frequency, phase, verticalOffset, speed) {
    let waveTime = time * speed;
    return (
      amplitude * Math.sin((waveTime + phase) * frequency) + verticalOffset
    );
  }
}

class GradientStop {
  constructor(position, stopColor) {
    this.position = Clamp(position, 0, 1);
    this.stopColor = stopColor;
  }
}

function SineWave(amplitude, frequency, phase, verticalOffset, speed, time) {
  let waveTime = time * speed;
  return amplitude * Math.sin((waveTime + phase) * frequency) + verticalOffset;
}

function Clamp(value, min, max) {
  if (value > max) {
    return max;
  } else if (value < min) {
    return min;
  }
  return value;
}

class SineWaveProperties {
  constructor(amplitude, frequency, phase, verticalOffset, speed) {
    this.amplitude = amplitude;
    this.frequency = frequency;
    this.phase = phase;
    this.verticalOffset = verticalOffset;
    this.speed = speed;
  }
}

function TriangleWave(amplitude, speed, time)
{
  let waveTime = time * speed;
  return abs((waveTime % (amplitude * 2)) - amplitude) - (amplitude / 2);
}

// =============================================================
// =                            EASING                         =
// =============================================================

// Ease In + Out
function easeInOutSine(t) {
  return -(cos(PI * t) - 1) / 2;
}

function easeOutCubic(t) {
  return 1 - pow(1 - t, 3);
}

function easeInCubic(t) {
  return t * t * t;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2;
}

function easeInOutQuint(t) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 - pow(-2 * t + 2, 5) / 2;
}

function easeOutQuart(t) {
  return 1 - pow(1 - t, 4);
}

function easeOutBounce(t) {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}

function easeOutSine(t) {
  return Math.sin((t * PI) / 2);
}

// =============================================================
// =                            QUEUE                          =
// =============================================================

function Queue() {
  this.qList = [];
  this.head = -1;
  this.tail = -1;
  
  this.enqueue = function(item) {
    if (this.head == -1) {
      this.head++;
    }
    this.tail++;
    this.qList.push(item);
  };
  
  this.dequeue = function() {
    if (this.head == -1) {
      console.log("Queue underflow!");
    } else if (this.head == this.tail) {
      const p = this.qList.splice(0, 1);
      this.head--;
      this.tail--;
      return p;
    } else {
      this.tail--;
      return this.qList.splice(0, 1);
    }
  };
  
  this.size = function() {
    return this.qList.length;
  };
  
  this.peek = function() {
    if (this.head == -1) {
      console.log("Queue is empty!");
    } else {
      return this.qList[this.head];
    }
  };
  
  this.list = function() {
    return this.qList;
  };
}
