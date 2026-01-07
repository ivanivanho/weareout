# **Product Requirement Document: WeAreOut**

**Version:** 1.0 (Full SLC Build)

**Status:** Finalized for External Build Phase

**Project Codename:** Checklist

## **1\. Introduction & Vision**

**WeAreOut** is a personal inventory concierge designed to eliminate the mental burden of household management. By acting as a proactive agent rather than a manual tracker, it solves the core problem of **cognitive offloading**. The vision is a "zero-friction" world where a user never has to remember to buy essentials like milk, bread, or shampoo—the app remembers for them.

## **2\. Goals & Objectives**

* **Utility-Market Fit (Business Goal):** Launch an SLC (Simple, Lovable, Complete) product that achieves immediate utility by offloading the user's tracking burden. Success is measured by the transition from manual tracking to agent-assisted replenishment.  
* **The "Never Out" Promise (User Goal):** Zero instances of running out of essential items and zero "double-buying" due to lack of visibility.  
* **indispensable Daily Tool (Product Goal):** Measured by high daily active usage and user retention, specifically focusing on "High-Value Perishables".

## **3\. Brand Identity & Persona: The Concierge**

* **Name:** **WeAreOut** (Declarative, functional, and relatable).  
* **Persona:** An "invisible" digital concierge (akin to a modern-day Alfred or steward).  
* **Communication Tone:** Professional, quiet, and proactive. Notifications should feel like a helpful update rather than a system alert (e.g., *"Excuse me, I've noticed the milk is nearly finished. I've added it to the list for you."*).  
* **Zero Gamification:** Avoids mascots or badges to maintain a high-trust, professional "clerk" identity.

## **4\. Core Features & Functionality**

### **4.1. Passive Ingestion (Zero-Effort Logging)**

* **Email Receipt Scraping:** Secure OAuth2 integration to scan for digital receipts (Amazon, Instacart, etc.) to auto-populate inventory without user action.  
* **Gemini Vision Integration:**  
  * **Pantry/Fridge Photos:** Users can snap a photo; Gemini parses the image to extract structured data (Item, Quantity, Unit).  
  * **Physical Receipt OCR:** Parsing store name, date, and line items from photos of paper receipts.  
* **Voice/Text Quick-Log:** Simple, 2-second methods for a user to indicate a depletion (e.g., *"WeAreOut of shampoo"*).

### **4.2. Consumption Intelligence**

* **Predictive Burn Rate:** An algorithm that tracks the time delta between purchase logs to establish a "Consumption Velocity" and "Time-to-Empty" clock.  
* **Functional Metrics:** Display "Estimated \[X\] Days Left" or "3 items remaining" rather than just a colored bar.  
* **Confidence Score:** If the app is unsure of a burn rate, it proactively prompts for a quick confirmation.

### **4.3. Functional Dashboard (The Daily View)**

* **Fuel Gauge View:** Visual cards showing stock levels (Green/Yellow/Red).  
* **Dynamic Grouping:** Users can toggle views between **Usage Category** (e.g., "Running Gear") and **Physical Location** (e.g., "Pantry," "Fridge").  
* **Location Tagging:** Optional tagging for items (e.g., "Garage, Shelf B") to help users find things in full storerooms.

## **5\. Technical Requirements**

### **5.1. The "Buddy" Technical Pillars**

* **Security & Privacy:**  
  * **Encrypted Storage:** All data is stored in an encrypted cloud account accessible only by the authorized user.  
  * **PII Masking:** Email scraper strictly limited to commerce-related keywords; personal correspondence remains unindexed.  
* **Integration Layer:**  
  * **Merchant-Agnostic API:** Built with a deep-link engine to support various retailers globally (Tesco, Amazon, FairPrice, etc.).  
  * **Regional Modules:** Capability to toggle hooks based on the user's geography.

## **6\. UX Flows & Roadmap**

### **6.1. Build Phases**

* **Phase 1 (Single User SLC):** Email/Receipt scraping, Gemini photo recognition, manual depletion triggers, and shopping list generation.  
* **Phase 2 (Household):** Multi-user household accounts with shared inventory and attribution.  
* **Phase 3 (Agentic):** Autonomous reordering via agent-led purchasing once critical thresholds are hit.

### **6.2. The "Golden Path" UX**

1. **Onboarding:** "No-Pressure" intro where users can test a "Learning Scan" of a receipt.  
2. **Daily View:** Instant situational awareness via the "Days Remaining" metrics.  
3. **The Depletion Moment:** Long-press home screen widgets or voice triggers to mark an item as out in under 2 seconds.

