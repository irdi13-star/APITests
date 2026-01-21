import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

export const testrail = axios.create({
    baseURL: `${process.env.TESTRAIL_BASE_URL}/index.php?/api/v2/`,
    auth: {
        username: process.env.TESTRAIL_EMAIL!,
        password: process.env.TESTRAIL_API_KEY!
    },
    httpsAgent
});
