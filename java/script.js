let liveBitcoinPrice = 0;
let liveGoMiningTokenPrice = 0;
let manualBitcoinPrice = null; // Holds the manual Bitcoin price if set by the user

// Fetch current prices for Bitcoin and GoMining Token from CoinGecko API
function fetchPrices() {
    const bitcoinApiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
    const goMiningApiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=gmt-token&vs_currencies=usd';

    // Fetch Bitcoin price
    fetch(bitcoinApiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.bitcoin && data.bitcoin.usd) {
                liveBitcoinPrice = data.bitcoin.usd;
                updateBitcoinPriceDisplay(); // Update the Bitcoin price display if needed
            } else {
                throw new Error('Invalid Bitcoin price data');
            }
        })
        .catch(error => {
            console.error('Error fetching Bitcoin price:', error);
        });

    // Fetch GoMining Token price
    fetch(goMiningApiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch GoMining Token price');
        }
        return response.json();
    })
    .then(data => {
        console.log('GoMining Token data:', data); // Log the data to check the structure
        if (data['gmt-token'] && data['gmt-token'].usd) {
            liveGoMiningTokenPrice = data['gmt-token'].usd;
            document.getElementById('gmt-price').innerText = liveGoMiningTokenPrice.toFixed(4);
        } else {
            console.error('Invalid data format for GoMining Token price:', data);
            document.getElementById('gmt-price').innerText = 'Error loading price';
        }
    })
    .catch(error => {
        console.error('Error fetching GoMining Token price:', error);
        document.getElementById('gmt-price').innerText = 'Error loading price';
    });
}

// Call fetchPrices on page load
window.onload = fetchPrices;

// Update Bitcoin price display or store the price if manually set
function updateBitcoinPriceDisplay() {
    // Choose the live price or the manual price set by the user
    const bitcoinPrice = manualBitcoinPrice || liveBitcoinPrice;
    document.getElementById('btc-price').innerText = bitcoinPrice.toFixed(2);
}

// Calculate earnings, electricity cost, service cost, and pure earnings with discount
function calculateEarnings() {
    const hashPower = parseFloat(document.getElementById('th-power').value); // Terahash
    const efficiency = parseFloat(document.getElementById('efficiency').value); // W/TH (efficiency entered by user)
    const discount = parseFloat(document.getElementById('discount').value); // Discount percentage

    // Choose the live price or the manual price set by the user
    const bitcoinPrice = manualBitcoinPrice || liveBitcoinPrice;

    // Validate user input
    if (isNaN(hashPower) || isNaN(efficiency) || isNaN(discount) || bitcoinPrice === 0 || liveGoMiningTokenPrice === 0) {
        alert('Please enter valid values and ensure the prices are loaded.');
        return;
    }

    // Define timeframes in days
    const daysInMonth = 30;
    const daysInYear = 365;

    // Earnings per TH in satoshi
    const satoshiPerTHPerDay = 73; 
    const dailyEarningsBTC = (hashPower * satoshiPerTHPerDay) / 100000000; // Convert satoshi to BTC
    const dailyEarningsUSD = dailyEarningsBTC * bitcoinPrice; // Convert to USD

    // Calculate electricity costs in GoMining tokens using user-input efficiency
    const powerCostPerDay = 0.05; // kWh cost
    const hoursPerDay = 24; 
    const electricityCostPerTHPerDay = (powerCostPerDay * hoursPerDay * efficiency) / (liveGoMiningTokenPrice * 1000);
    
    // Apply discount
    const discountMultiplier = (100 - discount) / 100; // Convert discount to a multiplier
    const discountedElectricityCostPerDay = electricityCostPerTHPerDay * discountMultiplier;

    // Multiply by hash power for total costs
    const totalElectricityCostPerDay = discountedElectricityCostPerDay * hashPower;
    const totalElectricityCostPerMonth = totalElectricityCostPerDay * daysInMonth; // Monthly electricity cost
    const totalElectricityCostPerYear = totalElectricityCostPerDay * daysInYear; // Yearly electricity cost

    // Calculate service costs in GoMining tokens
    const serviceCostPerTHPerDay = (0.0089 / liveGoMiningTokenPrice); // Constant divided by the GoMining Token price
    const discountedServiceCostPerDay = serviceCostPerTHPerDay * discountMultiplier; // Apply discount
    const totalServiceCostPerDay = discountedServiceCostPerDay * hashPower; // Total service cost per day
    const totalServiceCostPerMonth = totalServiceCostPerDay * daysInMonth; // Monthly service cost
    const totalServiceCostPerYear = totalServiceCostPerDay * daysInYear; // Yearly service cost

    // Calculate earnings based on timeframe
    const earnings = {
        daily: dailyEarningsUSD,
        monthly: dailyEarningsUSD * daysInMonth,
        yearly: dailyEarningsUSD * daysInYear
    };

    // Calculate costs based on timeframe
    const electricityCosts = {
        daily: totalElectricityCostPerDay,
        monthly: totalElectricityCostPerMonth,
        yearly: totalElectricityCostPerYear
    };

    const serviceCosts = {
        daily: totalServiceCostPerDay,
        monthly: totalServiceCostPerMonth,
        yearly: totalServiceCostPerYear
    };

    // Calculate pure earnings
    const pureEarnings = {
        daily: earnings.daily - (electricityCosts.daily + serviceCosts.daily),
        monthly: earnings.monthly - (electricityCosts.monthly + serviceCosts.monthly),
        yearly: earnings.yearly - (electricityCosts.yearly + serviceCosts.yearly)
    };

    // Display default as daily values
    updateResults(earnings.daily, electricityCosts.daily, serviceCosts.daily, pureEarnings.daily);
}

// Update the results based on selected timeframe
function updateResults(earnings, electricityCost, serviceCost, pureEarnings) {
    document.getElementById('earnings').innerText = `Earnings: $${earnings.toFixed(2)}`;
    document.getElementById('electricity-cost').innerText = `Electricity Cost: ${electricityCost.toFixed(8)} GoMining Tokens`;
    document.getElementById('service-cost').innerText = `Service Cost: ${serviceCost.toFixed(8)} GoMining Tokens`;
    document.getElementById('pure-earnings').innerText = `Pure Earnings: $${pureEarnings.toFixed(2)}`;
}

// Toggle between daily, monthly, and yearly views
function setView(timeframe) {
    const hashPower = parseFloat(document.getElementById('th-power').value);
    const efficiency = parseFloat(document.getElementById('efficiency').value);
    const discount = parseFloat(document.getElementById('discount').value);

    // Choose the live price or the manual price set by the user
    const bitcoinPrice = manualBitcoinPrice || liveBitcoinPrice;

    if (isNaN(hashPower) || isNaN(efficiency) || isNaN(discount) || bitcoinPrice === 0 || liveGoMiningTokenPrice === 0) {
        alert('Please enter valid values and ensure the prices are loaded.');
        return;
    }

    // Define timeframes in days
    const daysInMonth = 30;
    const daysInYear = 365;

    // Calculate earnings, electricity costs, and service costs for the selected timeframe
    const multiplier = {
        daily: 1,
        monthly: daysInMonth,
        yearly: daysInYear
    }[timeframe];

    const earnings = (hashPower * 73 / 100000000) * bitcoinPrice * multiplier;
    const electricityCost = (0.05 * 24 * efficiency / (liveGoMiningTokenPrice * 1000) * (100 - discount) / 100 * hashPower) * multiplier;
    const serviceCost = (0.0089 / liveGoMiningTokenPrice * (100 - discount) / 100 * hashPower) * multiplier;

    // Calculate pure earnings
    const pureEarnings = earnings - (electricityCost + serviceCost);

    // Update the displayed results
    updateResults(earnings, electricityCost, serviceCost, pureEarnings);
}

// Toggle between light and dark mode
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle');

    // Load saved theme from localStorage
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Update button text based on current theme
    themeToggleButton.textContent = currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';

    // Add event listener for the theme toggle button
    themeToggleButton.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Update button text
        themeToggleButton.textContent = newTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    });
});

// Event listeners for the timeframe buttons
document.querySelectorAll('.timeframe-buttons button').forEach(button => {
    button.addEventListener('click', (event) => {
        const timeframe = event.target.textContent.toLowerCase();
        setView(timeframe);
    });
});

// Add event listener for hypothetical Bitcoin price input
document.getElementById('manual-btc-price').addEventListener('input', (event) => {
    const inputPrice = parseFloat(event.target.value);
    manualBitcoinPrice = isNaN(inputPrice) ? null : inputPrice; // Set manual price or reset if invalid
    updateBitcoinPriceDisplay(); // Update display with the manual price if set
});
