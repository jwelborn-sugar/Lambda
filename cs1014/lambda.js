const axios = require('axios');

let handler = async (event) => {
    let baseUrl = process.env.sugarUrl
    
    return axios.post(`${baseUrl}/rest/v11_10/oauth2/token`, {
        grant_type: 'password',
        client_id: 'sugar',
        client_secret: '',
        username: process.env.sugarUsername,
        password: process.env.sugarPass,
        platform: 'base'
    })
    .then((response) => {
        let queryParams = {
            erased_fields: true,
            fields: 'status'
        };
        let config = {
            headers: { Authorization: `Bearer ${response.data.access_token}`},
            params: queryParams
        }
        let filterUrl = encodeURI(`${baseUrl}/rest/v11_10/Cases?filter[0][case_number]=${event.caseNumber}`);
        return axios.get(filterUrl, config);
    })
    .then((response) => {
        return {
            caseStatus: response.data.records[0].status
        };
    })
    .catch((error) => {
        console.error(error);
        return {
            error: error
        };
    });
};

exports.handler = handler;
