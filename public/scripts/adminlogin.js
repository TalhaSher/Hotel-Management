function validateForm() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  // Check if username or password is empty
  if (username === "" || password === "") {
    showAlert("Please enter both username and password.", "danger");
    return false;
  }

  // Check if username and password are correct (you can replace this with your own validation logic)
  if (username !== "Riphah" || password !== "1234") {
    showAlert("Incorrect username or password.", "danger");
    return false;
  }

  // If everything is valid, allow form submission
  return true;
}

function showAlert(message, type) {
  var alertDiv = document.createElement("div");
  alertDiv.className = "alert alert-" + type;
  alertDiv.textContent = message;

  var alertContainer = document.getElementById("alertContainer");
  alertContainer.innerHTML = ""; // Clear any existing alerts
  alertContainer.appendChild(alertDiv);
}
// Password Visibility Button
function togglePasswordVisibility() {
  var passwordInput = document.getElementById("password");
  var passwordVisibilityIcon = document.getElementById(
    "passwordVisibilityIcon"
  );

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    passwordVisibilityIcon.classList.remove("fa-eye");
    passwordVisibilityIcon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    passwordVisibilityIcon.classList.remove("fa-eye-slash");
    passwordVisibilityIcon.classList.add("fa-eye");
  }
}
