(() => {
  // Jaar in footer
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Mobile menu toggle
  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("navlinks");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close menu on click
    links.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Active section highlight
  const sections = ["wie-ben-ik","relatietherapie","individueel","specialisaties","werkwijze","faq","contact"]
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const navAnchors = Array.from(document.querySelectorAll(".navlinks a"))
    .filter(a => a.getAttribute("href") && a.getAttribute("href").startsWith("#"));

  const byHash = (hash) => navAnchors.find(a => a.getAttribute("href") === hash);

  if (sections.length && navAnchors.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          navAnchors.forEach(a => a.classList.remove("active"));
          const a = byHash("#" + e.target.id);
          if (a) a.classList.add("active");
        }
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 });

    sections.forEach(s => obs.observe(s));
  }

  // Contact form -> mailto
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const msg = (data.get("message") || "").toString().trim();

      const subject = encodeURIComponent("Kennismaking coaching — " + (name || "aanvraag"));
      const body = encodeURIComponent(
        `Naam: ${name}\nE-mail: ${email}\n\nBericht:\n${msg}\n\n— Verzonden via de website`
      );

      window.location.href = `mailto:Erwin@erwinnootercoaching.nl?subject=${subject}&body=${body}`;
    });
  }
})();
