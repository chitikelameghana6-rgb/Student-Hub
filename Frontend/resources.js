
console.log("RESOURCES.JS LOADED");

const API_URL = "http://localhost:5000";

const resourcesContainer =
    document.getElementById("resources-container");

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

const token =
    localStorage.getItem("token");

let allResources = [];


if (!token) {

    resourcesContainer.innerHTML =
        "<p>Please login to view resources.</p>";

} else {

    loadResources();
}


// Load Approved Resources
async function loadResources() {

    try {

        const response = await fetch(
            `${API_URL}/api/resources/`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data =
            await response.json();


        console.log(
            "Resources response:",
            data
        );


        if (!response.ok) {

            resourcesContainer.innerHTML =
                `<p>${data.message || "Failed to load resources."}</p>`;

            return;
        }


        allResources =
            data.resources || [];


        displayResources(allResources);


    } catch (error) {

        console.error(
            "Resource loading error:",
            error
        );


        resourcesContainer.innerHTML =
            "<p>Cannot connect to Student Hub backend.</p>";
    }
}



// Display Resources
function displayResources(resources) {

    resourcesContainer.innerHTML = "";


    if (
        !Array.isArray(resources) ||
        resources.length === 0
    ) {

        resourcesContainer.innerHTML =
            "<p>No resources found.</p>";

        return;
    }


    resources.forEach(function (resource) {

        const card =
            document.createElement("div");


        card.className =
            "resource-card";


        card.innerHTML = `
            <h3>
                ${resource.title}
            </h3>

            <p>
                ${resource.description || "No description available"}
            </p>

            <p>
                Subject:
                ${resource.subject || "N/A"}
            </p>

            <p>
                Category:
                ${resource.category || "General"}
            </p>

            <p>
                Uploaded By:
                ${resource.uploaded_by || "N/A"}
            </p>

            <p>
                Downloads:
                ${resource.download_count || 0}
            </p>

            <div id="rating-info-${resource.id}">
                Loading rating...
            </div>

            <hr>


            <!-- Rating -->

            <div class="rating-section">

                <p>
                    <strong>
                        Rate this resource:
                    </strong>
                </p>


                <select id="rating-${resource.id}">

                    <option value="">
                        Select rating
                    </option>

                    <option value="1">
                        ⭐ 1
                    </option>

                    <option value="2">
                        ⭐ 2
                    </option>

                    <option value="3">
                        ⭐ 3
                    </option>

                    <option value="4">
                        ⭐ 4
                    </option>

                    <option value="5">
                        ⭐ 5
                    </option>

                </select>


                <button
                    onclick="submitRating(${resource.id})">

                    Submit Rating

                </button>


                <p
                    id="rating-message-${resource.id}">
                </p>

            </div>


            <hr>


            <!-- Download -->

            <button
                onclick="downloadResource(${resource.id})">

                Download

            </button>
        `;


        resourcesContainer.appendChild(card);


        loadRating(resource.id);

    });

}



// Search Resources
function filterResources() {

    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedCategory =
        categoryFilter.value;


    const filteredResources =
        allResources.filter(function (resource) {


            const title =
                (resource.title || "")
                    .toLowerCase();


            const subject =
                (resource.subject || "")
                    .toLowerCase();


            const category =
                resource.category || "";


            const matchesSearch =
                title.includes(searchText) ||
                subject.includes(searchText);


            const matchesCategory =
                selectedCategory === "" ||
                category === selectedCategory;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    displayResources(filteredResources);

}



// Search event
if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterResources
    );

}



// Category event
if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        filterResources
    );

}



// Load Average Rating
async function loadRating(resourceId) {

    const ratingInfo =
        document.getElementById(
            `rating-info-${resourceId}`
        );


    try {

        const response =
            await fetch(
                `${API_URL}/api/ratings/${resourceId}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Rating information:",
            data
        );


        if (!response.ok) {

            ratingInfo.innerHTML =
                "Rating information unavailable.";

            return;
        }


        const average =
            Number(
                data.average_rating
            ).toFixed(1);


        const total =
            data.total_ratings;


        ratingInfo.innerHTML = `
            <p>
                <strong>
                    ⭐ ${average} / 5
                </strong>
            </p>

            <p>
                Total Ratings: ${total}
            </p>
        `;


    } catch (error) {

        console.error(
            "Load rating error:",
            error
        );


        ratingInfo.innerHTML =
            "Rating information unavailable.";
    }

}



// Submit Rating
async function submitRating(resourceId) {

    const ratingSelect =
        document.getElementById(
            `rating-${resourceId}`
        );


    const ratingMessage =
        document.getElementById(
            `rating-message-${resourceId}`
        );


    const rating =
        ratingSelect.value;


    if (!rating) {

        ratingMessage.innerHTML =
            "<span style='color:red;'>Please select a rating.</span>";

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/ratings/${resourceId}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        rating: Number(rating)
                    })
                }
            );


        const data =
            await response.json();


        console.log(
            "Rating response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to submit rating"
            );
        }


        ratingMessage.innerHTML =
            "<span style='color:green;'>Rating submitted successfully! ⭐</span>";


        ratingSelect.value = "";


        loadRating(resourceId);


    } catch (error) {

        console.error(
            "Rating error:",
            error
        );


        ratingMessage.innerHTML =
            `<span style='color:red;'>${error.message}</span>`;
    }

}



// Download Resource
async function downloadResource(resourceId) {

    try {

        console.log(
            "Downloading resource:",
            resourceId
        );


        const response =
            await fetch(
                `${API_URL}/api/resources/download/${resourceId}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {

            const data =
                await response.json();


            throw new Error(
                data.message ||
                "Download failed"
            );
        }


        const blob =
            await response.blob();


        const downloadUrl =
            window.URL.createObjectURL(
                blob
            );


        const link =
            document.createElement("a");


        link.href =
            downloadUrl;


        link.download =
            "resource";


        document.body.appendChild(link);


        link.click();


        link.remove();


        window.URL.revokeObjectURL(
            downloadUrl
        );


        console.log(
            "Resource downloaded successfully"
        );


    } catch (error) {

        console.error(
            "Download error:",
            error
        );


        alert(error.message);
    }

}

