
// Add this to your JavaScript
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        
        // Add fade-out class to body
        document.body.classList.add('fade-out');
        
        // Navigate after transition
        setTimeout(() => {
            window.location.href = href;
        }, 300);
    });
});

