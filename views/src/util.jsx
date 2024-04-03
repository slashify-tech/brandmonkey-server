import axios from 'axios';

const apiurl = axios.create({
    baseURL : "https://monkeytreeadmin.brandmonkey.in",
});

export default apiurl;