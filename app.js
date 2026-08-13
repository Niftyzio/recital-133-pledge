(function () {
  var config = window.PLEDGE_CONFIG || {};
  var form = document.getElementById("sign-form");
  var statusEl = document.getElementById("form-status");
  var embed = document.getElementById("form-embed");

  function setStatus(message) {
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  if (embed && config.signFormUrl) {
    embed.hidden = false;
    embed.src = config.signFormUrl;
    if (form) {
      form.hidden = true;
    }
  }

  var nextField = document.getElementById("form-next");
  if (nextField && config.canonicalUrl) {
    nextField.value = config.canonicalUrl.replace(/\/?$/, "/") + "#sign";
  }

  var submitTarget = config.formsubmitId || config.signatureEmail;

  if (form && submitTarget && !config.signFormUrl) {
    form.setAttribute("action", "https://formsubmit.co/" + encodeURIComponent(submitTarget));
    form.setAttribute("method", "POST");
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      if (config.signFormUrl) {
        return;
      }

      if (!submitTarget) {
        event.preventDefault();
        setStatus("The form is not wired. Try again later.");
        return;
      }

      setStatus("Sending.");
    });
  }
})();
