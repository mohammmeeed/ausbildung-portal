// --- STATE & DATA ---
// We simulate a database by storing an array of applications in LocalStorage.
const STORAGE_KEY = 'ausbildung_applications';
let currentLanguage = 'DE';

// --- TRANSLATIONS (i18n) ---
const translations = {
    'DE': {
        'homeTitle': 'Ausbildung Bewerbung Portal',
        'homeDesc': 'Willkommen! Starten Sie Ihre Karriere bei uns mit einer erstklassigen Ausbildung.',
        'homeBtn': 'Bewerbung starten',
        'formTitle': 'Ihre Bewerbung',
        'labelName': 'Vollständiger Name',
        'labelEmail': 'E-Mail',
        'labelAge': 'Alter',
        'labelGerman': 'Deutschkenntnisse',
        'labelField': 'Fachbereich',
        'labelCV': 'Lebenslauf hochladen (PDF)',
        'selectOption': 'Bitte wählen',
        'fieldIT': 'Informatik (IT)',
        'fieldBusiness': 'Wirtschaft (Business)',
        'fieldLogistics': 'Logistik (Logistics)',
        'fieldSales': 'Vertrieb (Sales)',
        'btnSubmit': 'Absenden',
        'errorRequired': 'Bitte ausfüllen',
        'errorEmail': 'Ungültige E-Mail',
        'errorAge': 'Bitte ein gültiges Alter eingeben',
        'errorCV': 'Bitte PDF hochladen',
        'successTitle': 'Vielen Dank für Ihre Bewerbung!',
        'successID': 'Ihre Bewerbungs-ID: ',
        'summaryTitle': 'Zusammenfassung:',
        'btnBack': 'Zurück zur Startseite'
    },
    'FR': {
        'homeTitle': 'Portail de Candidature',
        'homeDesc': 'Bienvenue ! Commencez votre carrière avec nous grâce à une excellente formation.',
        'homeBtn': 'Démarrer la candidature',
        'formTitle': 'Votre Candidature',
        'labelName': 'Nom complet',
        'labelEmail': 'E-Mail',
        'labelAge': 'Âge',
        'labelGerman': 'Niveau d\'Allemand',
        'labelField': 'Domaine',
        'labelCV': 'Télécharger CV (PDF)',
        'selectOption': 'Veuillez choisir',
        'fieldIT': 'Informatique (IT)',
        'fieldBusiness': 'Commerce (Business)',
        'fieldLogistics': 'Logistique (Logistics)',
        'fieldSales': 'Vente (Sales)',
        'btnSubmit': 'Soumettre',
        'errorRequired': 'Champ requis',
        'errorEmail': 'E-Mail invalide',
        'errorAge': 'Veuillez entrer un âge valide',
        'errorCV': 'Veuillez uploader un PDF',
        'successTitle': 'Merci pour votre candidature !',
        'successID': 'Votre ID de candidature: ',
        'summaryTitle': 'Résumé :',
        'btnBack': 'Retour à l\'accueil'
    }
};

// --- DOM ELEMENTS ---
const views = {
    home: document.getElementById('view-home'),
    form: document.getElementById('view-form'),
    success: document.getElementById('view-success'),
    admin: document.getElementById('view-admin')
};

// Navigation buttons
const btnStart = document.getElementById('btn-start');
const btnAdminNav = document.getElementById('admin-nav');
const btnBackHome = document.getElementById('btn-back-home');
const btnAdminHome = document.getElementById('btn-admin-home');

// Form & Inputs
const form = document.getElementById('application-form');
const loader = document.querySelector('.loader');
const btnSubmitText = document.querySelector('#btn-submit .btn-text');

// Controls
const themeToggle = document.getElementById('theme-toggle');
const langToggle = document.getElementById('lang-toggle');


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Check local storage for theme
    if(localStorage.getItem('theme') === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    }
    
    // Setup event listeners
    setupNavigation();
    setupFormValidation();
    setupThemeToggle();
    setupLangToggle();
    
    // Apply initial language
    applyTranslations();
});

// --- ROUTING (Single Page App logic) ---
function navigateTo(viewName) {
    // Hide all views
    Object.values(views).forEach(view => {
        view.classList.remove('active');
        view.classList.add('hidden');
    });
    
    // Show requested view
    views[viewName].classList.remove('hidden');
    views[viewName].classList.add('active');
    
    // If admin view, refresh the table
    if (viewName === 'admin') {
        renderAdminTable();
    }
}

function setupNavigation() {
    btnStart.addEventListener('click', () => navigateTo('form'));
    btnAdminNav.addEventListener('click', () => navigateTo('admin'));
    btnBackHome.addEventListener('click', () => {
        form.reset(); // clear form
        navigateTo('home');
    });
    btnAdminHome.addEventListener('click', () => navigateTo('home'));
}

// --- THEME & LANGUAGE ---
function setupThemeToggle() {
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.body.removeAttribute('data-theme');
            themeToggle.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        }
    });
}

function setupLangToggle() {
    langToggle.addEventListener('click', () => {
        currentLanguage = currentLanguage === 'DE' ? 'FR' : 'DE';
        langToggle.textContent = currentLanguage === 'DE' ? 'FR' : 'DE'; // Button shows the *other* language
        applyTranslations();
    });
}

function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLanguage][key]) {
            el.textContent = translations[currentLanguage][key];
        }
    });
}

// --- FORM VALIDATION & SUBMISSION ---
function setupFormValidation() {
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload
        
        if (validateForm()) {
            submitApplication();
        }
    });

    // Real-time validation removal on input
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            input.parentElement.classList.remove('invalid');
        });
    });
}

function validateForm() {
    let isValid = true;
    
    // Simple utility to mark invalid
    const setInvalid = (id) => {
        document.getElementById(id).parentElement.classList.add('invalid');
        isValid = false;
    };

    // 1. Name
    const name = document.getElementById('fullName').value.trim();
    if (name.length < 2) setInvalid('fullName');

    // 2. Email
    const email = document.getElementById('email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) setInvalid('email');

    // 3. Age
    const age = document.getElementById('age').value;
    if (age < 15 || age > 99) setInvalid('age');

    // 4. German Level
    const level = document.getElementById('germanLevel').value;
    if (!level) setInvalid('germanLevel');

    // 5. Field
    const field = document.getElementById('field').value;
    if (!field) setInvalid('field');

    // 6. CV (just check if a file is selected)
    const cv = document.getElementById('cv').value;
    if (!cv) setInvalid('cv');

    return isValid;
}

function submitApplication() {
    // 1. Show Loading State
    btnSubmitText.style.display = 'none';
    loader.classList.remove('hidden');
    document.getElementById('btn-submit').disabled = true;

    // Simulate network delay (1.5 seconds)
    setTimeout(() => {
        // 2. Gather Data
        const appData = {
            id: 'APP-' + Math.floor(Math.random() * 100000), // Random ID
            name: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            age: document.getElementById('age').value,
            level: document.getElementById('germanLevel').value,
            field: document.getElementById('field').options[document.getElementById('field').selectedIndex].text,
            status: 'Pending', // Default status
            date: new Date().toLocaleDateString()
        };

        // 3. Save to LocalStorage
        saveToStorage(appData);

        // 4. Update Success View
        populateSuccessView(appData);

        // 5. Reset button & form, Navigate
        btnSubmitText.style.display = 'inline';
        loader.classList.add('hidden');
        document.getElementById('btn-submit').disabled = false;
        
        navigateTo('success');
    }, 1500);
}

// --- DATA MANAGEMENT ---
function saveToStorage(appData) {
    let apps = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    apps.push(appData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

function getFromStorage() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

// Expose to window so it can be called from onclick in HTML string
window.updateStatus = function(id, newStatus) {
    let apps = getFromStorage();
    const index = apps.findIndex(app => app.id === id);
    if (index !== -1) {
        apps[index].status = newStatus;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
        renderAdminTable(); // re-render table
    }
}

// --- VIEW UPDATES ---
function populateSuccessView(data) {
    document.getElementById('display-app-id').textContent = data.id;
    
    const summaryList = document.getElementById('summary-list');
    summaryList.innerHTML = `
        <li><strong>Name:</strong> ${data.name}</li>
        <li><strong>Email:</strong> ${data.email}</li>
        <li><strong>Field:</strong> ${data.field}</li>
        <li><strong>German Level:</strong> ${data.level}</li>
    `;
}

function renderAdminTable() {
    const tbody = document.getElementById('admin-tbody');
    const apps = getFromStorage();
    
    tbody.innerHTML = ''; // clear current table
    
    if (apps.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No applications yet.</td></tr>';
        return;
    }

    apps.forEach(app => {
        const tr = document.createElement('tr');
        
        // Status Badge Logic
        let statusClass = 'status-pending';
        if (app.status === 'Accepted') statusClass = 'status-accepted';
        if (app.status === 'Rejected') statusClass = 'status-rejected';

        tr.innerHTML = `
            <td>${app.id}</td>
            <td>${app.name}</td>
            <td>${app.email}</td>
            <td>${app.field}</td>
            <td>${app.level}</td>
            <td><span class="status-badge ${statusClass}">${app.status}</span></td>
            <td class="action-btns">
                ${app.status === 'Pending' ? `
                    <button class="btn-small btn-accept" onclick="updateStatus('${app.id}', 'Accepted')">Accept</button>
                    <button class="btn-small btn-reject" onclick="updateStatus('${app.id}', 'Rejected')">Reject</button>
                ` : '-'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}
