function initNetlifyIdentity() {
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", function(user) {
      if (!user) {
        window.netlifyIdentity.on("login", function() {
          window.location.href = "/admin/";
        });
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", initNetlifyIdentity);
