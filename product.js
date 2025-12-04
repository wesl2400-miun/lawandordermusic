window.addEventListener('click', () => {
  const params = new URLSearchParams(window.location.search);
  const current = params.get('track') || '';
  console.log(current);
})