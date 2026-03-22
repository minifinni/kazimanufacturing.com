/**
 * KAZI Manufacturing Interactive Pricing Calculator
 * Real-time pricing updates with clickable options
 */

(function() {
  'use strict';

  // Base prices by product type
  const basePrices = {
    tshirt: { min: 8, max: 15, default: 10 },
    hoodie: { min: 12, max: 22, default: 16 },
    'embroidery-only': { min: 15, max: 25, default: 18 },
    'screen-only': { min: 6, max: 12, default: 8 },
    'dtg-only': { min: 10, max: 18, default: 12 }
  };

  // Product display names
  const productNames = {
    tshirt: 'T-Shirts',
    hoodie: 'Hoodies',
    'embroidery-only': 'Embroidery Service',
    'screen-only': 'Screen Printing Service',
    'dtg-only': 'DTG Printing Service'
  };

  // Volume discount tiers (percentage off base price)
  const volumeTiers = [
    { min: 50, max: 99, discount: 0, label: 'Base price' },
    { min: 100, max: 249, discount: 0.10, label: '10% off' },
    { min: 250, max: 499, discount: 0.15, label: '15% off' },
    { min: 500, max: 999, discount: 0.20, label: '20% off' },
    { min: 1000, max: 2499, discount: 0.25, label: '25% off' },
    { min: 2500, max: Infinity, discount: 0.30, label: '30% off' }
  ];

  // State
  let state = {
    product: null,
    quantity: 100,
    printType: 'none',
    locations: [],
    color: 'white'
  };

  // DOM Elements cache
  let elements = {};

  /**
   * Initialize calculator
   */
  function init() {
    cacheElements();
    bindEvents();
    
    // Check for URL params
    const params = new URLSearchParams(window.location.search);
    const productParam = params.get('product');
    if (productParam && basePrices[productParam]) {
      selectProduct(productParam);
    }
    
    updateDisplay();
  }

  /**
   * Cache DOM elements
   */
  function cacheElements() {
    elements = {
      // Product cards
      productCards: document.querySelectorAll('.product-card'),
      
      // Decoration group
      decorationGroup: document.getElementById('decorationGroup'),
      
      // Print type buttons
      printTypeButtons: document.querySelectorAll('.print-type-options .option-btn'),
      
      // Location checkboxes
      locationCheckboxes: document.querySelectorAll('.location-options input[type="checkbox"]'),
      
      // Color buttons
      colorButtons: document.querySelectorAll('.color-options .option-btn'),
      
      // Quantity controls
      quantitySlider: document.getElementById('quantitySlider'),
      quantityInput: document.getElementById('quantityInput'),
      
      // Display elements
      selectedProductDisplay: document.getElementById('selectedProductDisplay'),
      displayQuantity: document.getElementById('displayQuantity'),
      leadTime: document.getElementById('leadTime'),
      basePrice: document.getElementById('basePrice'),
      colorCost: document.getElementById('colorCost'),
      printCost: document.getElementById('printCost'),
      locationCost: document.getElementById('locationCost'),
      discountRow: document.getElementById('discountRow'),
      discountAmount: document.getElementById('discountAmount'),
      unitCost: document.getElementById('unitCost'),
      totalPrice: document.getElementById('totalPrice'),
      quantityDiscountNote: document.getElementById('quantityDiscountNote'),
      
      // Tier cards
      tierCards: document.querySelectorAll('.tier-card'),
      
      // Form fields
      formProduct: document.getElementById('formProduct'),
      formQuantity: document.getElementById('formQuantity'),
      formPrintMethod: document.getElementById('formPrintMethod'),
      formColor: document.getElementById('formColor'),
      formLocations: document.getElementById('formLocations'),
      formCalculatedPrice: document.getElementById('formCalculatedPrice')
    };
  }

  /**
   * Bind all event listeners
   */
  function bindEvents() {
    // Product card selection
    elements.productCards.forEach(card => {
      card.addEventListener('click', () => {
        const product = card.dataset.product;
        selectProduct(product);
      });
    });

    // Print type selection
    elements.printTypeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const printType = btn.dataset.print;
        selectPrintType(printType);
      });
    });

    // Location checkboxes
    elements.locationCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', updateLocations);
    });

    // Color selection
    elements.colorButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        selectColor(color);
      });
    });

    // Quantity slider
    if (elements.quantitySlider) {
      elements.quantitySlider.addEventListener('input', handleSliderChange);
    }

    // Quantity input
    if (elements.quantityInput) {
      elements.quantityInput.addEventListener('change', handleQuantityInput);
      elements.quantityInput.addEventListener('blur', handleQuantityInput);
    }

    // Tier card clicks
    elements.tierCards.forEach(card => {
      card.addEventListener('click', () => {
        const tierMin = parseInt(card.dataset.tier);
        state.quantity = tierMin;
        elements.quantitySlider.value = Math.min(tierMin, 5000);
        elements.quantityInput.value = tierMin;
        updateDisplay();
      });
    });
  }

  /**
   * Select a product
   */
  function selectProduct(product) {
    state.product = product;
    
    // Update card visuals
    elements.productCards.forEach(card => {
      card.classList.remove('selected');
      if (card.dataset.product === product) {
        card.classList.add('selected');
      }
    });

    // Show decoration options
    if (elements.decorationGroup) {
      elements.decorationGroup.style.display = 'block';
      elements.decorationGroup.classList.add('fade-in');
    }

    // For decoration-only products, auto-select the appropriate print type
    if (product === 'embroidery-only') {
      selectPrintType('embroidery');
    } else if (product === 'screen-only') {
      selectPrintType('screen-1');
    } else if (product === 'dtg-only') {
      selectPrintType('dtg');
    } else {
      // Default to none for garments
      selectPrintType('none');
    }

    // Default color
    selectColor('white');

    updateDisplay();
  }

  /**
   * Select print type
   */
  function selectPrintType(printType) {
    state.printType = printType;
    
    elements.printTypeButtons.forEach(btn => {
      btn.classList.remove('selected');
      if (btn.dataset.print === printType) {
        btn.classList.add('selected');
      }
    });

    updateDisplay();
  }

  /**
   * Update selected locations
   */
  function updateLocations() {
    state.locations = [];
    elements.locationCheckboxes.forEach(checkbox => {
      if (checkbox.checked) {
        state.locations.push({
          name: checkbox.dataset.location,
          price: parseFloat(checkbox.dataset.price)
        });
      }
    });
    updateDisplay();
  }

  /**
   * Select garment color
   */
  function selectColor(color) {
    state.color = color;
    
    elements.colorButtons.forEach(btn => {
      btn.classList.remove('selected');
      if (btn.dataset.color === color) {
        btn.classList.add('selected');
      }
    });

    updateDisplay();
  }

  /**
   * Handle quantity slider change
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
    
    if (isNaN(value) || value < 50) {
      value = 50;
    } else if (value > 10000) {
      value = 10000;
    }
    
    state.quantity = value;
    elements.quantitySlider.value = Math.min(value, 5000);
    elements.quantityInput.value = value;
    updateDisplay();
  }

  /**
   * Calculate price breakdown
   */
  function calculatePrice() {
    if (!state.product) {
      return null;
    }

    const product = basePrices[state.product];
    const tier = volumeTiers.find(t => state.quantity >= t.min && state.quantity <= t.max);
    const discount = tier ? tier.discount : 0;

    // Base price with volume discount
    const discountedBase = product.default * (1 - discount);
    const baseTotal = discountedBase * state.quantity;

    // Color adjustment
    const colorPrice = getColorPrice();
    const colorTotal = colorPrice * state.quantity;

    // Print type cost
    const printPrice = getPrintPrice();
    const printTotal = printPrice * state.quantity;

    // Location costs
    const locationTotal = state.locations.reduce((sum, loc) => sum + (loc.price * state.quantity), 0);

    // Discount amount (what was saved)
    const discountAmount = (product.default * discount) * state.quantity;

    // Totals
    const subtotal = baseTotal + colorTotal + printTotal + locationTotal;
    const pricePerUnit = subtotal / state.quantity;

    return {
      basePrice: product.default,
      discountedBase: discountedBase,
      baseTotal: baseTotal,
      colorPrice: colorPrice,
      colorTotal: colorTotal,
      printPrice: printPrice,
      printTotal: printTotal,
      locationTotal: locationTotal,
      discount: discount,
      discountAmount: discountAmount,
      discountLabel: tier ? tier.label : '',
      pricePerUnit: pricePerUnit,
      total: subtotal
    };
  }

  /**
   * Get color price adjustment
   */
  function getColorPrice() {
    switch (state.color) {
      case 'black': return 0.5;
      case 'colors': return 0.75;
      default: return 0;
    }
  }

  /**
   * Get print type price
   */
  function getPrintPrice() {
    switch (state.printType) {
      case 'dtg': return 2;
      case 'screen-1': return 1;
      case 'screen-multi': return 2.5;
      case 'embroidery': return 4;
      default: return 0;
    }
  }

  /**
   * Update all display elements
   */
  function updateDisplay() {
    const prices = calculatePrice();

    // Update product name
    if (elements.selectedProductDisplay) {
      if (state.product) {
        elements.selectedProductDisplay.textContent = productNames[state.product];
        elements.selectedProductDisplay.classList.add('active');
      } else {
        elements.selectedProductDisplay.textContent = 'Select a product';
        elements.selectedProductDisplay.classList.remove('active');
      }
    }

    // Update quantity
    if (elements.displayQuantity) {
      elements.displayQuantity.textContent = state.quantity.toLocaleString();
    }

    // Update tier highlights
    updateTierHighlights();

    if (!prices) {
      resetDisplay();
      return;
    }

    // Update price breakdown
    updatePriceRow(elements.basePrice, prices.baseTotal, `£${prices.basePrice.toFixed(2)} base`);
    updatePriceRow(elements.colorCost, prices.colorTotal, `£${prices.colorPrice.toFixed(2)}/unit`);
    updatePriceRow(elements.printCost, prices.printTotal, `£${prices.printPrice.toFixed(2)}/unit`);
    updatePriceRow(elements.locationCost, prices.locationTotal);

    // Update discount row
    if (elements.discountRow && elements.discountAmount) {
      if (prices.discount > 0) {
        elements.discountRow.style.display = 'flex';
        elements.discountAmount.textContent = `-£${prices.discountAmount.toFixed(2)}`;
      } else {
        elements.discountRow.style.display = 'none';
      }
    }

    // Update discount note
    if (elements.quantityDiscountNote) {
      if (prices.discount > 0) {
        elements.quantityDiscountNote.textContent = `${prices.discountLabel} applied (${(prices.discount * 100).toFixed(0)}% volume discount)`;
        elements.quantityDiscountNote.classList.add('active');
      } else {
        elements.quantityDiscountNote.textContent = '';
        elements.quantityDiscountNote.classList.remove('active');
      }
    }

    // Update totals with animation
    animateValue(elements.unitCost, prices.pricePerUnit);
    animateValue(elements.totalPrice, prices.total);

    // Update lead time
    if (elements.leadTime) {
      elements.leadTime.textContent = state.quantity < 100 ? '12-16 weeks' : '16-20 weeks';
    }

    // Update form fields
    updateFormFields(prices);
  }

  /**
   * Update a price row with label suffix
   */
  function updatePriceRow(element, value, suffix) {
    if (element) {
      let text = `£${value.toFixed(2)}`;
      if (suffix) {
        text += ` <span class="price-suffix">${suffix}</span>`;
      }
      element.innerHTML = value > 0 ? text : '£0.00';
    }
  }

  /**
   * Reset display to zero
   */
  function resetDisplay() {
    const zeros = ['£0.00', '£0.00', '£0.00', '£0.00'];
    if (elements.basePrice) elements.basePrice.textContent = zeros[0];
    if (elements.colorCost) elements.colorCost.textContent = zeros[1];
    if (elements.printCost) elements.printCost.textContent = zeros[2];
    if (elements.locationCost) elements.locationCost.textContent = zeros[3];
    if (elements.discountRow) elements.discountRow.style.display = 'none';
    if (elements.unitCost) elements.unitCost.textContent = '£0.00';
    if (elements.totalPrice) elements.totalPrice.textContent = '£0.00';
  }

  /**
   * Update tier card highlights
   */
  function updateTierHighlights() {
    const tier = volumeTiers.find(t => state.quantity >= t.min && state.quantity <= t.max);
    
    elements.tierCards.forEach(card => {
      card.classList.remove('active');
      const cardTier = parseInt(card.dataset.tier);
      if (tier && cardTier === tier.min) {
        card.classList.add('active');
      }
    });
  }

  /**
   * Animate value change
   */
  function animateValue(element, newValue) {
    if (!element) return;
    
    element.classList.add('price-updating');
    element.textContent = '£' + newValue.toFixed(2);
    
    setTimeout(() => {
      element.classList.remove('price-updating');
    }, 200);
  }

  /**
   * Update hidden form fields
   */
  function updateFormFields(prices) {
    if (elements.formProduct) {
      elements.formProduct.value = state.product || '';
    }
    if (elements.formQuantity) {
      elements.formQuantity.value = state.quantity;
    }
    if (elements.formPrintMethod) {
      elements.formPrintMethod.value = state.printType;
    }
    if (elements.formColor) {
      elements.formColor.value = state.color;
    }
    if (elements.formLocations) {
      elements.formLocations.value = state.locations.map(l => l.name).join(', ');
    }
    if (elements.formCalculatedPrice) {
      elements.formCalculatedPrice.value = '£' + prices.total.toFixed(2);
    }
  }

  /**
   * Populate quote form (global function)
   */
  window.populateQuoteForm = function() {
    updateDisplay();
    
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
