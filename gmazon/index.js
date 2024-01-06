// Copyright 2024 fluxxxto.github.io \\

let allData;
let displayedData;
const CURRENCY_SYMBOL = 'EUR';
let cartItems = [];
updateCartDisplay()

document.addEventListener('DOMContentLoaded', function () {

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            console.log('Data loaded:', data);
            allData = data;
            displayedData = sortArticlesByPrice(allData);
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

    displayedData = sortArticlesByPrice(displayedData);
    displayArticles(displayedData, CURRENCY_SYMBOL);
}

function displayArticles(articles, currencySymbol) {
    const articleList = document.getElementById('articleList');
    articleList.innerHTML = '';

  
    articles.sort((a, b) => {
        if (a.discount && !b.discount) {
            return -1;
        } else if (!a.discount && b.discount) {
            return 1;
        } else {

            const outOfStockComparison = a.outOfStock - b.outOfStock;
            return outOfStockComparison !== 0 ? outOfStockComparison : a.price - b.price;
        }
    });

    for (let i = 0; i < articles.length; i += 4) {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('articleRow');

        for (let j = i; j < i + 4 && j < articles.length; j++) {
            const article = articles[j];

            const listItem = document.createElement('div');
            listItem.classList.add('article');

            if (article.discount) {
                listItem.classList.add('discount-article');
            }

            if (article.outOfStock) {
                listItem.classList.add('out-of-stock');
            }

            const img = document.createElement('img');
            img.alt = 'Icon';

            if (article.image.startsWith('http')) {
                img.src = article.image;
            } else {
                img.src = `images/${article.image}.png`;
            }

            img.width = 50;
            img.height = 50;
            listItem.appendChild(img);

            const infoDiv = document.createElement('div');
            infoDiv.classList.add('info-container');

            const nameHeading = document.createElement('h2');
            const limitedName = article.name.length > 20 ? article.name.substring(0, 17) + '...' : article.name;
            nameHeading.textContent = limitedName;
            infoDiv.appendChild(nameHeading);


            if (article.discount && article.additionalInfo !== undefined && article.additionalInfo !== "") {
                const additionalInfoParagraph = document.createElement('p');
                additionalInfoParagraph.textContent = article.additionalInfo;
                additionalInfoParagraph.classList.add('additional-info');
                infoDiv.appendChild(additionalInfoParagraph);
            }


            const priceDiv = document.createElement('div');
            const priceParagraph = document.createElement('p');
            priceParagraph.textContent = `Preis: ${formatCurrency(article.price, currencySymbol)}`;
            priceParagraph.classList.add('average-price');
            priceDiv.appendChild(priceParagraph);

            infoDiv.appendChild(priceDiv);

            if (!article.outOfStock) {
                const quantityInput = document.createElement('input');
                quantityInput.type = 'number';
                quantityInput.classList.add('quantity-input');
                quantityInput.id = `quantity-${j}`;
                quantityInput.placeholder = 'Menge';
                quantityInput.min = 0;
                quantityInput.max = 10000;
                quantityInput.value = 0;
                infoDiv.appendChild(quantityInput);

                const addButton = document.createElement('button');
                addButton.textContent = 'In den Warenkorb';
                addButton.classList.add('add-to-cart-btn');
                addButton.addEventListener('click', function () {
                    if (!article.outOfStock) {
                        addToCart(article.key, article.image, article.name, article.price, parseInt(quantityInput.value, 10));
                    }
                });
                infoDiv.appendChild(addButton);
            }

            listItem.appendChild(infoDiv);
            rowDiv.appendChild(listItem);
        }

        articleList.appendChild(rowDiv);
    }
}
function formatCurrency(amount) {
    return amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A';
}

function sortArticlesByPrice(articles) {
    const clonedArticles = articles.map(article => ({ ...article }));

    return clonedArticles.sort((a, b) => {

        const isOutOfStockA = a.outOfStock === true;

        const isOutOfStockB = b.outOfStock === true;


        if (isOutOfStockA && !isOutOfStockB) {
            return 1;
        }


        if (!isOutOfStockA && isOutOfStockB) {
            return -1;
        }


        return a.price - b.price;
    });
}

function toggleCartPopup() {
    const cartPopup = document.getElementById('cart-popup');
    cartPopup.style.display = cartPopup.style.display === 'none' ? 'block' : 'none';
}

function addToCart(itemKey, itemId, itemName, itemPrice, quantity) {
    const existingItem = cartItems.find(item => item.key === itemKey);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cartItems.push({ key: itemKey, id: itemId, name: itemName, price: itemPrice, quantity: quantity });
    }

    updateCartDisplay();
}

function applyCoupon() {
    const couponInput = document.getElementById('couponInput');
    const couponCode = couponInput.value;
}

function updateCartDisplay() {
    const cartContent = document.getElementById('cart-content');
    const totalAmountSpan = document.getElementById('total-amount');
    const cartCountSpan = document.getElementById('cart-count');


    if (cartItems.length === 0) {
        cartContent.innerHTML = '<p class="empty-cart-message">Hier ist es sehr staubig und leer <br> Da wird der Hausmeister sauer :c';
        totalAmountSpan.textContent = formatCurrency(0);
        cartCountSpan.textContent = 0;
        return;
    }

    cartContent.innerHTML = '';
    let totalAmount = 0;


    cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;

        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');

        const itemImg = document.createElement('img');

        if (item.id.startsWith('http')) {
            itemImg.src = item.id;
        } else {
            itemImg.src = `images/${item.id}.png`;
        }

        itemImg.alt = 'Item Image';
        itemImg.width = 50;
        itemImg.height = 50;
        cartItemDiv.appendChild(itemImg);


        const itemInfo = document.createElement('div');
        itemInfo.classList.add('item-info');

        const itemName = document.createElement('span');
        itemName.classList.add('item-name');
        itemName.textContent = item.name;
        itemInfo.appendChild(itemName);

        const itemDetails = document.createElement('span');
        itemDetails.classList.add('item-details');
        itemDetails.textContent = `${formatCurrency(item.price)} x ${item.quantity}`;
        itemInfo.appendChild(itemDetails);

        cartItemDiv.appendChild(itemInfo);
        cartContent.appendChild(cartItemDiv);
    });


    totalAmountSpan.textContent = formatCurrency(totalAmount);
    cartCountSpan.textContent = cartItems.reduce((total, item) => total + item.quantity, 0);
}
function doCheckout(checkoutinfo, paymentMethod) {
    let checkoutString = '';
    var checkoutInstruction = '';
    var gmapifield = '';

    

    //Wer das liest guckt gerade wohl nach wie der Checkoutcode gemacht wird c:
    cartItems.forEach(item => {

        checkoutString += `${item.key}${item.quantity}`;
    });


    const popup = document.createElement('div');
    popup.id = 'popup';

    switch (paymentMethod) {
        case 'ingame-transfer':
            checkoutInstruction = 'Überweise das Geld an die Kontonummer DEF08666676, dabei MUSS der oben genannte Checkoutcode in der Beschreibung der Überweisung enthalten sein. Wenn kein Mitarbeiter z.B. "Fluxxxto" online ist, kann die Lieferung bis zu 8 Stunden dauern.';
            break;
        case 'ingame-cash':
            checkoutInstruction = 'Melde dich bei einem ingame bei einem Mitarbeiter z.B. "Fluxxxto" und schicke ihm den Checkoutcode, dieser wird sich um dich kümmern.';
            break;
        case 'gmapi':
            checkoutInstruction = 'Trage deine GM-API code unten ein um die Transaktion abzuschließen. (Wir speichern KEINE Daten wie z.B. den GM-API code)';
            gmapifield = '<p><input type="text" id="gmapi-input" placeholder="Gib deinen GM-API Code ein" style="display: inline-block; margin-right: 10px;"><button id="confirm-button" onclick="confirmGMAPICode(\'' + checkoutString + '\', \'' + checkoutinfo + '\')" style="display: inline-block;">Bestätigen</button></p>';
            break;
        default:
            break;
    }
    

    const popupContent = `
        <div class "checkout-popup">
            <span id="closeBtn" onclick="closePopup()">×</span>
            <h2>Dein Checkout-Code</h2>
            <p class="checkout-code" id="checkoutCode">${checkoutString}${checkoutinfo}</p>
            <p>${checkoutInstruction}</p>
            ${gmapifield}
        </div>
    `;


    popup.innerHTML = popupContent;


    document.body.appendChild(popup);


    popup.style.display = 'block';
}

function confirmGMAPICode(apicode, checkoutcode) {
    const gmapiCode = document.getElementById('gmapi-input').value;

    console.log(gmapiCode + checkoutcode);

    $.post('https://api.germanminer.de/v2/bank/list?key=' + apicode , function(data) {

        if (data.success) {

            $.each(data.data, function(accountNumber, accountData) {

                if (accountData.accountType === 'Privatkonto') {

                    console.log('Kontonummer des Privatkontos:', accountNumber);

                }
            });
        } else {

            console.error('Fehler bei der API-Anfrage:', data);
        }
    }, 'json');

}


function closePopup() {
    const popupElement = document.getElementById('popup');


    if (popupElement) {

        popupElement.parentNode.removeChild(popupElement);
    }
}

function copyToClipboard() {
    const checkoutCodeElement = document.getElementById('checkoutCode');
    const copyFeedbackElement = document.getElementById('copyFeedback');
    

    const textarea = document.createElement('textarea');
    textarea.value = checkoutCodeElement.textContent.trim();
    document.body.appendChild(textarea);


    textarea.select();
    document.execCommand('copy');


    document.body.removeChild(textarea);


    copyFeedbackElement.style.opacity = 1;
    setTimeout(() => {
        copyFeedbackElement.style.opacity = 0;
    }, 1000);
}

let deliveryOption = '';

function setDeliveryOption(option) {
    deliveryOption = option;
    showDeliveryPopup();
}

function showDeliveryPopup() {

    const deliveryPopup = document.createElement('div');
    deliveryPopup.id = 'delivery-popup';


    const deliveryOptions = `
        <div class="delivery-header">
            <h2>Wähle eine Lieferoption</h2>
        </div>
        <div class="delivery-body">
            <label for="delivery-method">Liefermethode:</label>
            <select id="delivery-method">
                <option value="person">Liefern zu Person</option>
                <option value="kiste">Liefern zu Kiste/Briefkasten</option>
            </select>
            <p id="delivery-info"></p>
            <input type="text" id="delivery-location" placeholder="Kau/Ort">
            <label for="payment-method">Zahlungsmethode:</label>
            <select id="payment-method">
                <option value="ingame-transfer">Ingame überweisen</option>
                <option value="ingame-cash">Ingame bar zahlen</option>
                <option value="gmapi">Über GM-API bezahlen (nocht nicht funktional)</option>
            </select>
        </div>
        <div class="delivery-footer">
            <button onclick="completeCheckout()">Checkout</button>
            <button onclick="closeDeliveryPopup()">Abbrechen</button>
        </div>
    `;


    deliveryPopup.innerHTML = deliveryOptions;


    document.body.appendChild(deliveryPopup);


    deliveryPopup.style.display = 'block';
}

function createDeliveryPopup() {
    const deliveryPopup = document.createElement('div');
    deliveryPopup.id = 'delivery-popup';

    const deliveryOptions = `
        <h2>Wähle eine Lieferoption</h2>
        <button onclick="setDeliveryMethod('person')">Liefern zu Person</button>
        <button onclick="setDeliveryMethod('kiste')">Liefern zu Kiste/Briefkasten</button>
        <p id="delivery-info"></p>
        <input type="text" id="delivery-location" placeholder="Kau/Ort">
        <select id="payment-method">
            <option value="ingame-transfer">Ingame überweisen</option>
            <option value="ingame-cash">Ingame bar zahlen</option>
            <option value="gmapi">Über GM-API bezahlen</option>
        </select>
        <div id="payment-info-container"></div>
        <div id="hover-info-container"></div>
        <button onclick="completeCheckout()">Checkout</button>
    `;

    deliveryPopup.innerHTML = deliveryOptions;
    document.body.appendChild(deliveryPopup);
}


function completeCheckout() {
    const deliveryMethod = document.getElementById('delivery-method').value;
    const deliveryLocation = document.getElementById('delivery-location').value;
    const paymentMethod = document.getElementById('payment-method').value;

    let checkoutCode = '';

    if (deliveryMethod === 'person') {
        checkoutCode += '@';
    } else if (deliveryMethod === 'kiste') {
        checkoutCode += '%';
    }

    switch (paymentMethod) {
        case 'ingame-transfer':
            checkoutCode += '/';
            break;
        case 'ingame-cash':
            checkoutCode += '=';
            break;
        case 'gmapi':
            checkoutCode += '~';
            break;
        default:
            break;
    }

    checkoutCode += ` ${deliveryLocation}`;


    console.log(`Dein Checkout-Code: ${checkoutCode}`);

    closeDeliveryPopup();
    doCheckout(checkoutCode, paymentMethod)
    console.log(paymentMethod)
}


function showPaymentInfo(info) {
    const paymentInfoContainer = document.getElementById('payment-info-container');
    

    if (paymentInfoContainer) {

        const paymentInfoElement = document.createElement('div');
        paymentInfoElement.classList.add('payment-info');
        paymentInfoElement.textContent = info;


        paymentInfoContainer.appendChild(paymentInfoElement);
    }
}

function closeDeliveryPopup() {
    const deliveryPopup = document.getElementById('delivery-popup');
    if (deliveryPopup) {
        deliveryPopup.parentNode.removeChild(deliveryPopup);
    }
}
