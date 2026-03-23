// Pricing Calculator
const quantitySlider = document.getElementById('quantity');
const quantityValue = document.getElementById('quantity-value');
const pricePerUnit = document.getElementById('price-per-unit');
const priceTotal = document.getElementById('price-total');

// Pricing tiers
const tiers = [
    { max: 50, price: 12 },
    { max: 100, price: 9 },
    { max: 250, price: 7 },
    { max: 500, price: 5.50 },
    { max: 1000, price: 4.50 },
    { max: 2500, price: 3.50 },
    { max: 5000, price: 3.50 }
];

function getPrice(quantity) {
    for (let i = 0; i < tiers.length; i++) {
        if (quantity <= tiers[i].max) {
            // Find previous tier for interpolation
            const prevTier = i > 0 ? tiers[i - 1] : tiers[i];
            const currTier = tiers[i];
            
            if (quantity === currTier.max || i === 0) {
                return currTier.price;
            }
            
            // Linear interpolation between tiers
            const range = currTier.max - prevTier.max;
            const position = quantity - prevTier.max;
            const ratio = position / range;
            const priceDiff = prevTier.price - currTier.price;
            
            return prevTier.price - (priceDiff * ratio);
        }
    }
    return tiers[tiers.length - 1].price;
}

function updateCalculator() {
    const quantity = parseInt(quantitySlider.value);
    const price = getPrice(quantity);
    const total = Math.round(quantity * price);
    
    quantityValue.textContent = quantity;
    pricePerUnit.textContent = price.toFixed(2);
    priceTotal.textContent = total.toLocaleString();
}

if (quantitySlider) {
    quantitySlider.addEventListener('input', updateCalculator);
    updateCalculator();
}

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all other items
        faqItems.forEach(otherItem => {
            otherItem.classList.remove('active');
        });
        
        // Toggle current item
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// Mobile Navigation
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Animate hamburger
        const spans = navToggle.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // Close menu when clicking a link
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Form handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('.form-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Collect print locations
        const printLocations = [];
        contactForm.querySelectorAll('input[name="print-locations"]:checked').forEach(cb => {
            printLocations.push(cb.value);
        });
        
        // Build form data
        const formData = {
            name: contactForm.querySelector('#name')?.value,
            email: contactForm.querySelector('#email')?.value,
            company: contactForm.querySelector('#company')?.value,
            productType: contactForm.querySelector('#product-type')?.value,
            decorationType: contactForm.querySelector('#decoration-type')?.value,
            printLocations: printLocations,
            numColors: contactForm.querySelector('#num-colors')?.value,
            quantity: contactForm.querySelector('#form-quantity')?.value,
            timeline: contactForm.querySelector('#timeline')?.value,
            message: contactForm.querySelector('#message')?.value
        };
        
        try {
            const response = await fetch('/api/quote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Success - show message
                showFormMessage('Thank you! Your quote request has been submitted. Check your email for confirmation.', 'success');
                contactForm.reset();
            } else {
                // Error from server
                showFormMessage(result.error || 'Something went wrong. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showFormMessage('Unable to submit. Please try again or email us directly at hello@kazimanufacturing.com', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Show form message
function showFormMessage(message, type) {
    // Remove any existing messages
    const existingMsg = document.querySelector('.form-message');
    if (existingMsg) existingMsg.remove();
    
    // Create message element
    const msgDiv = document.createElement('div');
    msgDiv.className = `form-message form-message-${type}`;
    msgDiv.textContent = message;
    
    // Style based on type
    msgDiv.style.padding = '1rem';
    msgDiv.style.marginBottom = '1rem';
    msgDiv.style.borderRadius = '0.5rem';
    msgDiv.style.fontWeight = '500';
    
    if (type === 'success') {
        msgDiv.style.background = '#dcfce7';
        msgDiv.style.color = '#166534';
        msgDiv.style.border = '1px solid #86efac';
    } else {
        msgDiv.style.background = '#fee2e2';
        msgDiv.style.color = '#991b1b';
        msgDiv.style.border = '1px solid #fecaca';
    }
    
    // Insert before form
    const form = document.getElementById('quoteForm');
    form.parentNode.insertBefore(msgDiv, form);
    
    // Scroll to message
    msgDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        msgDiv.remove();
    }, 10000);
}
