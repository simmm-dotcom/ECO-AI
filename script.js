let model;
let selectedImage = false;

const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const classifyBtn = document.getElementById("classifyBtn");
const resetBtn = document.getElementById("resetBtn");
const statusText = document.getElementById("status");
const result = document.getElementById("result");

const wasteData = {
    Plastic: {
        description: "Plastic waste includes bottles, containers and packaging.",
        disposal: "Clean and place recyclable plastic in the designated recycling bin."
    },
    Paper: {
        description: "Paper waste includes newspapers, envelopes and paper products.",
        disposal: "Keep paper dry and place it in the paper recycling bin."
    },
    Metal: {
        description: "Metal waste includes cans and metal containers.",
        disposal: "Separate metal items and send them for metal recycling."
    },
    Glass: {
        description: "Glass waste includes bottles and glass containers.",
        disposal: "Handle carefully and place in a glass recycling collection point."
    },
    Organic: {
        description: "Organic waste includes food scraps and plant materials.",
        disposal: "Place in an organic waste bin or use for composting."
    },
    E_Waste: {
        description: "Electronic waste includes discarded electronic products.",
        disposal: "Take electronic items to an authorized e-waste collection centre."
    },
    Other: {
        description: "The object could not be confidently assigned to a supported waste category.",
        disposal: "Check local waste guidelines before disposal."
    }
};

// Convert recognized object labels into waste categories
function getCategory(label) {
    const word = label.toLowerCase();

    if (/bottle|water jug|plastic bag|plastic wrap|plastic container|pop bottle/.test(word))
        return "Plastic";

    if (/can opener|can|tin|aluminum|steel|metal/.test(word))
        return "Metal";

    if (/wine bottle|beer bottle|glassware|goblet|jar/.test(word))
        return "Glass";

    if (/envelope|book|newspaper|paper towel|carton|cardboard/.test(word))
        return "Paper";

    if (/banana|apple|orange|lemon|broccoli|cabbage|vegetable|food/.test(word))
        return "Organic";

    if (/computer|laptop|keyboard|mouse|telephone|remote control/.test(word))
        return "E_Waste";

    return "Other";
}

// Load the AI model
async function loadModel() {
    try {
        statusText.textContent = "Loading AI model... Please wait.";

        model = await mobilenet.load();

        statusText.textContent = "AI model loaded! Upload an image.";
    } catch (error) {
        statusText.textContent = "Model loading failed. Check your internet connection.";
        console.error(error);
    }
}

loadModel();

// Image upload and preview
imageInput.addEventListener("change", function() {
    const file = this.files[0];

    result.style.display = "none";
    selectedImage = false;

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image.");
        this.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        preview.src = event.target.result;
        preview.style.display = "block";
        selectedImage = true;
        statusText.textContent = "Image uploaded successfully!";
    };

    reader.readAsDataURL(file);
});

// Classify image
classifyBtn.addEventListener("click", async function() {

    if (!selectedImage) {
        alert("Please upload an image first!");
        return;
    }

    if (!model) {
        alert("AI model is still loading. Please wait.");
        return;
    }

    statusText.textContent = "Analyzing image...";

    try {
        const predictions = await model.classify(preview, 5);

        let best = null;

        // Select the highest-confidence prediction
        for (const prediction of predictions) {
            const category = getCategory(prediction.className);

            if (category !== "Other") {
                best = {
                    ...prediction,
                    category: category
                };
                break;
            }
        }

        // If no supported category is found
        if (!best) {
            best = {
                category: "Other",
                className: predictions[0].className,
                probability: predictions[0].probability
            };
        }

        const data = wasteData[best.category];

        document.getElementById("category").textContent =
            best.category.replace("_", " ");

        document.getElementById("confidence").textContent =
            "Recognition confidence: " +
            (best.probability * 100).toFixed(2) + "%";

        document.getElementById("description").textContent =
            "Description: " + data.description;

        document.getElementById("disposal").textContent =
            "Disposal Suggestion: " + data.disposal;

        result.style.display = "block";
        statusText.textContent = "Classification completed!";

        result.scrollIntoView({ behavior: "smooth" });

    } catch (error) {
        statusText.textContent = "Image classification failed. Try another image.";
        console.error(error);
    }
});

// Reset application
resetBtn.addEventListener("click", function() {
    imageInput.value = "";
    preview.src = "";
    preview.style.display = "none";
    result.style.display = "none";
    selectedImage = false;

    statusText.textContent = model
        ? "Ready to classify another image."
        : "AI model is loading...";
});