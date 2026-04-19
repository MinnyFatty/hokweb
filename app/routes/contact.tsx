// @ts-nocheck
import type { ActionArgs } from "react-router";
import { handleCreateContactAction } from "../backend/controllers/contactController.server";

export function meta() {
  return [
    { title: "Contact Us | House of Knowledge" },
    {
      name: "description",
      content: "Contact House of Knowledge and submit your details through our contact form.",
    },
  ];
}

export async function action(args: ActionArgs) {
  return handleCreateContactAction(args);
}

export default function ContactPage() {
  return (
    <section className="contact-page">
      <header className="contact-page-header">
        <h1>House Of Knowledge</h1>
        <p>Contact: admin@houseofknowledge.net</p>
      </header>

      <div className="contact-layout">
        <article className="contact-intro">
          <h2>Contact Us</h2>
          <p>
            Share your details and we will reach out with the right information,
            learning options, and next steps.
          </p>
          <ul>
            <li>Personal response from our team</li>
            <li>Guidance based on your interests</li>
            <li>Clear next actions after submission</li>
          </ul>

          <div className="contact-details" aria-label="Direct contact details">
            <h3>Direct Contact Details</h3>

            <a className="contact-detail-item" href="tel:+27659272238" aria-label="Call House of Knowledge">
              <span className="contact-icon" aria-hidden="true">📞</span>
              <span>0659272238</span>
            </a>

            <a className="contact-detail-item" href="mailto:admin@houseofknowledge.net" aria-label="Email House of Knowledge">
              <span className="contact-icon" aria-hidden="true">
                <svg className="social-logo" viewBox="0 0 24 24" role="img" aria-label="Envelope">
                  <rect x="2.5" y="5" width="19" height="14" rx="2" fill="#f3f7fb" stroke="#113d74" strokeWidth="1.8" />
                  <path d="M3.8 6.6 12 13.1l8.2-6.5" fill="none" stroke="#113d74" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>admin@houseofknowledge.net</span>
            </a>

            <a
              className="contact-detail-item"
              href="https://www.facebook.com/search/top?q=House%20of%20Knowledge%20-%20Light%20of%20Youth"
              target="_blank"
              rel="noreferrer"
              aria-label="Open Facebook page"
            >
              <span className="contact-icon" aria-hidden="true">
                <img className="social-logo" src="/fb_logo.png" alt="Facebook" />
              </span>
              <span>House of Knowledge - Light of Youth</span>
            </a>

            <a
              className="contact-detail-item"
              href="https://www.instagram.com/houseofknowledge_lightofyouth/"
              target="_blank"
              rel="noreferrer"
              aria-label="Open Instagram page"
            >
              <span className="contact-icon" aria-hidden="true">
                <img
                  className="social-logo"
                  src="/instagram-logo-png-transparent-background-300x300.png"
                  alt="Instagram"
                />
              </span>
              <span>@houseofknowledge_lightofyouth</span>
            </a>
          </div>
        </article>

        <form method="post" className="contact-form">
          <h2>Contact Form</h2>

          <label>
            <span>Name *</span>
            <input name="name" required />
          </label>

          <label>
            <span>Surname</span>
            <input name="surname" />
          </label>

          <label>
            <span>Email *</span>
            <input name="email" type="email" required />
          </label>

          <label>
            <span>Contact Number *</span>
            <input name="contactNumber" required />
          </label>

          <button type="submit" className="button-primary">Submit</button>
        </form>
      </div>
    </section>
  );
}
