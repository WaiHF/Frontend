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
                // Returns the function's response after running .json() on recieved data.
                .then(funcResponse => funcResponse.json())
                .then(funcData =>
                    // After 2 seconds try to to visit function's result page.
                    // Maybe can change this to a loop instead of waiting for 2 seconds.
                    setTimeout(() => fetch(funcData.statusQueryGetUri)
                        // Returns the function's result page response after running .json() on recieved data.
                        .then(funcResult => funcResult.json())
                        // Prints the visitor's count.
                        // Need to implement this into the page.
                        .then(result => console.log('There have been ' + result.output.visits + ' to this page.'))
                        .catch(error => console.log('Failed to get function result: ' + error))
                        , 2000))
                .catch(error => console.log('Failed to run function: ' + error));
        })
        .catch(error => console.error('Failed to check status: ' + error));
}
