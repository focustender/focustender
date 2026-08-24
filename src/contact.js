// Progressive enhancement over the plain HTML form in contact.html: with
// JS disabled the form still posts natively to Web3Forms and the visitor
// lands on Web3Forms' own confirmation page; with it enabled, submission
// happens via fetch so the result shows inline instead.
const form = document.getElementById("contact-form");
const status = document.getElementById("contact-form-status");

if (form && status) {
  const submitButton = form.querySelector(".contact-form__submit");
  const requiredInputs = [form.elements.name, form.elements.email, form.elements.message];

  // Greyed out (see :disabled in contact.css) until Name, Email, and
  // Message all hold something valid — checkValidity() covers the email
  // field's format check too, not just "non-empty." Only gates the
  // button, not submission itself: the inputs' own `required` attributes
  // already block a native submit if JS never ran.
  function updateSubmitState() {
    submitButton.disabled = !requiredInputs.every((el) => el.checkValidity() && el.value.trim());
  }

  requiredInputs.forEach((el) => el.addEventListener("input", updateSubmitState));
  updateSubmitState();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Honeypot: a real visitor never sees or checks this field (see
    // .contact-form__honeypot in contact.css), so a checked box means a
    // bot filled every input it could find. Drop it silently rather than
    // showing an error, there's no one on the other end to see it.
    if (form.botcheck.checked) return;

    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
    status.textContent = "";
    status.classList.remove("is-error");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Request failed");
      }

      form.reset();
      status.textContent = "Thanks — I'll get back to you soon.";
    } catch {
      status.textContent = "Something went wrong sending that. Try emailing iancastorillo@gmail.com directly.";
      status.classList.add("is-error");
    } finally {
      // Not a bare `= false`: form.reset() above clears the fields on
      // success, so the button needs to go back to disabled along with
      // them rather than staying enabled with nothing typed in.
      updateSubmitState();
      submitButton.textContent = "Send";
    }
  });
}
