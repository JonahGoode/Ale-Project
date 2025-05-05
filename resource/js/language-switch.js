document.addEventListener('DOMContentLoaded', function() {
    let currentLang = localStorage.getItem('selectedLanguage') || 'en';
    let translations = {};

    // Function to load language file
    async function loadTranslations(lang) {
        try {
            const response = await fetch(`/resource/js/${lang}.json`);
            if (!response.ok) throw new Error('Translation file not found');
            translations = await response.json();
            updateContent();
        } catch (error) {
            console.error('Error loading translations:', error);
        }
    }

    // Function to get nested object values
    function getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => 
            current && current[key] !== undefined ? current[key] : null, obj);
    }

    // Function to update content
    function updateContent() {
        // Update all elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = getNestedValue(translations, key);
            if (translation) {
                element.textContent = translation;
            }
        });

        // Update alt texts
        document.querySelectorAll('[data-translate-alt]').forEach(element => {
            const key = element.getAttribute('data-translate-alt');
            const translation = getNestedValue(translations, key);
            if (translation) {
                element.alt = translation;
            }
        });

        // Update active language visual
        document.querySelectorAll('.lang-option').forEach(el => {
            el.classList.toggle('active', el.getAttribute('data-lang') === currentLang);
        });
    }

    // Language switcher event listeners
    document.querySelectorAll('.lang-option').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const newLang = e.target.getAttribute('data-lang');
            if (newLang !== currentLang) {
                currentLang = newLang;
                localStorage.setItem('selectedLanguage', currentLang);
                loadTranslations(currentLang);
            }
        });
    });

    // Initial load
    loadTranslations(currentLang);
});

