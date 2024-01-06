// Copyright 2024 fluxxxto.github.io \\


const jsonDataPath = 'http://fluxxxto.github.io/gmazon/data.json';
var informationFirstPart = '';
var informationLocation = '';
var informationPayment = '';
var informationDelivery = '';

async function fetchJsonData() {
    try {
        const response = await fetch(jsonDataPath);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching JSON data:', error.message);
        return [];
    }
}

async function decode() {
    const encodedCodeInput = document.getElementById('encodedCode');
    const decodedResult = document.getElementById('decodedResult');


    const encodedCode = extractFirstPart(encodedCodeInput.value);


    const jsonData = await fetchJsonData();

    const decodedText = decodeFromJson(encodedCode, jsonData);


    decodedResult.innerHTML = decodedText;
}

function wholeCode() {
    const encodedCodeInput = document.getElementById('encodedCode');
    return encodedCodeInput.value;
}

function decodeFromJson(encodedCode, jsonData) {
    let result = '';
    let totalAmount = 0;
    let totalPrice = 0;

    let i = 0;
    while (i < encodedCode.length) {
        const codeSection = encodedCode.substr(i, 2);


        let quantityDigits = '';
        i += 2;
        while (i < encodedCode.length && !isNaN(parseInt(encodedCode[i], 10))) {
            quantityDigits += encodedCode[i];
            i++;
        }

        const quantity = parseInt(quantityDigits, 10);

        const entry = jsonData.find(item => item.key === codeSection);

        if (entry) {

            const itemPrice = entry.price * quantity;

            totalAmount += quantity;
            totalPrice += itemPrice;

            const img = document.createElement('img');
            img.alt = 'Icon';

            if (entry.image.startsWith('http')) {
                img.src = entry.image;
            } else {
                img.src = `images/${entry.image}.png`;
            }


            result += `
                <div class="result-item">
                    <img src="${img.src}" alt="${entry.name}" style="max-width: 100px;">
                    <div class="result-info">
                        <h3>${entry.name}</h3>
                        <p>Anzahl: ${quantity}</p>
                        <p>Preis: ${entry.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} ⇒ ${itemPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).replace('.', ',')}</p>
                        ${entry.outOfStock ? '<p>Ausverkauft</p>' : '<p>Verfügbar</p>'}
                        <p>${entry.additionalInfo}</p>
                    </div>
                </div>
            `;
        } else {
            result += '<p>Unbekannter Code</p>';
        }
    }


    const ratio = totalAmount / 64;
    setInformationLocation(wholeCode());
    splitWord(getFirstTwoLetters(decodeFirst(wholeCode())));


    result += `
        <div class="total-info">
            <p>Gesamtanzahl: ${totalAmount.toLocaleString('de-DE')} Items ⇒ ca. ${ratio.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} Stacks</p>
            <p>Gesamtpreis: ${totalPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p>${informationLocation}</p>
            <p>${informationPayment}</p>
            <p>${informationDelivery}</p>
        </div>
    `;

    return result;
}

function decodeFirst(inputString) {
    const percentIndex = inputString.indexOf('%');
    const atSymbolIndex = inputString.indexOf('@');

    let symbolIndex;

    if (percentIndex !== -1 && atSymbolIndex !== -1) {
        symbolIndex = Math.min(percentIndex, atSymbolIndex);
    } else {

        symbolIndex = Math.max(percentIndex, atSymbolIndex);
    }

    if (symbolIndex !== -1) {

        const extractedString = inputString.substring(symbolIndex).trim();
        return extractedString;
    } else {

        return null;
    }
}

function splitWord(word) {
    if (word.length === 2) {
        const firstLetter = word[0];
        const secondLetter = word[1];
        if (firstLetter === '%') {
            informationDelivery = 'Ablieferungsposition: Briefkasten / Kiste';
        } else {
            informationDelivery = 'Ablieferungsposition: Persönlich';
        }
        if (secondLetter === '/') {
            informationPayment = 'Zahlungsmethode: Ingame überweisung';
        } if (secondLetter === '=') {
            informationPayment = 'Zahlungsmethode: Bargeld';
        } else {
            informationPayment = 'Zahlungsmethode: GMAPI';
        }

    } else {
        console.error('Das Wort sollte genau 2 Buchstaben enthalten.');
    }
}

function setInformationLocation(inputString) {
    const spaceIndex = inputString.indexOf(' ');

    if (spaceIndex !== -1) {

        const extractedString = inputString.substring(spaceIndex + 1).trim();
        informationLocation = 'Lieferungsort: ' + extractedString;
    }
}

function getFirstTwoLetters(inputString) {

    if (inputString.length >= 2) {

        const firstTwoLetters = inputString.substring(0, 2);
        return firstTwoLetters;
    } else {

        console.error('Der Eingabestring sollte mindestens zwei Buchstaben enthalten.');
        return null;
    }
}

function extractFirstPart(inputString) {
    const percentIndex = inputString.indexOf('%');
    const atSymbolIndex = inputString.indexOf('@');

    let symbolIndex;


    if (percentIndex !== -1 && atSymbolIndex !== -1) {
        symbolIndex = Math.min(percentIndex, atSymbolIndex);
    } else {

        symbolIndex = Math.max(percentIndex, atSymbolIndex);
    }

    if (symbolIndex !== -1) {

        const extractedString = inputString.substring(0, symbolIndex).trim();
        return extractedString;
    } else {

        return null;
    }
}
