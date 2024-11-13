const axios = require('axios');
async function requestManager(config) {
    try {
        const response = await axios(config);
        return { data: response.data, status: response.status, statusText: response.statusText };
    } catch (error) {
        return { data: error?.response?.data, status: error?.response?.status, statusText: error?.response?.statusText };
    }
}

module.exports = { requestManager };