document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const numbersInput = document.getElementById('numbers-input');
    const numberPad = document.getElementById('number-pad');
    const addNumberManualButton = document.getElementById('add-number-manual');
    const analyzeButton = document.getElementById('analyze-button');
    const resetButton = document.getElementById('reset-button');
    const enteredNumbersList = document.getElementById('entered-numbers-list');
    const errorMessageDiv = document.getElementById('error-message');

    // Results display elements
    const hotNumbersResult = document.getElementById('hot-numbers-result');
    const coldNumbersResult = document.getElementById('cold-numbers-result');
    const frequencyTableBody = document.getElementById('frequency-table').querySelector('tbody');
    const dozensResult = document.getElementById('dozens-result');
    const columnsResult = document.getElementById('columns-result');
    const colorsResult = document.getElementById('colors-result');
    const evenOddResult = document.getElementById('even-odd-result');
    const userGuidance = document.getElementById('user-guidance');

    let enteredNumbers = [];
    const MIN_NUMBERS_FOR_ANALYSIS = 50;

    // --- Input Handling and Display ---

    function displayError(message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
    }

    function clearError() {
        errorMessageDiv.textContent = '';
        errorMessageDiv.style.display = 'none';
    }

    function displayUserGuidance(message, type = 'info') { // type can be 'info', 'warning', 'error'
        const guidancePara = userGuidance.querySelector('p');
        if (guidancePara) {
            guidancePara.textContent = message;
            guidancePara.className = type; // Apply class for styling
        } else {
             userGuidance.innerHTML = `<p class="${type}">${message}</p>`;
        }
    }

    function updateEnteredNumbersDisplay() {
        enteredNumbersList.textContent = enteredNumbers.join(', ') || '-';
        if (enteredNumbers.length === 0) {
            displayUserGuidance(`حداقل ${MIN_NUMBERS_FOR_ANALYSIS} شماره برای تحلیل مناسب نیاز است. لطفاً شماره وارد کنید.`);
        } else if (enteredNumbers.length < MIN_NUMBERS_FOR_ANALYSIS) {
            displayUserGuidance(`حداقل ${MIN_NUMBERS_FOR_ANALYSIS} شماره برای تحلیل مناسب نیاز است. تعداد فعلی: ${enteredNumbers.length}`, 'warning');
        } else {
            displayUserGuidance('تعداد شماره‌های وارد شده برای تحلیل کافی است. برای شروع، دکمه "شروع تحلیل" را بزنید.', 'info');
        }
    }

    function addNumberToSequence(number) {
        const num = parseInt(number); // Ensure it's a number
        if (!isNaN(num) && num >= 0 && num <= 36) {
            enteredNumbers.push(num);
            updateEnteredNumbersDisplay();
            clearError();
        } else {
            displayError(`شماره نامعتبر: ${number}. لطفاً عددی بین 0 تا 36 وارد کنید.`);
        }
    }

    if (numberPad) {
        numberPad.querySelectorAll('.num-btn').forEach(button => {
            button.addEventListener('click', () => {
                addNumberToSequence(button.textContent);
            });
        });
    }

    if (addNumberManualButton) {
        addNumberManualButton.addEventListener('click', () => {
            clearError();
            const inputText = numbersInput.value.trim();
            if (inputText === '') {
                displayError('لطفاً شماره‌ها را در فیلد متنی وارد کنید.');
                return;
            }
            const numbersArrayStrings = inputText.split(',');
            const tempNumbers = [];
            let validInput = true;

            for (const numStr of numbersArrayStrings) {
                const num = parseInt(numStr.trim());
                if (isNaN(num) || num < 0 || num > 36) {
                    displayError(`ورودی نامعتبر: "${numStr.trim()}". همه شماره‌ها باید بین 0 تا 36 باشند.`);
                    validInput = false;
                    break;
                }
                tempNumbers.push(num);
            }

            if (validInput) {
                tempNumbers.forEach(num => addNumberToSequence(num)); // Use the validated addNumberToSequence
                numbersInput.value = '';
            }
        });
    }

    if (resetButton) {
        resetButton.addEventListener('click', () => {
            enteredNumbers = [];
            updateEnteredNumbersDisplay();
            clearError();
            numbersInput.value = '';
            hotNumbersResult.textContent = '-';
            coldNumbersResult.textContent = '-';
            frequencyTableBody.innerHTML = '';
            dozensResult.textContent = '-';
            columnsResult.textContent = '-';
            colorsResult.textContent = '-';
            evenOddResult.textContent = '-';
            console.log('ورودی‌ها و نتایج پاک شدند.');
        });
    }

    if (analyzeButton) {
        analyzeButton.addEventListener('click', () => {
            clearError();
            if (enteredNumbers.length < MIN_NUMBERS_FOR_ANALYSIS) {
                displayError(`برای شروع تحلیل، حداقل به ${MIN_NUMBERS_FOR_ANALYSIS} شماره نیاز است. شما ${enteredNumbers.length} شماره وارد کرده‌اید.`);
                return;
            }
            console.log('شروع تحلیل با شماره‌های:', enteredNumbers);
            runAnalysis();
        });
    }

    // --- Analysis Functions ---
    function runAnalysis() {
        console.log('اجرای توابع تحلیل...');
        const frequencies = calculateFrequencies(enteredNumbers);
        displayFrequencyTable(frequencies);

        const hot = getHotNumbers(frequencies, 3);
        hotNumbersResult.textContent = hot.length > 0 ? hot.map(item => `${item.number} (${item.count} بار)`).join(', ') : 'اطلاعات کافی نیست';

        const cold = getColdNumbers(frequencies, 3);
        coldNumbersResult.textContent = cold.length > 0 ? cold.map(item => `${item.number} (${item.count} بار)`).join(', ') : 'همه اعداد حداقل یکبار آمده‌اند یا اطلاعات کافی نیست';

        displayDozensAnalysis(analyzeDozens(enteredNumbers), enteredNumbers.length);
        displayColumnsAnalysis(analyzeColumns(enteredNumbers), enteredNumbers.length);
        displayColorsAnalysis(analyzeColors(enteredNumbers), enteredNumbers.length);
        displayEvenOddAnalysis(analyzeEvenOdd(enteredNumbers), enteredNumbers.length);
    }

    function calculateFrequencies(numbers) {
        const freq = new Array(37).fill(0);
        numbers.forEach(num => {
            if (num >= 0 && num <= 36) {
                freq[num]++;
            }
        });
        return freq;
    }

    function displayFrequencyTable(frequencies) {
        frequencyTableBody.innerHTML = '';
        if (!frequencies || frequencies.length === 0) {
            const row = frequencyTableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 2;
            cell.textContent = 'داده‌ای برای نمایش وجود ندارد.';
            return;
        }
        let hasData = false;
        frequencies.forEach((count, number) => {
            const row = frequencyTableBody.insertRow();
            const numberCell = row.insertCell();
            const countCell = row.insertCell();
            numberCell.textContent = number;
            countCell.textContent = count;
            if (count > 0) hasData = true;
        });
        if (!hasData) {
             frequencyTableBody.innerHTML = ''; // Clear again if only zeros
             const row = frequencyTableBody.insertRow();
             const cell = row.insertCell();
             cell.colSpan = 2;
             cell.textContent = 'هنوز شماره‌ای ثبت نشده یا تمام فراوانی‌ها صفر است.';
        }
    }

    function getHotNumbers(frequencies, count) {
        const numberCounts = frequencies.map((c, i) => ({ number: i, count: c }))
            .filter(item => item.count > 0); // Only consider numbers that have appeared

        numberCounts.sort((a, b) => {
            if (b.count === a.count) { // If counts are equal, sort by number for stable sort (optional)
                return a.number - b.number;
            }
            return b.count - a.count; // Sort by count descending
        });
        return numberCounts.slice(0, count);
    }

    function getColdNumbers(frequencies, count) {
        const numberCounts = frequencies.map((c, i) => ({ number: i, count: c }));

        numberCounts.sort((a, b) => {
            if (a.count === b.count) { // If counts are equal
                return a.number - b.number; // Sort by number (smaller numbers first for tie-breaking)
            }
            return a.count - b.count; // Sort by count ascending
        });
        // Filter out numbers that have appeared many times if we only want "truly cold" ones.
        // For this definition, we take the least frequent, including those with 0 appearances.
        return numberCounts.slice(0, count);
    }

    function formatPercentage(count, total) {
        if (total === 0) return '0%';
        return ((count / total) * 100).toFixed(1) + '%';
    }

    function analyzeDozens(numbers) {
        const dozens = { '1st': 0, '2nd': 0, '3rd': 0, 'zero': 0 };
        numbers.forEach(num => {
            if (num === 0) dozens['zero']++;
            else if (num >= 1 && num <= 12) dozens['1st']++;
            else if (num >= 13 && num <= 24) dozens['2nd']++;
            else if (num >= 25 && num <= 36) dozens['3rd']++;
        });
        return dozens;
    }

    function displayDozensAnalysis(dozenData, totalNumbers) {
        let text = `دوجین اول (1-12): ${dozenData['1st']} بار (${formatPercentage(dozenData['1st'], totalNumbers)})`;
        text += ` | دوجین دوم (13-24): ${dozenData['2nd']} بار (${formatPercentage(dozenData['2nd'], totalNumbers)})`;
        text += ` | دوجین سوم (25-36): ${dozenData['3rd']} بار (${formatPercentage(dozenData['3rd'], totalNumbers)})`;
        if(dozenData['zero'] > 0) {
            text += ` | صفر: ${dozenData['zero']} بار (${formatPercentage(dozenData['zero'], totalNumbers)})`;
        }
        dozensResult.textContent = text;
    }

    function analyzeColumns(numbers) {
        const columns = { '1st': 0, '2nd': 0, '3rd': 0, 'zero': 0 };
        numbers.forEach(num => {
            if (num === 0) {
                columns['zero']++;
                return;
            }
            if (num % 3 === 1) columns['1st']++; // 1, 4, ..., 34
            else if (num % 3 === 2) columns['2nd']++; // 2, 5, ..., 35
            else if (num % 3 === 0) columns['3rd']++; // 3, 6, ..., 36
        });
        return columns;
    }

    function displayColumnsAnalysis(columnData, totalNumbers) {
        let text = `ستون اول: ${columnData['1st']} بار (${formatPercentage(columnData['1st'], totalNumbers)})`;
        text += ` | ستون دوم: ${columnData['2nd']} بار (${formatPercentage(columnData['2nd'], totalNumbers)})`;
        text += ` | ستون سوم: ${columnData['3rd']} بار (${formatPercentage(columnData['3rd'], totalNumbers)})`;
         if(columnData['zero'] > 0) {
            text += ` | صفر: ${columnData['zero']} بار (${formatPercentage(columnData['zero'], totalNumbers)})`;
        }
        columnsResult.textContent = text;
    }

    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    // Black numbers are not explicitly needed if we derive them, but good for clarity
    // const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

    function analyzeColors(numbers) {
        const colors = { 'red': 0, 'black': 0, 'green': 0 }; // Green for 0
        numbers.forEach(num => {
            if (num === 0) colors['green']++;
            else if (redNumbers.includes(num)) colors['red']++;
            else colors['black']++; // If not 0 and not red, it's black
        });
        return colors;
    }

    function displayColorsAnalysis(colorData, totalNumbers) {
        let text = `قرمز: ${colorData.red} بار (${formatPercentage(colorData.red, totalNumbers)})`;
        text += ` | سیاه: ${colorData.black} بار (${formatPercentage(colorData.black, totalNumbers)})`;
        text += ` | سبز (0): ${colorData.green} بار (${formatPercentage(colorData.green, totalNumbers)})`;
        colorsResult.textContent = text;
    }

    function analyzeEvenOdd(numbers) {
        const evenOdd = { 'even': 0, 'odd': 0, 'zero': 0 };
        numbers.forEach(num => {
            if (num === 0) {
                evenOdd['zero']++; // Count zero separately
                return;
            }
            if (num % 2 === 0) evenOdd['even']++;
            else evenOdd['odd']++;
        });
        return evenOdd;
    }

    function displayEvenOddAnalysis(evenOddData, totalNumbers) {
        let text = `زوج: ${evenOddData.even} بار (${formatPercentage(evenOddData.even, totalNumbers)})`;
        text += ` | فرد: ${evenOddData.odd} بار (${formatPercentage(evenOddData.odd, totalNumbers)})`;
        if(evenOddData['zero'] > 0) {
             text += ` | صفر: ${evenOddData.zero} بار (${formatPercentage(evenOddData.zero, totalNumbers)})`;
        }
        evenOddResult.textContent = text;
    }

    // Initial setup
    updateEnteredNumbersDisplay();

}); // End DOMContentLoaded
