const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { withAccelerate } = require('@prisma/extension-accelerate');
const { Ratelimit } = require('@upstash/ratelimit');
const { Redis } = require('@upstash/redis');
const bcrypt = require('bcrypt');

const app = express();

// Initialize Prisma Client with Accelerate
const prisma = new PrismaClient().$extends(withAccelerate());

// Initialize Upstash Redis
let redis, ratelimitFree, ratelimitPro;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  
  // Free tier: 100 requests per day
  ratelimitFree = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(100, "1 d"),
  });

  // Pro tier: 10000 requests per day
  ratelimitPro = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(10000, "1 d"),
  });
}

// B2B Auth & Rate Limiting Middleware
const authMiddleware = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const apiSecret = req.headers['x-api-secret'];

  // For Demo Client and Admin Dashboard (bypass if no keys provided, or restrict in production)
  // Since it's Phase 2, we'll allow public access if no keys are provided, 
  // but if it's a B2B request, we validate and rate limit.
  if (!apiKey || !apiSecret) {
    return next(); // Bypass for local/dashboard testing
  }

  try {
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true }
    });

    if (!keyRecord || !keyRecord.active) {
      return res.status(401).json({ success: false, error: 'Invalid or inactive API Key' });
    }

    const validSecret = await bcrypt.compare(apiSecret, keyRecord.secret);
    if (!validSecret) {
      return res.status(401).json({ success: false, error: 'Invalid API Secret' });
    }

    // Apply Upstash Rate Limiting based on Plan
    if (redis) {
      const ratelimit = keyRecord.user.plan === 'Pro' || keyRecord.user.plan === 'Ultra' ? ratelimitPro : ratelimitFree;
      const { success, limit, remaining, reset } = await ratelimit.limit(keyRecord.userId);
      
      res.set('X-RateLimit-Limit', limit);
      res.set('X-RateLimit-Remaining', remaining);
      res.set('X-RateLimit-Reset', reset);

      if (!success) {
        return res.status(429).json({ success: false, error: 'Rate limit exceeded for your plan' });
      }
    }

    req.user = keyRecord.user;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Authentication error' });
  }
};

app.use(cors());
app.use(express.json());
app.use('/api/v1', authMiddleware); // Apply middleware to all API routes

app.get('/api/v1/states', async (req, res) => {
  try {
    const states = await prisma.state.findMany();
    res.json({ success: true, count: states.length, data: states, meta: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/districts', async (req, res) => {
  const { stateId } = req.query;
  try {
    const districts = await prisma.district.findMany({
      where: stateId ? { stateId: parseInt(stateId) } : undefined,
    });
    res.json({ success: true, count: districts.length, data: districts, meta: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/subdistricts', async (req, res) => {
  const { districtId } = req.query;
  try {
    const subDistricts = await prisma.subDistrict.findMany({
      where: districtId ? { districtId: parseInt(districtId) } : undefined,
    });
    res.json({ success: true, count: subDistricts.length, data: subDistricts, meta: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/villages', async (req, res) => {
  const { subDistrictId } = req.query;
  try {
    const villages = await prisma.village.findMany({
      where: subDistrictId ? { subDistrictId: parseInt(subDistrictId) } : undefined,
      take: 100, // Limit for performance without pagination
    });
    res.json({ success: true, count: villages.length, data: villages, meta: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ success: false, error: 'Query parameter q is required' });
  
  try {
    const villages = await prisma.village.findMany({
      where: {
        name: {
          contains: q,
          mode: 'insensitive',
        },
      },
      take: 50,
      include: {
        subDistrict: {
          include: {
            district: {
              include: {
                state: true
              }
            }
          }
        }
      }
    });
    res.json({ success: true, count: villages.length, data: villages, meta: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/autocomplete', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ success: false, error: 'Query parameter q is required' });
  
  try {
    const villages = await prisma.village.findMany({
      where: {
        name: {
          startsWith: q,
          mode: 'insensitive',
        },
      },
      take: 10,
      select: { id: true, name: true }
    });
    res.json({ success: true, count: villages.length, data: villages, meta: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

// Export the express app for Vercel Serverless/Edge
module.exports = app;
