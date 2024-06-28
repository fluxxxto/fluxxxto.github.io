
fetch('pi.txt')
    .then(response => {
        if (!response.ok) {
            throw new Error('Netzwerkantwort war nicht ok');
        }
        return response.text();
    })
    .then(data => {
        let pi = data.trim();
        let piContainer = document.getElementById('pi-container');
        let index = 0;

        function showPi() {
            if (index < pi.length) {
                let digit = pi.charAt(index);
                let newDigit = document.createElement('span');
                newDigit.className = 'pi-digit';
                newDigit.textContent = digit;
                piContainer.appendChild(newDigit);
                if ((index + 1) % 20 === 0) {
                    piContainer.appendChild(document.createElement('br'));
                }
                index++;


                setTimeout(showPi, 25);
            }
        }

        showPi();
    })
    .catch(error => console.error('Fehler beim Laden der Pi-Datei:', error));
