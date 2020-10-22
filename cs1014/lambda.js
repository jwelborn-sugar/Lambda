const axios = require('axios');

const HttpStatus = {
    ok: 200,
    notFound: 404,
    error: 500
}

const baseUrl = process.env.sugarUrl;

let handler = async (event) => {
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
        let caseBean = response.data.records[0]
        let statusCode = HttpStatus.notFound;
        let body = {};
        if (caseBean) {
            statusCode = HttpStatus.ok
            body = {
                id: caseBean.id,
                status: caseBean.status
            }
        }

        console.log({
            status: statusCode,
            body: body
        });
        return {
            status: statusCode,
            body: body
        };
    })
    .catch((error) => {
        console.error(error);
        return {
            status: HttpStatus.error,
            error: error
        };
    });
};

exports.handler = handler;