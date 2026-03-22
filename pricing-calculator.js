/**
 * KAZI Manufacturing Pricing Calculator
 * Interactive pricing slider with real-time quote calculation
 */

(function() {
  'use strict';

  // Pricing tiers for t-shirts (base pricing)
  const pricingTiers = [
    { min: 50, max: 99, price: 12.00 },
    { min: 100, max: 249, price: 9.00 },
    { min: 250, max: 499, price: 7.00 },
    { min: 500, max: 999, price: 5.50 },
    { min: 1000, max: 2499, price: 4.50 },
    { min: 2500, max: Infinity, price: 3.50 }
  ];

  // Product type multipliers (base is t-shirt)
  const productMultipliers = {
    tshirt: 1.0,
    hoodie: 2.2,
    sweatshirt: 1.8,
    polo: 1.3,
    tank: 0.85
  };

  // Customization costs per unit
  const customizationCosts = {
    printMethod: {
      none: 0,
      screen: 2.50,
      dtg: 3.50,
      embroidery: 4.00
    },
    customLabels: {
      none: 0,
      woven: 0.75,
      printed: 0.35,
      both: 1.00
    },
    packaging: {
      standard: 0,
      branded: 0.50,
      box: 1.50
    }
  };

  // Lead times by quantity
  const leadTimes = {
    sample: '12-16 weeks',
    bulk: '16-20 weeks'
  };

  // Product images (placeholder URLs - replace with actual product images)
  const productImages = {
    tshirt: 'https://placehold.co/400x400/1a1a1a/c17a4a?text=T-Shirt',
    hoodie: 'https://placehold.co/400x400/1a1a1a/c17a4a?text=Hoodie',
    sweatshirt: 'https://placehold.co/400x400/1a1a1a/c17a4a?text=Sweatshirt',
    polo: 'https://placehold.co/400x400/1a1a1a/c17a4a?text=Polo',
    tank: 'https://placehold.co/400x400/1a1a1a/c17a4a?text=Tank+Top'
  };

  // DOM Elements
  const elements = {
    productSelect: document.getElementById('productSelect'),
    productImage: document.getElementById('productImage'),
    printMethod: document.getElementById('printMethod'),
    customLabels: document.getElementById('customLabels'),
    packaging: document.getElementById('packaging'),
    quantitySlider: document.getElementById('quantitySlider'),
    quantityInput: document.getElementById('quantityInput'),
    leadTime: document.getElementById('leadTime'),
    displayQuantity: document.getElementById('displayQuantity'),
    unitCost: document.getElementById('unitCost'),
    customCost: document.getElementById('customCost'),
    subtotal: document.getElementById('subtotal'),
    tierCards: document.querySelectorAll('.tier-card'),
    formProduct: document.getElementById('formProduct'),
    formQuantity: document.getElementById('formQuantity'),
    formCalculatedPrice: document.getElementById('formCalculatedPrice')
  };

  // State
  let state = {
    product: 'tshirt',
    quantity: 50,
    printMethod: 'none',
    customLabels: 'none',
    packaging: 'standard'
  };

  /**
   * Get base price for quantity tier
   */
  function getBasePrice(quantity) {
    const tier = pricingTiers.find(t => quantity >= t.min && quantity <= t.max);
    return tier ? tier.price : pricingTiers[pricingTiers.length - 1].price;
  }

  /**
   * Calculate total price breakdown
   */
  function calculatePrice() {
    const basePrice = getBasePrice(state.quantity);
    const multiplier = productMultipliers[state.product] || 1;
    
    // Calculate base unit cost with product multiplier
    const adjustedBasePrice = basePrice * multiplier;
    
    // Calculate customization costs
    const printCost = customizationCosts.printMethod[state.printMethod] || 0;
    const labelCost = customizationCosts.customLabels[state.customLabels] || 0;
    const packagingCost = customizationCosts.packaging[state.packaging] || 0;
    
    const totalCustomCost = printCost + labelCost + packagingCost;
    const unitCost = adjustedBasePrice + totalCustomCost;
    const subtotal = unitCost * state.quantity;
    
    return {
      basePrice: adjustedBasePrice,
      unitCost: unitCost,
      customCost: totalCustomCost,
      subtotal: subtotal,
      printCost: printCost,
      labelCost: labelCost,
      packagingCost: packagingCost
    };
  }

  /**
   * Format currency
   */
  function formatCurrency(amount) {
    return '£' + amount.toFixed(2);
  }

  /**
   * Update the display with calculated prices
   */
  function updateDisplay() {
    const prices = calculatePrice();
    
    // Add updating class for animation
    elements.unitCost.classList.add('price-updating');
    elements.subtotal.classList.add('price-updating');
    
    // Update values
    elements.displayQuantity.textContent = state.quantity.toLocaleString();
    elements.unitCost.textContent = formatCurrency(prices.unitCost);
    elements.customCost.textContent = formatCurrency(prices.customCost);
    elements.subtotal.textContent = formatCurrency(prices.subtotal);
    
    // Update lead time
    elements.leadTime.textContent = state.quantity <= 10 ? leadTimes.sample : leadTimes.bulk;
    
    // Remove updating class after animation
    setTimeout(() => {
      elements.unitCost.classList.remove('price-updating');
      elements.subtotal.classList.remove('price-updating');
    }, 200);
    
    // Update active tier card
    updateActiveTier();
    
    // Update form hidden fields
    updateFormFields(prices);
  }

  /**
   * Highlight the active pricing tier
   */
  function updateActiveTier() {
    elements.tierCards.forEach(card => {
      card.classList.remove('active');
      const tierMin = parseInt(card.dataset.tier);
      const tier = pricingTiers.find(t => t.min === tierMin);
      
      if (tier && state.quantity >= tier.min && state.quantity <= tier.max) {
        card.classList.add('active');
      } else if (tierMin === 2500 && state.quantity >= 2500) {
        card.classList.add('active');
      }
    });
  }

  /**
   * Update hidden form fields with calculator data
   */
  function updateFormFields(prices) {
    if (elements.formProduct) {
      elements.formProduct.value = state.product;
    }
    if (elements.formQuantity) {
      elements.formQuantity.value = state.quantity;
    }
    if (elements.formCalculatedPrice) {
      elements.formCalculatedPrice.value = formatCurrency(prices.subtotal);
    }
  }

  /**
   * Handle quantity slider input
   */
  function handleSliderChange(e) {
    state.quantity = parseInt(e.target.value);
    elements.quantityInput.value = state.quantity;
    updateDisplay();
  }

  /**
   * Handle quantity input change
   */
  function handleQuantityInput(e) {
    let value = parseInt(e.target.value);
    
    // Validate input
    if (isNaN(value) || value < 50) {
      value = 50;
    } else if (value > 10000) {
      value = 10000;
    }
    
    state.quantity = value;
    elements.quantitySlider.value = Math.min(value, 2500);
    elements.quantityInput.value = value;
    updateDisplay();
  }

  /**
   * Handle product selection change
   */
  function handleProductChange(e) {
    state.product = e.target.value;
    
    // Update product image
    if (elements.productImage && productImages[state.product]) {
      elements.productImage.src = productImages[state.product];
      elements.productImage.alt = state.product + ' preview';
    }
    
    updateDisplay();
  }

  /**
   * Handle customization changes
   */
  function handleCustomizationChange(e) {
    const id = e.target.id;
    state[id] = e.target.value;
    updateDisplay();
  }

  /**
   * Populate quote form with calculator data
   */
  function populateQuoteForm() {
    const prices = calculatePrice();
    updateFormFields(prices);
    
    // Scroll to form
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Initialize event listeners
   */
  function init() {
    if (!elements.quantitySlider) return; // Not on pricing page
    
    // Quantity controls
    elements.quantitySlider.addEventListener('input', handleSliderChange);
    elements.quantityInput.addEventListener('change', handleQuantityInput);
    elements.quantityInput.addEventListener('blur', handleQuantityInput);
    
    // Product selector
    if (elements.productSelect) {
      elements.productSelect.addEventListener('change', handleProductChange);
    }
    
    // Customizations
    if (elements.printMethod) {
      elements.printMethod.addEventListener('change', handleCustomizationChange);
    }
    if (elements.customLabels) {
      elements.customLabels.addEventListener('change', handleCustomizationChange);
    }
    if (elements.packaging) {
      elements.packaging.addEventListener('change', handleCustomizationChange);
    }
    
    // Tier card clicks
    elements.tierCards.forEach(card => {
      card.addEventListener('click', () => {
        const tierMin = parseInt(card.dataset.tier);
        state.quantity = tierMin;
        elements.quantitySlider.value = Math.min(tierMin, 2500);
        elements.quantityInput.value = tierMin;
        updateDisplay();
      });
    });
    
    // Initial display update
    updateDisplay();
  }

  // Expose populateQuoteForm globally for the CTA button
  window.populateQuoteForm = populateQuoteForm;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
