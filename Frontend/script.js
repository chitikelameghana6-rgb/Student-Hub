// Student Hub JavaScript


// =========================
// LOGIN BUTTON
// =========================

const loginButton = document.querySelector(".login-btn");

loginButton.addEventListener("click", function () {
    alert("Login page will open here.");
});


// =========================
// REGISTER BUTTON
// =========================

const registerButton = document.querySelector(".register-btn");

registerButton.addEventListener("click", function () {
    alert("Registration page will open here.");
});


// =========================
// EXPLORE RESOURCES
// =========================

const exploreButton = document.querySelector(".hero-buttons .primary-btn");

exploreButton.addEventListener("click", function () {
    document.querySelector("#resources").scrollIntoView({
        behavior: "smooth"
    });
});


// =========================
// UPLOAD RESOURCE BUTTON
// =========================

const uploadButtons = document.querySelectorAll(
    ".secondary-btn, .cta .primary-btn"
);

uploadButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        alert("Login required to upload a resource.");

    });

});


// =========================
// NAVIGATION
// =========================

const navLinks = document.querySelectorAll(".nav-links a");

navLinks.forEach(function (link) {

    link.addEventListener("click", function (event) {

        event.preventDefault();

        const targetId = link.getAttribute("href");

        const targetSection = document.querySelector(targetId);

        if (targetSection) {

            targetSection.scrollIntoView({
                behavior: "smooth"
            });

        }

    });

});