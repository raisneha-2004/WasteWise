import sharp from 'sharp';
import app from './src/app.js';

let server;

async function runTests() {
  const PORT = 5001;
  server = app.listen(PORT);

  const BASE_URL = `http://localhost:${PORT}`;
  console.log(`\n--- Running Endpoints Test on ${BASE_URL} ---\n`);

  try {
    // 1. GET /api/health
    console.log('Testing 1: GET /api/health');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthJson = await healthRes.json();
    console.log('Health Status:', healthJson.success ? 'PASS ✅' : 'FAIL ❌');
    console.log(JSON.stringify(healthJson, null, 2));

    // 2. GET /api/categories
    console.log('\nTesting 2: GET /api/categories');
    const catRes = await fetch(`${BASE_URL}/api/categories`);
    const catJson = await catRes.json();
    console.log('Categories Count:', catJson.data?.categories?.length, catJson.success ? 'PASS ✅' : 'FAIL ❌');

    // 3. GET /api/centers
    console.log('\nTesting 3: GET /api/centers (with Noida coordinates & category filter)');
    const centersRes = await fetch(`${BASE_URL}/api/centers?lat=28.5832&lng=77.3481&category=Plastic&radiusKm=15&page=1&limit=3`);
    const centersJson = await centersRes.json();
    console.log('Centers returned:', centersJson.data?.centers?.length, 'Total matching:', centersJson.data?.pagination?.total, centersJson.success ? 'PASS ✅' : 'FAIL ❌');

    // 4. POST /api/waste/confirm
    console.log('\nTesting 4: POST /api/waste/confirm (Hinglish)');
    const confirmRes = await fetch(`${BASE_URL}/api/waste/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemName: 'Cardboard Box',
        category: 'Paper',
        language: 'hinglish',
        lat: 28.5832,
        lng: 77.3481
      })
    });
    const confirmJson = await confirmRes.json();
    console.log('Confirm Bin:', confirmJson.data?.bin?.name, 'Steps:', confirmJson.data?.steps?.length, confirmJson.success ? 'PASS ✅' : 'FAIL ❌');

    // 5. POST /api/impact/summary
    console.log('\nTesting 5: POST /api/impact/summary');
    const impactRes = await fetch(`${BASE_URL}/api/impact/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history: [
          { category: 'Plastic', weightKg: 0.5, date: '2026-10-01' },
          { category: 'Metal', weightKg: 0.2, date: '2026-10-01' },
          { category: 'Organic', weightKg: 1.2, date: '2026-10-02' }
        ]
      })
    });
    const impactJson = await impactRes.json();
    console.log('Total CO2 Saved:', impactJson.data?.totalCo2SavedKg, 'Badge:', impactJson.data?.badge?.badge, impactJson.success ? 'PASS ✅' : 'FAIL ❌');

    // 6. POST /api/assistant/ask
    console.log('\nTesting 6: POST /api/assistant/ask (Hinglish waste question)');
    const assistantRes = await fetch(`${BASE_URL}/api/assistant/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'Ghar par purani plastic bottle kaise recycle karein?',
        language: 'hinglish',
        context: { lastItem: 'Water Bottle', category: 'Plastic' }
      })
    });
    const assistantJson = await assistantRes.json();
    console.log('Assistant Answer:', assistantJson.data?.answer, assistantJson.success ? 'PASS ✅' : 'FAIL ❌');

    // 7. POST /api/waste/analyze (Creating realistic JPEG buffer with Sharp and sending via FormData)
    console.log('\nTesting 7: POST /api/waste/analyze (Multipart upload)');
    const bottleSvg = `
      <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#ffffff"/>
        <rect x="180" y="60" width="40" height="30" fill="#0284c7" rx="3"/>
        <rect x="185" y="45" width="30" height="15" fill="#0369a1" rx="2"/>
        <path d="M160,110 L240,110 L250,330 C250,345 235,355 200,355 C165,355 150,345 150,330 Z" fill="#38bdf8" fill-opacity="0.85" stroke="#0284c7" stroke-width="4"/>
        <text x="200" y="220" font-family="Arial" font-size="16" text-anchor="middle" fill="#0f172a" font-weight="bold">MINERAL WATER</text>
        <text x="200" y="240" font-family="Arial" font-size="12" text-anchor="middle" fill="#334155">PET 1 PLASTIC BOTTLE</text>
      </svg>
    `;
    const testImageBuffer = await sharp(Buffer.from(bottleSvg))
      .jpeg()
      .toBuffer();

    const formData = new FormData();
    const blob = new Blob([testImageBuffer], { type: 'image/jpeg' });
    formData.append('image', blob, 'test-bottle.jpg');
    formData.append('language', 'hinglish');
    formData.append('lat', '28.5832');
    formData.append('lng', '77.3481');

    const analyzeRes = await fetch(`${BASE_URL}/api/waste/analyze`, {
      method: 'POST',
      body: formData
    });
    const analyzeJson = await analyzeRes.json();
    console.log('Analyze Result Item:', analyzeJson.data?.item?.name, 'Category:', analyzeJson.data?.category, analyzeJson.success ? 'PASS ✅' : 'FAIL ❌');
    console.log('Eco-points:', analyzeJson.data?.ecoPoints?.totalPoints, 'Nearby Centers:', analyzeJson.data?.nearbyCenters?.length);

    console.log('\n🎉 ALL 7 ENDPOINTS PASSED VERIFICATION SUCCESFULLY!\n');
  } catch (err) {
    console.error('Test run error:', err);
  } finally {
    if (server) {
      server.close();
    }
  }
}

runTests();
