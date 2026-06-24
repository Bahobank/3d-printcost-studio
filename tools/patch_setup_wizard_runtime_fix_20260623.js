const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "outputs", "3d-print-cost-calculator.html");
let html = fs.readFileSync(file, "utf8");

html = html.replaceAll("â†’", "→").replaceAll("âœ“", "✓");

const start = "<!-- setup-wizard-runtime-fix:start -->";
const end = "<!-- setup-wizard-runtime-fix:end -->";

const block = `${start}
<script>
(function () {
  const runtimeKey = "__setupWizardRuntimeFix20260623c";
  if (window[runtimeKey]) return;
  window[runtimeKey] = true;

  function textOf(el) {
    return (el && el.textContent ? el.textContent : "").replace(/\\s+/g, " ").trim();
  }

  function isVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return style.display !== "none" &&
      style.visibility !== "hidden" &&
      (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0);
  }

  function containsAll(el, texts) {
    const text = textOf(el);
    return texts.every((part) => text.includes(part));
  }

  function findSmallestContainer(requiredTexts, avoidNode) {
    const nodes = Array.from(document.querySelectorAll("main, section, article, div"));
    const matches = nodes.filter((el) => {
      if (avoidNode && el.contains(avoidNode)) return false;
      return containsAll(el, requiredTexts);
    });
    matches.sort((a, b) => textOf(a).length - textOf(b).length);
    return matches[0] || null;
  }

  function expandToStepPanel(el, forbidden) {
    let node = el;
    let best = el;
    while (node && node !== document.body) {
      if (forbidden && node.contains(forbidden)) break;
      const rect = node.getBoundingClientRect();
      const parent = node.parentElement;
      if (rect.width >= 700 && rect.height >= 260) best = node;
      if (!parent || parent === document.body || parent === document.documentElement) break;
      const siblings = Array.from(parent.children).filter((child) => child !== node && isVisible(child));
      const parentRect = parent.getBoundingClientRect();
      if (parentRect.height > window.innerHeight * 1.35 && siblings.length > 0) break;
      node = parent;
    }
    return best;
  }

  function repairMojibake(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const badNodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.nodeValue && (node.nodeValue.includes("â†’") || node.nodeValue.includes("âœ“"))) {
        badNodes.push(node);
      }
    }
    badNodes.forEach((node) => {
      node.nodeValue = node.nodeValue.replaceAll("â†’", "→").replaceAll("âœ“", "✓");
    });
  }

  function fixFirstStepButtonText(root) {
    const scope = root || document;
    Array.from(scope.querySelectorAll("button, a")).forEach((button) => {
      if (textOf(button) === "เริ่มใช้งาน") {
        button.textContent = "ถัดไป";
      }
    });
  }

  function findAnalyticsStep() {
    const inner = findSmallestContainer([
      "STEP 2 OF 3",
      "ช่วยปรับปรุง 3D PrintCost Studio"
    ]);
    return inner ? expandToStepPanel(inner) : null;
  }

  function findPrinterStep(analyticsStep) {
    const inner = findSmallestContainer([
      "เลือกประเภทเครื่องพิมพ์ 3D ที่คุณใช้งาน",
      "เลือก FDM",
      "เลือก Resin"
    ], analyticsStep);
    return inner ? expandToStepPanel(inner, analyticsStep) : null;
  }

  function unhidePrinterSteps() {
    Array.from(document.querySelectorAll("[data-setup-wizard-hidden='1']")).forEach((el) => {
      el.style.display = "";
      el.removeAttribute("aria-hidden");
      delete el.dataset.setupWizardHidden;
    });
  }

  function fixSetupWizardLayout(options) {
    if (window.location.hash !== "#setup") return;

    repairMojibake(document.body);
    fixFirstStepButtonText(document);

    const analyticsStep = findAnalyticsStep();
    const analyticsVisible = analyticsStep && isVisible(analyticsStep);

    if (!analyticsVisible) {
      unhidePrinterSteps();
      return;
    }

    const printerStep = findPrinterStep(analyticsStep);
    if (printerStep && isVisible(printerStep) && printerStep !== analyticsStep && !printerStep.contains(analyticsStep)) {
      printerStep.dataset.setupWizardHidden = "1";
      printerStep.style.display = "none";
      printerStep.setAttribute("aria-hidden", "true");
      if (options && options.scrollTop) {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    }
  }

  let scheduled = false;
  function scheduleFix(options) {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      fixSetupWizardLayout(options || {});
    });
  }

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (target && target.matches && target.matches("input[type='checkbox']")) {
      setTimeout(() => scheduleFix({ scrollTop: true }), 0);
      setTimeout(() => scheduleFix({ scrollTop: true }), 120);
    }
  }, true);

  document.addEventListener("click", () => {
    setTimeout(() => scheduleFix({ scrollTop: false }), 0);
  }, true);

  window.addEventListener("hashchange", () => {
    setTimeout(() => scheduleFix({ scrollTop: true }), 0);
  });

  const observer = new MutationObserver(() => scheduleFix({ scrollTop: false }));
  function startObserver() {
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class", "hidden"]
      });
      scheduleFix({ scrollTop: false });
      setTimeout(() => scheduleFix({ scrollTop: true }), 250);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserver);
  } else {
    startObserver();
  }
})();
</script>
${end}`;

const oldBlock = new RegExp(`${start}[\\s\\S]*?${end}\\s*`, "g");
html = html.replace(oldBlock, "");

if (html.includes("</body>")) {
  html = html.replace("</body>", `${block}\n</body>`);
} else {
  html += `\n${block}\n`;
}

fs.writeFileSync(file, html, "utf8");
