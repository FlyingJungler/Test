// Chart.js setup
const bitcoinChartCtx = document.getElementById('bitcoin-chart').getContext('2d');
const gominingChartCtx = document.getElementById('gomining-chart').getContext('2d');

let bitcoinChart = new Chart(bitcoinChartCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Bitcoin Price',
            data: [],
            borderColor: '#FF9900',
            borderWidth: 2,
            fill: false
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Date'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Price (USD)'
                }
            }
        }
    }
});

let gominingChart = new Chart(gominingChartCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'GoMining Token Price',
            data: [],
            borderColor: '#00BFFF',
            borderWidth: 2,
            fill: false
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Date'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Price (USD)'
                }
            }
        }
    }
});

const fetchData = async (symbol, range) => {
    const endpoint = `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=${range}`;
    const response = await fetch(endpoint);
    const data = await response.json();
    return data;
};

const updateBitcoinChart = async (range) => {
    const data = await fetchData('bitcoin', range);
    const labels = data.prices.map(price => new Date(price[0]).toLocaleDateString());
    const prices = data.prices.map(price => price[1]);

    bitcoinChart.data.labels = labels;
    bitcoinChart.data.datasets[0].data = prices;
    bitcoinChart.update();
};

const updateGoMiningChart = async (range) => {
    const data = await fetchData('gmt-token', range);
    const labels = data.prices.map(price => new Date(price[0]).toLocaleDateString());
    const prices = data.prices.map(price => price[1]);

    gominingChart.data.labels = labels;
    gominingChart.data.datasets[0].data = prices;
    gominingChart.update();
};

// Initialize charts with default timeframe
updateBitcoinChart('1d');
updateGoMiningChart('1d');

// Function to be called when timeframe button is clicked
const setView = (view) => {
    updateBitcoinChart(view);
    updateGoMiningChart(view);
};
