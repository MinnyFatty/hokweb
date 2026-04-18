(async () => {
  try {
    const body = new URLSearchParams({
      name: 'Test',
      surname: 'User',
      email: 'test@example.com',
      contactNumber: '555-1234'
    });

    const res = await fetch('https://houseofknowledge.net/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    console.log('STATUS', res.status);
    console.log(await res.text());
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
