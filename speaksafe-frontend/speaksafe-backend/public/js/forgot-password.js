(function () {
  "use strict";

  const form = document.getElementById("forgotForm");
  const email = document.getElementById("email");
  const submitBtn = document.getElementById("submitBtn");
  const messageBox = document.getElementById("messageBox");
  const successState = document.getElementById("successState");

  function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = "message-box show " + type;
  }

  function hideMessage() {
    messageBox.className = "message-box";
  }

  function setLoading(loading) {
    if (loading) {
      submitBtn.classList.add("loading");
      submitBtn.disabled = true;
      email.disabled = true;
    } else {
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
      email.disabled = false;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    hideMessage();
    successState.style.display = "none";

    const emailValue = email.value.trim();

    if (!emailValue) {
      showMessage("Please enter your email address", "error");
      email.focus();
      return;
    }

    if (!emailValue.includes("@") || !emailValue.includes(".")) {
      showMessage("Please enter a valid email address", "error");
      email.focus();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue }),
      });

      const data = await response.json();

      if (response.ok) {
        // Always show success (even if email doesn't exist - security best practice)
        form.style.display = "none";
        successState.style.display = "block";
        hideMessage();
      } else {
        showMessage(
          data.message || "Something went wrong. Please try again.",
          "error",
        );
      }
    } catch (error) {
      showMessage("Network error. Please check your connection.", "error");
    } finally {
      setLoading(false);
    }
  }

  form.addEventListener("submit", handleSubmit);

  // Auto-focus email field
  email.focus();
})();
