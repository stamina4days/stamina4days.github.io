(() => {
  "use strict";

  // Mobile nav toggle
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");

  const closeMenu = () => {
    if (!menu) return;
    menu.classList.remove("open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  };

  if (toggle && menu) {
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
  }

  // Footer year
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Copy pitch button (with fallback)
  const copyBtn = document.getElementById("copyPitch");
  const status = document.getElementById("copyStatus");

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const pitch =
        "A quiet, escalating record of what happens when observation stops being neutral—and becomes a force.";

      const setStatus = (msg) => {
        if (!status) return;
        status.textContent = msg;
        window.clearTimeout(setStatus._t);
        setStatus._t = window.setTimeout(() => {
          if (status) status.textContent = "";
        }, 1200);
      };

      try {
        await navigator.clipboard.writeText(pitch);
        setStatus("Copied.");
      } catch {
        // Fallback for restricted clipboard environments
        try {
          const ta = document.createElement("textarea");
          ta.value = pitch;
          ta.setAttribute("readonly", "");
          ta.style.position = "fixed";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          setStatus("Copied.");
        } catch {
          setStatus("Copy failed. Select and copy manually.");
        }
      }
    });
  }
})();