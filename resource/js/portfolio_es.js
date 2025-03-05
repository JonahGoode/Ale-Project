document.addEventListener("DOMContentLoaded", async function () {
    const gallery = document.querySelector(".gallery");
    const imageBaseUrl = "resource/images/portfolio-photos/Portfolio/"; // Ensure this is correct
    const jsonUrl = "resource/data_es.JSON"; // Your JSON file path
    const maxAttempts = 1000; // Prevent excessive requests (adjust if needed)
    const imagesPerPage = 30; // Number of images to load per batch

    let allImages = [];
    let currentIndex = 0;
    let loadMoreButtonAdded = false;  // Flag to prevent adding multiple buttons

    // Modal Elements
    const modal = document.getElementById("modal");
    const modalImg = document.getElementById("modal-img");
    const modalTitle = document.getElementById("modal-title");
    const modalDescription = document.getElementById("modal-description");
    const closeModal = document.getElementById("close-modal");
    const bwToggleBtn = document.getElementById("bw-toggle"); // The B/W toggle checkbox

    let currentImagePath = ''; // To store the current image path for B/W toggle

    // Try to load images from JSON
    try {
        const response = await fetch(jsonUrl);
        if (!response.ok) throw new Error("JSON file not found");

        const images = await response.json();
        allImages = images.reverse(); // Reverse the array before processing
        loadImages();  // Initial batch load
    } catch (error) {
        console.warn("Could not load JSON file. Falling back to auto-detecting images.");
        
        let imageIndex = 1;
        async function loadImagesFallback() {
            const imagesToLoad = [];
            while (imageIndex <= maxAttempts) {
                const imageUrl = `${imageBaseUrl}${imageIndex}.JPEG`;
                
                try {
                    const response = await fetch(imageUrl, { method: "HEAD" }); // HEAD request to check existence
                    
                    if (!response.ok) break; // Stop if image doesn't exist

                    // Check if the image is in the JSON, if not, create a fallback entry
                    const existingImage = allImages.find(img => img.filename === `${imageIndex}.JPEG`);
                    if (!existingImage) {
                        imagesToLoad.push({ 
                            src: imageUrl, 
                            titleText: `Unknown Image ${imageIndex}`, 
                            descText: `This image does not have metadata in the JSON.` 
                        });
                    }

                    imageIndex++; 
                } catch {
                    break;
                }
            }

            allImages = imagesToLoad.reverse(); // Reverse the imagesToLoad array
            loadImages();  // Initial batch load
        }

        await loadImagesFallback(); // Fallback to loading images
    }

    // Function to create gallery items and append them to the gallery
    function createGalleryItem(src, titleText, descText) {
        const item = document.createElement("div");
        item.classList.add("gallery-item");
        item.setAttribute("data-title", titleText);
        item.setAttribute("data-description", descText);

        const img = document.createElement("img");
        img.src = src;
        img.alt = titleText;

        item.appendChild(img);
        gallery.appendChild(item);

        // Add event listener for opening the modal when an image is clicked
        item.addEventListener('click', async () => {
            currentImagePath = src;
            modalImg.src = src;
            modalTitle.textContent = titleText;
            modalDescription.textContent = descText;

            // Check if BW version exists
            const hasBWVersion = await checkBWVersionExists(src);
            bwToggleBtn.style.display = hasBWVersion ? 'inline-block' : 'none';

            // Reset checkbox state
            bwToggleBtn.checked = false;

            modal.style.display = 'flex';
        });
    }

    // Function to check if BW version exists
    function checkBWVersionExists(imagePath) {
        return new Promise((resolve) => {
            const bwPath = imagePath.replace(/\.[^/.]+$/, 'bw$&');
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = bwPath;
        });
    }

    // Handle B/W toggle
    bwToggleBtn.addEventListener('change', () => {
        const newImage = new Image();

        if (bwToggleBtn.checked) {
            newImage.src = currentImagePath.replace(/\.[^/.]+$/, 'bw$&'); // Switch to B/W
        } else {
            newImage.src = currentImagePath; // Switch to color
        }

        newImage.onload = () => {
            modalImg.style.opacity = '0';
            
            setTimeout(() => {
                modalImg.src = newImage.src;
                modalImg.style.opacity = '1';
            }, 300);
        };
    });

    // Function to load a specific set of images based on the current index
    function loadImages() {
        const imagesToLoad = allImages.slice(currentIndex, currentIndex + imagesPerPage);
        imagesToLoad.forEach(image => {
            const imageUrl = `${imageBaseUrl}${image.filename}`; // Combine the base URL and filename from JSON
            
            // Create gallery items
            createGalleryItem(imageUrl, image.title, image.description);
        });

        currentIndex += imagesPerPage;

        // If there are more images to load, show the "Load More" button
        if (currentIndex < allImages.length) {
            showLoadMoreButton();
        }
    }

    // Function to show the "Load More" button and handle the click event
    function showLoadMoreButton() {
        if (!loadMoreButtonAdded) {  // Ensure the button is added only once
            const loadMoreButton = document.createElement("button");
            loadMoreButton.textContent = "Cargar más";
            loadMoreButton.classList.add("load-more-button");

            // Position the button at the bottom using flex
            const galleryContainer = document.querySelector(".gallery-container");
            galleryContainer.appendChild(loadMoreButton);

            loadMoreButtonAdded = true; // Set flag to prevent adding another button

            loadMoreButton.addEventListener("click", () => {
                loadImages(); // Load next batch of images
                if (currentIndex >= allImages.length) {
                    loadMoreButton.disabled = true; // Disable button if no more images
                    loadMoreButton.textContent = "No More Images";
                }
            });
        }
    }

    // Handle modal close button
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Handle clicking outside modal to close
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Handle image zoom effect in the modal (magnifier)
    const magnifier = document.querySelector(".magnifier");

    modalImg.addEventListener("mousemove", (e) => {
        const rect = modalImg.getBoundingClientRect();
        
        // Get cursor position relative to image
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Show magnifier
        magnifier.style.display = "block";
        
        // Center the magnifier on the cursor by subtracting half of the magnifier's dimensions
        magnifier.style.left = `${e.clientX - (magnifier.offsetWidth)}px`;
        magnifier.style.top = `${e.clientY - (magnifier.offsetHeight)}px`;
    
        // Set background image to the same image as modal but zoomed in
        magnifier.style.backgroundImage = `url(${modalImg.src})`;
        
        // Calculate background position to zoom in on the cursor position
        const bgPosX = (mouseX / rect.width) * 100;
        const bgPosY = (mouseY / rect.height) * 100;
        
        magnifier.style.backgroundPosition = `${bgPosX}% ${bgPosY}%`;
    });

    // Hide magnifier when mouse leaves the image
    modalImg.addEventListener("mouseleave", () => {
        magnifier.style.display = "none";
    });
});
