(function () {
  var config = window.PLEDGE_CONFIG || {};
  var form = document.getElementById("sign-form");
  var statusEl = document.getElementById("form-status");
  var listEl = document.getElementById("signatory-list");
  var countEl = document.getElementById("signatory-count");
  var countLabel = document.getElementById("signatory-count-label");
  var embed = document.getElementById("form-embed");

  function setStatus(message) {
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  function setListMessage(message) {
    if (!listEl) {
      return;
    }
    listEl.replaceChildren();
    var item = document.createElement("li");
    item.textContent = message;
    listEl.appendChild(item);
  }

  function loadSignatories() {
    if (!listEl) {
      return;
    }

    fetch("signatories.json")
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Could not load names");
        }
        return response.json();
      })
      .then(function (rows) {
        listEl.replaceChildren();
        if (countEl) {
          countEl.textContent = String(rows.length);
        }
        if (countLabel) {
          countLabel.textContent = rows.length === 1 ? "" : "s";
        }
        rows.forEach(function (row) {
          var item = document.createElement("li");
          var who = document.createElement("span");
          who.className = "who";
          who.textContent = row.displayName;
          var role = document.createElement("span");
          role.className = "role";
          var bits = [];
          if (row.role) {
            bits.push(row.role);
          }
          if (row.organisation) {
            bits.push(row.organisation);
          }
          role.textContent = bits.join(" · ");
          item.appendChild(who);
          item.appendChild(role);
          listEl.appendChild(item);
        });
      })
      .catch(function () {
        setListMessage("Names appear here after a human check. No emails are stored.");
      });
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
  var moderationUrl = (config.moderationUrl || "").replace(/\/$/, "");

  if (form && submitTarget && !config.signFormUrl && !moderationUrl) {
    form.setAttribute("action", "https://formsubmit.co/" + encodeURIComponent(submitTarget));
    form.setAttribute("method", "POST");
  }

  function syncConsentFields() {
    var publish = document.getElementById("publish-full-name");
    var publishHidden = document.getElementById("publish-full-name-hidden");
    var consent = document.getElementById("consent");
    var consentHidden = document.getElementById("consent-hidden");
    if (publishHidden) {
      publishHidden.value = publish && publish.checked ? "yes" : "no";
    }
    if (consentHidden) {
      consentHidden.value = consent && consent.checked ? "yes" : "no";
    }
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      syncConsentFields();

      if (config.signFormUrl) {
        return;
      }

      if (moderationUrl) {
        event.preventDefault();
        setStatus("Sending.");
        fetch(moderationUrl + "/sign", {
          method: "POST",
          body: new FormData(form),
        })
          .then(function (response) {
            if (!response.ok) {
              throw new Error("Send failed");
            }
            return response.json();
          })
          .then(function () {
            form.reset();
            setStatus("Sent for review. It will appear on the page after the initiator publishes the name.");
          })
          .catch(function () {
            setStatus("Could not send. Try again in a minute.");
          });
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

  loadSignatories();
})();
