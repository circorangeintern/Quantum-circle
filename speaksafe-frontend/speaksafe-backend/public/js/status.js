(function () {
  "use strict";

  const input = document.getElementById("statusInput");
  const checkBtn = document.getElementById("checkBtn");
  const messageBox = document.getElementById("messageBox");
  const resultCard = document.getElementById("resultCard");
  const newSearchBtn = document.getElementById("newSearchBtn");

  // Result elements
  const trackingCode = document.getElementById("trackingCode");
  const statusBadge = document.getElementById("statusBadge");
  const reportCategory = document.getElementById("reportCategory");
  const reportTitle = document.getElementById("reportTitle");
  const reportDate = document.getElementById("reportDate");
  const reportUpdated = document.getElementById("reportUpdated");
  const timeline = document.getElementById("timeline");

  let isSearching = false;

  function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = "message-box show " + type;
  }

  function hideMessage() {
    messageBox.className = "message-box";
  }

  function setLoading(loading) {
    isSearching = loading;
    if (loading) {
      checkBtn.classList.add("loading");
      checkBtn.disabled = true;
      input.disabled = true;
    } else {
      checkBtn.classList.remove("loading");
      checkBtn.disabled = false;
      input.disabled = false;
    }
  }

  function getStatusBadgeClass(status) {
    const map = {
      new: "new",
      open: "open",
      investigating: "investigating",
      resolved: "resolved",
      closed: "closed",
    };
    return map[status] || "new";
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function showResult(data) {
    resultCard.classList.add("show");

    // Populate data
    trackingCode.textContent = input.value.trim().toUpperCase();
    statusBadge.textContent =
      data.status.charAt(0).toUpperCase() + data.status.slice(1);
    statusBadge.className = "status-badge " + getStatusBadgeClass(data.status);

    reportCategory.textContent =
      data.category.charAt(0).toUpperCase() + data.category.slice(1);
    reportTitle.textContent = data.title || "—";
    reportDate.textContent = formatDate(data.submittedAt);
    reportUpdated.textContent = formatDate(data.updatedAt);

    // Render timeline
    timeline.innerHTML = "";
    if (data.timeline && data.timeline.length > 0) {
      data.timeline.forEach((event) => {
        const li = document.createElement("li");
        li.innerHTML = `
              <div class="date">${formatDate(event.date)}</div>
              <div class="event">${event.event}</div>
            `;
        timeline.appendChild(li);
      });
    } else {
      timeline.innerHTML =
        '<li><div class="event" style="color: var(--text-faint);">No timeline events yet.</div></li>';
    }

    // Scroll to result
    resultCard.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function hideResult() {
    resultCard.classList.remove("show");
  }

  async function checkStatus() {
    const code = input.value.trim().toUpperCase();

    if (!code) {
      showMessage("Please enter a tracking code", "error");
      input.classList.add("error");
      return;
    }

    input.classList.remove("error");
    hideMessage();
    hideResult();
    setLoading(true);

    try {
      const response = await fetch(
        `/api/v1/reports/status/${encodeURIComponent(code)}`,
      );

      if (response.ok) {
        const data = await response.json();
        showResult(data.data);
        showMessage("", "");
      } else if (response.status === 404) {
        showMessage(
          "No report found with this tracking code. Please check and try again.",
          "error",
        );
      } else {
        showMessage("Something went wrong. Please try again.", "error");
      }
    } catch (error) {
      showMessage(
        "Network error. Please check your connection and try again.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  // ===== Event Listeners =====
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isSearching) {
        checkStatus();
      }
    }
  });

  input.addEventListener("input", function () {
    this.classList.remove("error");
    hideMessage();
    hideResult();
    this.value = this.value.toUpperCase();
    // Remove invalid characters
    this.value = this.value.replace(/[^A-Z0-9\-]/g, "");
  });

  checkBtn.addEventListener("click", function () {
    if (!isSearching) {
      checkStatus();
    }
  });

  newSearchBtn.addEventListener("click", function () {
    hideResult();
    hideMessage();
    input.value = "";
    input.focus();
  });

  // ===== Auto-check if code is present in URL =====
  function getCodeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("ref");
  }

  const urlCode = getCodeFromUrl();
  if (urlCode) {
    input.value = urlCode.toUpperCase();
    setTimeout(() => {
      checkStatus();
    }, 300);
  } else {
    input.focus();
  }
})();
