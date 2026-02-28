🌾 Sri Balaji Traders – Website ::

Sri Balaji Traders is a real-world business website developed to support and digitize my father’s rice trading shop.
The primary goal of this project is to increase sales, improve customer reach, and provide easy access to rice varieties, prices, and shop location through an online platform.

🔗 Live Website: https://sri-balaji-traders-1.web.app/

<p align="center">
<img width="195"  alt="Screenshot 2026-01-10 at 11 45 59 PM" src="https://github.com/user-attachments/assets/27d8dcc1-ad05-41c1-b9de-f95d28e61c97" />
<img width="195" alt="Screenshot 2026-01-11 at 12 04 47 AM" src="https://github.com/user-attachments/assets/df8fb840-3e0d-4cf2-aba2-3f757f64f73a" />
<img width="195"  alt="Screenshot 2026-01-10 at 11 46 55 PM" src="https://github.com/user-attachments/assets/04c8b197-4048-4dfe-a1b7-62f38640957b" />
<img width="195"  alt="Screenshot 2026-01-10 at 11 47 19 PM" src="https://github.com/user-attachments/assets/15e0e1c2-28fc-48b6-8f98-b48c89ae9797" />
<img width="195"  alt="Screenshot 2026-01-11 at 12 04 07 AM" src="https://github.com/user-attachments/assets/4850eac7-0e0f-4a7c-98b0-2a182b5bdc19" />
</p>

## 🛠️ Tech Stack

	- Frontend: React 19, Vite, JavaScript, HTML, CSS (with framer-motion for animations)
	- Backend & Database: Firebase Firestore
	- Authentication: Clerk
	- Image Storage: Cloudinary
	- AI Integration: Google Gemini API
	- Analytics: Looker Studio
	- Features: Progressive Web App (PWA), EmailJS Integration

## 🤝 Collaboration & Contributions

	 This project was collaboratively developed by two developers with clearly defined following real business requirements and customer needs.

## 👨‍💻 Vinay Kumar (Vinay50029)

	•	Designed and implemented the Firebase database and data structure
	•	Implemented secure authentication for the shop owner (Father Admin)
	•	Developed core pages: Home | cart | orders | Essentials | About
    •   Built Looker Studio analytics dashboard
	•	Integrated order data with notification workflows
	•	Implemented product listing and display logic
	•	Partially implemented customer authentication (initial setup – 50)
  
## 👨‍💻 Nikhil Kumar (nick3948)

	•	Integrated Google Generative AI (Gemini API) features
	•	Enhanced overall UI/UX design
	•	Completed and finalized customer authentication (100%)
	•	Improved responsiveness and user experience
  	• 	Implemented email notifications for orders
	•	Implemented WhatsApp auto-draft order messaging


## 🔐 Authentication System
The application uses role-based authentication:

	•	Admin (Shop Owner) : Full access to add, edit, and delete products, prices, and images
	•	Customers: Secure login for browsing and interacting with store content

Authentication is implemented using Clerk with protected routes to prevent unauthorized access.

## 🗄️ Database Design & Data Management
The application uses Firebase Firestore for real-time data storage and management.

	•	Products: Uploaded by the Admin with details such as name, category, price, and image URL
	•	Users: Stores authenticated customer and admin details
	•	Cart: Maintains user-specific cart items and quantities
	•	Orders: Stores complete order history for customers and admin tracking
  
## 🖼️ Image Management & Optimization

	•	Product images are uploaded to Cloudinary
	•	Cloudinary generates optimized and secure image URLs
	•	Only image URLs are stored in Firebase Firestore

This approach ensures better performance, scalability, and faster image loading.	

## 📊 Analytics & Monitoring

	The application includes an analytics dashboard built using Looker Studio to monitor business performance and customer activity.
🔗 Looker Studio Dashboard: https://lookerstudio.google.com/u/0/reporting/b13b48ac-697b-406a-a510-73191d5c9b0d/page/6q2iF

<p align="center">
<img width="290" alt="image" src="https://github.com/user-attachments/assets/04e08aaa-ade2-4bb1-86b1-04158aa8d99b" />
</p>
<br>

## 📍 Business Information

	•	Business Name: Sri Balaji Traders
	•	Category: Rice & Grocery Trading
	•	Delivery: Free delivery up to 10 km (selected areas)
	•	Location: Local shop (map integrated in website)
