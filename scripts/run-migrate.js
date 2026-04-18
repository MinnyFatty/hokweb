(async () => {
  try {
    const res = await fetch('https://houseofknowledge.net/admin/migrate-contacts', {
      method: 'POST',
      headers: { 'x-migrate-token': 'migrate-temp-4f3b7c' },
    });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log(text);
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
