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

    // Close menu when clicking a link
    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", closeMenu);
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!menu.classList.contains("open")) return;
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (!menu.contains(t) && !toggle.contains(t)) closeMenu();
    });

    // Close menu on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  };

  const setActiveNavLink = () => {
    if (!navContainer) return;

    const activeKey = (navContainer.getAttribute("data-active") || "").trim();
    if (!activeKey) return;

    const link = navContainer.querySelector(`[data-nav="${activeKey}"]`);
    if (link) link.classList.add("active");
  };

  const wireCopyPitch = () => {
    const copyBtn = document.getElementById("copyPitch");
    const status = document.getElementById("copyStatus");
    if (!copyBtn) return;

    // No em dashes
    const pitch =
      "A quiet, escalating record of what happens when observation stops being neutral and becomes a force.";

    const setStatus = (msg) => {
      if (!status) return;
      status.textContent = msg;

      // Use a stable timer holder (avoid attaching props to a function)
      if (setStatus._t) window.clearTimeout(setStatus._t);
      setStatus._t = window.setTimeout(() => {
        if (status) status.textContent = "";
      }, 1200);
    };
    setStatus._t = null;

    copyBtn.addEventListener("click", async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(pitch);
          setStatus("Copied.");
          return;
        }
      } catch {
        // fall through to legacy copy
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

  const runPageWires = () => {
    // These should work even if nav fails to load
    wireFooterYear();
    wireCopyPitch();
  };

  const injectNav = async () => {
    // Always wire page stuff immediately
    runPageWires();

    if (!navContainer) return;

    try {
      // ensure hidden state before injection (so fade actually happens)
      navContainer.classList.remove("nav-ready");

      // Cache-bust the nav include so updates show immediately on GitHub Pages
      const res = await fetch(`/partials/nav.html?v=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Nav fetch failed: ${res.status}`);

      const html = await res.text();
      navContainer.innerHTML = html;

      // Now that it's in the DOM, wire it up
      wireNavToggle();
      setActiveNavLink();

      // Trigger fade in on next frame
      requestAnimationFrame(() => {
        navContainer.classList.add("nav-ready");
      });
    } catch (err) {
      console.warn(err);
      // Page wiring already ran, so we're good even if nav fails
    }
  };

  // Run after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectNav);
  } else {
    injectNav();
  }
})();
