/* Next Prayer site: the live menu bar item, its panel, and the day scrubber.
   The countdown mirrors the app (PrayerStore.swift): HH:MM when an hour or
   more away, MM:SS under it, a blink in the last ten minutes, and tomorrow's
   Fajr after Isha. Times are the featured mosques' real timetables, read in
   the mosque's own time zone. */
(() => {
  'use strict';

  const MOSQUES = window.NP_MOSQUES || {};
  const ORDER = ['paris', 'lyon', 'marseille', 'brussels', 'london', 'montreal'].filter((id) => MOSQUES[id]);
  if (!ORDER.length) return;

  // Other spellings people will type for these cities.
  const ALIASES = {
    brussels: 'brussels brussel',
    london: 'londres',
    montreal: 'montreal masjid al salam',
  };

  // Calendar days are [fajr, sunrise, dhuhr, asr, maghrib, isha]; `at` indexes that.
  const PRAYERS = [
    { key: 'fajr', name: 'Fajr', icon: 'i-fajr', at: 0 },
    { key: 'dhuhr', name: 'Dhuhr', icon: 'i-dhuhr', at: 2 },
    { key: 'asr', name: 'Asr', icon: 'i-asr', at: 3 },
    { key: 'maghrib', name: 'Maghrib', icon: 'i-maghrib', at: 4 },
    { key: 'isha', name: 'Isha', icon: 'i-isha', at: 5 },
  ];

  const T = {
    en: {
      'doc.title': "Next Prayer: your mosque's prayer times in the Mac menu bar",
      'doc.desc': "Your mosque's real prayer times, live in the Mac menu bar. A quiet countdown, a gentle reminder, and zero tracking. Free.",
      'nav.day': 'A day',
      'nav.why': 'Why',
      'nav.privacy': 'Privacy',
      'hero.hint': "It's already running. Click it.",
      'hero.title1': 'Your mosque,',
      'hero.title2': 'in your menu bar. Free.',
      'hero.lead': "Your mosque's real prayer times, as a live countdown in your Mac's menu bar. Not a formula's best guess.",
      'store.badge': 'Download on the Mac App Store',
      'store.meta': 'macOS 14 or later · No data collected',
      'day.title': 'A day in the menu bar.',
      'day.lead': "Drag through the day. The countdown follows, the next prayer lights up, and after Isha it rolls over to tomorrow's Fajr.",
      'day.reset': 'Back to now',
      'day.today': "Today's times",
      'day.scrub': 'Time of day',
      'why.title': 'Small app. Right times.',
      'f1.t': 'Your mosque, not a formula',
      'f1.d': 'The exact times your imam sets, straight from mawaqit.net and its 8,000+ mosques. When your mosque says 22:47, so does your Mac.',
      'f2.t': 'Always in sight',
      'f2.d': "No window, no Dock icon. One glance at the menu bar and you know what's next.",
      'f3.t': 'A gentle heads-up',
      'f3.d': 'An optional reminder 10 minutes before each prayer, and a soft blink in the final ten.',
      'f4.t': 'It knows Fridays',
      'f4.d': 'Jumua times appear on Fridays, all by themselves.',
      'f5.t': 'Private mode',
      'f5.d': 'Show only the countdown. Which prayer is next stays between you and your Mac.',
      'f6.t': 'Your business is yours',
      // Inside the feature cards
      'b.yours': 'Your mosque',
      'b.formula': 'A formula',
      'b.now': 'now',
      'b.notif': (time) => `In 10 minutes, at ${time}`,
      'b.dnc': 'Data Not Collected',
      'b.label': 'Privacy label on the App Store',
      'f6.d': 'No account, no ads, no analytics. The app talks to exactly one place: mawaqit.net.',
      'closer.title': 'Free. Properly.',
      'closer.lead': 'The whole app. No locked features, no subscription waiting to pounce.',
      'footer.contact': 'Contact',
      'footer.fine': 'Next Prayer is an independent app, not affiliated with MAWAQIT. Times come from public mawaqit.net pages.',
      'lang.switch': 'Passer en français',
      // The panel: the app's own strings (Localizable.xcstrings).
      'p.in': (prayer, time) => `${prayer} in ${time}`,
      'p.loading': 'Loading…',
      'p.sunrise': 'Sunrise',
      'p.reminder': 'Reminder',
      'p.before': '10 min before',
      'p.reminderHelp': 'A reminder 10 minutes before each prayer',
      'p.menubar': 'Menu bar',
      'p.menubarHelp': 'What the menu bar shows: the prayer and countdown, or the countdown alone',
      'p.full': 'Full',
      'p.private': 'Private',
      'p.updated': (time) => `Times updated ${time}`,
      'p.quit': 'Quit',
      'p.search': 'Search city or mosque',
      'p.change': 'Change',
      'p.done': 'Done',
      'p.try': 'Try a mosque',
      'p.none': 'No mosques found.',
      'p.caption': 'In the app: 8,000+ mosques via mawaqit.net',
    },
    fr: {
      'doc.title': 'Next Prayer : les horaires de votre mosquée dans la barre des menus du Mac',
      'doc.desc': 'Les vrais horaires de votre mosquée, en direct dans la barre des menus du Mac. Un compte à rebours discret, un rappel, zéro pistage. Gratuit.',
      'nav.day': 'Une journée',
      'nav.why': 'Pourquoi',
      'nav.privacy': 'Confidentialité',
      'hero.hint': 'Elle tourne déjà. Cliquez dessus.',
      'hero.title1': 'Votre mosquée,',
      'hero.title2': 'dans la barre des menus. Gratuit.',
      'hero.lead': "Les vrais horaires de votre mosquée, en compte à rebours dans la barre des menus de votre Mac. Pas l'estimation d'une formule.",
      'store.badge': 'Télécharger dans le Mac App Store',
      'store.meta': 'macOS 14 ou ultérieur · Aucune donnée collectée',
      'day.title': 'Une journée dans la barre des menus.',
      'day.lead': "Faites glisser la journée. Le compte à rebours suit, la prochaine prière s'allume, et après Isha, cap sur le Fajr de demain.",
      'day.reset': 'Revenir à maintenant',
      'day.today': 'Horaires du jour',
      'day.scrub': 'Heure de la journée',
      'why.title': 'Petite app. Les bons horaires.',
      'f1.t': 'Votre mosquée, pas une formule',
      'f1.d': 'Les horaires exacts fixés par votre imam, directement depuis mawaqit.net et ses plus de 8 000 mosquées. Quand votre mosquée dit 22:47, votre Mac aussi.',
      'f2.t': 'Toujours visible',
      'f2.d': "Pas de fenêtre, pas d'icône dans le Dock. Un coup d'œil à la barre des menus et vous savez.",
      'f3.t': 'Un petit rappel',
      'f3.d': 'Une notification facultative 10 minutes avant chaque prière, et un léger clignotement dans les dix dernières.',
      'f4.t': 'Il connaît le vendredi',
      'f4.d': "Les horaires de la Jumua s'affichent tout seuls le vendredi.",
      'f5.t': 'Mode privé',
      'f5.d': 'Seulement le compte à rebours. Quelle prière arrive, ça reste entre vous et votre Mac.',
      'f6.t': 'Vos affaires restent vos affaires',
      'b.yours': 'Votre mosquée',
      'b.formula': 'Une formule',
      'b.now': 'maintenant',
      'b.notif': (time) => `Dans 10 minutes, à ${time}`,
      'b.dnc': 'Données non collectées',
      'b.label': "Étiquette de confidentialité de l'App Store",
      'f6.d': "Pas de compte, pas de pub, pas de statistiques. L'app ne parle qu'à un seul endroit : mawaqit.net.",
      'closer.title': 'Gratuit, vraiment.',
      'closer.lead': "Toute l'app. Rien de verrouillé, pas d'abonnement embusqué.",
      'footer.contact': 'Contact',
      'footer.fine': 'Next Prayer est une app indépendante, sans affiliation avec MAWAQIT. Les horaires proviennent des pages publiques de mawaqit.net.',
      'lang.switch': 'Switch to English',
      'p.in': (prayer, time) => `${prayer} dans ${time}`,
      'p.loading': 'Chargement…',
      'p.sunrise': 'Lever du soleil',
      'p.reminder': 'Rappel',
      'p.before': '10 min avant',
      'p.reminderHelp': 'Un rappel 10 minutes avant chaque prière',
      'p.menubar': 'Barre des menus',
      'p.menubarHelp': "Ce qu'affiche la barre des menus : la prière et le compte à rebours, ou le compte à rebours seul",
      'p.full': 'Complet',
      'p.private': 'Privé',
      'p.updated': (time) => `Horaires actualisés à ${time}`,
      'p.quit': 'Quitter',
      'p.search': 'Rechercher une ville ou une mosquée',
      'p.change': 'Modifier',
      'p.done': 'Terminé',
      'p.try': 'Essayez une mosquée',
      'p.none': 'Aucune mosquée trouvée.',
      'p.caption': "Dans l'app : plus de 8 000 mosquées via mawaqit.net",
    },
  };

  // ---------- Small helpers ----------

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const pad = (n) => String(n).padStart(2, '0');
  const hhmm = (minutes) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const t = (key) => T[state.lang][key] ?? T.en[key];
  const setText = (el, text) => { if (el.textContent !== text) el.textContent = text; };

  // Browser storage can throw (private windows, blocked site data), and the
  // page has to work without it.
  const saved = {
    get(key) { try { return localStorage.getItem(`np.${key}`); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(`np.${key}`, value); } catch { /* not kept */ } },
  };

  /** `HH:MM` when an hour or more away, otherwise `MM:SS`, like the app. */
  function countdown(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    return s >= 3600 ? `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}` : `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
  }

  // ---------- State ----------

  function pickLang() {
    const stored = saved.get('lang');
    if (stored === 'en' || stored === 'fr') return stored;
    const first = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
    return first.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  }

  /** The featured mosque nearest the visitor, going by their time zone. */
  function nearestMosque() {
    let tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { /* keep Paris */ }
    if (tz === 'Europe/London') return 'london';
    if (tz === 'Europe/Brussels') return 'brussels';
    if (tz === 'America/Toronto' || tz === 'America/Montreal') return 'montreal';
    return 'paris';
  }

  const state = {
    lang: pickLang(),
    mosque: MOSQUES[saved.get('mosque')] ? saved.get('mosque') : nearestMosque(),
    style: saved.get('style') === 'private' ? 'private' : 'full',
    reminder: false,
    offset: 0,        // ms the scrubber has moved the clock
    loadingUntil: 0,  // a mosque change shows the loading state, like the app's fetch
    updatedAt: Date.now(),
  };

  // ---------- Time, in the mosque's own time zone ----------

  const wallFormats = new Map();
  function wall(ms, tz) {
    let format = wallFormats.get(tz);
    if (!format) {
      format = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, hourCycle: 'h23', weekday: 'short',
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
      });
      wallFormats.set(tz, format);
    }
    const p = {};
    for (const part of format.formatToParts(ms)) p[part.type] = part.value;
    return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour % 24, mi: +p.minute, s: +p.second, friday: p.weekday === 'Fri' };
  }

  /** A day's six times, in minutes after midnight. */
  function dayTimes(mosque, y, m, d) {
    const month = mosque.cal[m - 1];
    const start = Math.min((d - 1) * 24, month.length - 24); // Feb 29 in a year that has none
    const out = [];
    for (let k = 0; k < 6; k++) {
      const hm = month.substr(start + k * 4, 4);
      out.push(+hm.slice(0, 2) * 60 + +hm.slice(2));
    }
    return out;
  }

  function nextDay({ y, m, d }) {
    const date = new Date(Date.UTC(y, m - 1, d + 1));
    return { y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate() };
  }

  const now = () => Date.now() + state.offset;

  /** Everything the page shows at a moment: the day's times and what's next. */
  function snapshot(ms) {
    const mosque = MOSQUES[state.mosque];
    const w = wall(ms, mosque.tz);
    const times = dayTimes(mosque, w.y, w.m, w.d);
    const sec = w.h * 3600 + w.mi * 60 + w.s;
    let next = null;
    for (const prayer of PRAYERS) {
      const at = times[prayer.at] * 60;
      if (at > sec) { next = { prayer, remaining: at - sec, tomorrow: false, at: times[prayer.at] }; break; }
    }
    if (!next) {
      const tomorrow = nextDay(w);
      const fajr = dayTimes(mosque, tomorrow.y, tomorrow.m, tomorrow.d)[0];
      next = { prayer: PRAYERS[0], remaining: 86400 - sec + fajr * 60, tomorrow: true, at: fajr };
    }
    return {
      ms, w, times, next, mosque,
      minute: w.h * 60 + w.mi,
      urgent: next.remaining > 0 && next.remaining <= 600,
      loading: Date.now() < state.loadingUntil,
    };
  }

  function menuTitle(snap) {
    if (snap.loading) return t('p.loading');
    const time = countdown(snap.next.remaining);
    return state.style === 'private' ? time : t('p.in')(snap.next.prayer.name, time);
  }

  const clockNames = new Map();
  function clockText(snap) {
    const locale = state.lang === 'fr' ? 'fr-FR' : 'en-US';
    let names = clockNames.get(locale);
    if (!names) {
      names = {
        weekday: new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }),
        month: new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' }),
      };
      clockNames.set(locale, names);
    }
    const { w } = snap;
    const day = Date.UTC(w.y, w.m - 1, w.d, 12);
    const time = `${pad(w.h)}:${pad(w.mi)}`;
    return {
      long: `${names.weekday.format(day)} ${w.d} ${names.month.format(day)} ${time}`,
      short: time,
    };
  }

  function localTime(ms) {
    const w = wall(ms, MOSQUES[state.mosque].tz);
    return `${pad(w.h)}:${pad(w.mi)}`;
  }

  // ---------- Dunes: the colours of the day ----------

  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  const ease = (t) => t * t * (3 - 2 * t);

  function mixHex(a, b, t) {
    const x = parseInt(a.slice(1), 16);
    const y = parseInt(b.slice(1), 16);
    const channel = (shift) => Math.round(((x >> shift) & 255) + (((y >> shift) & 255) - ((x >> shift) & 255)) * t);
    return `#${((channel(16) << 16) | (channel(8) << 8) | channel(0)).toString(16).padStart(6, '0')}`;
  }

  function luminance(hex) {
    const n = parseInt(hex.slice(1), 16);
    return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  }

  // The stage wallpaper at its key moments. `far` and `near` are the first and
  // last ridge; the three between are blended from them. Night is the App
  // Store screenshot's midnight and indigo under lavender moonlight, with dusk
  // a violet on the way there; through the day the sand is gold, deepening
  // to amber.
  const SKY = {
    night:   { skyTop: '#171744', skyLow: '#2C2D86', glow: '#A3A4E6', strength: 0.28, far: '#34369A', near: '#141440', lit: '#8E92E6', shade: '#0A0A26' },
    dawn:    { skyTop: '#27324A', skyLow: '#C4978B', glow: '#F4C7A6', strength: 0.55, far: '#7A7082', near: '#2B3043', lit: '#E0B09A', shade: '#161A26' },
    sunrise: { skyTop: '#A9B8B2', skyLow: '#F4CF98', glow: '#FFE1A8', strength: 0.9,  far: '#EFC98A', near: '#C88A40', lit: '#FFE6B0', shade: '#8F5A24' },
    day:     { skyTop: '#DCE1D2', skyLow: '#F6E7C4', glow: '#FFF3D4', strength: 0.7,  far: '#F2D69A', near: '#D9A24C', lit: '#FFF1CE', shade: '#A56C28' },
    golden:  { skyTop: '#E9CF9C', skyLow: '#F4C47A', glow: '#FFD58A', strength: 1.0,  far: '#F0BD62', near: '#C97C28', lit: '#FFDB8E', shade: '#8A511A' },
    sunset:  { skyTop: '#473D55', skyLow: '#E88D5E', glow: '#FFB070', strength: 1.0,  far: '#C9804A', near: '#5C3420', lit: '#FBB070', shade: '#2A1812' },
    dusk:    { skyTop: '#1E1D52', skyLow: '#5A4E8A', glow: '#B7A6D8', strength: 0.35, far: '#3E3C7A', near: '#16163F', lit: '#8A86C2', shade: '#0A0A24' },
  };
  const SKY_KEYS = ['skyTop', 'skyLow', 'glow', 'far', 'near', 'lit', 'shade'];
  const HORIZON = 0.5;
  const MOON = [0.8, 0.84];

  /** When each look peaks, from the day's prayer times (minutes after midnight). */
  function skyAnchors(times) {
    const [fajr, sunrise, , asr, maghrib, isha] = times;
    return [
      [0, 'night'], [fajr - 25, 'night'], [fajr + 20, 'dawn'], [sunrise + 10, 'sunrise'],
      [sunrise + 80, 'day'], [asr, 'day'], [(asr + maghrib) / 2 + 15, 'golden'],
      [maghrib - 5, 'sunset'], [(maghrib + isha) / 2, 'dusk'], [isha + 15, 'night'], [1440, 'night'],
    ].sort((a, b) => a[0] - b[0]);
  }

  /** The stage wallpaper's palette at a minute of the day. */
  function skyAt(times, minute) {
    const anchors = skyAnchors(times);
    let i = 0;
    while (i < anchors.length - 2 && minute >= anchors[i + 1][0]) i++;
    const [m0, from] = anchors[i];
    const [m1, to] = anchors[i + 1];
    const t = m1 > m0 ? ease(clamp((minute - m0) / (m1 - m0), 0, 1)) : 0;
    const c = {};
    for (const key of SKY_KEYS) c[key] = mixHex(SKY[from][key], SKY[to][key], t);
    let strength = SKY[from].strength + (SKY[to].strength - SKY[from].strength) * t;

    // The sun arcs from sunrise to Maghrib and dips below the horizon either
    // side; at night a faint moon waits up top. Where one hands over to the
    // other, the glow fades out and back in rather than sliding across the sky.
    const sunrise = times[1];
    const maghrib = times[4];
    const p = (minute - sunrise) / (maghrib - sunrise);
    const sun = [
      0.1 + 0.8 * clamp(p, -0.12, 1.12),
      HORIZON + 0.4 * Math.sin(Math.PI * clamp(p, 0, 1)) - 0.3 * Math.max(0, -p) - 0.3 * Math.max(0, p - 1),
    ];
    const moon = Math.max(
      1 - ease(clamp((minute - (sunrise - 110)) / 50, 0, 1)),
      ease(clamp((minute - (maghrib + 60)) / 50, 0, 1)),
    );
    const [x, y] = moon > 0.5 ? MOON : sun;
    strength *= Math.abs(2 * moon - 1);
    // The direction the dunes are lit from blends through the handover rather
    // than following the glow's jump: it's what caught the eye when the light
    // flipped sides at the sun-to-moon switch. Sun and moon being on the same
    // side at dusk, nothing moves then; at dawn it swings across over the
    // handover's fifty minutes.
    const side = (at) => clamp((at - 0.5) * 6, -1, 1);
    const light = side(sun[0]) * (1 - moon) + side(MOON[0]) * moon;

    return {
      // What's under the stage's menu bar: sky for side-on forms, sand from above.
      light: luminance(TOP_DOWN ? mixHex(c.far, c.near, 0.3) : c.skyTop) > 0.5,
      palette: {
        skyTop: c.skyTop, skyLow: c.skyLow, glow: c.glow, lit: c.lit, shade: c.shade,
        layers: [0, 0.25, 0.5, 0.75, 1].map((f) => mixHex(c.far, c.near, f)),
        sun: [+x.toFixed(4), +y.toFixed(4), +strength.toFixed(3)],
        light: +light.toFixed(3),
      },
    };
  }

  // The hero's dunes are gold on the page colour, every ridge of them; the band
  // fades into the page at both edges (styles.css) rather than ending on a
  // page-coloured ridge, which read as a white cut-out. In dark mode the gold
  // drops to bronze.
  function heroPalette() {
    const paper = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim();
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // Side-on, light from off to the right; from above, a low sun on the left.
    const sun = TOP_DOWN ? [0.15, 0.62, 0.8] : [1.6, 0.9, 0];
    return dark
      ? { skyTop: paper, skyLow: paper, glow: paper, sun, lit: '#D6AE62', shade: '#0A0805',
          layers: ['#2B2416', '#3A2F1A', '#4B3B1D', '#5C4721', '#6B5224'] }
      : { skyTop: paper, skyLow: paper, glow: paper, sun, lit: '#FFF6DC', shade: '#B5772E',
          layers: ['#F7E6BC', '#F1D291', '#E9BD6A', '#DDA44B', '#D08F3A'] };
  }

  // The closer, in the App Store screenshot's colours: indigo dunes under a
  // midnight sky, with the lavender of its waves as the light on the crests.
  const CLOSER_PALETTE = {
    skyTop: '#171744', skyLow: '#2C2D86', glow: '#A3A4E6', sun: [0.74, 0.46, 0.45],
    lit: '#A3A4E6', shade: '#10103A',
    layers: ['#585ADC', '#4A4CD0', '#3A3CBC', '#2E30A0', '#23247F'],
  };

  // Each form, sized for the hero, the stage and the closer. `shape` means
  // something different per form (see dunes.js); fx is [grain, ripples, flat
  // front ridge, grain in the sky].
  const DUNE_FORMS = {
    ridges: {
      hero: { shape: [0.7, 0.2, 0.05, 0.12], unit: 380, fx: [0.022, 0, 0, 0] },
      stage: { shape: [HORIZON, 0.1, 0.045, 0.11], unit: 300, fx: [0.03, 0, 0, 1] },
      closer: { shape: [0.44, 0.08, 0.045, 0.1], unit: 360, fx: [0.028, 0, 0, 1] },
    },
    sweep: {
      hero: { shape: [0.66, 0.2, 0.08, 0.2], unit: 170, fx: [0.022, 0, 0, 0] },
      stage: { shape: [HORIZON, 0.12, 0.07, 0.2], unit: 150, fx: [0.03, 0, 0, 1] },
      closer: { shape: [0.44, 0.1, 0.06, 0.16], unit: 170, fx: [0.028, 0, 0, 1] },
    },
    ripples: {
      hero: { shape: [1, 0.9, 0, 0.2], unit: 26, fx: [0.03, 0, 0, 1] },
      stage: { shape: [1, 0.9, 0, 0.2], unit: 22, fx: [0.03, 0, 0, 1] },
      closer: { shape: [1, 0.9, 0, 0.2], unit: 26, fx: [0.03, 0, 0, 1] },
    },
  };
  // Try another with ?dunes=ridges|sweep|ripples.
  const requested = new URLSearchParams(window.location.search).get('dunes');
  const FORM = DUNE_FORMS[requested] ? requested : 'sweep';
  const TOP_DOWN = FORM === 'ripples';

  const Dunes = window.Dunes;
  const stageBox = $('.stage');
  const makeDunes = (selector, place, seed) => Dunes && new Dunes($(selector), { form: FORM, seed, ...DUNE_FORMS[FORM][place] });
  const heroDunes = makeDunes('.dunes--hero', 'hero', 1.3);
  const stageDunes = makeDunes('.dunes--stage', 'stage', 4.2);
  const closerDunes = makeDunes('.dunes--closer', 'closer', 7.9);
  // Seen from above there's no horizon to blend into, so the hero's band of
  // sand fades out at both edges instead.
  $('.dunes--hero').classList.toggle('is-top-down', TOP_DOWN);
  if (heroDunes) {
    heroDunes.set(heroPalette());
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => heroDunes.set(heroPalette()));
  }
  if (closerDunes) closerDunes.set(CLOSER_PALETTE);

  // ---------- The panel ----------

  /** One prayer row, as the panel draws it (the feature cards reuse it). */
  const rowHtml = (icon, label, time, isNext) => `
    <div class="p-row${isNext ? ' is-next' : ''}">
      <span class="p-ic" aria-hidden="true"><svg><use href="#${icon}"/></svg></span>
      <span class="p-name">${esc(label)}</span>
      <span class="p-time">${time}</span>
    </div>`;

  const PANEL_HTML = `
    <div class="p-list"></div>
    <div class="p-picker">
      <div class="p-mosque">
        <span class="p-mosque__glyph" aria-hidden="true"><svg><use href="#i-mosque"/></svg></span>
        <span class="p-mosque__text">
          <span class="p-mosque__name" dir="auto"></span>
          <span class="p-mosque__city"></span>
        </span>
        <button class="p-glyphbtn p-toggle" type="button" aria-expanded="false"></button>
      </div>
      <div class="p-search">
        <div class="p-search__inner">
          <div class="p-field">
            <svg aria-hidden="true"><use href="#i-search"/></svg>
            <input type="text" autocomplete="off" autocapitalize="off" spellcheck="false">
            <button class="p-clear" type="button" hidden><svg><use href="#i-clear"/></svg></button>
          </div>
          <div class="p-results"></div>
          <p class="p-caption"></p>
        </div>
      </div>
    </div>
    <div class="p-settings">
      <div class="p-set p-set--reminder">
        <span class="p-set__label" data-k="p.reminder"></span>
        <span class="p-set__value" data-k="p.before"></span>
        <button class="p-switch" type="button" role="switch" aria-checked="false"></button>
      </div>
      <div class="p-set p-set--style">
        <span class="p-set__label" data-k="p.menubar"></span>
        <span class="p-seg" role="radiogroup">
          <button type="button" role="radio" data-style="full" data-k="p.full"></button>
          <button type="button" role="radio" data-style="private" data-k="p.private"></button>
        </span>
      </div>
    </div>
    <div class="p-foot">
      <span class="p-updated"></span>
      <button class="p-btn p-quit" type="button" data-k="p.quit"></button>
    </div>`;

  function createPanel(root, { onQuit }) {
    root.innerHTML = PANEL_HTML;
    const list = $('.p-list', root);
    const name = $('.p-mosque__name', root);
    const city = $('.p-mosque__city', root);
    const toggle = $('.p-toggle', root);
    const search = $('.p-search', root);
    const field = $('.p-field', root);
    const input = $('input', root);
    const clear = $('.p-clear', root);
    const results = $('.p-results', root);
    const caption = $('.p-caption', root);
    const reminder = $('.p-switch', root);
    const styles = $$('.p-seg button', root);
    const updated = $('.p-updated', root);
    let listKey = '';
    let searchOpen = false;
    let clearTimer = 0;

    function setSearch(open, { instant = false } = {}) {
      searchOpen = open;
      clearTimeout(clearTimer);
      if (instant) root.classList.add('no-anim');
      search.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      labelToggle();
      if (open) {
        renderResults();
        requestAnimationFrame(() => input.focus({ preventScroll: true }));
      } else if (instant) {
        input.value = '';
        renderResults();
      } else {
        // Emptied once the collapse is over, so the block doesn't shrink as it fades.
        clearTimer = setTimeout(() => { input.value = ''; renderResults(); }, 200);
      }
      if (instant) requestAnimationFrame(() => root.classList.remove('no-anim'));
    }

    function labelToggle() {
      toggle.innerHTML = `<svg aria-hidden="true"><use href="#${searchOpen ? 'i-close' : 'i-search'}"/></svg>`;
      toggle.title = t(searchOpen ? 'p.done' : 'p.change');
      toggle.setAttribute('aria-label', toggle.title);
    }

    function renderResults() {
      const query = fold(input.value.trim());
      clear.hidden = !input.value;
      // Matches at the start of a word, so "lon" finds London and not Frais Vallon.
      const ids = ORDER.filter((id) => {
        if (!query) return true;
        const m = MOSQUES[id];
        const words = fold(` ${m.name} ${m.city} ${ALIASES[id] || ''}`).replace(/[-'’&,]/g, ' ');
        return words.includes(` ${query}`);
      });
      if (!ids.length) {
        results.innerHTML = `<p class="p-empty">${esc(t('p.none'))}</p>`;
        return;
      }
      results.innerHTML = `
        <div class="p-sec-head"><span>${esc(t('p.try'))}</span><span class="p-sec-count">${ids.length}</span></div>
        <div class="p-sec-box">${ids.map((id) => `
          <button class="p-result" type="button" data-id="${id}">
            <span class="p-result__name" dir="auto">${esc(MOSQUES[id].name)}</span>
            <span class="p-result__city">${esc(MOSQUES[id].city)}</span>
          </button>`).join('')}
        </div>`;
    }

    function renderList(snap) {
      const { w } = snap;
      const key = [state.mosque, w.y, w.m, w.d, snap.next.prayer.key, snap.next.tomorrow, state.lang, snap.loading].join('|');
      if (key === listKey) return;
      listKey = key;

      const row = rowHtml;
      const [fajr, dhuhr, asr, maghrib, isha] = PRAYERS;

      if (snap.loading) {
        list.classList.add('is-skeleton');
        list.innerHTML = [fajr, { icon: 'i-sunrise', name: t('p.sunrise') }, dhuhr, asr, maghrib, isha]
          .map((p) => row(p.icon, p.name, '00:00', false)).join('');
        return;
      }

      const isNext = (p) => !snap.next.tomorrow && snap.next.prayer.key === p.key;
      const prayerRow = (p) => row(p.icon, p.name, hhmm(snap.times[p.at]), isNext(p));
      const rows = [prayerRow(fajr), row('i-sunrise', t('p.sunrise'), hhmm(snap.times[1]), false), prayerRow(dhuhr)];
      if (w.friday) {
        snap.mosque.jumua.forEach((time, i) => rows.push(row('i-jumua', i ? `Jumua ${i + 1}` : 'Jumua', time, false)));
      }
      rows.push(prayerRow(asr), prayerRow(maghrib), prayerRow(isha));
      list.classList.remove('is-skeleton');
      list.innerHTML = rows.join('');
    }

    function update(snap) {
      renderList(snap);
      const mosque = MOSQUES[state.mosque];
      setText(name, mosque.name);
      setText(city, mosque.city);
      reminder.setAttribute('aria-checked', String(state.reminder));
      styles.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.style === state.style)));
      setText(updated, t('p.updated')(localTime(state.updatedAt)));
    }

    function applyText() {
      $$('[data-k]', root).forEach((el) => setText(el, t(el.dataset.k)));
      input.placeholder = t('p.search');
      input.setAttribute('aria-label', t('p.search'));
      clear.setAttribute('aria-label', 'Clear');
      caption.textContent = t('p.caption');
      reminder.setAttribute('aria-label', t('p.reminder'));
      $('.p-set--reminder', root).title = t('p.reminderHelp');
      $('.p-set--style', root).title = t('p.menubarHelp');
      $('.p-seg', root).setAttribute('aria-label', t('p.menubar'));
      labelToggle();
      renderResults();
      listKey = '';
    }

    toggle.addEventListener('click', () => setSearch(!searchOpen));
    field.addEventListener('click', (e) => { if (e.target === field) input.focus(); });
    input.addEventListener('input', renderResults);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (input.value) { input.value = ''; renderResults(); } else { setSearch(false); toggle.focus(); }
      } else if (e.key === 'Enter') {
        const first = $('.p-result', results);
        if (first) first.click();
      }
    });
    clear.addEventListener('click', () => { input.value = ''; renderResults(); input.focus(); });
    results.addEventListener('click', (e) => {
      const pick = e.target.closest('.p-result');
      if (!pick) return;
      selectMosque(pick.dataset.id);
      setSearch(false);
    });
    reminder.addEventListener('click', () => { state.reminder = !state.reminder; render(); });
    styles.forEach((b) => b.addEventListener('click', () => {
      state.style = b.dataset.style;
      saved.set('style', state.style);
      render();
    }));
    $('.p-quit', root).addEventListener('click', onQuit);

    applyText();
    return { update, applyText, reset: () => setSearch(false, { instant: true }) };
  }

  function selectMosque(id) {
    if (!MOSQUES[id] || id === state.mosque) return;
    state.mosque = id;
    saved.set('mosque', id);
    state.loadingUntil = Date.now() + 450;
    setTimeout(() => { state.updatedAt = Date.now(); render(); }, 470);
    render();
  }

  // ---------- The menu bar ----------

  const item = $('#np-item');
  const drop = $('#np-drop');
  const hint = $('.hint');
  const langButton = $('#mb-lang');
  const titles = $$('.np-title');
  const clocksLong = $$('.clock-long');
  const clocksShort = $$('.clock-short');

  const dropPanel = createPanel(drop, { onQuit: () => closeDrop(true) });

  const stage = $('#np-stage');
  const stagePanel = createPanel(stage, {
    // "Quitting" here just relaunches the preview.
    onQuit: () => {
      stage.classList.add('is-quit');
      setTimeout(() => stage.classList.remove('is-quit'), 900);
    },
  });
  const panels = [dropPanel, stagePanel];

  function positionDrop() {
    const box = item.getBoundingClientRect();
    const width = drop.offsetWidth || 300;
    const viewport = document.documentElement.clientWidth;
    const left = Math.max(8, Math.min(box.left + box.width / 2 - width / 2, viewport - width - 8));
    drop.style.left = `${Math.round(left)}px`;
  }

  function openDrop() {
    dropPanel.reset();
    drop.hidden = false;
    positionDrop();
    drop.classList.remove('is-entering');
    void drop.offsetWidth; // restart the entrance
    drop.classList.add('is-entering');
    item.setAttribute('aria-expanded', 'true');
    hint.classList.add('is-done');
  }

  function closeDrop(returnFocus = false) {
    if (drop.hidden) return;
    drop.hidden = true;
    item.setAttribute('aria-expanded', 'false');
    if (returnFocus) item.focus();
  }

  item.addEventListener('click', () => (drop.hidden ? openDrop() : closeDrop()));
  document.addEventListener('pointerdown', (e) => {
    if (!drop.hidden && !drop.contains(e.target) && !item.contains(e.target)) closeDrop();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !drop.hidden) closeDrop(true);
  });
  drop.addEventListener('focusout', (e) => {
    if (e.relatedTarget && !drop.contains(e.relatedTarget) && e.relatedTarget !== item) closeDrop();
  });

  /** Keeps the hint's arrow pointing at the item, whatever its width. */
  function placeHint() {
    const box = item.getBoundingClientRect();
    const viewport = document.documentElement.clientWidth;
    hint.style.setProperty('--hint-right', `${Math.max(8, Math.round(viewport - (box.left + box.width / 2) - 10))}px`);
  }

  // ---------- The scrubber ----------

  const scrub = {
    root: $('.scrub'),
    input: $('.scrub__input'),
    thumb: $('.scrub__thumb'),
    time: $('.scrub__time'),
    track: $('.scrub__track'),
    ticks: $('.scrub__ticks'),
    now: $('.scrub__now'),
    note: $('.scrub__note'),
    reset: $('.scrub__reset'),
    key: '',
  };
  const RANGE = 1439;
  const at = (minute) => (minute / RANGE).toFixed(4);
  const pct = (minute) => `${((minute / RANGE) * 100).toFixed(2)}%`;

  /** Day/night shading and prayer ticks for the day being shown. */
  function buildScrubber(snap) {
    const key = [state.mosque, snap.w.y, snap.w.m, snap.w.d, state.lang].join('|');
    if (key === scrub.key) return;
    scrub.key = key;
    const sunrise = snap.times[1];
    // The track previews the wallpaper: each moment's horizon and sand, in order.
    const stops = skyAnchors(snap.times)
      .map(([minute, key]) => `${mixHex(SKY[key].skyLow, SKY[key].far, 0.5)} ${pct(clamp(minute, 0, RANGE))}`);
    scrub.track.style.background = `linear-gradient(90deg, ${stops.join(', ')})`;
    const marks = [
      ...PRAYERS.map((p) => ({ key: p.key, icon: p.icon, label: p.name, minute: snap.times[p.at] })),
      { key: 'sunrise', icon: 'i-sunrise', label: t('p.sunrise'), minute: sunrise, minor: true },
    ];
    scrub.ticks.innerHTML = marks.map((m) => `
      <span class="scrub__tick${m.minor ? ' is-minor' : ''}" data-key="${m.key}" style="left:${pct(m.minute)}" title="${esc(m.label)} ${hhmm(m.minute)}">
        <svg><use href="#${m.icon}"/></svg>
      </span>`).join('');
    const mosque = MOSQUES[state.mosque];
    const where = fold(mosque.name).includes(fold(mosque.city)) ? mosque.name : `${mosque.name}, ${mosque.city}`;
    scrub.note.textContent = `${t('day.today')} · ${where}`;
  }

  function updateScrubber(snap) {
    buildScrubber(snap);
    const minute = snap.minute;
    if (+scrub.input.value !== minute) scrub.input.value = String(minute);
    scrub.thumb.style.setProperty('--pos', at(minute));
    setText(scrub.time, hhmm(minute));
    scrub.input.setAttribute('aria-valuetext', `${hhmm(minute)}, ${menuTitle(snap)}`);
    const nextKey = snap.next.tomorrow ? '' : snap.next.prayer.key;
    $$('.scrub__tick', scrub.ticks).forEach((tick) => tick.classList.toggle('is-next', tick.dataset.key === nextKey));

    const moved = Math.abs(state.offset) > 30000;
    scrub.root.classList.toggle('is-moved', moved);
    scrub.reset.hidden = !moved;
    const real = wall(Date.now(), snap.mosque.tz);
    scrub.now.style.setProperty('--now', at(real.h * 60 + real.mi));
  }

  scrub.input.addEventListener('input', () => {
    // Move the clock so it reads exactly the chosen minute, then let it run.
    const ms = Date.now();
    const real = wall(ms, MOSQUES[state.mosque].tz);
    const realSeconds = real.h * 3600 + real.mi * 60 + real.s;
    state.offset = (+scrub.input.value * 60 - realSeconds) * 1000 - (ms % 1000);
    render();
  });
  scrub.reset.addEventListener('click', () => { state.offset = 0; render(); });

  // ---------- Language ----------

  function applyLang() {
    document.documentElement.lang = state.lang;
    document.title = t('doc.title');
    const description = $('meta[name="description"]');
    if (description) description.content = t('doc.desc');
    $$('[data-i18n]').forEach((el) => {
      const text = t(el.dataset.i18n);
      if (typeof text === 'string') setText(el, text);
    });
    // Apple's badge comes per language; swap the locale at the end of its URL.
    const badgeLocale = state.lang === 'fr' ? 'fr-fr' : 'en-us';
    $$('.js-badge').forEach((badge) => {
      const attr = badge.tagName === 'SOURCE' ? 'srcset' : 'src';
      badge.setAttribute(attr, badge.getAttribute(attr).replace(/[a-z]{2}-[a-z]{2}$/, badgeLocale));
      if (attr === 'src') badge.alt = t('store.badge');
    });
    langButton.textContent = state.lang.toUpperCase();
    langButton.title = t('lang.switch');
    langButton.setAttribute('aria-label', t('lang.switch'));
    $$('.footer__lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)));
    scrub.input.setAttribute('aria-label', t('day.scrub'));
    panels.forEach((p) => p.applyText());
    scrub.key = '';
    render();
  }

  function setLang(lang) {
    if (lang === state.lang) return;
    state.lang = lang;
    saved.set('lang', lang);
    applyLang();
  }

  langButton.addEventListener('click', () => setLang(state.lang === 'en' ? 'fr' : 'en'));
  $$('.footer__lang button').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

  // ---------- The clock ----------

  // ---------- The feature cards ----------

  // The live bits of the "Small app. Right times." cards: the countdown in
  // both menu bar styles, the notification the app would send next, and the
  // selected mosque's Friday times.
  const cards = {
    titlesFull: $$('.js-title-full'),
    titlesPrivate: $$('.js-title-private'),
    clocks: $$('.js-clock'),
    notifTitle: $('.js-notif-title'),
    notifBody: $('.js-notif-body'),
    friday: $('.js-friday'),
    fridayKey: '',
  };

  function updateCards(snap, clock) {
    const time = countdown(snap.next.remaining);
    cards.titlesFull.forEach((el) => setText(el, t('p.in')(snap.next.prayer.name, time)));
    cards.titlesPrivate.forEach((el) => setText(el, time));
    cards.clocks.forEach((el) => setText(el, clock.short));
    setText(cards.notifTitle, snap.next.prayer.name);
    setText(cards.notifBody, t('b.notif')(hhmm(snap.next.at)));

    const key = [state.mosque, state.lang, snap.times[2]].join('|');
    if (key === cards.fridayKey) return;
    cards.fridayKey = key;
    cards.friday.innerHTML = [
      rowHtml('i-dhuhr', 'Dhuhr', hhmm(snap.times[2]), false),
      ...snap.mosque.jumua.map((time, i) => rowHtml('i-jumua', i ? `Jumua ${i + 1}` : 'Jumua', time, i === 0)),
    ].join('');
  }

  let lastTitle = '';
  function render() {
    const snap = snapshot(now());
    const title = menuTitle(snap);
    // The blink: blank on the "off" half of each second, only in the last ten minutes.
    const blank = snap.urgent && !snap.loading && Math.floor(snap.ms / 500) % 2 === 1;
    titles.forEach((el) => {
      setText(el, title);
      el.classList.toggle('is-blank', blank);
    });
    item.setAttribute('aria-label', title);
    const clock = clockText(snap);
    clocksLong.forEach((el) => setText(el, clock.long));
    clocksShort.forEach((el) => setText(el, clock.short));
    panels.forEach((p) => p.update(snap));
    updateScrubber(snap);
    updateCards(snap, clock);
    if (stageDunes) {
      const sky = skyAt(snap.times, snap.minute + snap.w.s / 60);
      stageDunes.set(sky.palette);
      stageBox.classList.toggle('is-light', sky.light);
    }
    if (title.length !== lastTitle.length) {
      lastTitle = title;
      placeHint();
      if (!drop.hidden) positionDrop();
    }
  }

  window.addEventListener('resize', () => {
    placeHint();
    if (!drop.hidden) positionDrop();
  });
  document.addEventListener('visibilitychange', render);

  applyLang();
  setInterval(render, 250);
})();
