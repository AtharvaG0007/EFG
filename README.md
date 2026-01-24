# EFG – AI-Powered Finance Assistant

## Overview

EFG is an advanced AI-driven web application designed to empower students with real-time, precise guidance on finance, investments, and money management. By integrating Google Gemini AI with a sleek web interface, EFG provides students with actionable insights and clear, student-friendly explanations to help them make informed financial decisions.

## Features

* **Instant Finance Guidance**: Ask finance-related questions and receive immediate, AI-powered responses.
* **Student-Centric Design**: Information is presented in an easy-to-understand, concise format.
* **Web-Based Accessibility**: Fully hosted on Firebase for seamless cross-device access.
* **Future-Ready Architecture**: Scalable and ready for additional features like personalized recommendations.

## Technologies Used

* Google Gemini AI – Natural language processing and finance-specific knowledge engine.
* Firebase Hosting – Reliable and fast deployment of static web assets.
* HTML, CSS, JavaScript – Core front-end technologies ensuring smooth user interaction.
* google gemini - Research , image generation

## Architecture

User → Web App → Gemini API → AI Response

## Deployment

The application is hosted on Firebase:
[EFG Live Site](https://efg-mvp-3e91a.web.app/)

## CORS Restrictions

EFG communicates with the Google Gemini API through secure client-side requests.
**Important:** The API enforces Cross-Origin Resource Sharing (CORS) restrictions.

* Requests from unauthorized origins may be blocked by the API.
* Always use a verified and allowed domain (e.g., your Firebase hosting URL) to ensure smooth functionality.
* Local testing may require a development proxy or temporary CORS bypass solutions before deployment.

## Setup Instructions (For Developers)

1. Clone the repository using the GitHub URL.
2. Navigate into the project folder.
3. Install Firebase CLI if not already installed.
4. Initialize Firebase (if needed) and deploy using `firebase deploy --only hosting`.

## Future Scope

* User authentication and personalized dashboards.
* AI-driven investment recommendations.
* Comprehensive finance learning modules tailored for students.

## License

This project is proprietary and intended for educational and demonstration purposes.

---
