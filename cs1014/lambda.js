const axios = require('axios');

const HttpStatus = {
  ok: 200,
  notFound: 404,
  error: 500
};

const baseUrl = process.env.sugarUrl;

const handler = async (event) => {
  return axios.post(`${baseUrl}/rest/v11_10/oauth2/token`, {
    grant_type: 'password',
    client_id: 'sugar',
    client_secret: '',
    username: process.env.sugarUsername,
    password: process.env.sugarPass,
    platform: 'base'
  })
    .then((response) => {
      const queryParams = {
        erased_fields: true,
        fields: 'status'
      };
      const config = {
        headers: { Authorization: `Bearer ${response.data.access_token}` },
        params: queryParams
      };
      const filterUrl = encodeURI(`${baseUrl}/rest/v11_10/Cases?filter[0][case_number]=${event.caseNumber}`);
      return axios.get(filterUrl, config);
    })
    .then((response) => {
      const caseBean = response.data.records[0];
      let statusCode = HttpStatus.notFound;
      let body = {};
      if (caseBean) {
        statusCode = HttpStatus.ok;
        body = {
          id: caseBean.id,
          status: caseBean.status
        };
      }
      return {
        status: statusCode,
        body: body
      };
    })
    .catch((error) => {
      return {
        status: HttpStatus.error,
        error: error
      };
    });
};

exports.handler = handler;
