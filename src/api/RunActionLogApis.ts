/* eslint-disable class-methods-use-this */
import axiosClient from './axiosClient';
import Cookies from 'universal-cookie';

interface IResponse {
    error: number;
    msg: string;
    data: any;
}
const cookies = new Cookies();
class RunActionLogApis {
    runActionLog = (action: string, metadata="{}") => {
        if ((!cookies.get('user_accept_logging') 
            || cookies.get('user_accept_logging') == 'false')
            && (!['0000', '0003'].includes(action)) // not load or decline logging
        ) {
            return;
        }
        const url = '/action-log/';
        const data = { action, metadata, timestamp: Math.floor(Date.now()),  client_agent: window.navigator.userAgent };
        return axiosClient.post<any, IResponse>(url, { data });
    };
}

const runActionLogApis = new RunActionLogApis();
export default runActionLogApis;
