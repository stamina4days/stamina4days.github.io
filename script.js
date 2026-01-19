(() => {
  "use strict";

  // Mobile nav toggle
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close menu when clicking a link
    menu.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!menu.classList.contains("open")) return;
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (!menu.contains(t) && !toggle.contains(t)) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
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
      const pitch = "A quiet, escalating record of what happens when observation stops being neutral—and becomes a force.";
      try {
        await navigator.clipboard.writeText(pitch);
        if (status) status.textContent = "Copied.";
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
          if (status) status.textContent = "Copied.";
        } catch {
          if (status) status.textContent = "Copy failed. Select and copy manually.";
        }
      }
      setTimeout(() => { if (status) status.textContent = ""; }, 1200);
    });
  }
})();