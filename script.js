const countriesByContinent = {};
const countriesStats = {};
let labels;
let data;
let dropdown;
let selectedContinent = 'World';
let selectedData = 'recovered';

function changeChartDisplday() {
  const chart = document.querySelector('#myChart');
  if (chart.style.display === 'none') chart.style.display = 'block';
}

function removeCurrentCountry() {
  if (document.querySelector('.selectedCountry')) {
    const currentStat = document.querySelector('.selectedCountry');
    currentStat.remove();
  }
}

function handleDataClick(event) {
  changeChartDisplday();
  removeCurrentCountry();
  selectedData = event.target.value;
}

function handleRegionClick(event) {
  changeChartDisplday();
  removeCurrentCountry();
  selectedContinent = event.target.value;
}

function getData(codes, type) {
  const dataArr = [];
  for (const code of codes) {
    if (countriesStats[code]) dataArr.push(countriesStats[code][type]);
  }
  return dataArr;
}

function getCodes() {
  let codes = [];
  if (selectedContinent !== 'World')
    codes = countriesByContinent[selectedContinent];
  else {
    const allContinents = Object.keys(countriesByContinent);
    for (const continent of allContinents)
      codes.push(...countriesByContinent[continent]);
  }
  return codes;
}

function displayCountryData(event) {
  const chart = document.querySelector('#myChart');
  chart.style.display = 'none';

  const dataContainer = document.querySelector('.data-container');

  removeCurrentCountry();

  const countryStats = document.createElement('div');
  countryStats.classList.add('selectedCountry');
  const selectedCountry = event.target.value;

  for (const key of Object.keys(countriesStats[selectedCountry])) {
    const stat = document.createElement('div');
    stat.classList.add('stat');
    const heading = document.createElement('h3');
    heading.innerHTML = `${key}:`;
    const countryStat = document.createElement('h4');
    countryStat.innerHTML = `${countriesStats[selectedCountry][key]}`;
    stat.append(heading);
    stat.append(countryStat);
    countryStats.append(stat);
  }
  dataContainer.append(countryStats);
}

async function createDropdown(codes) {
  if (dropdown) {
    const options = document.querySelectorAll('.option');
    for (const op of options) {
      op.remove();
    }
  }
  dropdown = document.querySelector('select');
  dropdown.addEventListener('input', () => displayCountryData(event));
  if (!document.querySelector('.def')) {
    const def = document.createElement('option');
    def.classList.add('def');
    def.innerHTML = 'Select country';
    dropdown.append(def);
  }
  for (const code of codes) {
    const option = document.createElement('option');
    option.setAttribute('value', code);
    option.innerHTML = `${getData([code], 'name')}`;
    option.classList.add('option');
    dropdown.append(option);
  }
}

async function createChart() {
  const codes = getCodes();
  labels = getData(codes, 'name');
  data = getData(codes, selectedData);
  const ctx = document.getElementById('myChart').getContext('2d');
  const myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: `${selectedData} in ${selectedContinent}`,
          data,
          backgroundColor: '#1d2d506e',
          borderColor: '#145b9c',
          borderWidth: 1,
        },
      ],
    },
    options: {
      events: ['hover'],
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });
  createDropdown(codes);
}

async function activateButtons() {
  const placeBtn = document.querySelector('.places');
  const statsBtn = document.querySelector('.stats');
  const all = document.querySelector('.buttons');
  all.addEventListener('click', () => createChart());
  statsBtn.addEventListener('click', () => handleDataClick(event));
  placeBtn.addEventListener('click', () => handleRegionClick(event));
}

async function getStats() {
  const endPoint = 'https://corona-api.com/countries';
  const response = await fetch(`${endPoint}`);
  const stats = await response.json();

  stats.data.forEach((country) => {
    countriesStats[country.code] = {
      name: country.name,
      confirmed: country.latest_data.confirmed,
      deaths: country.latest_data.deaths,
      'new deaths': country.today.deaths,
      'new confirmed': country.today.confirmed,
      critical: country.latest_data.critical,
      recovered: country.latest_data.recovered,
    };
  });
}

async function sortByContinent() {
  const proxy = 'https://api.codetabs.com/v1/proxy?quest=';
  const endPoint = 'https://restcountries.herokuapp.com/api/v1';

  const response = await fetch(`${proxy}${endPoint}`);
  const countries = await response.json();

  countries.forEach((country) => {
    if (!countriesByContinent[country.region]) {
      countriesByContinent[country.region] = [country.cca2];
    } else {
      countriesByContinent[country.region].push(country.cca2);
    }
  });
  countriesByContinent.Other = countriesByContinent[''];
  delete countriesByContinent[''];
  activateButtons();
  createChart();
}

getStats();
sortByContinent();
