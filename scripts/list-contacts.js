(async () => {
  try {
    const res = await fetch('https://houseofknowledge.net/admin/list-contacts', {
      method: 'GET',
      headers: { 'x-migrate-token': 'migrate-temp-4f3b7c' },
    });
    console.log('STATUS', res.status);
    console.log(await res.text());
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
