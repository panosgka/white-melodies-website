const header = document.querySelector(".site-header");
const toggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");

function syncHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
}

window.addEventListener("scroll", syncHeader, { passive: true });
syncHeader();

function closeMobileMenu() {
  header.classList.remove("is-open");
  toggle?.setAttribute("aria-expanded", "false");
  if (mobileNav) mobileNav.hidden = true;
}

toggle?.addEventListener("click", () => {
  const isOpen = header.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(isOpen));
  mobileNav.hidden = !isOpen;
});

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMobileMenu();
});

document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const answer = item?.querySelector(".faq-answer");
    if (answer) {
      answer.style.setProperty("--faq-height", `${answer.scrollHeight + 36}px`);
    }
    const isOpen = item.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
  });
});

function syncFaqHeights() {
  document.querySelectorAll(".faq-answer").forEach((answer) => {
    answer.style.setProperty("--faq-height", `${answer.scrollHeight + 36}px`);
  });
}

syncFaqHeights();
document.fonts.ready.then(syncFaqHeights);

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(syncFaqHeights, 100);
}, { passive: true });

const form = document.querySelector("[data-contact-form]");
form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const subject = encodeURIComponent("Αίτημα προσφοράς White Melodies Events");
  const body = encodeURIComponent(
    `Όνομα: ${data.get("name") || ""}\nEmail: ${data.get("email") || ""}\nΤηλέφωνο: ${data.get("phone") || ""}\nΗμερομηνία: ${data.get("date") || ""}\nΤοποθεσία: ${data.get("location") || ""}\nΚαλεσμένοι: ${data.get("guests") || ""}\nΥπηρεσίες: ${data.get("services") || ""}\n\nΜήνυμα:\n${data.get("message") || ""}`
  );
  window.location.href = `mailto:WhiteMelodiesEvents@gmail.com?subject=${subject}&body=${body}`;
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setupRevealMotion() {
  const revealTargets = [
    ".section .eyebrow",
    ".section h2",
    ".section-head > p",
    ".split p",
    ".split .image-panel",
    ".stat",
    ".card",
    ".package-card",
    ".portfolio-card",
    ".faq-item",
    ".package-note",
    ".section .section-actions",
    ".cta-band .eyebrow",
    ".cta-band h2",
    ".cta-band p",
    ".cta-band .section-actions",
    ".footer-grid > div",
    ".footer-bottom",
    ".contact-card",
    ".form label",
    ".page-hero .eyebrow",
    ".page-hero h1",
    ".page-hero p",
    ".service-list li"
  ];

  const elements = [...document.querySelectorAll(revealTargets.join(","))];
  if (!elements.length) return;
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("motion-ready");
  }

  const groupSelectors = [".grid", ".faq-list", ".footer-grid", ".form", ".service-list", ".stat-grid"];

  elements.forEach((element) => {
    element.classList.add("reveal");

    const group = groupSelectors.map((selector) => element.closest(selector)).find(Boolean);
    if (group) {
      const siblings = [...group.querySelectorAll(".card, .package-card, .portfolio-card, .faq-item, .footer-grid > div, .form label, .service-list li, .stat")];
      const index = siblings.indexOf(element);
      const step = element.classList.contains("faq-item") ? 70 : element.classList.contains("package-card") || element.classList.contains("portfolio-card") ? 120 : 80;
      if (index >= 0) element.style.setProperty("--reveal-delay", `${Math.min(index * step, 520)}ms`);
    }
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -15% 0px" });

  elements.forEach((element) => observer.observe(element));
}

function setupSoftParallax() {
  const hero = document.querySelector(".hero");
  const pageHero = document.querySelector(".page-hero");
  const panels = [...document.querySelectorAll(".image-panel")];
  if (prefersReducedMotion || (!hero && !pageHero && !panels.length)) return;

  panels.forEach((panel) => panel.classList.add("parallax-soft"));

  let ticking = false;
  const update = () => {
    const scrollY = window.scrollY || 0;

    if (hero) {
      const heroHeight = hero.offsetHeight || 1;
      const maxShift = heroHeight * 0.12;
      const offset = Math.min(scrollY * 0.4, maxShift);
      hero.style.setProperty("--hero-parallax-y", `${offset}px`);
    }

    if (pageHero) {
      const ph = pageHero.offsetHeight || 1;
      const maxShift = ph * 0.1;
      const offset = Math.min(scrollY * 0.35, maxShift);
      pageHero.style.setProperty("--hero-parallax-y", `${offset}px`);
    }

    panels.forEach((panel) => {
      const rect = panel.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const centerOffset = (rect.top + rect.height / 2 - viewport / 2) / viewport;
      const y = Math.max(-12, Math.min(12, centerOffset * -18));
      panel.style.setProperty("--panel-y", `${y}px`);
    });

    ticking = false;
  };

  const requestTick = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick, { passive: true });
  requestTick();

  // Mouse-follow parallax on .hero (desktop pointers only)
  const finePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  if (hero && finePointer) {
    let targetX = 0, targetY = 0, curX = 0, curY = 0, rafId = null, lastRect = null;
    const refreshRect = () => { lastRect = hero.getBoundingClientRect(); };
    refreshRect();
    window.addEventListener("resize", refreshRect, { passive: true });

    const loop = () => {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      hero.style.setProperty("--hero-mouse-x", `${curX.toFixed(2)}px`);
      hero.style.setProperty("--hero-mouse-y", `${curY.toFixed(2)}px`);
      if (Math.abs(targetX - curX) > 0.05 || Math.abs(targetY - curY) > 0.05) {
        rafId = window.requestAnimationFrame(loop);
      } else {
        rafId = null;
      }
    };
    const kickLoop = () => { if (rafId === null) rafId = window.requestAnimationFrame(loop); };

    hero.addEventListener("mousemove", (e) => {
      if (!lastRect) refreshRect();
      const cx = lastRect.left + lastRect.width / 2;
      const cy = lastRect.top + lastRect.height / 2;
      targetX = ((e.clientX - cx) / lastRect.width) * 14;
      targetY = ((e.clientY - cy) / lastRect.height) * 10;
      kickLoop();
    }, { passive: true });
    hero.addEventListener("mouseleave", () => {
      targetX = 0; targetY = 0; kickLoop();
    }, { passive: true });
  }
}

setupRevealMotion();
setupSoftParallax();
