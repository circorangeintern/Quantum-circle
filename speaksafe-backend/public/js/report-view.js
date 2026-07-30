(function () {
  "use strict";

  const stateLoading = document.getElementById("state-loading");
  const stateExpired = document.getElementById("state-expired");
  const stateReport = document.getElementById("state-report");

  const reportTitle = document.getElementById("reportTitle");
  const reportRef = document.getElementById("reportRef");
  const reportDate = document.getElementById("reportDate");
  const reportCategory = document.getElementById("reportCategory");
  const reportUrgency = document.getElementById("reportUrgency");
  const reportStatusText = document.getElementById("reportStatusText");
  const reportAssigned = document.getElementById("reportAssigned");
  const reportDescription = document.getElementById("reportDescription");
  const reportLocation = document.getElementById("reportLocation");
  const reportPeople = document.getElementById("reportPeople");
  const statusBadge = document.getElementById("statusBadge");
  const timeline = document.getElementById("timeline");
  const extraDetails = document.getElementById("extraDetails");

  const expiredTitle = document.getElementById("expiredTitle");
  const expiredMessage = document.getElementById("expiredMessage");
  const expiredWarning = document.getElementById("expiredWarning");

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

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function showReport(data) {
    stateLoading.style.display = "none";
    stateReport.style.display = "block";

    reportTitle.textContent = data.title || "Untitled Report";
    reportRef.textContent = data.referenceCode || "SS-2026-XXXX";
    reportDate.textContent = formatDate(data.submittedAt);

    reportCategory.textContent = capitalize(data.category || "—");
    reportUrgency.textContent = capitalize(data.urgency || "—");
    reportStatusText.textContent = capitalize(data.status || "—");
    reportAssigned.textContent = data.assignedTo?.name || "Unassigned";

    reportDescription.textContent =
      data.description || "No description provided.";

    // Status badge
    statusBadge.textContent = capitalize(data.status || "new");
    statusBadge.className = "status-badge " + getStatusBadgeClass(data.status);

    // Extra details
    if (data.location || data.peopleInvolved) {
      extraDetails.style.display = "block";
      reportLocation.textContent = data.location || "Not specified";
      reportPeople.textContent = data.peopleInvolved || "Not specified";
    }

    // Timeline
    timeline.innerHTML = "";
    if (data.publicTimeline && data.publicTimeline.length > 0) {
      data.publicTimeline.forEach((event) => {
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

  function showExpired() {
    stateLoading.style.display = "none";
    stateExpired.style.display = "block";
  }

  // ===== Get Report ID from URL =====
  function getReportIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  const reportId = getReportIdFromUrl();

  // ===== Get Token from URL =====
  function getTokenFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("token");
  }

  const token = getTokenFromUrl();

  function showExpired(status, message) {
    stateLoading.style.display = "none";
    stateExpired.style.display = "block";

    if (status === "used") {
      expiredTitle.textContent = "Link Already Used";
      expiredMessage.textContent = "This report link has already been viewed.";
      expiredWarning.innerHTML = `
            For security, report links can only be viewed once.
            Please log in to your <span class="highlight">SpeakSafe Dashboard</span> to view this report.
          `;
    } else if (status === "expired") {
      expiredTitle.textContent = "Link Expired";
      expiredMessage.textContent = "This report link has expired.";
      expiredWarning.innerHTML = `
            Report links expire after 7 days for security.
            Please log in to your <span class="highlight">SpeakSafe Dashboard</span> to view this report.
          `;
    } else {
      expiredTitle.textContent = "Invalid Link";
      expiredMessage.textContent = "This report link is invalid.";
      expiredWarning.innerHTML = `
            Please check the link or contact support for assistance.
            You can also log in to your <span class="highlight">SpeakSafe Dashboard</span> to view this report.
          `;
    }
  }

  async function fetchReport() {
    if (!token) {
      showExpired("invalid");
      return;
    }

    try {
      const response = await fetch(`/api/reports/view?token=${token}`);

      if (response.ok) {
        const data = await response.json();
        showReport(data.data);
      } else if (response.status === 410) {
        // Gone - already viewed or expired
        const data = await response.json();
        if (data.message && data.message.includes("already been used")) {
          showExpired("used");
        } else if (data.message && data.message.includes("expired")) {
          showExpired("expired");
        } else {
          showExpired("invalid");
        }
      } else if (response.status === 404) {
        showExpired("invalid");
      } else {
        showExpired("invalid");
      }
    } catch (error) {
      showExpired("invalid");
    }
  }

  fetchReport();
})();
