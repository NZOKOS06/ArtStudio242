// Script de debug pour vérifier les URLs d'images
// À exécuter dans la console du navigateur

console.log("🔍 Debug des images - Art Studio 242");

// Vérifier toutes les images sur la page
const images = document.querySelectorAll('img');
console.log(`Found ${images.length} images on page`);

images.forEach((img, index) => {
  console.log(`\n--- Image ${index + 1} ---`);
  console.log('src:', img.src);
  console.log('alt:', img.alt);
  console.log('loaded:', img.complete && img.naturalHeight > 0);
  console.log('error:', img.complete && img.naturalHeight === 0);
  
  if (img.src.includes('cloudinary')) {
    console.log('✅ Cloudinary image detected');
  } else if (img.src.includes('localhost') || img.src.includes('vercel')) {
    console.log('🏠 Local/hosted image');
  } else {
    console.log('❓ Unknown image source');
  }
});

// Vérifier la fonction api.assetUrl si disponible
if (typeof window !== 'undefined' && window.api?.assetUrl) {
  console.log('\n🔧 Testing api.assetUrl function:');
  
  const testUrls = [
    '/uploads/test.jpg',
    'https://res.cloudinary.com/test/image/upload/v1234/sample.jpg',
    'http://localhost:4000/uploads/test.jpg'
  ];
  
  testUrls.forEach(url => {
    console.log(`Input: ${url}`);
    console.log(`Output: ${window.api.assetUrl(url)}`);
  });
}

// Tester Cloudinary transformations
console.log('\n🌐 Testing Cloudinary URL transformations:');

function testCloudinaryUrl(url) {
  console.log(`Original: ${url}`);
  
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    const optimized = url.replace('/upload/', '/upload/f_auto,q_auto/');
    console.log(`Optimized: ${optimized}`);
    
    const webp = url.replace('/upload/', '/upload/f_webp,q_auto/');
    console.log(`WebP: ${webp}`);
    
    const resized = url.replace('/upload/', '/upload/w_800,f_auto,q_auto/');
    console.log(`Resized: ${resized}`);
  } else {
    console.log('Not a Cloudinary URL');
  }
  console.log('---');
}

// Exemples de test
const sampleCloudinaryUrls = [
  'https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg',
  'https://res.cloudinary.com/your-cloud/image/upload/folder/image.png'
];

sampleCloudinaryUrls.forEach(testCloudinaryUrl);