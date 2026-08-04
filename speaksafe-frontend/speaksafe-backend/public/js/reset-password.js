(function () {
  "use strict";

  // ===== DOM Elements =====
  const stateChecking = document.getElementById("state-checking");
  const stateInvalid = document.getElementById("state-invalid");
  const stateValid = document.getElementById("state-valid");
  const stateSuccess = document.getElementById("state-success");
  const invalidMessage = document.getElementById("invalidMessage");

  const form = document.getElementById("resetForm");
  const newPassword = document.getElementById("newPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const submitBtn = document.getElementById("submitBtn");
  const messageBox = document.getElementById("messageBox");

  const strengthFill = document.getElementById("strengthFill");
  const strengthText = document.getElementById("strengthText");

  const reqLength = document.getElementById("reqLength");
  const reqUppercase = document.getElementById("reqUppercase");
  const reqLowercase = document.getElementById("reqLowercase");
  const reqNumber = document.getElementById("reqNumber");

  // ===== Get Token from URL =====
  function getTokenFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("token");
  }

  const token = getTokenFromUrl();

  // ===== Validate Token =====
  async function validateToken() {
    if (!token) {
      showInvalidState(
        "No reset token provided. Please request a new password reset link.",
      );
      return;
    }

    try {
      const response = await fetch("/api/v1/auth/validate-reset-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        showValidState();
      } else {
        const data = await response.json();
        showInvalidState(data.message || "Invalid or expired reset token.");
      }
    } catch (error) {
      showInvalidState(
        "Unable to validate token. Please check your connection.",
      );
    }
  }

  // ===== State Functions =====
  function showValidState() {
    stateChecking.style.display = "none";
    stateValid.style.display = "block";
    newPassword.focus();
  }

  function showInvalidState(message) {
    stateChecking.style.display = "none";
    stateInvalid.style.display = "block";
    if (message) {
      invalidMessage.textContent = message;
    }
  }

  function showSuccessState() {
    stateValid.style.display = "none";
    stateSuccess.style.display = "block";
  }

  // ===== Show Message =====
  function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = "message-box show " + type;
  }

  function hideMessage() {
    messageBox.className = "message-box";
  }

  // ===== Password Strength =====
  function checkPasswordStrength(password) {
    const hasLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    // Update requirements
    updateRequirement(reqLength, hasLength);
    updateRequirement(reqUppercase, hasUppercase);
    updateRequirement(reqLowercase, hasLowercase);
    updateRequirement(reqNumber, hasNumber);

    // Calculate strength
    const score = [hasLength, hasUppercase, hasLowercase, hasNumber].filter(
      Boolean,
    ).length;

    let level, text;
    if (score === 0 || score === 1) {
      level = "weak";
      text = "Weak password";
    } else if (score === 2 || score === 3) {
      level = "medium";
      text = "Medium password";
    } else {
      level = "strong";
      text = "Strong password!";
    }

    strengthFill.className = "fill " + level;
    strengthText.textContent = text;
    strengthText.className = "text " + level;

    return { score, level };
  }

  function updateRequirement(element, met) {
    if (met) {
      element.classList.add("met");
      element.querySelector(".icon").textContent = "✓";
    } else {
      element.classList.remove("met");
      element.querySelector(".icon").textContent = "○";
    }
  }

  // ===== Form Submission =====
  async function handleSubmit(e) {
    e.preventDefault();
    hideMessage();

    const password = newPassword.value;
    const confirm = confirmPassword.value;

    // Validate
    if (password.length < 8) {
      showMessage("Password must be at least 8 characters", "error");
      newPassword.focus();
      return;
    }

    if (password !== confirm) {
      showMessage("Passwords do not match", "error");
      confirmPassword.focus();
      return;
    }

    // Check if token exists
    if (!token) {
      showMessage("No reset token found. Please request a new link.", "error");
      return;
    }

    // Loading state
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;

    try {
      const response = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccessState();
      } else {
        showMessage(
          data.message || "Failed to reset password. Please try again.",
          "error",
        );
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
      }
    } catch (error) {
      showMessage("An error occurred. Please try again.", "error");
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
    }
  }

  // ===== Event Listeners =====
  newPassword.addEventListener("input", function () {
    checkPasswordStrength(this.value);
    // Check if confirm password matches
    if (confirmPassword.value && this.value !== confirmPassword.value) {
      confirmPassword.setCustomValidity("Passwords do not match");
    } else {
      confirmPassword.setCustomValidity("");
    }
  });

  confirmPassword.addEventListener("input", function () {
    if (this.value !== newPassword.value) {
      this.setCustomValidity("Passwords do not match");
    } else {
      this.setCustomValidity("");
    }
  });

  form.addEventListener("submit", handleSubmit);

  // ===== Initialize =====
  validateToken();
})();
