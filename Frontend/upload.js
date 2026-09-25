console.log("UPLOAD.JS LOADED");

const API_URL = "http://localhost:5000";

const uploadForm = document.getElementById("uploadForm");
const message = document.getElementById("message");

const token = localStorage.getItem("token");

console.log("Upload form:", uploadForm);
console.log("Message element:", message);
console.log("Token exists:", !!token);

// =========================
// CHECK LOGIN
// =========================

if (!token) {


if (message) {
    message.innerHTML = `
        <div class="alert alert-warning">
            Please login before uploading a resource.
        </div>
    `;
}

if (uploadForm) {
    uploadForm.style.display = "none";
}


}

// =========================
// UPLOAD RESOURCE
// =========================

if (uploadForm) {


uploadForm.addEventListener("submit", async function (event) {

    console.log("UPLOAD FORM SUBMITTED");

    event.preventDefault();

    if (!token) {
        return;
    }


    const title =
        document.getElementById("title").value.trim();

    const description =
        document.getElementById("description").value.trim();

    const subject =
        document.getElementById("subject").value.trim();

    const category =
        document.getElementById("category").value;

    const fileInput =
        document.getElementById("file");

    const file =
        fileInput.files[0];


    // =========================
    // VALIDATE FILE
    // =========================

    if (!file) {

        message.innerHTML = `
            <div class="alert alert-danger">
                Please select a file.
            </div>
        `;

        return;
    }


    // =========================
    // MAXIMUM FILE SIZE
    // =========================

    const maxSize =
        10 * 1024 * 1024;

    if (file.size > maxSize) {

        message.innerHTML = `
            <div class="alert alert-danger">
                File size must be less than 10 MB.
            </div>
        `;

        return;
    }


    // =========================
    // ALLOWED FILE TYPES
    // =========================

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
                return fileName.endsWith(extension);
            }
        );


    if (!isAllowed) {

        message.innerHTML = `
            <div class="alert alert-danger">
                Only PDF, PPT, PPTX, PNG, JPG and JPEG files are allowed.
            </div>
        `;

        return;
    }


    // =========================
    // CREATE FORMDATA
    // =========================

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


    // =========================
    // UPLOAD
    // =========================

    try {

        message.innerHTML = `
            <div class="alert alert-info">
                Uploading resource...
            </div>
        `;


        console.log(
            "Sending upload request..."
        );


        const response =
            await fetch(
                `${API_URL}/api/resources/upload`,
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: formData
                }
            );


        const data =
            await response.json();


        console.log(
            "Upload response:",
            data
        );


        if (!response.ok) {

            message.innerHTML = `
                <div class="alert alert-danger">
                    ${
                        data.message ||
                        "Resource upload failed."
                    }
                </div>
            `;

            return;
        }


        // =========================
        // SUCCESS
        // =========================

        message.innerHTML = `
            <div class="alert alert-success">
                Resource uploaded successfully.
                Waiting for admin approval.
            </div>
        `;


        console.log(
            "RESOURCE UPLOADED SUCCESSFULLY"
        );


        uploadForm.reset();


    } catch (error) {

        console.error(
            "Resource upload error:",
            error
        );


        message.innerHTML = `
            <div class="alert alert-danger">
                Cannot connect to Student Hub backend.
            </div>
        `;
    }

});


} else {


console.error(
    "UPLOAD FORM NOT FOUND!"
);


}
