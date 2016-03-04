import express from 'express';
import request from 'request';

const router = express.Router();

router.get('/api-proxy', (req, res) => {
    request
        .get(`https://huxley.apphb.com/${req.query.uri}?accessToken=${process.env.NETWORK_RAIL_API_KEY}&expand=true`)
        .pipe(res);
});


export default router;
