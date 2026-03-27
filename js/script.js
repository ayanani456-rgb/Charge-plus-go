// =========================================
// NAVIGATION BEHAVIOR
// =========================================
const navbar = document.querySelector('.navbar');
const mobileToggle = document.querySelector('.mobile-toggle');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-links a');

// Change Navbar Background on Scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = mobileToggle.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Close Mobile Menu on Link Click
links.forEach(link => {
    link.addEventListener('click', () => {
        if(navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileToggle.querySelector('i').classList.remove('fa-times');
            mobileToggle.querySelector('i').classList.add('fa-bars');
        }
    });
});

// =========================================
// SCROLL SECTION REVEAL ANIMATIONS
// =========================================
const revealElements = document.querySelectorAll('.reveal');

const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // Optional: reveals only once
        }
    });
};

const revealOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px', // Trigger slightly before the element enters the viewport
    threshold: 0.1
};

const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

revealElements.forEach(el => revealObserver.observe(el));

// =========================================
// DYNAMIC KIOSK SLOT ANIMATION
// =========================================
// Optional interactive touch: randomly make slots active/empty over time
const slots = document.querySelectorAll('.kiosk-slots .slot');

setInterval(() => {
    // Pick a random slot
    const randomIdx = Math.floor(Math.random() * slots.length);
    const slot = slots[randomIdx];
    
    // Toggle state occasionally to simulate usage
    if (Math.random() > 0.7) {
        if (slot.classList.contains('active')) {
            slot.classList.remove('active');
            slot.classList.add('empty');
        } else {
            slot.classList.remove('empty');
            slot.classList.add('active');
        }
    }
}, 3000);
