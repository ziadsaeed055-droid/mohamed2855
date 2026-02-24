import admin from 'firebase-admin';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const serviceAccount = require('../firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Mapping old category values to new standardized ones
const categoryMapping = {
  'mens': 'men',
  'mens clothing': 'men',
  'men clothing': 'men',
  'men': 'men',
  
  'womens': 'women',
  'womens clothing': 'women',
  'women clothing': 'women',
  'women': 'women',
  
  'kids': 'kids',
  'kids clothing': 'kids',
  'children': 'kids',
  'boy': 'kids',
  'girl': 'kids',
  
  'accessories': 'accessories',
  'accessory': 'accessories',
  'shoes': 'accessories',
  'bags': 'accessories',
};

const subCategoryMapping = {
  't-shirts': 't-shirts',
  'tshirts': 't-shirts',
  'shirts': 'shirts',
  'pants': 'pants',
  'trousers': 'pants',
  'jeans': 'jeans',
  'dresses': 'dresses',
  'skirts': 'skirts',
  'shorts': 'shorts',
  'jackets': 'jackets',
  'coats': 'coats',
  'sweaters': 'sweaters',
  'hoodies': 'hoodies',
  'shoes': 'shoes',
  'sneakers': 'sneakers',
  'sandals': 'sandals',
  'bags': 'bags',
  'hats': 'hats',
  'accessories': 'accessories',
};

async function fixProductCategories() {
  console.log('[Migration] Starting product category fix...');
  
  try {
    const productsRef = db.collection('products');
    const snapshot = await productsRef.get();
    
    console.log(`[Migration] Found ${snapshot.docs.length} products`);
    
    let updated = 0;
    let errors = 0;
    
    for (const doc of snapshot.docs) {
      const product = doc.data();
      const updates = {};
      let needsUpdate = false;
      
      // Fix category
      if (product.category) {
        const normalizedCategory = product.category.toLowerCase().trim();
        const mappedCategory = categoryMapping[normalizedCategory] || normalizedCategory;
        
        if (mappedCategory !== product.category) {
          updates.category = mappedCategory;
          needsUpdate = true;
          console.log(`[Migration] Updating product "${product.name}": category "${product.category}" → "${mappedCategory}"`);
        }
      }
      
      // Fix subCategory
      if (product.subCategory) {
        const normalizedSubCategory = product.subCategory.toLowerCase().trim();
        const mappedSubCategory = subCategoryMapping[normalizedSubCategory] || normalizedSubCategory;
        
        if (mappedSubCategory !== product.subCategory) {
          updates.subCategory = mappedSubCategory;
          needsUpdate = true;
          console.log(`[Migration] Updating product "${product.name}": subCategory "${product.subCategory}" → "${mappedSubCategory}"`);
        }
      }
      
      if (needsUpdate) {
        await productsRef.doc(doc.id).update(updates);
        updated++;
      }
    }
    
    console.log(`[Migration] Successfully updated ${updated} products`);
    console.log(`[Migration] Errors: ${errors}`);
    console.log('[Migration] Migration completed successfully!');
    
  } catch (error) {
    console.error('[Migration] Error during migration:', error);
  } finally {
    process.exit(0);
  }
}

fixProductCategories();
