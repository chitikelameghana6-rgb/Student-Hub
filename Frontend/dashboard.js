console.log("DASHBOARD.JS LOADED");

const API_URL = "http://localhost:5000";

const token = localStorage.getItem("token");

// ===============================
// CHECK LOGIN
// ===============================

if (!token) {
window.location.href = "login.html";
}

// ===============================
// ELEMENTS
// ===============================

const myResourcesContainer =
document.getElementById("myResourcesContainer");

const loading =
document.getElementById("loading");

const noResources =
document.getElementById("noResources");

const downloadHistoryContainer =
document.getElementById("downloadHistoryContainer");

const downloadLoading =
document.getElementById("downloadLoading");

const noDownloads =
document.getElementById("noDownloads");

const myRatingsContainer =
document.getElementById("myRatingsContainer");

const ratingsLoading =
document.getElementById("ratingsLoading");

const noRatings =
document.getElementById("noRatings");

const message =
document.getElementById("message");

const logoutBtn =
document.getElementById("logoutBtn");

const sidebarLogoutBtn =
document.getElementById("sidebarLogoutBtn");

// Summary cards

const totalUploaded =
document.getElementById("totalUploaded");

const totalApproved =
document.getElementById("totalApproved");

const totalPending =
document.getElementById("totalPending");

const totalDownloads =
document.getElementById("totalDownloads");

// ===============================
// LOAD MY RESOURCES
// ===============================

async function loadMyResources() {


try {

    const response = await fetch(
        `${API_URL}/api/resources/my-resources`,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    console.log("My resources response:", data);

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to load your resources"
        );
    }

    if (loading) {
        loading.style.display = "none";
    }

    const resources = data.resources || [];

    if (myResourcesContainer) {
        myResourcesContainer.innerHTML = "";
    }

    // Summary counts

    let approvedCount = 0;
    let pendingCount = 0;
    let downloadCount = 0;

    resources.forEach(function (resource) {

        if (resource.status === "approved") {
            approvedCount++;
        }

        if (resource.status === "pending") {
            pendingCount++;
        }

        downloadCount +=
            Number(resource.download_count || 0);

    });

    if (totalUploaded) {
        totalUploaded.textContent =
            resources.length;
    }

    if (totalApproved) {
        totalApproved.textContent =
            approvedCount;
    }

    if (totalPending) {
        totalPending.textContent =
            pendingCount;
    }

    if (totalDownloads) {
        totalDownloads.textContent =
            downloadCount;
    }

    // No resources

    if (resources.length === 0) {

        if (noResources) {
            noResources.classList.remove("d-none");
        }

        return;
    }

    if (noResources) {
        noResources.classList.add("d-none");
    }

    // Display resources

    resources.forEach(function (resource) {

        const card =
            document.createElement("div");

        card.className =
            "col-md-6 col-lg-4";

        let statusClass =
            "bg-warning text-dark";

        if (resource.status === "approved") {
            statusClass = "bg-success";
        }

        if (resource.status === "rejected") {
            statusClass = "bg-danger";
        }

        card.innerHTML = `

            <div class="card h-100 shadow-sm">

                <div class="card-body">

                    <h5 class="card-title">
                        ${resource.title}
                    </h5>

                    <p class="card-text text-muted">
                        ${
                            resource.description ||
                            "No description available"
                        }
                    </p>

                    <p class="mb-1">
                        <strong>Subject:</strong>
                        ${resource.subject || "N/A"}
                    </p>

                    <p class="mb-1">
                        <strong>Category:</strong>
                        ${resource.category || "N/A"}
                    </p>

                    <p class="mb-1">
                        <strong>File:</strong>
                        ${resource.file_name || "N/A"}
                    </p>

                    <p class="mb-3">
                        <strong>Downloads:</strong>
                        ${resource.download_count || 0}
                    </p>

                    <span class="badge ${statusClass}">
                        ${resource.status}
                    </span>

                </div>

            </div>
        `;

        if (myResourcesContainer) {
            myResourcesContainer.appendChild(card);
        }

    });

} catch (error) {

    console.error(
        "My resources error:",
        error
    );

    if (loading) {
        loading.style.display = "none";
    }

    if (message) {
        message.innerHTML = `
            <div class="alert alert-danger">
                ${error.message}
            </div>
        `;
    }
}


}

// ===============================
// LOAD DOWNLOAD HISTORY
// ===============================

async function loadDownloadHistory() {


try {

    const response = await fetch(
        `${API_URL}/api/resources/download-history`,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    console.log(
        "Download history response:",
        data
    );

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to load download history"
        );
    }

    if (downloadLoading) {
        downloadLoading.style.display = "none";
    }

    const downloads =
        data.downloads || [];

    if (downloadHistoryContainer) {
        downloadHistoryContainer.innerHTML = "";
    }

    if (downloads.length === 0) {

        if (noDownloads) {
            noDownloads.classList.remove("d-none");
        }

        return;
    }

    if (noDownloads) {
        noDownloads.classList.add("d-none");
    }

    downloads.forEach(function (download) {

        const card =
            document.createElement("div");

        card.className =
            "col-md-6 col-lg-4";

        const downloadedDate =
            download.downloaded_at
                ? new Date(
                    download.downloaded_at
                ).toLocaleString()
                : "N/A";

        card.innerHTML = `

            <div class="card h-100 shadow-sm">

                <div class="card-body">

                    <h5 class="card-title">
                        ${download.title}
                    </h5>

                    <p class="mb-1">
                        <strong>Subject:</strong>
                        ${download.subject || "N/A"}
                    </p>

                    <p class="mb-1">
                        <strong>Category:</strong>
                        ${download.category || "N/A"}
                    </p>

                    <p class="mb-1">
                        <strong>File:</strong>
                        ${download.file_name || "N/A"}
                    </p>

                    <p class="text-muted mb-0">
                        <strong>Downloaded:</strong>
                        ${downloadedDate}
                    </p>

                </div>

            </div>
        `;

        if (downloadHistoryContainer) {
            downloadHistoryContainer.appendChild(card);
        }

    });

} catch (error) {

    console.error(
        "Download history error:",
        error
    );

    if (downloadLoading) {
        downloadLoading.style.display = "none";
    }

    if (message) {
        message.innerHTML += `
            <div class="alert alert-danger">
                ${error.message}
            </div>
        `;
    }
}


}

// ===============================
// LOAD MY RATINGS
// ===============================

async function loadMyRatings() {


try {

    const response = await fetch(
        `${API_URL}/api/ratings/my-ratings`,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    console.log(
        "My ratings response:",
        data
    );

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to load your ratings"
        );
    }

    if (ratingsLoading) {
        ratingsLoading.style.display = "none";
    }

    const ratings =
        data.ratings || [];

    if (myRatingsContainer) {
        myRatingsContainer.innerHTML = "";
    }

    if (ratings.length === 0) {

        if (noRatings) {
            noRatings.classList.remove("d-none");
        }

        return;
    }

    if (noRatings) {
        noRatings.classList.add("d-none");
    }

    ratings.forEach(function (rating) {

        const card =
            document.createElement("div");

        card.className =
            "col-md-6 col-lg-4";

        const ratingDate =
            rating.created_at
                ? new Date(
                    rating.created_at
                ).toLocaleString()
                : "N/A";

        const ratingNumber =
            Number(rating.rating) || 0;

        card.innerHTML = `

            <div class="card h-100 shadow-sm">

                <div class="card-body">

                    <h5 class="card-title">
                        ${rating.title}
                    </h5>

                    <p class="mb-1">
                        <strong>Subject:</strong>
                        ${rating.subject || "N/A"}
                    </p>

                    <p class="mb-1">
                        <strong>Category:</strong>
                        ${rating.category || "N/A"}
                    </p>

                    <p class="mb-2">
                        <strong>Your Rating:</strong>
                        ${"⭐".repeat(ratingNumber)}
                        (${ratingNumber}/5)
                    </p>

                    <p class="text-muted mb-0">
                        <strong>Rated:</strong>
                        ${ratingDate}
                    </p>

                </div>

            </div>
        `;

        if (myRatingsContainer) {
            myRatingsContainer.appendChild(card);
        }

    });

} catch (error) {

    console.error(
        "My ratings error:",
        error
    );

    if (ratingsLoading) {
        ratingsLoading.style.display = "none";
    }

    if (message) {
        message.innerHTML += `
            <div class="alert alert-danger">
                ${error.message}
            </div>
        `;
    }
}


}

// ===============================
// LOGOUT FUNCTION
// ===============================

function logout() {


localStorage.removeItem("token");

window.location.href =
    "login.html";


}

// ===============================
// LOGOUT BUTTONS
// ===============================

if (logoutBtn) {


logoutBtn.addEventListener(
    "click",
    logout
);


}

if (sidebarLogoutBtn) {


sidebarLogoutBtn.addEventListener(
    "click",
    logout
);


}

// ===============================
// START DASHBOARD
// ===============================

loadMyResources();

loadDownloadHistory();

loadMyRatings();
