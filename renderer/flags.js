(function () {
  'use strict';

  // Crisp inline SVG definitions (viewBox 0 0 24 16) for countries on VPN Gate + major regions.
  // Windows 10/11 Segoe UI Emoji does not render Unicode regional flag emojis, so inline SVGs
  // ensure razor-sharp flags offline on every Windows system.
  const SVG_FLAGS = {
    JP: '<rect width="24" height="16" fill="#fff"/><circle cx="12" cy="8" r="4.6" fill="#bc002d"/>',
    KR: '<rect width="24" height="16" fill="#fff"/><circle cx="12" cy="8" r="4" fill="#cd2e3a"/><path d="M12,8 a2,2 0 0,1 -4,0 a4,4 0 0,0 8,0 a2,2 0 0,0 -4,0" fill="#0047a0"/><g fill="#111"><rect x="4.5" y="3" width="3" height=".8" transform="rotate(-33 6 3.4)"/><rect x="16.5" y="3" width="3" height=".8" transform="rotate(33 18 3.4)"/><rect x="4.5" y="12.2" width="3" height=".8" transform="rotate(33 6 12.6)"/><rect x="16.5" y="12.2" width="3" height=".8" transform="rotate(-33 18 12.6)"/></g>',
    US: '<rect width="24" height="16" fill="#b22234"/><path d="M0,2.46h24M0,4.92h24M0,7.38h24M0,9.85h24M0,12.31h24M0,14.77h24" stroke="#fff" stroke-width="1.23"/><rect width="10" height="8.6" fill="#3c3b6e"/>',
    DE: '<rect width="24" height="5.34" fill="#111"/><rect y="5.33" width="24" height="5.34" fill="#dd0000"/><rect y="10.66" width="24" height="5.34" fill="#ffce00"/>',
    NL: '<rect width="24" height="5.34" fill="#ae1c28"/><rect y="5.33" width="24" height="5.34" fill="#fff"/><rect y="10.66" width="24" height="5.34" fill="#21468b"/>',
    FR: '<rect width="8" height="16" fill="#002395"/><rect x="8" width="8" height="16" fill="#fff"/><rect x="16" width="8" height="16" fill="#ed2939"/>',
    GB: '<rect width="24" height="16" fill="#012169"/><path d="M0,0 L24,16 M24,0 L0,16" stroke="#fff" stroke-width="2.8"/><path d="M0,0 L24,16 M24,0 L0,16" stroke="#c8102e" stroke-width="1.4"/><path d="M12,0 V16 M0,8 H24" stroke="#fff" stroke-width="4.4"/><path d="M12,0 V16 M0,8 H24" stroke="#c8102e" stroke-width="2.6"/>',
    CA: '<rect width="24" height="16" fill="#ff0000"/><rect x="6" width="12" height="16" fill="#fff"/><path d="M12,3.2 l1.1,2.4 l2.2,-.4 l-1.2,2.2 l1.3,.7 l-2.9,.9 v2.2 h-1 v-2.2 l-2.9,-.9 l1.3,-.7 l-1.2,-2.2 l2.2,.4 z" fill="#ff0000"/>',
    TW: '<rect width="24" height="16" fill="#fe0000"/><rect width="12" height="8" fill="#000095"/><circle cx="6" cy="4" r="2.1" fill="#fff"/>',
    TH: '<rect width="24" height="16" fill="#a51931"/><rect y="2.67" width="24" height="10.66" fill="#f4f5f8"/><rect y="5.33" width="24" height="5.34" fill="#2d2a4a"/>',
    VN: '<rect width="24" height="16" fill="#da251d"/><polygon points="12,3.4 13.2,7 17,7 13.9,9.2 15.1,12.8 12,10.6 8.9,12.8 10.1,9.2 7,7 10.8,7" fill="#ffff00"/>',
    ID: '<rect width="24" height="8" fill="#ce1126"/><rect y="8" width="24" height="8" fill="#fff"/>',
    SG: '<rect width="24" height="8" fill="#ef3340"/><rect y="8" width="24" height="8" fill="#fff"/><circle cx="5.4" cy="4" r="2.5" fill="#fff"/><circle cx="6.3" cy="4" r="2.2" fill="#ef3340"/>',
    HK: '<rect width="24" height="16" fill="#de2910"/><circle cx="12" cy="8" r="3.4" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="3.2 1.1"/>',
    IN: '<rect width="24" height="5.34" fill="#ff9933"/><rect y="5.33" width="24" height="5.34" fill="#fff"/><rect y="10.66" width="24" height="5.34" fill="#138808"/><circle cx="12" cy="8" r="1.9" fill="none" stroke="#000080" stroke-width=".9"/>',
    AU: '<rect width="24" height="16" fill="#00008b"/><path d="M0,0 L12,8 M12,0 L0,8" stroke="#fff" stroke-width="1.6"/><path d="M6,0 V8 M0,4 H12" stroke="#fff" stroke-width="2.4"/><path d="M6,0 V8 M0,4 H12" stroke="#cc0000" stroke-width="1.3"/><circle cx="6" cy="12" r="1.3" fill="#fff"/><circle cx="18" cy="4" r=".9" fill="#fff"/><circle cx="16" cy="8" r=".9" fill="#fff"/><circle cx="20" cy="7.5" r=".9" fill="#fff"/><circle cx="18" cy="12" r="1" fill="#fff"/>',
    BR: '<rect width="24" height="16" fill="#009c3b"/><polygon points="12,2 21.5,8 12,14 2.5,8" fill="#ffdf00"/><circle cx="12" cy="8" r="3.2" fill="#002776"/>',
    TR: '<rect width="24" height="16" fill="#e30a17"/><circle cx="10" cy="8" r="4" fill="#fff"/><circle cx="11.1" cy="8" r="3.2" fill="#e30a17"/><polygon points="14.2,8 17.2,6.9 15.4,9.5 15.4,6.5 17.2,9.1" fill="#fff"/>',
    SE: '<rect width="24" height="16" fill="#006aa7"/><rect x="7" width="3.2" height="16" fill="#fecc02"/><rect y="6.4" width="24" height="3.2" fill="#fecc02"/>',
    FI: '<rect width="24" height="16" fill="#fff"/><rect x="7" width="3.4" height="16" fill="#003580"/><rect y="6.3" width="24" height="3.4" fill="#003580"/>',
    NO: '<rect width="24" height="16" fill="#ba0c2f"/><rect x="6.5" width="4" height="16" fill="#fff"/><rect y="6" width="24" height="4" fill="#fff"/><rect x="7.5" width="2" height="16" fill="#00205b"/><rect y="7" width="24" height="2" fill="#00205b"/>',
    DK: '<rect width="24" height="16" fill="#c8102e"/><rect x="7" width="3" height="16" fill="#fff"/><rect y="6.5" width="24" height="3" fill="#fff"/>',
    CH: '<rect width="24" height="16" fill="#d52b1e"/><rect x="10.2" y="3.5" width="3.6" height="9" fill="#fff"/><rect x="7.5" y="6.2" width="9" height="3.6" fill="#fff"/>',
    PL: '<rect width="24" height="8" fill="#fff"/><rect y="8" width="24" height="8" fill="#dc143c"/>',
    UA: '<rect width="24" height="8" fill="#005bbb"/><rect y="8" width="24" height="8" fill="#ffd500"/>',
    RO: '<rect width="8" height="16" fill="#002b7f"/><rect x="8" width="8" height="16" fill="#fcd116"/><rect x="16" width="8" height="16" fill="#ce1126"/>',
    IT: '<rect width="8" height="16" fill="#009246"/><rect x="8" width="8" height="16" fill="#fff"/><rect x="16" width="8" height="16" fill="#ce2b37"/>',
    IE: '<rect width="8" height="16" fill="#169b62"/><rect x="8" width="8" height="16" fill="#fff"/><rect x="16" width="8" height="16" fill="#ff883e"/>',
    BE: '<rect width="8" height="16" fill="#111"/><rect x="8" width="8" height="16" fill="#fae042"/><rect x="16" width="8" height="16" fill="#ed2939"/>',
    ES: '<rect width="24" height="16" fill="#aa151b"/><rect y="4" width="24" height="8" fill="#f1bf00"/>',
    AT: '<rect width="24" height="5.34" fill="#ed2939"/><rect y="5.33" width="24" height="5.34" fill="#fff"/><rect y="10.66" width="24" height="5.34" fill="#ed2939"/>',
    CZ: '<rect width="24" height="8" fill="#fff"/><rect y="8" width="24" height="8" fill="#d7141a"/><polygon points="0,0 12,8 0,16" fill="#11457e"/>',
    MY: '<rect width="24" height="16" fill="#cc0001"/><path d="M0,2.3h24M0,5.7h24M0,9.1h24M0,12.6h24M0,15.4h24" stroke="#fff" stroke-width="1.3"/><rect width="12" height="8.5" fill="#010066"/><circle cx="5.2" cy="4.2" r="2.2" fill="#ffcc00"/><circle cx="6" cy="4.2" r="1.9" fill="#010066"/>',
    PH: '<rect width="24" height="8" fill="#0038a8"/><rect y="8" width="24" height="8" fill="#ce1126"/><polygon points="0,0 11,8 0,16" fill="#fff"/><circle cx="4.2" cy="8" r="1.6" fill="#fcd116"/>',
    AE: '<rect width="24" height="5.34" fill="#00732f"/><rect y="5.33" width="24" height="5.34" fill="#fff"/><rect y="10.66" width="24" height="5.34" fill="#111"/><rect width="6.5" height="16" fill="#ff0000"/>',
    MX: '<rect width="8" height="16" fill="#006847"/><rect x="8" width="8" height="16" fill="#fff"/><rect x="16" width="8" height="16" fill="#ce1126"/><circle cx="12" cy="8" r="1.8" fill="#8c6239"/>',
    AR: '<rect width="24" height="5.34" fill="#74acdf"/><rect y="5.33" width="24" height="5.34" fill="#fff"/><rect y="10.66" width="24" height="5.34" fill="#74acdf"/><circle cx="12" cy="8" r="1.6" fill="#f6b40e"/>',
    ZA: '<rect width="24" height="8" fill="#e03c31"/><rect y="8" width="24" height="8" fill="#001489"/><path d="M0,1.5 L10,8 L0,14.5 M10,8 H24" stroke="#fff" stroke-width="3.6" fill="none"/><path d="M0,1.5 L10,8 L0,14.5 M10,8 H24" stroke="#007749" stroke-width="2.2" fill="none"/><polygon points="0,3.2 7.2,8 0,12.8" fill="#111"/>',
    BG: '<rect width="24" height="5.34" fill="#fff"/><rect y="5.33" width="24" height="5.34" fill="#00966e"/><rect y="10.66" width="24" height="5.34" fill="#d62612"/>',
    HU: '<rect width="24" height="5.34" fill="#ce2939"/><rect y="5.33" width="24" height="5.34" fill="#fff"/><rect y="10.66" width="24" height="5.34" fill="#477050"/>'
  };

  const displayNamesCache = {};

  function getDisplayNames(lang) {
    const key = lang === 'en' ? 'en' : 'fa';
    if (!displayNamesCache[key]) {
      try {
        displayNamesCache[key] = new Intl.DisplayNames([key], { type: 'region' });
      } catch {
        displayNamesCache[key] = null;
      }
    }
    return displayNamesCache[key];
  }

  function countryName(cc, fallback = '', lang = 'fa') {
    const code = String(cc || '').trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(code)) {
      const dn = getDisplayNames(lang);
      if (dn) {
        try {
          const name = dn.of(code);
          if (name && name.toUpperCase() !== code) return name;
        } catch {}
      }
    }
    return fallback || code || '--';
  }

  function flagElement(cc, size = 'md') {
    const code = String(cc || '').trim().toUpperCase();
    const wrap = document.createElement('span');
    wrap.className = `flag-chip flag-${size}`;

    if (/^[A-Z]{2}$/.test(code) && SVG_FLAGS[code]) {
      wrap.innerHTML =
        `<svg viewBox="0 0 24 16" aria-hidden="true" focusable="false">` +
        SVG_FLAGS[code] +
        `<rect x="0.35" y="0.35" width="23.3" height="15.3" rx="2.2" fill="none" stroke="rgba(128,128,150,0.28)" stroke-width="0.7"/>` +
        `</svg>`;
      wrap.title = code;
      return wrap;
    }

    wrap.classList.add('flag-code');
    wrap.textContent = /^[A-Z]{2}$/.test(code) ? code : '🌐';
    return wrap;
  }

  window.BanafshFlags = {
    countryName,
    flagElement
  };
})();
