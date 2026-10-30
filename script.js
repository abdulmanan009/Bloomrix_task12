
const form = document.querySelector("#registrationForm");
const submitButton = document.querySelector("#submitButton");
const password = document.querySelector("#password");
const confirmPassword = document.querySelector("#confirmPassword");
const birthDate = document.querySelector("#birthDate");
const about = document.querySelector("#about");
const skillSelect = document.querySelector("#skillSelect");
const skillList = document.querySelector("#skillList");
const skillError = document.querySelector("#skillError");
const formMessage = document.querySelector("#formMessage");
const modal = document.querySelector("#confirmModal");
const notification = document.querySelector("#notification");
const terms = document.querySelector("#terms");

let notificationTimer;
let skills = [];
let modalOpener = null;
let completingRegistration = false;

// Set today's local date as the maximum date of birth.
const today = new Date();
const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
);

birthDate.max = localDate.toISOString().split("T")[0];


// Get a custom validation message for each field.
function getError(input) {
    if (input.validity.valueMissing) {
        return "This field is required.";
    }

    if (input.validity.typeMismatch) {
        return "Please enter a valid email address.";
    }

    if (input.validity.patternMismatch) {
        return "Enter a Pakistani mobile number, e.g. 03001234567.";
    }

    if (input.validity.tooShort) {
        return `Enter at least ${input.minLength} characters.`;
    }

    if (input === birthDate && birthDate.value > birthDate.max) {
        return "Date of birth cannot be in the future.";
    }

    if (input === password && input.value.length < 8) {
        return "Password must contain at least 8 characters.";
    }

    if (
        input === confirmPassword &&
        input.value !== password.value
    ) {
        return "Passwords do not match.";
    }

    return "";
}


// Display validation errors beside the relevant fields.
function validateField(input) {
    const errorElement = document.querySelector(`#${input.id}Error`);

    if (!errorElement) {
        return true;
    }

    const message = getError(input);

    errorElement.textContent = message;

    input.classList.toggle("invalid", Boolean(message));
    input.classList.toggle(
        "valid",
        !message && (input.value !== "" || input.type === "checkbox")
    );

    input.setAttribute("aria-invalid", String(Boolean(message)));

    return !message;
}


// Validate fields when the user types or leaves a field.
const fields = [...form.querySelectorAll(
    "input:not([type=checkbox]), select, textarea"
)];

fields.forEach(input => {
    input.addEventListener("input", () => {
        validateField(input);

        // Recheck confirm password when the original password changes.
        if (input === password && confirmPassword.value) {
            validateField(confirmPassword);
        }

        updateSubmitButton();
    });

    input.addEventListener("blur", () => {
        validateField(input);
        updateSubmitButton();
    });
});


// Password strength feedback.
function updatePasswordStrength() {
    const value = password.value;
    let score = 0;

    if (value.length >= 8) score++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^a-zA-Z0-9]/.test(value)) score++;

    const labels = ["Not entered", "Weak", "Fair", "Good", "Strong"];

    const bar = document.querySelector("#strengthBar");
    const strengthText = document.querySelector("#strengthText");

    bar.style.width = `${score * 25}%`;

    strengthText.textContent =
        `Password strength: ${value ? labels[score] : "Not entered"}`;

    bar.style.background =
        score <= 1 ? "#dc2626" :
        score === 2 ? "#f59e0b" :
        score === 3 ? "#65a30d" : "#16a34a";
}

password.addEventListener("input", updatePasswordStrength);


// About Yourself character counter.
function updateCharacterCount() {
    document.querySelector("#charCount").textContent =
        `${about.value.length} / 200 characters`;
}

about.addEventListener("input", updateCharacterCount);


// Add a selected skill to the dynamic list.
document.querySelector("#addSkill").addEventListener("click", () => {
    const skill = skillSelect.value;

    if (!skill) {
        skillError.textContent = "Please choose a skill first.";
        skillSelect.focus();
        return;
    }

    if (skills.includes(skill)) {
        skillError.textContent = "This skill has already been added.";
        return;
    }

    skills.push(skill);
    skillError.textContent = "";

    renderSkills();
    updateSubmitButton();
});


// Create and display skill elements.
function renderSkills() {
    skillList.replaceChildren();

    skills.forEach(skill => {
        const item = document.createElement("li");
        const name = document.createElement("span");
        const removeButton = document.createElement("button");

        name.textContent = skill;

        removeButton.type = "button";
        removeButton.textContent = "Remove";
        removeButton.className = "remove-skill";
        removeButton.dataset.skill = skill;
        removeButton.setAttribute("aria-label", `Remove ${skill}`);

        item.append(name, removeButton);
        skillList.append(item);
    });
}


// Event delegation: one listener handles all Remove buttons.
skillList.addEventListener("click", event => {
    const button = event.target.closest("button[data-skill]");

    if (!button || !skillList.contains(button)) {
        return;
    }

    skills = skills.filter(
        skill => skill !== button.dataset.skill
    );

    skillError.textContent =
        skills.length > 0 ? "" : "Please add at least one skill.";

    renderSkills();
    updateSubmitButton();
});


// Validate the terms checkbox.
terms.addEventListener("change", () => {
    document.querySelector("#termsError").textContent =
        terms.checked ? "" : "You must agree to the terms.";

    updateSubmitButton();
});


// Check every field without displaying errors immediately.
function isFormValid() {
    const fieldsValid = fields.every(input => {
        if (!input.checkValidity()) {
            return false;
        }

        if (
            input === confirmPassword &&
            input.value !== password.value
        ) {
            return false;
        }

        if (
            input === birthDate &&
            birthDate.value > birthDate.max
        ) {
            return false;
        }

        return true;
    });

    return fieldsValid && terms.checked && skills.length > 0;
}


// Enable or disable the submit button.
function updateSubmitButton() {
    submitButton.disabled = !isFormValid();
}


// Display all validation errors.
function showValidationErrors() {
    fields.forEach(input => validateField(input));

    document.querySelector("#termsError").textContent =
        terms.checked ? "" : "You must agree to the terms.";

    skillError.textContent =
        skills.length > 0 ? "" : "Please add at least one skill.";
}


// Handle form submission without reloading the page.
form.addEventListener("submit", event => {
    event.preventDefault();

    if (!isFormValid()) {
        showValidationErrors();

        const firstInvalid = fields.find(
            input => !validateField(input)
        );

        if (firstInvalid) {
            firstInvalid.focus();
        } else if (!terms.checked) {
            terms.focus();
        } else {
            skillSelect.focus();
        }

        return;
    }

    modalOpener = submitButton;

    const fullName = document.querySelector("#fullName").value;

    document.querySelector("#modalDetails").textContent =
        `Name: ${fullName}. Selected skills: ${skills.join(", ")}.`;

    modal.showModal();
    document.querySelector("#confirmSubmit").focus();
});


// Confirm registration.
document.querySelector("#confirmSubmit").addEventListener("click", () => {
    modal.close();

    formMessage.textContent =
        "Registration completed successfully! This is a demo; your data was not saved.";

    showNotification("Registration completed successfully.");

    // Reset form values and generated UI.
    completingRegistration = true;
    form.reset();

    skills = [];
    renderSkills();

    fields.forEach(input => {
        input.classList.remove("valid", "invalid");
        input.removeAttribute("aria-invalid");

        const error = document.querySelector(`#${input.id}Error`);

        if (error) {
            error.textContent = "";
        }
    });

    document.querySelector("#termsError").textContent = "";
    skillError.textContent = "";

    document.querySelector("#strengthBar").style.width = "0";
    document.querySelector("#strengthText").textContent =
        "Password strength: Not entered";

    updateCharacterCount();

    submitButton.disabled = true;
});


// Cancel the confirmation modal.
document.querySelector("#cancelModal").addEventListener("click", () => {
    modal.close();
});


// Restore focus when the modal closes, including with Escape.
modal.addEventListener("close", () => {
    if (modalOpener && modalOpener.isConnected) {
        modalOpener.focus();
    }
});


// Show a temporary notification using setTimeout.
function showNotification(message) {
    clearTimeout(notificationTimer);

    notification.textContent = message;
    notification.classList.add("show");

    notificationTimer = setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}


// Tabs: switch panels using dataset attributes.
const tabs = document.querySelector(".tabs");

tabs.addEventListener("click", event => {
    const button = event.target.closest("button[data-tab]");

    if (!button || !tabs.contains(button)) {
        return;
    }

    document.querySelectorAll(".tab").forEach(tab => {
        const selected = tab === button;

        tab.classList.toggle("active", selected);
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
    });

    document.querySelectorAll(".tab-panel").forEach(panel => {
        panel.hidden = panel.id !== button.dataset.tab;
    });
});


// Keyboard navigation between tabs.
tabs.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) {
        return;
    }

    const buttons = [...tabs.querySelectorAll("[data-tab]")];
    const current = buttons.indexOf(document.activeElement);

    if (current === -1) {
        return;
    }

    event.preventDefault();

    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next = (current + direction + buttons.length) % buttons.length;

    buttons[next].focus();
    buttons[next].click();
});


// Clear errors and generated UI when Reset Form is clicked.
form.addEventListener("reset", () => {
    // Hide any previous notification.
    clearTimeout(notificationTimer);
    notification.classList.remove("show");
    notification.textContent = "";

    setTimeout(() => {
        skills = [];
        renderSkills();

        fields.forEach(input => {
            input.classList.remove("valid", "invalid");
            input.removeAttribute("aria-invalid");

            const error = document.querySelector(`#${input.id}Error`);

            if (error) {
                error.textContent = "";
            }
        });

        document.querySelector("#termsError").textContent = "";
        skillError.textContent = "";

        // Keep the success message after successful registration.
        if (!completingRegistration) {
            formMessage.textContent = "";
        }

        document.querySelector("#strengthBar").style.width = "0";
        document.querySelector("#strengthText").textContent =
            "Password strength: Not entered";

        updateCharacterCount();

        submitButton.disabled = true;

        completingRegistration = false;
    }, 0);
});


// Initialize the page.
updateCharacterCount();
updatePasswordStrength();

submitButton.disabled = true;


