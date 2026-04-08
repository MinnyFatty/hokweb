// @ts-nocheck
import React from "react";
// server will handle saving and marking POI

export function Welcome({ message }: { message: string }) {
  return (
	<main className="flex items-center justify-center pt-16 pb-4">
	  <div className="flex-1 flex flex-col items-center gap-8 min-h-0">
		<header className="flex flex-col items-center gap-4">
		  <h1 className="text-4xl font-bold">House Of Knowledge</h1>
		  <p className="text-sm text-gray-600">Contact: admin@houseofknowledge.net</p>
		</header>

		<div className="space-y-4">
		  <a href="#contact" className="px-4 py-2 inline-block rounded bg-blue-600 text-white">Go to Contact Form</a>
		  <p className="text-gray-700">{message}</p>
		</div>

        <div id="contact" className="mt-6">
		  <ContactForm />
		</div>
	  </div>
	</main>
  );
}

function ContactForm() {
  return (
	<form action="/contact" method="post" className="rounded border p-6 max-w-md bg-white">
	  <h2 className="text-xl font-semibold mb-4">Contact Form</h2>

	  <label className="block mb-2">
		<span className="text-sm">Name *</span>
        <input name="name" required className="mt-1 block w-full border rounded p-2" />
	  </label>

	  <label className="block mb-2">
		<span className="text-sm">Surname</span>
		<input name="surname" className="mt-1 block w-full border rounded p-2" />
	  </label>

	  <label className="block mb-2">
		<span className="text-sm">Email *</span>
        <input name="email" type="email" required className="mt-1 block w-full border rounded p-2" />
	  </label>

	  <label className="block mb-4">
		<span className="text-sm">Contact Number *</span>
        <input name="contactNumber" required className="mt-1 block w-full border rounded p-2" />
	  </label>

	  <div className="flex gap-2">
		<button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Submit</button>
		<a href="#" className="px-4 py-2 bg-gray-200 rounded">Close</a>
	  </div>
	</form>
  );
}
