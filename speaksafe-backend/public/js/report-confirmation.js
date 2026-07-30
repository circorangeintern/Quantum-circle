(function () {
  "use strict";

  // ===== DOM Elements =====
  const stateChecking = document.getElementById("state-checking");
  const stateInvalid = document.getElementById("state-invalid");
  const stateSuccess = document.getElementById("state-success");

  const trackingCode = document.getElementById("trackingCode");
  const statusBadge = document.getElementById("statusBadge");
  const reportCategory = document.getElementById("reportCategory");
  const reportTitle = document.getElementById("reportTitle");
  const reportDate = document.getElementById("reportDate");
  const reportUpdated = document.getElementById("reportUpdated");
  const timeline = document.getElementById("timeline");
  const copyBtn = document.getElementById("copyBtn");
  const copyToast = document.getElementById("copyToast");

  // ===== Get Reference Code from URL =====
  function getCodeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("ref");
  }

  const referenceCode = getCodeFromUrl();

  // ===== Status Badge Class =====
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

  // ===== Format Date =====
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

  // ===== Fetch Report Status =====
  async function fetchReportStatus() {
    if (!referenceCode) {
      showInvalidState();
      return;
    }

    try {
      const response = await fetch(`/api/v1/reports/status/${referenceCode}`);

      if (response.ok) {
        const data = await response.json();
        showSuccessState(data.data);
      } else {
        showInvalidState();
      }
    } catch (error) {
      showInvalidState();
    }
  }

  // ===== State Functions =====
  function showInvalidState() {
    stateChecking.style.display = "none";
    stateInvalid.style.display = "block";
  }

  function showSuccessState(data) {
    stateChecking.style.display = "none";
    stateSuccess.style.display = "block";

    // Populate data
    trackingCode.textContent = referenceCode;
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
  }

  // ===== Copy Tracking Code =====
  function copyTrackingCode() {
    const code = trackingCode.textContent;
    navigator.clipboard
      .writeText(code)
      .then(() => {
        copyToast.classList.remove("hidden");
        copyToast.classList.add("show");
        setTimeout(() => {
          copyToast.classList.remove("show");
          setTimeout(() => {
            copyToast.classList.add("hidden");
          }, 300);
        }, 2000);
      })
      .catch(() => {
        // Fallback
        const textarea = document.createElement("textarea");
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        copyToast.classList.remove("hidden");
        copyToast.classList.add("show");
        setTimeout(() => {
          copyToast.classList.remove("show");
          setTimeout(() => {
            copyToast.classList.add("hidden");
          }, 300);
        }, 2000);
      });
  }

  // ===== Event Listeners =====
  copyBtn.addEventListener("click", copyTrackingCode);

  // ===== Initialize =====
  fetchReportStatus();
})();
