function toggleSubcategories(formId, listId) {
  var form = document.getElementById(formId);
  var list = document.getElementById(listId);

  if (form) {
    form.classList.toggle("hidden");
  }

  if (list) {
    list.classList.toggle("hidden");
  }
}
