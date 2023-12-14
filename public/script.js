document.addEventListener("DOMContentLoaded", (event) => {
  if (document.getElementById("stoicQuote")) {
      fetchStoicQuote();
  }


  if (document.querySelector(".weather-container")) {
      fetchWeather();
  }

  if (document.getElementById("startStopBtn")) {
      setupPomodoroTimer();
  }

  if(document.getElementById("existingCourseSelect" )) {
    showCourseSelection();
  }

  if(document.getElementById("newCourseInput")) {
    showNewCourseInput();
  }


  document.querySelectorAll('.due-date').forEach(el => {
    el.textContent = formatDate(el.textContent);
});

  filterTasks('all'); // Show all tasks initially

  searchTasks();
});

function setupPomodoroTimer() {
  let isRunning = false;
  let sessionCount = 0;
  let sessionTime = 25 * 60; // 25 minutes
  let breakTime = 5 * 60; // 5 minutes
  let longBreakTime = 15 * 60; // 15 minutes
  let currentTime = sessionTime;
  let timer;

  const display = document.getElementById('timerDisplay');
  const startStopBtn = document.getElementById('startStopBtn');
  const resetBtn = document.getElementById('resetBtn');
  const sessionCountDisplay = document.getElementById('sessionCount');

  startStopBtn.addEventListener('click', toggleTimer);
  resetBtn.addEventListener('click', resetTimer);

  function toggleTimer() {
      if (isRunning) {
          clearInterval(timer);
          startStopBtn.textContent = 'Start';
      } else {
          timer = setInterval(function() {
              currentTime--;
              updateDisplay();

              if (currentTime <= 0) {
                  clearInterval(timer);
                  sessionCount++;
                  sessionCountDisplay.textContent = sessionCount;

                  if (sessionCount % 4 === 0) {
                      currentTime = longBreakTime;
                  } else {
                      currentTime = sessionCount % 2 === 0 ? breakTime : sessionTime;
                  }
              }
          }, 1000);
          startStopBtn.textContent = 'Pause';
      }
      isRunning = !isRunning;
  }

  function resetTimer() {
      clearInterval(timer);
      isRunning = false;
      sessionCount = 0;
      currentTime = sessionTime;
      updateDisplay();
      sessionCountDisplay.textContent = sessionCount;
      startStopBtn.textContent = 'Start';
  }

  function updateDisplay() {
      let minutes = Math.floor(currentTime / 60);
      let seconds = currentTime % 60;
      display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  updateDisplay(); // Initial display update
}

// Stoic Quotes API
function fetchStoicQuote() {
  let url = "https://stoic-quotes.com/api/quote";

  fetch(url)
      .then((response) => response.json())
      .then((data) => {
          displayStoicText(data);
      })
      .catch((err) => {
          console.error("Error fetching stoic quote:", err);
      });
}

function displayStoicText(data) {
  const quoteElement = document.getElementById("stoicQuote");
  quoteElement.textContent = `"${data.text}" - ${data.author}`;
}

// Weather API
function fetchWeather() {
  let city = "london";
  let apiKey = "2315392e1494807887d2743404f0616f";
  let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

  fetch(url)
      .then((response) => response.json())
      .then((data) => {
          displayWeather(data);
      })
      .catch((err) => {
          console.error("Error fetching weather:", err);
      });
}

function displayWeather(data) {
  const weatherContainer = document.createElement("div");
  weatherContainer.innerHTML = `
      <h2>Weather in ${data.name}</h2>
      <p>Temperature: ${data.main.temp} °C</p>
      <p>Weather: ${data.weather[0].main}</p>
  `;
  document.body.appendChild(weatherContainer);
}

function showCourseSelection() {
  document.getElementById('existingCourseSelect').style.display = 'block';
  document.getElementById('newCourseInput').style.display = 'none';
}

function showNewCourseInput() {
  document.getElementById('existingCourseSelect').style.display = 'none';
  document.getElementById('newCourseInput').style.display = 'block';
}


function formatDate(dateString) {
  const options = {
    day: "numeric",
    month: "short",
    year: "numeric",
};

  return new Date(dateString).toLocaleDateString("en-US", options);
}
function filterTasks(status) {
    const tasks = document.querySelectorAll('.task-item');
    tasks.forEach(task => {
        if (status === 'all' || task.getAttribute('data-status') === status) {
            task.style.display = '';
        } else {
            task.style.display = 'none';
        }
    });
  }

  function searchTasks() {
    const searchInput = document.getElementById('taskSearchInput').value.toLowerCase();
    const tasks = document.querySelectorAll('.task-item');

    tasks.forEach(task => {
        const taskName = task.querySelector('.task-details').textContent.toLowerCase();
        if (taskName.includes(searchInput)) {
            task.style.display = '';
        } else {
            task.style.display = 'none';
        }
    });
}
  