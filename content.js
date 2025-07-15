let speedControllerAdded = false;
let currentVideoUrl = '';

const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
let currentSpeedIndex = 3;

function checkForVideoChange() {
  const currentUrl = window.location.href;
  if (currentUrl !== currentVideoUrl && currentUrl.includes('watch')) {
    currentVideoUrl = currentUrl;
    speedControllerAdded = false;
    setTimeout(() => {
      waitForPlayer();
    }, 1000);
  }
}

function waitForPlayer() {
  let attempts = 0;
  const maxAttempts = 20;
  
  const checkInterval = setInterval(() => {
    attempts++;
    const player = document.querySelector('.ytp-right-controls');
    
    if (player && !speedControllerAdded) {
      addSpeedController();
      speedControllerAdded = true;
      clearInterval(checkInterval);
    } else if (attempts >= maxAttempts) {
      clearInterval(checkInterval);
    }
  }, 500);
}

function addSpeedController() {
  const rightControls = document.querySelector('.ytp-right-controls');
  if (!rightControls) return;
  
  if (document.querySelector('.ytp-speed-controller')) {
    return;
  }

  const speedContainer = document.createElement('div');
  speedContainer.className = 'ytp-speed-controller';
  
  const speedDisplay = document.createElement('button');
  speedDisplay.className = 'ytp-button ytp-speed-display';
  speedDisplay.setAttribute('aria-label', '再生速度');
  speedDisplay.setAttribute('title', '再生速度');
  speedDisplay.innerHTML = '<span class="ytp-speed-value-text">1</span><span class="ytp-speed-x">×</span>';
  
  const speedSlider = document.createElement('div');
  speedSlider.className = 'ytp-speed-slider';
  speedSlider.style.display = 'none';
  
  // スライダーコンテナ
  const sliderContainer = document.createElement('div');
  sliderContainer.className = 'ytp-speed-slider-container';
  
  // 実際のスライダー
  const sliderWrapper = document.createElement('div');
  sliderWrapper.className = 'ytp-speed-slider-wrapper';
  
  const sliderInput = document.createElement('input');
  sliderInput.type = 'range';
  sliderInput.className = 'ytp-speed-range';
  sliderInput.min = '0.25';
  sliderInput.max = '3';
  sliderInput.step = '0.05';
  sliderInput.value = '1';
  
  const sliderValue = document.createElement('div');
  sliderValue.className = 'ytp-speed-value';
  sliderValue.textContent = '1.00x';
  
  sliderInput.addEventListener('input', (e) => {
    const speed = parseFloat(e.target.value);
    setPlaybackSpeed(speed, -1);
    sliderValue.textContent = speed.toFixed(2) + 'x';
  });
  
  sliderWrapper.appendChild(sliderInput);
  sliderWrapper.appendChild(sliderValue);
  sliderContainer.appendChild(sliderWrapper);
  
  // プリセットボタン
  const presetContainer = document.createElement('div');
  presetContainer.className = 'ytp-speed-preset-container';
  
  const sliderTrack = document.createElement('div');
  sliderTrack.className = 'ytp-speed-slider-track';
  
  speeds.forEach((speed, index) => {
    const speedOption = document.createElement('div');
    speedOption.className = 'ytp-speed-option';
    speedOption.textContent = speed + 'x';
    speedOption.dataset.speed = speed;
    speedOption.dataset.index = index;
    
    if (index === currentSpeedIndex) {
      speedOption.classList.add('active');
    }
    
    speedOption.addEventListener('click', (e) => {
      e.stopPropagation();
      setPlaybackSpeed(speed, index);
      document.querySelectorAll('.ytp-speed-option').forEach(opt => opt.classList.remove('active'));
      speedOption.classList.add('active');
      sliderInput.value = speed;
      sliderValue.textContent = speed.toFixed(2) + 'x';
    });
    
    sliderTrack.appendChild(speedOption);
  });
  
  presetContainer.appendChild(sliderTrack);
  
  speedSlider.appendChild(sliderContainer);
  speedSlider.appendChild(presetContainer);
  speedContainer.appendChild(speedDisplay);
  speedContainer.appendChild(speedSlider);
  
  const toggleSpeed = (e) => {
    e.stopPropagation();
    const isVisible = speedSlider.style.display === 'block';
    speedSlider.style.display = isVisible ? 'none' : 'block';
  };
  
  speedDisplay.addEventListener('click', toggleSpeed);
  
  const closeHandler = (e) => {
    if (!speedContainer.contains(e.target)) {
      speedSlider.style.display = 'none';
    }
  };
  
  document.addEventListener('click', closeHandler);
  
  rightControls.insertBefore(speedContainer, rightControls.firstChild);
  
  const video = document.querySelector('video');
  if (video) {
    const savedSpeed = parseFloat(localStorage.getItem('youtube-speed') || '1');
    const savedIndex = speeds.indexOf(savedSpeed);
    if (savedIndex !== -1) {
      currentSpeedIndex = savedIndex;
      setPlaybackSpeed(savedSpeed, savedIndex);
      document.querySelectorAll('.ytp-speed-option').forEach((opt, idx) => {
        opt.classList.toggle('active', idx === savedIndex);
      });
    } else if (savedSpeed) {
      // カスタム速度の場合
      setPlaybackSpeed(savedSpeed, -1);
    }
    sliderInput.value = savedSpeed;
    sliderValue.textContent = savedSpeed.toFixed(2) + 'x';
  }
}

function setPlaybackSpeed(speed, index) {
  const video = document.querySelector('video');
  if (video) {
    video.playbackRate = speed;
    currentSpeedIndex = index;
    localStorage.setItem('youtube-speed', speed.toString());
    
    const display = document.querySelector('.ytp-speed-display');
    if (display) {
      display.innerHTML = `<span class="ytp-speed-value-text">${speed}</span><span class="ytp-speed-x">×</span>`;
    }
  }
}

function handleKeyPress(e) {
  const video = document.querySelector('video');
  if (!video) return;
  
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  
  if (e.key === '-' || e.key === '_') {
    e.preventDefault();
    if (currentSpeedIndex > 0) {
      currentSpeedIndex--;
      setPlaybackSpeed(speeds[currentSpeedIndex], currentSpeedIndex);
      updateActiveOption();
    }
  } else if (e.key === '+' || e.key === '=') {
    e.preventDefault();
    if (currentSpeedIndex < speeds.length - 1) {
      currentSpeedIndex++;
      setPlaybackSpeed(speeds[currentSpeedIndex], currentSpeedIndex);
      updateActiveOption();
    }
  }
}

function updateActiveOption() {
  document.querySelectorAll('.ytp-speed-option').forEach((opt, idx) => {
    opt.classList.toggle('active', idx === currentSpeedIndex);
  });
}

document.addEventListener('keydown', handleKeyPress);

if (window.location.href.includes('youtube.com/watch')) {
  currentVideoUrl = window.location.href;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForPlayer);
  } else {
    waitForPlayer();
  }
}

setInterval(checkForVideoChange, 1000);