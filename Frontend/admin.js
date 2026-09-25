console.log("ADMIN JS LOADED");

const API_URL = "http://localhost:5000";

// =========================
// TOKEN
// =========================

function getToken() {
return localStorage.getItem("token");
}

// =========================
// ELEMENTS
// =========================

const resourcesContainer =
document.getElementById("resourcesContainer");

const approvedResourcesContainer =
document.getElementById("approvedResourcesContainer");

const rejectedResourcesContainer =
document.getElementById("rejectedResourcesContainer");

const ratingsContainer =
document.getElementById("ratingsContainer");

const usersContainer =
document.getElementById("usersContainer");

const loading =
document.getElementById("loading");

const noResources =
document.getElementById("noResources");

const message =
document.getElementById("message");

const logoutBtn =
document.getElementById("logoutBtn");

const pendingCount =
document.getElementById("pendingCount");

const sidebarPendingCount =
document.getElementById("sidebarPendingCount");

const totalResources =
document.getElementById("totalResources");

const totalPending =
document.getElementById("totalPending");

const totalApproved =
document.getElementById("totalApproved");

const totalRejected =
document.getElementById("totalRejected");

const resourceSearch =
document.getElementById("resourceSearch");

const resourceStatusFilter =
document.getElementById("resourceStatusFilter");

const adminUploadForm =
document.getElementById("adminUploadForm");

const uploadMessage =
document.getElementById("uploadMessage");

// =========================
// LOGIN CHECK
// =========================

if (!getToken()) {
window.location.href = "login.html";
}

// =========================
// MESSAGE
// =========================

function showMessage(text, type = "success") {


if (!message) return;

message.innerHTML = `
    <div class="alert alert-${type}">
        ${text}
    </div>
`;


}

// =========================
// CREATE RESOURCE CARD
// =========================

function createResourceCard(resource, showActions = false) {


const card =
    document.createElement("div");

card.className = "resource-card";

const status =
    resource.status || "approved";

// Support both possible ID names
const resourceId =
    resource.id || resource.resource_id;

console.log(
    "Creating resource card:",
    resource.title,
    "ID:",
    resourceId
);

card.innerHTML = `

    <div class="resource-card-header">

        <span class="resource-status">
            ${status.toUpperCase()}
        </span>

    </div>

    <h4>
        ${resource.title || "Untitled Resource"}
    </h4>

    <p class="resource-description">
        ${
            resource.description ||
            "No description available"
        }
    </p>

    <div class="resource-details">

        <p>
            <strong>Subject:</strong>
            ${resource.subject || "N/A"}
        </p>

        <p>
            <strong>Category:</strong>
            ${resource.category || "N/A"}
        </p>

        <p>
            <strong>File:</strong>
            ${resource.file_name || "N/A"}
        </p>

        <p>
            <strong>Uploaded By:</strong>
            ${resource.uploaded_by || "N/A"}
        </p>

        <p>
            <strong>Downloads:</strong>
            ${resource.download_count || 0}
        </p>

    </div>

    ${
        showActions
            ? `
                <div class="resource-actions">

                    <button
                        type="button"
                        class="approve-btn"
                        onclick="approveResource(${resourceId})">
                        ✓ Approve
                    </button>

                    <button
                        type="button"
                        class="reject-btn"
                        onclick="rejectResource(${resourceId})">
                        ✕ Reject
                    </button>

                </div>
            `
            : ""
    }

`;

return card;


}

// =========================
// LOAD DASHBOARD STATS
// =========================

async function loadStats() {


try {

    const response =
        await fetch(
            `${API_URL}/api/admin/stats`,
            {
                method: "GET",
                headers: {
                    "Authorization":
                        `Bearer ${getToken()}`
                }
            }
        );

    const data =
        await response.json();

    console.log(
        "Admin stats:",
        data
    );

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Failed to load statistics"
        );
    }

    const stats =
        data.stats || {};

    if (totalResources) {
        totalResources.innerText =
            stats.total_resources || 0;
    }

    if (totalPending) {
        totalPending.innerText =
            stats.pending_resources || 0;
    }

    if (totalApproved) {
        totalApproved.innerText =
            stats.approved_resources || 0;
    }

    if (totalRejected) {
        totalRejected.innerText =
            stats.rejected_resources || 0;
    }

    if (sidebarPendingCount) {
        sidebarPendingCount.innerText =
            stats.pending_resources || 0;
    }

    if (pendingCount) {
        pendingCount.innerText =
            `${stats.pending_resources || 0} Pending`;
    }

} catch (error) {

    console.error(
        "Stats error:",
        error
    );
}


}

// =========================
// LOAD PENDING RESOURCES
// =========================

async function loadPendingResources() {


if (loading) {
    loading.style.display = "block";
}

if (noResources) {
    noResources.classList.add("d-none");
}

try {

    const response =
        await fetch(
            `${API_URL}/api/admin/pending`,
            {
                method: "GET",
                headers: {
                    "Authorization":
                        `Bearer ${getToken()}`
                }
            }
        );

    const data =
        await response.json();

    console.log(
        "Pending resources:",
        data
    );

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Failed to load pending resources"
        );
    }

    const resources =
        Array.isArray(data.resources)
            ? data.resources
            : [];

    if (resourcesContainer) {
        resourcesContainer.innerHTML = "";
    }

    if (pendingCount) {
        pendingCount.innerText =
            `${resources.length} Pending`;
    }

    if (sidebarPendingCount) {
        sidebarPendingCount.innerText =
            resources.length;
    }

    if (totalPending) {
        totalPending.innerText =
            resources.length;
    }

    if (resources.length === 0) {

        if (noResources) {
            noResources.classList.remove(
                "d-none"
            );
        }

        return;
    }

    resources.forEach(
        function (resource) {

            const card =
                createResourceCard(
                    {
                        ...resource,
                        status: "pending"
                    },
                    true
                );

            if (resourcesContainer) {
                resourcesContainer.appendChild(
                    card
                );
            }
        }
    );

} catch (error) {

    console.error(
        "Pending resources error:",
        error
    );

    showMessage(
        error.message,
        "danger"
    );

} finally {

    if (loading) {
        loading.style.display = "none";
    }
}


}

// =========================
// LOAD APPROVED RESOURCES
// =========================

async function loadApprovedResources() {


try {

    const response =
        await fetch(
            `${API_URL}/api/admin/approved`,
            {
                method: "GET",
                headers: {
                    "Authorization":
                        `Bearer ${getToken()}`
                }
            }
        );

    const data =
        await response.json();

    console.log(
        "Approved resources:",
        data
    );

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Failed to load approved resources"
        );
    }

    const resources =
        Array.isArray(data.resources)
            ? data.resources
            : [];

    if (!approvedResourcesContainer) {
        return;
    }

    approvedResourcesContainer.innerHTML = "";

    if (resources.length === 0) {

        approvedResourcesContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <h5>No Approved Resources</h5>
                <p>No approved resources available.</p>
            </div>
        `;

        return;
    }

    resources.forEach(
        function (resource) {

            approvedResourcesContainer.appendChild(
                createResourceCard(
                    {
                        ...resource,
                        status: "approved"
                    }
                )
            );
        }
    );

} catch (error) {

    console.error(
        "Approved resources error:",
        error
    );
}


}

// =========================
// LOAD REJECTED RESOURCES
// =========================

async function loadRejectedResources() {


try {

    const response =
        await fetch(
            `${API_URL}/api/admin/rejected`,
            {
                method: "GET",
                headers: {
                    "Authorization":
                        `Bearer ${getToken()}`
                }
            }
        );

    const data =
        await response.json();

    console.log(
        "Rejected resources:",
        data
    );

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Failed to load rejected resources"
        );
    }

    const resources =
        Array.isArray(data.resources)
            ? data.resources
            : [];

    if (!rejectedResourcesContainer) {
        return;
    }

    rejectedResourcesContainer.innerHTML = "";

    if (resources.length === 0) {

        rejectedResourcesContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <h5>No Rejected Resources</h5>
                <p>No rejected resources available.</p>
            </div>
        `;

        return;
    }

    resources.forEach(
        function (resource) {

            rejectedResourcesContainer.appendChild(
                createResourceCard(
                    {
                        ...resource,
                        status: "rejected"
                    }
                )
            );
        }
    );

} catch (error) {

    console.error(
        "Rejected resources error:",
        error
    );
}


}

// =========================
// LOAD RATINGS
// =========================

async function loadRatings() {


try {

    const response =
        await fetch(
            `${API_URL}/api/admin/ratings`,
            {
                method: "GET",
                headers: {
                    "Authorization":
                        `Bearer ${getToken()}`
                }
            }
        );

    const data =
        await response.json();

    console.log(
        "Ratings:",
        data
    );

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Failed to load ratings"
        );
    }

    const ratings =
        Array.isArray(data.ratings)
            ? data.ratings
            : [];

    if (!ratingsContainer) {
        return;
    }

    ratingsContainer.innerHTML = "";

    if (ratings.length === 0) {

        ratingsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⭐</div>
                <h5>No Ratings Yet</h5>
                <p>No ratings have been submitted.</p>
            </div>
        `;

        return;
    }

    ratings.forEach(
        function (rating) {

            const card =
                document.createElement("div");

            card.className =
                "resource-card";

            card.innerHTML = `

                <h4>
                    ⭐ ${rating.rating}/5
                </h4>

                <p>
                    <strong>Resource:</strong>
                    ${rating.resource_title || "N/A"}
                </p>

                <p>
                    <strong>User:</strong>
                    ${rating.user_name || "N/A"}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${rating.user_email || "N/A"}
                </p>

            `;

            ratingsContainer.appendChild(
                card
            );
        }
    );

} catch (error) {

    console.error(
        "Ratings error:",
        error
    );
}


}

// =========================
// LOAD USERS
// =========================

async function loadUsers() {


try {

    const response =
        await fetch(
            `${API_URL}/api/admin/users`,
            {
                method: "GET",
                headers: {
                    "Authorization":
                        `Bearer ${getToken()}`
                }
            }
        );

    const data =
        await response.json();

    console.log(
        "Users:",
        data
    );

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Failed to load users"
        );
    }

    const users =
        Array.isArray(data.users)
            ? data.users
            : [];

    if (!usersContainer) {
        return;
    }

    usersContainer.innerHTML = "";

    if (users.length === 0) {

        usersContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👥</div>
                <h5>No Users Found</h5>
                <p>No registered users found.</p>
            </div>
        `;

        return;
    }

    const table =
        document.createElement("table");

    table.className =
        "table table-hover align-middle";

    table.innerHTML = `

        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
            </tr>
        </thead>

        <tbody></tbody>

    `;

    const tbody =
        table.querySelector("tbody");

    users.forEach(
        function (user) {

            const row =
                document.createElement("tr");

            row.innerHTML = `

                <td>
                    ${user.id}
                </td>

                <td>
                    ${user.name || "N/A"}
                </td>

                <td>
                    ${user.email || "N/A"}
                </td>

                <td>
                    <span class="badge bg-primary">
                        ${user.role || "user"}
                    </span>
                </td>

            `;

            tbody.appendChild(
                row
            );
        }
    );

    usersContainer.appendChild(
        table
    );

} catch (error) {

    console.error(
        "Users error:",
        error
    );
}


}

// =========================
// APPROVE RESOURCE
// =========================

async function approveResource(id) {


console.log(
    "APPROVE CLICKED. Resource ID:",
    id
);

if (!id || id === "undefined") {

    showMessage(
        "Resource ID is missing.",
        "danger"
    );

    return;
}

try {

    const response =
        await fetch(
            `${API_URL}/api/admin/approve/${id}`,
            {
                method: "PUT",
                headers: {
                    "Authorization":
                        `Bearer ${getToken()}`
                }
            }
        );

    const data =
        await response.json();

    console.log(
        "Approve response:",
        data
    );

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Failed to approve resource"
        );
    }

    showMessage(
        "Resource approved successfully!",
        "success"
    );

    await Promise.all([
        loadPendingResources(),
        loadApprovedResources(),
        loadStats()
    ]);

} catch (error) {

    console.error(
        "Approve error:",
        error
    );

    showMessage(
        error.message,
        "danger"
    );
}


}

// =========================
// REJECT RESOURCE
// =========================

async function rejectResource(id) {


console.log(
    "REJECT CLICKED. Resource ID:",
    id
);

if (!id || id === "undefined") {

    showMessage(
        "Resource ID is missing.",
        "danger"
    );

    return;
}

try {

    const response =
        await fetch(
            `${API_URL}/api/admin/reject/${id}`,
            {
                method: "PUT",
                headers: {
                    "Authorization":
                        `Bearer ${getToken()}`
                }
            }
        );

    const data =
        await response.json();

    console.log(
        "Reject response:",
        data
    );

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Failed to reject resource"
        );
    }

    showMessage(
        "Resource rejected successfully!",
        "success"
    );

    await Promise.all([
        loadPendingResources(),
        loadRejectedResources(),
        loadStats()
    ]);

} catch (error) {

    console.error(
        "Reject error:",
        error
    );

    showMessage(
        error.message,
        "danger"
    );
}


}

// IMPORTANT:
// Make functions available to inline HTML onclick
window.approveResource = approveResource;
window.rejectResource = rejectResource;

// =========================
// ADMIN UPLOAD
// =========================

if (adminUploadForm) {


adminUploadForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const title =
            document.getElementById(
                "adminTitle"
            ).value.trim();

        const subject =
            document.getElementById(
                "adminSubject"
            ).value.trim();

        const category =
            document.getElementById(
                "adminCategory"
            ).value;

        const description =
            document.getElementById(
                "adminDescription"
            ).value.trim();

        const file =
            document.getElementById(
                "adminFile"
            ).files[0];

        if (!title || !subject || !category) {

            uploadMessage.innerHTML = `
                <div class="alert alert-danger">
                    Title, subject and category are required.
                </div>
            `;

            return;
        }

        if (!file) {

            uploadMessage.innerHTML = `
                <div class="alert alert-danger">
                    Please select a file.
                </div>
            `;

            return;
        }

        const allowedExtensions = [
            ".pdf",
            ".ppt",
            ".pptx",
            ".png",
            ".jpg",
            ".jpeg"
        ];

        const fileName =
            file.name.toLowerCase();

        const isAllowed =
            allowedExtensions.some(
                function (extension) {
                    return fileName.endsWith(
                        extension
                    );
                }
            );

        if (!isAllowed) {

            uploadMessage.innerHTML = `
                <div class="alert alert-danger">
                    Only PDF, PPT, PPTX, PNG, JPG and JPEG files are allowed.
                </div>
            `;

            return;
        }

        if (file.size > 10 * 1024 * 1024) {

            uploadMessage.innerHTML = `
                <div class="alert alert-danger">
                    File size must be less than 10 MB.
                </div>
            `;

            return;
        }

        const formData =
            new FormData();

        formData.append(
            "title",
            title
        );

        formData.append(
            "description",
            description
        );

        formData.append(
            "subject",
            subject
        );

        formData.append(
            "category",
            category
        );

        formData.append(
            "file",
            file
        );

        uploadMessage.innerHTML = `
            <div class="alert alert-info">
                Uploading resource...
            </div>
        `;

        try {

            const response =
                await fetch(
                    `${API_URL}/api/resources/admin-upload`,
                    {
                        method: "POST",
                        headers: {
                            "Authorization":
                                `Bearer ${getToken()}`
                        },
                        body: formData
                    }
                );

            const data =
                await response.json();

            console.log(
                "Admin upload response:",
                data
            );

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Resource upload failed"
                );
            }

            uploadMessage.innerHTML = `
                <div class="alert alert-success">
                    Resource uploaded and approved successfully!
                </div>
            `;

            adminUploadForm.reset();

            await Promise.all([
                loadApprovedResources(),
                loadPendingResources(),
                loadStats()
            ]);

        } catch (error) {

            console.error(
                "Admin upload error:",
                error
            );

            uploadMessage.innerHTML = `
                <div class="alert alert-danger">
                    ${error.message}
                </div>
            `;
        }
    }
);


}

// =========================
// SEARCH + FILTER
// =========================

function filterResources() {


const searchText =
    resourceSearch
        ? resourceSearch.value
            .toLowerCase()
            .trim()
        : "";

const selectedStatus =
    resourceStatusFilter
        ? resourceStatusFilter.value
        : "";

const cards =
    document.querySelectorAll(
        ".resource-card"
    );

cards.forEach(
    function (card) {

        const text =
            card.innerText.toLowerCase();

        const matchesSearch =
            text.includes(searchText);

        const matchesStatus =
            selectedStatus === "" ||
            text.includes(
                selectedStatus.toLowerCase()
            );

        card.style.display =
            matchesSearch &&
            matchesStatus
                ? "block"
                : "none";
    }
);


}

if (resourceSearch) {


resourceSearch.addEventListener(
    "input",
    filterResources
);


}

if (resourceStatusFilter) {


resourceStatusFilter.addEventListener(
    "change",
    filterResources
);


}

// =========================
// SIDEBAR ACTIVE ITEM
// =========================

const menuItems =
document.querySelectorAll(
".menu-item"
);

menuItems.forEach(
function (item) {


    item.addEventListener(
        "click",
        function () {

            menuItems.forEach(
                function (menu) {

                    menu.classList.remove(
                        "active"
                    );
                }
            );

            item.classList.add(
                "active"
            );
        }
    );
}


);

// =========================
// LOGOUT
// =========================

if (logoutBtn) {


logoutBtn.addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "token"
        );

        window.location.href =
            "login.html";
    }
);


}

// =========================
// START ADMIN DASHBOARD
// =========================

async function initializeAdminDashboard() {


console.log(
    "Initializing Admin Dashboard..."
);

await Promise.all([
    loadStats(),
    loadPendingResources(),
    loadApprovedResources(),
    loadRejectedResources(),
    loadRatings(),
    loadUsers()
]);

console.log(
    "Admin Dashboard Loaded."
);


}

initializeAdminDashboard();
