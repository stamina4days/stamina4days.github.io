(() => {
  "use strict";

  const navContainer = document.getElementById("siteNav");

  const wireFooterYear = () => {
    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  };

  const wireNavToggle = () => {
    const toggle = document.getElementById("navToggle");
    const menu = document.getElementById("navMenu");

    const closeMenu = () => {
      if (!menu) return;
      menu.classList.remove("open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    };

    if (!toggle || !menu) return;

    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (e) => {
      if (!menu.classList.contains("open")) return;
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (!menu.contains(t) && !toggle.contains(t)) closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  };

  const wireCopyPitch = () => {
    const copyBtn = document.getElementById("copyPitch");
    const status = document.getElementById("copyStatus");
    if (!copyBtn) return;

    // No em dashes
    const pitch =
      "A quiet, escalating record of what happens when observation stops being neutral and becomes a force.";

    let tId = null;
    const setStatus = (msg) => {
      if (!status) return;
      status.textContent = msg;
      if (tId) window.clearTimeout(tId);
      tId = window.setTimeout(() => {
        if (status) status.textContent = "";
      }, 1200);
    };

    copyBtn.addEventListener("click", async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(pitch);
          setStatus("Copied.");
          return;
        }
      } catch {
        // fall through
      }

      // Legacy fallback
      try {
        const ta = document.createElement("textarea");
        ta.value = pitch;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        ta.style.top = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setStatus("Copied.");
      } catch {
        setStatus("Copy failed. Select and copy manually.");
      }
    });
  };

  // NEW: scroll-activated "classified record" treatment
  const wireClassifiedReveal = () => {
    const targets = document.querySelectorAll("[data-classified]");
    if (!targets.length) return;

    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      targets.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    targets.forEach((el) => io.observe(el));
  };

  const runPageWires = () => {
    wireFooterYear();
    wireCopyPitch();
    wireClassifiedReveal();
  };

  const injectNav = async () => {
    // Always wire page features even if nav fails
    runPageWires();

    if (!navContainer) return;

    try {
      navContainer.classList.remove("nav-ready");

      // Relative path + cache-bust so GitHub Pages doesn’t serve an old nav
      const navUrl = `partials/nav.html?v=${Date.now()}`;

      const res = await fetch(navUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`Nav fetch failed: ${res.status}`);

      const html = await res.text();
      navContainer.innerHTML = html;

      wireNavToggle();

      requestAnimationFrame(() => {
        navContainer.classList.add("nav-ready");
      });
    } catch (err) {
      console.warn(err);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectNav);
  } else {
    injectNav();
  }
})();
