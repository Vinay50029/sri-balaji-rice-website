🌾 Sri Balaji Traders – Website

Sri Balaji Traders is a real-world business website developed to support and digitize my father’s rice trading shop.
The primary goal of this project is to increase sales, improve customer reach, and provide easy access to rice varieties, prices, and shop location through an online platform.

🔗 Live Website: https://sri-balaji-traders-1.web.app/

🤝 Collaboration & Contributions
This project was collaboratively developed by two developers with clearly defined following real business requirements and customer needs.

👨‍💻 Vinay Kumar 

	•	Designed and implemented the Firebase database and data structure
	•	Implemented secure authentication for the shop owner (Father Admin)
	•	Developed core pages:
	      Home | cart | orders | Essentials | About
    
    . Built Looker Studio analytics dashboard
	•	Integrated order data with notification workflows
	•	Implemented product listing and display logic
	•	Partially implemented customer authentication (initial setup – 50%)
  

👨‍💻 Nikhil Kumar (nick3948)

	•	Integrated Google Generative AI (Gemini API) features
	•	Enhanced overall UI/UX design
	•	Completed and finalized customer authentication (100%)
	•	Improved responsiveness and user experience
  	. 	Implemented email notifications for orders
	•	Implemented WhatsApp auto-draft order messaging


🔐 Authentication System

The application uses role-based authentication:

	•	Father Admin: Full access to add, edit, and delete products, prices, and images
	•	Customers: Secure login for browsing and interacting with store content

Authentication is implemented using Clerk with protected routes to prevent unauthorized access.

🗄️ Database Design & Data Management

The application uses Firebase Firestore for real-time data storage and management.

	•	Products: Uploaded by the Father Admin with details such as name, category, price, and image URL
	•	Users: Stores authenticated customer and admin details
	•	Cart: Maintains user-specific cart items and quantities
	•	Orders: Stores complete order history for customers and admin tracking
  
🖼️ Image Management & Optimization

	•	Product images are uploaded to Cloudinary
	•	Cloudinary generates optimized and secure image URLs
	•	Only image URLs are stored in Firebase Firestore

This approach ensures better performance, scalability, and faster image loading.	

📍 Business Information

	•	Business Name: Sri Balaji Traders
	•	Category: Rice & Grocery Trading
	•	Delivery: Free delivery up to 10 km (selected areas)
	•	Location: Local shop (map integrated in website)

<img width="766" height="1076" alt="image" src="https://github.com/user-attachments/assets/04e08aaa-ade2-4bb1-86b1-04158aa8d99b" />
  
