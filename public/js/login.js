const login = (email, password) => {};

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  // pull email and password
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
