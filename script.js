const form = document.querySelector("#registrationForm");

const fullName = document.querySelector("#fullName");
const password = document.querySelector("#password");
const confirmPassword = document.querySelector("#confirmPassword");
const birthDate = document.querySelector("#birthDate");

const errorMessage = document.querySelector("#errorMessage");
const successMessage = document.querySelector("#successMessage");

// Prevent selecting a future date of birth
birthDate.max = new Date().toISOString().split("T")[0];

// Check whether both passwords match
function validatePassword() {
    if (password.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity("Passwords do not match.");
    } else {
        confirmPassword.setCustomValidity("");
    }
}

password.addEventListener("input", validatePassword);
confirmPassword.addEventListener("input", validatePassword);

// Clear messages when the user edits the form
form.addEventListener("input", function () {
    errorMessage.textContent = "";
    successMessage.textContent = "";
});

// Handle form submission
form.addEventListener("submit", function (event) {
    event.preventDefault();

    validatePassword();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Read all form fields
    const formData = new FormData(form);
    const user = Object.fromEntries(formData.entries());

    // Do not display passwords
    delete user.password;
    delete user.confirmPassword;
    delete user.terms;

    successMessage.textContent =
        "Registration successful for " + fullName.value + "!";

    errorMessage.textContent = "";

    // Display submitted details in the browser console
    console.log("Registration Details:", user);

    
    // Clear the form
    form.reset();
    confirmPassword.setCustomValidity("");
});

// Handle form reset
form.addEventListener("reset", function () {
    errorMessage.textContent = "";
    successMessage.textContent = "";
});