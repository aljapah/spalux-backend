const express = require('express');
const router = express.Router();
const Advertisement = require('../models/Advertisement');

const getKey = (str) =>
  str
    .toLowerCase()
    .replace(/أ|إ/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[^a-z0-9]/g, '_')
    .trim();

router.get('/', async (req, res) => {
  try {
    const baseUrl = process.env.BASE_URL || 'https://spalux-backend.onrender.com';

    const { category, subCategory, governorate, limit = 50, skip = 0 } = req.query;
    
    let query = { 
      isActive: true,
      subscriptionEndDate: { $gte: new Date() }
    };
    
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (governorate) query.governorate = governorate;
    
    const advertisements = await Advertisement.find(query)
      .sort({ displayOrder: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Advertisement.countDocuments(query);
    
    const data = advertisements.map(ad => {
      const adObject = ad.toObject();
      
      const formattedImages = adObject.images.map(img => {
          if (img.startsWith('/uploads/') || img.startsWith('uploads/')) {
              const filename = img.replace('/uploads/', '').replace('uploads/', '');
              return `${baseUrl}/uploads/${filename}`;
          }
          return img; 
      });

      const formattedVideos = adObject.videos.map(vid => {
          if (vid.startsWith('/uploads/') || vid.startsWith('uploads/')) {
              const filename = vid.replace('/uploads/', '').replace('uploads/', '');
              return `${baseUrl}/uploads/${filename}`;
          }
          return vid;
      });

      return {
        ...adObject,
        images: formattedImages,
        videos: formattedVideos,
        category_key: getKey(adObject.subCategory || adObject.category),
        socialMedia: {
            ...adObject.socialMedia,
            tiktok: adObject.socialMedia.tiktok || ''
        }
      }
    });
    
    res.json({
      success: true,
      count: advertisements.length,
      total,
      data
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const baseUrl = process.env.BASE_URL || 'https://spalux-backend.onrender.com';
    
    const advertisement = await Advertisement.findById(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({ 
        success: false,
        message: 'Advertisement not found' 
      });
    }
    
    const adObject = advertisement.toObject();

    const formattedImages = adObject.images.map(img => {
        if (img.startsWith('/uploads/') || img.startsWith('uploads/')) {
            const filename = img.replace('/uploads/', '').replace('uploads/', '');
            return `${baseUrl}/uploads/${filename}`;
        }
        return img; 
    });

    const formattedVideos = adObject.videos.map(vid => {
        if (vid.startsWith('/uploads/') || vid.startsWith('uploads/')) {
            const filename = vid.replace('/uploads/', '').replace('uploads/', '');
            return `${baseUrl}/uploads/${filename}`;
        }
        return vid;
    });

    const data = {
      ...adObject,
      images: formattedImages,
      videos: formattedVideos,
      category_key: getKey(adObject.subCategory || adObject.category),
      socialMedia: {
          ...adObject.socialMedia,
          tiktok: adObject.socialMedia.tiktok || ''
      }
    };
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

router.get('/category/:category', async (req, res) => {
  try {
    const baseUrl = process.env.BASE_URL || 'https://spalux-backend.onrender.com';

    const { category } = req.params;
    const { governorate, subCategory } = req.query;
    
    let query = { 
      category,
      isActive: true,
      subscriptionEndDate: { $gte: new Date() }
    };
    
    if (governorate) query.governorate = governorate;
    if (subCategory) query.subCategory = subCategory;
    
    const advertisements = await Advertisement.find(query)
      .sort({ displayOrder: -1, createdAt: -1 });
    
    const data = advertisements.map(ad => {
        const adObject = ad.toObject();
        
        const formattedImages = adObject.images.map(img => {
            if (img.startsWith('/uploads/') || img.startsWith('uploads/')) {
                const filename = img.replace('/uploads/', '').replace('uploads/', '');
                return `${baseUrl}/uploads/${filename}`;
            }
            return img; 
        });

        const formattedVideos = adObject.videos.map(vid => {
            if (vid.startsWith('/uploads/') || vid.startsWith('uploads/')) {
                const filename = vid.replace('/uploads/', '').replace('uploads/', '');
                return `${baseUrl}/uploads/${filename}`;
            }
            return vid;
        });

        return {
            ...adObject,
            images: formattedImages,
            videos: formattedVideos,
            category_key: getKey(adObject.subCategory || adObject.category),
            socialMedia: {
                ...adObject.socialMedia,
                tiktok: adObject.socialMedia.tiktok || ''
            }
        };
    });
    
    res.json({
      success: true,
      count: advertisements.length,
      data
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;