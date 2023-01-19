window.onload = () => {
    document.getElementById("form_submit_btn").addEventListener('click', submitForm, false)

    function submitForm() {
        console.log('here');
        
        const functionURL = 'https://whf-functions.azurewebsites.net/api/SubmitContactForm?';
        let form = new FormData(document.getElementById('contact_form'));

        console.log(form);

        fetch(functionURL, {
            method: 'post',
            body: form,
        })
        .then(response => {
            console.log(response)
        }).catch(error => {
            console.error(error)
        })
    }
}