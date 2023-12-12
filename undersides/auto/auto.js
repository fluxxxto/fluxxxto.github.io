
let allData; // Daten ohne Filterung
let displayedData; // Daten, die auf der Seite angezeigt werden
const CURRENCY_SYMBOL = 'EUR'; // Wähle das gewünschte Währungssymbol

document.addEventListener('DOMContentLoaded', function () {

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            console.log('Data loaded:', data);
            allData = data;
            displayedData = sortArticlesByAveragePrice(allData);
            displayArticles(displayedData, CURRENCY_SYMBOL); // Übergebe das Währungssymbol hier
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
    displayArticles(displayedData, CURRENCY_SYMBOL); // Übergebe das Währungssymbol hier
}

function displayArticles(articles, currencySymbol) {
    const articleList = document.getElementById('articleList');
    articleList.innerHTML = '';

    const articlesPerRow = 3;

    for (let i = 0; i < articles.length; i += articlesPerRow) {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('articleRow');

        for (let j = i; j < i + articlesPerRow && j < articles.length; j++) {
            const article = articles[j];

            const listItem = document.createElement('div');
            listItem.classList.add('article', 'with-background');

            // Set background image dynamically
            const currentImageIndex = 1; // Start mit dem ersten Bild
            listItem.style.backgroundImage = `url('images/${article.image}${currentImageIndex}.png')`;

            const infoDiv = document.createElement('div');
            infoDiv.classList.add('info-container');

            const nameHeading = document.createElement('h2');
            nameHeading.innerHTML = `${article.name}${article.releaseDate ? ` <small>${article.releaseDate}</small>` : ''}`;
            infoDiv.appendChild(nameHeading);

            const priceDiv = document.createElement('div');

            if (article.prices.length > 0 && currencySymbol !== undefined) {
                const averagePriceParagraph = document.createElement('p');
                averagePriceParagraph.textContent = ` ⌀ Preis: ${formatCurrency(article.prices.reduce((a, b) => a + b) / article.prices.length, currencySymbol)}`;
                averagePriceParagraph.classList.add('average-price');
                priceDiv.appendChild(averagePriceParagraph);
            }

            if (article.lastPrice !== undefined && currencySymbol !== undefined) {
                const lastPriceParagraph = document.createElement('p');
                lastPriceParagraph.textContent = `Letzter Preis: ${formatCurrency(article.lastPrice, currencySymbol)}`;
                lastPriceParagraph.classList.add('last-price');
                priceDiv.appendChild(lastPriceParagraph);
            }

            infoDiv.appendChild(priceDiv);

            if (article.additionalInfo) {
                const additionalInfoDiv = document.createElement('div');
                additionalInfoDiv.classList.add('additional-info');
                additionalInfoDiv.textContent = article.additionalInfo;
                infoDiv.appendChild(additionalInfoDiv);
            }

            // Schaltflächen für die Bildergalerie
            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('button-container'); // Füge die Klasse 'button-container' hinzu

            const prevButton = document.createElement('button');
            prevButton.textContent = '←';
            prevButton.classList.add('prev'); // Füge die Klasse 'prev' hinzu
            prevButton.addEventListener('click', () => switchImage(-1, listItem, article.image, article.imageCount));

            const nextButton = document.createElement('button');
            nextButton.textContent = '→';
            nextButton.classList.add('next'); // Füge die Klasse 'next' hinzu
            nextButton.addEventListener('click', () => switchImage(1, listItem, article.image, article.imageCount));

            buttonContainer.appendChild(prevButton);
            buttonContainer.appendChild(nextButton);
            
            listItem.appendChild(buttonContainer);
            listItem.appendChild(infoDiv);
            rowDiv.appendChild(listItem);
        }

        articleList.appendChild(rowDiv);
    }
}

function switchImage(direction, listItem, baseImagePath, imageCount) {
    const currentImageIndex = parseInt(listItem.style.backgroundImage.match(/(\d+)\.png/)[1]);
    const newImageIndex = (currentImageIndex + direction - 1 + imageCount) % imageCount + 1;
    listItem.style.backgroundImage = `url('images/${baseImagePath}${newImageIndex}.png')`;
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

        // Hinzufügen des durchschnittlichen Preises zu den Artikelobjekten
        a.averagePrice = averagePriceA;
        b.averagePrice = averagePriceB;

        return averagePriceB - averagePriceA; // Sortiere absteigend
    });
}


function calculateAverage(prices) {
    if (prices.length === 0) {
        return 0;
    }

    const sum = prices.reduce((total, price) => total + price, 0);
    const average = sum / prices.length;

    return Number(average.toFixed(2)); // Runde auf 2 Dezimalstellen
}
