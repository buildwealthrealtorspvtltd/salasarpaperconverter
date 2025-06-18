document.addEventListener('DOMContentLoaded', () => {
    // --- Navbar Loading Logic ---
    fetch('navbar.html')
        .then(response => {
            if (!response.ok) {
                // If the response is not OK (e.g., 404 Not Found), throw an error.
                // This message helps in debugging if navbar.html is missing or mislocated.
                throw new Error('Network response was not ok. Check if navbar.html is in the correct folder.');
            }
            return response.text();
        })
        .then(htmlData => {
            const headerContainer = document.getElementById('sticky-header');
            if (headerContainer) {
                headerContainer.innerHTML = htmlData; // Inject the fetched HTML

                // IMPORTANT: Initialize navbar functionalities AFTER it has been loaded into the DOM
                initializeNavbar();
            }
        })
        .catch(error => {
            console.error('Error fetching navbar:', error);
            const headerContainer = document.getElementById('sticky-header');
            if (headerContainer) {
                headerContainer.innerHTML = '<p style="color:red; text-align:center; padding: 1rem;">Error: Could not load navigation bar. Please ensure `navbar.html` exists and is accessible.</p>';
            }
        });

    // --- Inward Form and List Logic ---
    const form = document.getElementById("inwardForm");
    // Target the tbody of your table, not a generic <ul> or <ol>
    const inwardRecordsTableBody = document.querySelector("#inwardRecordsTable tbody"); 

    if (form && inwardRecordsTableBody) {
        // Load existing data from localStorage
        const storedData = JSON.parse(localStorage.getItem("inwardData") || "[]");
        renderInwardTable(storedData); // Render initial data

        form.onsubmit = function (e) {
            e.preventDefault(); // Prevent default form submission
            const formData = new FormData(form);
            const newEntry = {
                date: new Date().toLocaleDateString('en-GB'), // Format date as DD/MM/YYYY
                reelCode: formData.get("reelCode"),
                weight: parseFloat(formData.get("weight")), // Parse weight as a number
                zone: formData.get("zone"),
                status: "Pending", // Default status for new entries
                time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) // Format time
            };

            // Add new entry and save to localStorage
            storedData.push(newEntry);
            localStorage.setItem("inwardData", JSON.stringify(storedData));

            renderInwardTable(storedData); // Re-render the table with the new data
            form.reset(); // Clear the form fields
        };

        // Function to render the inward data into the table
        function renderInwardTable(data) {
            inwardRecordsTableBody.innerHTML = ""; // Clear existing rows
            data.forEach(item => {
                const row = inwardRecordsTableBody.insertRow(); // Create a new table row

                // Insert cells and populate with data
                row.insertCell().textContent = item.date;
                row.insertCell().textContent = item.reelCode;
                row.insertCell().textContent = `${item.weight} kg`;
                row.insertCell().textContent = item.zone;

                // Status Cell with dynamic styling
                const statusCell = row.insertCell();
                const statusSpan = document.createElement("span");
                statusSpan.classList.add("px-2", "inline-flex", "text-xs", "leading-5", "font-semibold", "rounded-full");

                if (item.status === "Processed") {
                    statusSpan.classList.add("bg-green-100", "text-green-800");
                } else if (item.status === "Pending") {
                    statusSpan.classList.add("bg-yellow-100", "text-yellow-800");
                } else {
                    statusSpan.classList.add("bg-gray-100", "text-gray-800"); // Default/Other statuses
                }
                statusSpan.textContent = item.status;
                statusCell.appendChild(statusSpan);

                // Actions Cell (Edit and View buttons)
                const actionsCell = row.insertCell();
                actionsCell.classList.add("px-4", "py-3", "whitespace-nowrap", "text-sm", "text-gray-500");

                const editButton = document.createElement("button");
                editButton.classList.add("text-blue-600", "hover:text-blue-800", "mr-2");
                editButton.innerHTML = '<i class="fas fa-edit"></i>';
                editButton.title = "Edit";
                // Add event listener for edit if needed: editButton.addEventListener('click', () => editEntry(item));

                const viewButton = document.createElement("button");
                viewButton.classList.add("text-gray-600", "hover:text-gray-800");
                viewButton.innerHTML = '<i class="fas fa-eye"></i>';
                viewButton.title = "View Details";
                // Add event listener for view if needed: viewButton.addEventListener('click', () => viewEntry(item));

                actionsCell.appendChild(editButton);
                actionsCell.appendChild(viewButton);
            });
        }
    } else {
        console.warn("Could not find form or inwardRecordsTableBody elements. Ensure IDs are correct in HTML.");
    }
});

/**
 * Attaches all necessary event listeners to the newly loaded navbar elements.
 * This function is called AFTER the navbar.html content has been injected into the DOM.
 */
function initializeNavbar() {
    // Notification button functionality
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            alert('Notifications feature coming soon!');
        });
    }

    // Add shadow to header on scroll
    window.addEventListener('scroll', () => {
        const header = document.getElementById('sticky-header'); // Target by ID for certainty
        if (header) {
            if (window.scrollY > 10) { // Add shadow after scrolling a little
                header.classList.add('shadow-scroll');
            } else {
                header.classList.remove('shadow-scroll');
            }
        }
    });

    // Mobile menu toggle functionality
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            let mobileMenu = document.querySelector('.mobile-menu');

            // If the mobile menu doesn't exist yet, create it dynamically
            if (!mobileMenu) {
                const desktopNav = document.querySelector('.desktop-nav');
                if (desktopNav) {
                    mobileMenu = document.createElement('div');
                    mobileMenu.className = 'mobile-menu'; // Apply base styling

                    const mobileNavLinks = Array.from(desktopNav.children)
                        .map(link => {
                            const mobileLink = link.cloneNode(true);
                            mobileLink.className = 'mobile-nav-link'; // Apply mobile-specific styling
                            return mobileLink.outerHTML;
                        }).join('');

                    mobileMenu.innerHTML = `<nav class="flex flex-col">${mobileNavLinks}</nav>`;
                    document.body.appendChild(mobileMenu);

                    // Re-run active class logic for newly created mobile menu
                    updateActiveNavLinks();
                }
            }

            // Toggle the 'active' class to show/hide the menu
            if (mobileMenu) {
                mobileMenu.classList.toggle('active');
            }
        });
    }

    // Call this function initially and after mobile menu creation to set active links
    updateActiveNavLinks();
}

/**
 * Helper function to update the 'active' class on navigation links based on the current URL.
 * This is called from initializeNavbar and after mobile menu creation.
 */
function updateActiveNavLinks() {
    // For desktop navigation
    const desktopNavLinks = document.querySelectorAll('.desktop-nav .nav-link');
    desktopNavLinks.forEach(link => {
        const currentPath = window.location.pathname;
        const linkPath = new URL(link.href).pathname;

        // Special handling for the root/dashboard link if needed, e.g., index.html
        if (linkPath === '/' && (currentPath === '/' || currentPath === '/index.html' || currentPath === '/SalasarPaperConverter/')) { // Adjust based on your server's root
             link.classList.add('active');
        } else if (currentPath.includes(linkPath) && linkPath !== '/') { // Match partial paths for modules
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // For mobile navigation (if it exists)
    const mobileNavElement = document.querySelector('.mobile-menu');
    if (mobileNavElement) {
        const mobileNavLinks = mobileNavElement.querySelectorAll('.mobile-nav-link');
        mobileNavLinks.forEach(link => {
            const currentPath = window.location.pathname;
            const linkPath = new URL(link.href).pathname;

            if (linkPath === '/' && (currentPath === '/' || currentPath === '/index.html' || currentPath === '/SalasarPaperConverter/')) {
                link.classList.add('active');
            } else if (currentPath.includes(linkPath) && linkPath !== '/') {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}