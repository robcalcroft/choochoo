import express from 'express';
import request from 'request';

let router = express.Router();

router.get('/api-proxy', (req, res) => {
    request
        .get(`https://huxley.apphb.com/${req.query.proxyUri}?accessToken=${process.env.NETWORK_RAIL_API_KEY}`)
        .pipe(res);
});


export default router;
