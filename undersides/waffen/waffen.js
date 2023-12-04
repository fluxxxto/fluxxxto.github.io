
let allData;
let displayedData;
const CURRENCY_SYMBOL = 'EUR';

document.addEventListener('DOMContentLoaded', function () {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            console.log('Data loaded:', data);
            allData = data;
            displayedData = sortArticlesByAveragePrice(allData);
            displayArticles(displayedData, CURRENCY_SYMBOL);
        })
        .catch(error => console.error('Error loading data:', error));

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', handleSearch);
});

function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase();

    displayedData = allData.filter(article => {
        return article.name.toLowerCase().includes(searchTerm);
    });

    displayedData = sortArticlesByAveragePrice(displayedData);
    displayArticles(displayedData, CURRENCY_SYMBOL);
}

function displayArticles(articles, currencySymbol) {
    const articleList = document.getElementById('articleList');
    articleList.innerHTML = '';

    for (let i = 0; i < articles.length; i += 2) {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('articleRow');

        for (let j = i; j < i + 2 && j < articles.length; j++) {
            const article = articles[j];

            const listItem = document.createElement('div');
            listItem.classList.add('article');

            const img = document.createElement('img');
            img.src = `images/${article.image}.png`;
            img.alt = 'Icon';
            img.width = 100;
            img.height = 100;
            listItem.appendChild(img);

            const infoDiv = document.createElement('div');
            infoDiv.classList.add('info-container');

            const nameHeading = document.createElement('h2');
            nameHeading.innerHTML = `${article.name}${article.releaseDate ? ` <small>${article.releaseDate}</small>` : ''}`;
            infoDiv.appendChild(nameHeading);

            const priceDiv = document.createElement('div');

            if (article.averagePrice !== undefined && currencySymbol !== undefined) {
                const averagePriceParagraph = document.createElement('p');
                averagePriceParagraph.textContent = ` ⌀ Preis: ${formatCurrency(article.averagePrice, currencySymbol)}`;
                averagePriceParagraph.classList.add('average-price');
                priceDiv.appendChild(averagePriceParagraph);
            }

            if (article.lastPrice !== undefined && currencySymbol !== undefined) {
                const lastPriceParagraph = document.createElement('p');
                lastPriceParagraph.textContent = `Waffenladen: ${formatCurrency(article.lastPrice, currencySymbol)}`;
                lastPriceParagraph.classList.add('last-price');
                priceDiv.appendChild(lastPriceParagraph);
            }

            infoDiv.appendChild(priceDiv);

            listItem.appendChild(infoDiv);

            if (article.additionalInfo) {
                const additionalInfoDiv = document.createElement('div');
                additionalInfoDiv.classList.add('additional-info');
                additionalInfoDiv.textContent = article.additionalInfo;
                listItem.appendChild(additionalInfoDiv);
            }

            rowDiv.appendChild(listItem);
        }

        articleList.appendChild(rowDiv);
    }
}

function formatCurrency(amount, currencySymbol) {
    if (amount !== undefined && currencySymbol !== undefined) {
        return amount.toLocaleString('de-DE', { style: 'currency', currency: currencySymbol, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
        return 'N/A';
    }
}

function sortArticlesByAveragePrice(articles) {
    const clonedArticles = articles.map(article => ({ ...article }));

    return clonedArticles.sort((a, b) => {
        const averagePriceA = calculateAverage(a.prices);
        const averagePriceB = calculateAverage(b.prices);

        a.averagePrice = averagePriceA;
        b.averagePrice = averagePriceB;

        return averagePriceB - averagePriceA;
    });
}


function calculateAverage(prices) {
    if (prices.length === 0) {
        return 0;
    }

    const sum = prices.reduce((total, price) => total + price, 0);
    const average = sum / prices.length;

    return Number(average.toFixed(2));
}
