document.addEventListener("DOMContentLoaded", async function () {
    const gallery = document.querySelector(".gallery");
    const imageBaseUrl = "/resource/images/E-commerce/";
    const jsonUrl = "resource/js/e-commerce.json";
    const maxAttempts = 1000;
    const imagesPerPage = 30;

    let allImages = [];
    let originalImages = [];
    let currentIndex = 0;
    let loadMoreButtonAdded = false;
    let currentModalIndex = 0;
    let instructioncount = 0;
    
    // Modal Elements
    const modal = document.getElementById("modal");
    const modalImg = document.getElementById("modal-img");
    const modalTitle = document.getElementById("modal-title");
    const closeModal = document.getElementById("close-modal");
    const prevButton = document.querySelector('.modal-prev');
    const nextButton = document.querySelector('.modal-next');



    function navigateImage(direction) {
        if (direction === 'next') {
            currentModalIndex = (currentModalIndex + 1) % allImages.length;
        } else {
            currentModalIndex = (currentModalIndex - 1 + allImages.length) % allImages.length;
        }
        
        const newImage = allImages[currentModalIndex];
        if (newImage) {
            modalImg.src = `${imageBaseUrl}${newImage.filename}`;
            modalTitle.textContent = newImage.title;
        }
    }

    // Navigation event listeners
    prevButton.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateImage('prev');
    });

    nextButton.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateImage('next');
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
        if (modal.style.display === 'flex') {
            if (e.key === 'ArrowRight') {
                navigateImage('next');
            } else if (e.key === 'ArrowLeft') {
                navigateImage('prev');
            } else if (e.key === 'Escape') {
                modal.style.display = 'none';
            }
        }
    });
    // Try to load images from JSON
    try {
        const response = await fetch(jsonUrl);
        if (!response.ok) throw new Error("JSON file not found");

        const images = await response.json();
        originalImages = images.reverse(); // Store original copy
        allImages = [...originalImages];
        
      
        
        loadImages();
    } catch (error) {
        console.warn("Could not load JSON file. Falling back to auto-detecting images.");
        
        let imageIndex = 1;
        async function loadImagesFallback() {
            const imagesToLoad = [];
            while (imageIndex <= maxAttempts) {
                const imageUrl = `${imageBaseUrl}${imageIndex}.JPEG`;
                
                try {
                    const response = await fetch(imageUrl, { method: "HEAD" });
                    if (!response.ok) break;

                    const existingImage = allImages.find(img => img.filename === `${imageIndex}.JPEG`);
                    if (!existingImage) {
                        imagesToLoad.push({ 
                            src: imageUrl, 
                            titleText: `Image ${imageIndex}`
                        });
                    }
                    imageIndex++;
                } catch {
                    break;
                }
            }

            allImages = imagesToLoad.reverse();
            loadImages();
        }

        await loadImagesFallback();
    }

    function createGalleryItem(src, titleText) {
        const item = document.createElement("div");
        item.classList.add("gallery-item");
        item.setAttribute("data-title", titleText);

        const img = document.createElement("img");
        img.src = src;
        img.alt = titleText;

        item.appendChild(img);
        gallery.appendChild(item);

   item.addEventListener('click', () => {
       // Find the index of the clicked image
       const filename = src.split('/').pop();
       currentModalIndex = allImages.findIndex(img => img.filename === filename);
       
       modalImg.src = src;
       modalTitle.textContent = titleText;
       modal.style.display = 'flex';
       
       // Show the instruction
       showModalInstruction();
   });
   
    }

    function loadImages() {
        const imagesToLoad = allImages.slice(currentIndex, currentIndex + imagesPerPage);
        imagesToLoad.forEach(image => {
            const imageUrl = `${imageBaseUrl}${image.filename}`;
            createGalleryItem(imageUrl, image.title);
        });

        currentIndex += imagesPerPage;

        if (currentIndex < allImages.length) {
            showLoadMoreButton();
        }
    }

    function showLoadMoreButton() {
        if (!loadMoreButtonAdded) {
            const loadMoreButton = document.createElement("button");
            loadMoreButton.textContent = "Load More";
            loadMoreButton.classList.add("load-more-button");

            const galleryContainer = document.querySelector(".gallery-container");
            galleryContainer.appendChild(loadMoreButton);

            loadMoreButtonAdded = true;

            loadMoreButton.addEventListener("click", () => {
                loadImages();
                if (currentIndex >= allImages.length) {
                    loadMoreButton.disabled = true;
                    loadMoreButton.textContent = "No More Images";
                }
            });
        }
    }

    // Modal event listeners
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Magnifier functionality
    const magnifier = document.querySelector(".magnifier");

    function handleMagnifier(e) {
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        const rect = modalImg.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        
        if (mouseX >= 0 && mouseX <= rect.width && mouseY >= 0 && mouseY <= rect.height) {
            magnifier.style.display = "block";
            
            const magnifierWidth = magnifier.offsetWidth;
            const magnifierHeight = magnifier.offsetHeight;
            
            const touchOffset = e.type.includes('touch') ? 70 : 0;
            
            let left = clientX - (magnifierWidth / 2);
            let top = clientY - (magnifierHeight / 2);
            
            if (left < 0) left = 0;
            if (left + magnifierWidth > window.innerWidth) {
                left = window.innerWidth - magnifierWidth;
            }
            if (top < 0) {
                top = 0;
            }
            if (top + magnifierHeight > window.innerHeight) {
                top = window.innerHeight - magnifierHeight;
            }
            
            magnifier.style.left = `${left}px`;
            magnifier.style.top = `${top}px`;
            
            const bgX = (mouseX / rect.width) * 100;
            const bgY = (mouseY / rect.height) * 100;
            
            magnifier.style.backgroundImage = `url(${modalImg.src})`;
            magnifier.style.backgroundPosition = `${bgX}% ${bgY}%`;
        } else {
            magnifier.style.display = "none";
        }
    }

    function hideMagnifier() {
        magnifier.style.display = "none";
    }

    // Mouse events
    modalImg.addEventListener("mousemove", handleMagnifier);
    modalImg.addEventListener("mouseleave", hideMagnifier);

    // Touch events
    modalImg.addEventListener("touchstart", handleMagnifier);
    modalImg.addEventListener("touchmove", (e) => {
        e.preventDefault();
        handleMagnifier(e);
    });
    modalImg.addEventListener("touchend", hideMagnifier);

    // Prevent default touch behavior
    modalImg.addEventListener("touchstart", (e) => e.preventDefault());


// Add this after your modal elements declarations
const styles = `
.modal-instruction {
    position: absolute;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    z-index: 1000;
    text-align: center;
    animation: fadeInOut 5s forwards;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    font-family: Urbanist, sans-serif;
    font-size: 16px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

@keyframes fadeInOut {
    0% { opacity: 0; transform: translate(-50%, -20px); }
    10% { opacity: 1; transform: translate(-50%, 0); }
    90% { opacity: 1; transform: translate(-50%, 0); }
    100% { opacity: 0; transform: translate(-50%, -20px); }
}`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Add this function after the styles
function showModalInstruction() {
    // Remove any existing instruction first
    const existingInstruction = modal.querySelector('.modal-instruction');
    if (existingInstruction) {
        existingInstruction.remove();
    }

    if (instructioncount > 0) {
        return; 
    }
    instructioncount++;

    const instruction = document.createElement('div');
    instruction.classList.add('modal-instruction');

    // Check if device is mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Get current language from localStorage or default to 'en'
    const currentLang = localStorage.getItem('selectedLanguage') || 'en';
    
    // Fetch translations
    fetch(`resource/js/${currentLang}.json`)
        .then(response => response.json())
        .then(translations => {
            const instructionText = isMobile ? 
                translations.modal.instruction.mobile : 
                translations.modal.instruction.desktop;
            
            instruction.textContent = instructionText;
            modal.appendChild(instruction);
        })
        .catch(error => {
            console.error('Error loading translations:', error);
            // Fallback to English if translation fails
            instruction.textContent = isMobile ? 
                "Swipe across image to magnify" : 
                "Hover over the image to magnify";
            modal.appendChild(instruction);
        });

    setTimeout(() => {
        if (instruction.parentElement) {
            instruction.remove();
        }
    }, 5000); // 5 seconds
}
});