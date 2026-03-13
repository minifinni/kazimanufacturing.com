// KAZI Manufacturing - Main JavaScript

// i18n Translations
const i18n = {
  en: {
    nav_services: "Services",
    nav_suppliers: "Suppliers",
    nav_about: "About",
    nav_join: "Are you a manufacturer? Join us",
    nav_quote: "Get Quote",
    hero_eyebrow: "Kathmandu, Nepal · Full-Service Manufacturing",
    hero_desc: "Full-service garment manufacturing from the Himalayas. Hoodies · Embroidery · DTG · Screen Print · Knitwear · Private Label. 0% UK import duty. Ethical wages. MOQ from 100 units.",
    hero_cta: "Request a Quote",
    stat_moq: "MOQ per style",
    stat_duty: "UK import duty",
    stat_weight: "minimum weight",
    stat_lead: "sample lead time",
    services_label: "/ What We Make",
    services_title: "Our Services.",
    why_label: "/ Why Nepal",
    why_title: "The structural advantage.",
    process_label: "/ How It Works",
    process_title: "From brief to delivery."
  },
  ne: {
    nav_services: "सेवाहरू",
    nav_suppliers: "आपूर्तिकर्ताहरू",
    nav_about: "हाम्रोबारे",
    nav_join: "के तपाईं उत्पादक हुनुहुन्छ? सामेल हुनुहोस्",
    nav_quote: "कोट प्राप्त गर्नुहोस्",
    hero_eyebrow: "काठमाडौं, नेपाल · पूर्ण-सेवा विनिर्माण",
    hero_desc: "हिमालयबाट पूर्ण-सेवा गार्मेन्ट विनिर्माण। हुडीहरू · कढाइ · डीटीजी · स्क्रिन प्रिन्ट · निटवियर · निजी लेबल। ०% यूके आयात कर। नैतिक तलब। १०० युनिटबाट MOQ।",
    hero_cta: "कोट अनुरोध गर्नुहोस्",
    stat_moq: "प्रति शैली MOQ",
    stat_duty: "यूके आयात कर",
    stat_weight: "न्यूनतम तौल",
    stat_lead: "नमूना लिड समय",
    services_label: "/ हामी के बनाउछौं",
    services_title: "हाम्रा सेवाहरू।",
    why_label: "/ किन नेपाल",
    why_title: "संरचनात्मक लाभ।",
    process_label: "/ यसरी काम गर्छ",
    process_title: "ब्रिफबाट डेलिभरीसम्म।"
  },
  hi: {
    nav_services: "सेवाएं",
    nav_suppliers: "आपूर्तिकर्ता",
    nav_about: "हमारे बारे में",
    nav_join: "क्या आप एक निर्माता हैं? हमसे जुड़ें",
    nav_quote: "कोट प्राप्त करें",
    hero_eyebrow: "काठमांडू, नेपाल · पूर्ण-सेवा विनिर्माण",
    hero_desc: "हिमालय से पूर्ण-सेवा गार्मेंट विनिर्माण। हुडीज · एम्ब्रॉयडरी · डीटीजी · स्क्रीन प्रिंट · निटवियर · प्राइवेट लेबल। ०% यूके आयात शुल्क। नैतिक मजदूरी। १०० यूनिट से MOQ।",
    hero_cta: "कोट का अनुरोध करें",
    stat_moq: "प्रति शैली MOQ",
    stat_duty: "यूके आयात शुल्क",
    stat_weight: "न्यूनतम वजन",
    stat_lead: "नमूना लीड समय",
    services_label: "/ हम क्या बनाते हैं",
    services_title: "हमारी सेवाएं।",
    why_label: "/ क्यों नेपाल",
    why_title: "संरचनात्मक लाभ।",
    process_label: "/ यह कैसे काम करता है",
    process_title: "ब्रीफ से डिलीवरी तक।"
  }
};

// Get browser language
function getBrowserLang() {
  const lang = navigator.language || navigator.userLanguage;
  if (lang.startsWith('ne')) return 'ne';
  if (lang.startsWith('hi')) return 'hi';
  return 'en';
}

// Set language
function setLang(lang) {
  if (!i18n[lang]) lang = 'en';
  localStorage.setItem('kazi_lang', lang);
  document.documentElement.lang = lang;
  
  // Update select
  const select = document.getElementById('langSelect');
  if (select) select.value = lang;
  
  // Translate all elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang][key]) {
      el.innerHTML = i18n[lang][key];
    }
  });
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', function() {
  const savedLang = localStorage.getItem('kazi_lang') || getBrowserLang();
  setLang(savedLang);
});

// Click tracking functionality
function trackClick(service, type) {
  // Track in localStorage
  const data = JSON.parse(localStorage.getItem('kazi_clicks') || '{}');
  const timestamps = JSON.parse(localStorage.getItem('kazi_clicks_ts') || '{}');
  
  const key = type ? `${service}_${type}` : service;
  data[key] = (data[key] || 0) + 1;
  timestamps[key] = Date.now();
  
  localStorage.setItem('kazi_clicks', JSON.stringify(data));
  localStorage.setItem('kazi_clicks_ts', JSON.stringify(timestamps));
  
  // Send beacon if online (fire and forget)
  if (navigator.sendBeacon) {
    const beaconData = new FormData();
    beaconData.append('service', service);
    beaconData.append('type', type);
    beaconData.append('ts', Date.now());
    beaconData.append('url', window.location.href);
    beaconData.append('ref', document.referrer);
    
    // Send to Formspree for tracking (will create email notifications)
    navigator.sendBeacon('https://formspree.io/f/xpzgkqnd', beaconData);
  }
}

// Form handling with Formspree
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      // Track form submission
      trackClick(data.service || 'unknown', 'form_submit');
      
      // Submit to Formspree
      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          note.textContent = "Thanks! We'll be in touch within 2 working days.";
          note.className = 'form-note success';
          form.reset();
        } else {
          throw new Error('Form submission failed');
        }
      })
      .catch(error => {
        note.textContent = "Something went wrong. Please email us directly at hello@kazimanufacturing.com";
        note.style.color = '#c1a04a';
      });
    });
  }
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
  
  // Check for service in URL query params and pre-select
  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = urlParams.get('service');
  if (serviceParam) {
    const serviceSelect = document.querySelector('select[name="service"]');
    if (serviceSelect) {
      serviceSelect.value = serviceParam;
    }
  }
});

// Pre-fill service from URL hash
document.addEventListener('DOMContentLoaded', function() {
  const hash = window.location.hash;
  if (hash && hash.includes('?')) {
    const params = new URLSearchParams(hash.split('?')[1]);
    const service = params.get('service');
    if (service) {
      const select = document.querySelector('select[name="service"]');
      if (select) {
        select.value = service;
      }
    }
  }
});
