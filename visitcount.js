window.onload = () => {
    const url = window.location.href
    const functionURL = 'https://whf-functions.azurewebsites.net/api/orc/VisitIncrement?page='

    fetch(url)
        .then((response) => {
            // Splits the URL by / and gets the last item in the array which will be the page name
            let pageName = url.split("/").pop();

            // 404 and index might not show in the URL so they need to be processed in the statement below
            if (response.status == '404') {
                pageName = '404'
            } else if (pageName == '') {
                pageName = 'index'
            } else {
                // Splits the page name by the . and gets the first item which will be the page name without the extension
                pageName = pageName.split('.')[0]
            }

            // Calls the StartVisitIncrement Azure function.
            fetch(functionURL + pageName, {
                method: 'PUT'
            })
                // Takes the response from the fetch, reads it, and returns a JS object.
                .then(funcResponse => funcResponse.json())
                .then(funcData => {
                    let retries = 100;
                    let resultURL = funcData.statusQueryGetUri
                    // Recursively checks for the Azure function result.
                    const checkResult = (url, retries) =>
                        fetch(url)
                            .then(res => {
                                // If status is OK and retries is still positve then return response as JS object to next step.
                                if (res.ok && retries > 0) return res.json();
                                // If retries is more than 0 then retry.
                                if (retries > 0) return checkResult(url, retries - 1);
                                // Throw error if out of retries / no OK status.
                                throw new Error(res.status);
                            })
                            .then((result) => {
                                // If runtimeStatus is not completed then retry fetch.
                                if (result.runtimeStatus !== 'Completed') {
                                    // Updates the visitor counter.
                                    updateVisitCounter();
                                    return checkResult(url, retries - 1);
                                }
                                // Updates the visitor counter with a result.
                                if (!result.output.error) {
                                    updateVisitCounter(result.output.visits);
                                } else {
                                    updateVisitCounter(result.output.error);
                                }
                            })
                            .catch(error => {
                                updateVisitCounter(error);
                                console.error('Failed to get result: ' + error)
                            });

                    // Starts recursive check for Azure functions result.
                    checkResult(resultURL, retries);
                })
                .catch(error => {
                    updateVisitCounter(error);
                    console.log('Failed to run function: ' + error)
                });
        })
        .catch(error => {
            updateVisitCounter(error);
            console.error('Failed to check status: ' + error)
        });
}

// Updates the inner HTML for the counter
function updateVisitCounter(result) {
    const counterEl = document.getElementById('visit_counter');
    // Animates the loading text if no result is provided.
    if (!result) {
        let dots = counterEl.innerHTML.split('.');
        if (dots.length >= 4) {
            counterEl.innerHTML = 'Visitor count: loading';
        } else {
            counterEl.innerHTML = counterEl.innerHTML + '.';
        }
    } else {
        counterEl.innerHTML = 'Visitor count: ' + result;
    }
}