const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/hospitals', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude required." });
    }

    let hospitals = [];
    
    // 1. Load Local Fallback Data First (ensure SOMETHING always exists)
    const feedPath = path.join(__dirname, '../hospital_data.json');
    if (fs.existsSync(feedPath)) {
        try {
            const data = fs.readFileSync(feedPath, 'utf8');
            hospitals = JSON.parse(data);
        } catch (e) {
            console.error("Error reading hospital_data.json:", e.message);
        }
    }

    try {
        // 2. Fetch Live OSM Data
        const overpassQuery = `
            [out:json][timeout:25];
            (
              node(around:50000,${lat},${lon})["amenity"~"hospital|clinic|doctors|dentist"];
              node(around:50000,${lat},${lon})["healthcare"~"hospital|clinic|centre|dentist|surgeon"];
              node(around:50000,${lat},${lon})["name"~"Hospital|Clinic|Nursing Home|PHC|CHC|Health|Medical",i];
              way(around:50000,${lat},${lon})["amenity"~"hospital|clinic|doctors|dentist"];
              way(around:50000,${lat},${lon})["healthcare"~"hospital|clinic|centre|dentist|surgeon"];
              way(around:50000,${lat},${lon})["name"~"Hospital|Clinic|Nursing Home|PHC|CHC|Health|Medical",i];
            );
            out center;
        `;

        const response = await axios.post('https://overpass-api.de/api/interpreter', 
            `data=${encodeURIComponent(overpassQuery)}`,
            { 
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'AI-Chikitsalya-Health-App/1.0'
                },
                timeout: 30000 
            }
        );
        
        if (response.data && response.data.elements) {
            const osmHospitals = response.data.elements.map(h => {
                 const name = h.tags.name || h.tags['name:en'] || h.tags['name:hi'] || h.tags['name:mr'] || "Local Health Centre";
                 
                 let addrArray = [];
                 if (h.tags['addr:street']) addrArray.push(h.tags['addr:street']);
                 if (h.tags['addr:subdistrict']) addrArray.push(h.tags['addr:subdistrict']);
                 if (h.tags['addr:district']) addrArray.push(h.tags['addr:district']);
                 if (h.tags['addr:city']) addrArray.push(h.tags['addr:city']);
                 if (h.tags['addr:state']) addrArray.push(h.tags['addr:state']);

                 const addr = addrArray.length > 0 ? addrArray.join(", ") : "Local Medical Facility";
                 const phone = h.tags.phone || h.tags['contact:phone'] || h.tags['emergency:phone'] || "";

                 let category = "General";
                 let icon = "🏥";

                 const type = (h.tags.amenity || h.tags.healthcare || "").toLowerCase();
                 const speciality = (h.tags['healthcare:speciality'] || "").toLowerCase();

                 if (type.includes('dentist') || speciality.includes('dentist')) {
                     category = "Dentistry";
                     icon = "🦷";
                 } else if (type.includes('surgeon') || speciality.includes('surgery') || speciality.includes('surgeon')) {
                     category = "Surgeon";
                     icon = "🔬";
                 } else if (type.includes('clinic')) {
                     category = "Clinic";
                     icon = "🩺";
                 } else if (type.includes('hospital')) {
                     category = "Multispeciality";
                     icon = "🏥";
                 }

                 return {
                     name: name,
                     address: addr,
                     category: category,
                     icon: icon,
                     lat: h.lat || (h.center ? h.center.lat : null),
                     lon: h.lon || (h.center ? h.center.lon : null),
                     phone: phone,
                     source: 'satellite'
                 };
            }).filter(h => h.lat && h.lon);

            // Merge live data with local data, putting live data first
            hospitals = [...osmHospitals, ...hospitals];
        }

    } catch (err) {
        console.error("Overpass API Error:", err.message);
    }

    res.json(hospitals);
});

module.exports = router;