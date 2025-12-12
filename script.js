// State
let currentFilter = 'all';
let currentView = 'compact';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const categoryFilters = document.getElementById('categoryFilters');
const pdfGrid = document.getElementById('pdfGrid');
const emptyState = document.getElementById('emptyState');
const themeToggle = document.getElementById('themeToggle');
const pdfModal = document.getElementById('pdfModal');
const pdfViewer = document.getElementById('pdfViewer');
const modalTitle = document.getElementById('modalTitle');
const closeModal = document.getElementById('closeModal');
const openNewTab = document.getElementById('openNewTab');
const totalDocs = document.getElementById('totalDocs');
const totalCategories = document.getElementById('totalCategories');
const totalSize = document.getElementById('totalSize');

// Initialize
function init() {
    loadTheme();
    generateCategoryFilters();
    updateStats();
    renderPDFs();
    setupEventListeners();
}

// Theme Management
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'dark';
}

function toggleTheme() {
    const newTheme = themeToggle.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Generate category filter buttons
function generateCategoryFilters() {
    const categories = ['all', ...new Set(pdfLibrary.map(pdf => pdf.category))];

    categoryFilters.innerHTML = categories.map(category => `
        <button class="filter-btn ${category === 'all' ? 'active' : ''}" data-category="${category}">
            ${category.charAt(0).toUpperCase() + category.slice(1)}
        </button>
    `).join('');
}

// Update statistics
function updateStats() {
    totalDocs.textContent = pdfLibrary.length;
    totalCategories.textContent = new Set(pdfLibrary.map(pdf => pdf.category)).size;
    const totalBytes = pdfLibrary.reduce((sum, pdf) => sum + (pdf.fileSize || 0), 0);
    totalSize.textContent = formatFileSize(totalBytes);
}

// Render PDFs
function renderPDFs(searchTerm = '') {
    const filteredPDFs = pdfLibrary.filter(pdf => {
        const matchesCategory = currentFilter === 'all' || pdf.category === currentFilter;
        const matchesSearch = pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            pdf.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            pdf.category.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filteredPDFs.length === 0) {
        pdfGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    pdfGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    pdfGrid.className = `pdf-grid ${currentView}`;

    pdfGrid.innerHTML = filteredPDFs.map(pdf => `
        <div class="pdf-card">
            <span class="pdf-icon">PDF</span>
            <h3>${pdf.title}</h3>
            <span class="category">${pdf.category}</span>
            <p class="description">${pdf.description}</p>
            <div class="meta">
                <span>${formatDate(pdf.date)}</span>
                ${pdf.author ? `<span>${pdf.author}</span>` : ''}
                ${pdf.fileSize ? `<span>${formatFileSize(pdf.fileSize)}</span>` : ''}
            </div>
            <div class="card-actions">
                <button class="view-btn" onclick="viewPDF('${pdf.file}', '${pdf.title}')">
                    View PDF
                </button>
                <button class="download-btn" onclick="downloadPDF('${pdf.file}', '${pdf.title}')">
                    Download
                </button>
            </div>
        </div>
    `).join('');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// View PDF
function viewPDF(file, title) {
    modalTitle.textContent = title;
    pdfViewer.src = file;
    pdfModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Update the open new tab button
    openNewTab.onclick = () => window.open(file, '_blank');
}

// Close Modal
function closePDFModal() {
    pdfModal.style.display = 'none';
    pdfViewer.src = '';
    document.body.style.overflow = 'auto';
}

// Download PDF
function downloadPDF(file, title) {
    const link = document.createElement('a');
    link.href = file;
    link.download = title + '.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Setup event listeners
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('change', toggleTheme);

    // Search
    searchInput.addEventListener('input', (e) => {
        renderPDFs(e.target.value);
    });

    // Category filters
    categoryFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');
            currentFilter = e.target.dataset.category;
            renderPDFs(searchInput.value);
        }
    });

    // View options
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentView = e.currentTarget.dataset.view;
            renderPDFs(searchInput.value);
        });
    });

    // Modal close
    closeModal.addEventListener('click', closePDFModal);
    pdfModal.addEventListener('click', (e) => {
        if (e.target === pdfModal) {
            closePDFModal();
        }
    });

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && pdfModal.style.display === 'flex') {
            closePDFModal();
        }
    });
}

// Start the app
init();
