export const showAlert = (type, msg) => {
  // type must be either 'success' or 'error'
  // hide any open alerts
  hideAlert();
  // create alert html
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  // spawn in an alert modal
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  // hide any alerts after 5s
  window.setTimeout(hideAlert, 5000);
};

export const hideAlert = () => {
  // select alert element
  const el = document.querySelector('.alert');
  // select alert's parent, and remove child
  if (el) el.parentElement.removeChild(el);
};
