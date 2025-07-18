// # Bootstrap related server-side form validations

// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
    "use strict";

    bsCustomFileInput.init();

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll(".validated-form"); // can put and use any name

    // Loop over them and prevent submission
    Array.from(forms).forEach((form) => {
        form.addEventListener(
            "submit",
            (event) => {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                form.classList.add("was-validated");
            },
            false
        );
    });
})();
