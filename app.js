(function () {
  var config = window.PLEDGE_CONFIG || {};
  var form = document.getElementById("sign-form");
  var statusEl = document.getElementById("form-status");
  var listEl = document.getElementById("signatory-list");
  var countEl = document.getElementById("signatory-count");
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
          throw new Error("Could not load signatories");
        }
        return response.json();
      })
      .then(function (rows) {
        listEl.replaceChildren();
        if (countEl) {
          countEl.textContent = String(rows.length);
        }
        rows.forEach(function (row) {
          var item = document.createElement("li");
          var who = document.createElement("span");
          who.className = "who";
          who.textContent = row.name;
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
        setListMessage("Signatories will appear here once the list is published.");
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
        var name = document.getElementById("name").value.trim();
        var role = document.getElementById("role").value.trim();
        var organisation = document.getElementById("organisation").value.trim();
        var body =
          "I have read the Recital 133 Pledge and I sign.%0D%0A%0D%0AName: " +
          encodeURIComponent(name) +
          "%0D%0ARole: " +
          encodeURIComponent(role) +
          "%0D%0AOrganisation: " +
          encodeURIComponent(organisation);
        window.location.href =
          "mailto:sara@nocodelab.ai?subject=" +
          encodeURIComponent("Recital 133 Pledge signature") +
          "&body=" +
          body;
        setStatus("Your email app should open with the signature filled in. Send it, and a maintainer will add your name.");
        return;
      }

      setStatus("Sending.");
    });
  }

  loadSignatories();
})();
