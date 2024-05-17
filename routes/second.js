var express = require('express');
var router = express.Router()

jsonEntry =
{
    "copyright": "Dennis Lehtonen",
    "date": "2023-02-09",
    "explanation": "Vivid and lustrous, wafting iridescent waves of color wash across this skyscape from Kilpisjärvi, Finland. Known as nacreous clouds or mother-of-pearl clouds, they are rare. But their unforgettable appearance was captured looking south at 69 degrees north latitude at sunset on January 24.  A type of polar stratospheric cloud, they form when unusually cold temperatures in the usually cloudless lower stratosphere form ice crystals. Still sunlit at altitudes of around 15 to 25 kilometers, the clouds can diffract sunlight even after sunset and just before the dawn.",
    "hdurl": "https://apod.nasa.gov/apod/image/2302/PearlCloudDennis7.jpg",
    "media_type": "image",
    "service_version": "v1",
    "title": "Nacreous Clouds over Lapland",
    "url": "https://apod.nasa.gov/apod/image/2302/PearlCloudDennis7_1024.jpg"
}

router.get('/second', function(req, res, next) {
    res.render('second', {
        title: jsonEntry.title,
        description: jsonEntry.explanation,
        path: jsonEntry.url});
});

module.exports = router;