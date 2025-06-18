document.addEventListener('DOMContentLoaded', () => {
  // 1. Fetch the navbar HTML file
  fetch('navbar.html')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok. Check if navbar.html is in the correct folder.');
        }
        return response.text();
    })
    .then(htmlData => {
      // 2. Inject the fetched HTML into the placeholder div
      const headerContainer = document.getElementById('sticky-header');
      if (headerContainer) {
          headerContainer.innerHTML = htmlData;

          // 3. IMPORTANT: Run the navbar activation script AFTER it has been loaded
          initializeNavbar(); 
      }
    })
    .catch(error => {
        console.error('Error fetching navbar:', error);
        // Display an error message on the page if the navbar fails to load
        const headerContainer = document.getElementById('sticky-header');
        if(headerContainer) {
            headerContainer.innerHTML = '<p style="color:red; text-align:center; padding: 1rem;">Error: Could not load navigation bar.</p>';
        }
    });
});

/**
 * Attaches all necessary event listeners to the newly loaded navbar elements.
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
        const header = document.querySelector('.sticky-header'); 
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
            
            // If the mobile menu doesn't exist yet, create it
            if (!mobileMenu) {
                const desktopNav = document.querySelector('.desktop-nav');
                if (desktopNav) {
                    mobileMenu = document.createElement('div');
                    mobileMenu.className = 'mobile-menu';
                    
                    const mobileNavLinks = Array.from(desktopNav.children)
                        .map(link => {
                            const mobileLink = link.cloneNode(true);
                            mobileLink.className = 'mobile-nav-link'; // Use mobile-specific class
                            return mobileLink.outerHTML;
                        }).join('');
                        
                    mobileMenu.innerHTML = `<nav class="flex flex-col">${mobileNavLinks}</nav>`;
                    document.body.appendChild(mobileMenu);
                }
            }
            
            // Toggle the 'active' class to show/hide the menu
            if(mobileMenu) {
               mobileMenu.classList.toggle('active');
            }
        });
    }
}