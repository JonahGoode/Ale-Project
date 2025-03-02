const galleryItems = document.querySelectorAll('.gallery-item');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const closeModal = document.getElementById('close-modal');

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const imageSrc = item.querySelector('img').src;
        const title = item.getAttribute('data-title');
        const description = item.getAttribute('data-description');
        
        
        modalImg.src = imageSrc;
        modalTitle.textContent = title;
        modalDescription.textContent = description;
        modal.style.display = 'flex';
    });
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.querySelector('.gallery');
    const galleryItems = Array.from(gallery.children);   
    galleryItems.reverse().forEach(item => gallery.appendChild(item));
});

document.addEventListener("DOMContentLoaded", () => {
    const modalImg = document.getElementById("modal-img");
    const magnifier = document.querySelector(".magnifier");

    modalImg.addEventListener("mousemove", (e) => {
        const rect = modalImg.getBoundingClientRect();
        
        // Get cursor position relative to image
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Show magnifier
        magnifier.style.display = "block";
        magnifier.style.left = `${e.clientX - magnifier.offsetWidth}px`;
        magnifier.style.top = `${e.clientY - magnifier.offsetHeight}px`;

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