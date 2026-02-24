// This script initializes the settings collection in Firebase
// Run this once to create the initial documents

/*
To initialize the settings in Firebase, you need to:

1. Go to Firebase Console > Firestore Database
2. Click "Start collection" or add document
3. Create the following documents:

Collection: settings
Document ID: featuredProduct
Fields:
  - productId: "" (string)
  - titleAr: "منتج مميز" (string)
  - titleEn: "Featured Product" (string)
  - descriptionAr: "" (string)
  - descriptionEn: "" (string)
  - badges: [] (array)
  - isActive: false (boolean)

Collection: settings
Document ID: flashSale
Fields:
  - titleAr: "عروض سريعة" (string)
  - titleEn: "Flash Sale" (string)
  - discountPercent: 20 (number)
  - startDate: (timestamp - current date)
  - endDate: (timestamp - 7 days from now)
  - productIds: [] (array)
  - isActive: false (boolean)

4. Update Firebase Security Rules with the rules from firebase-rules-updated.txt
*/

export {}
