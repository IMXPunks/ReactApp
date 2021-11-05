import axios from "axios";

const defaultHeader = {
  'Content-Type': 'application/json'
};

class AxiosUtility {
  post(url, data = {}, headers = defaultHeader) {
    new Promise(async (resolve, reject) => {
      try {
        var config = {
          method: 'post',
          url,
          headers,
          data
        };
        let response = await axios(config);
        console.log('res post', response);
        resolve(response.data);
      } catch (error) {
        console.log('error while post', error);
        reject(error)
      }
    })
  }

  get(url, headers = defaultHeader) {
    console.log('hit get');
    new Promise(async (resolve, reject) => {
      try {
        var config = {
          method: 'get',
          url,
          headers
        };
        let response = await axios(config);
        console.log('res get', response);
        resolve(response.data);
      } catch (error) {
        console.log('error while get', error);
        reject(error)
      }
    })
  }

  patch(url, data = {}, headers = defaultHeader) {
    new Promise(async (resolve, reject) => {
      try {
        var config = {
          method: 'patch',
          url,
          headers,
          data
        };
        const response = await axios(config);
        console.log('res patch', response);
        resolve(response);
      } catch (error) {
        console.log('error while patch', error);
        reject(error)
      }
    })
  }
}

export default AxiosUtility;