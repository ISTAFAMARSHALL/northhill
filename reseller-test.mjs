import { createResellerLine } from './lib/reseller.js';

process.env.RESELLER_USERNAME   = 'NorthHIll';
process.env.RESELLER_PASSWORD   = 'dovzar-4dabMi-zektuw';
process.env.RESELLER_SERVER_URL = 'http://proxpanel.cc:8080';

try {
  const result = await createResellerLine({
    planName:    'Trial',
    planTerm:    'trial',
    connections: 1,
    startDate:   new Date().toISOString().split('T')[0],
    description: 'Test line from automation',
  });
  console.log('✅ SUCCESS:', result);
} catch (err) {
  console.error('❌ FAILED:', err.message);
}

