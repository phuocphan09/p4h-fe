/* eslint-disable class-methods-use-this */
import axiosClient from './axiosClient';

interface IResponse {
    error: number;
    msg: string;
    data: string;
}

class RunOpenAIApis {
    runOpenAIScript = (text: string) => {
        const url = '/explain-code/';
        const data = { text: `Giải thích đơn giản\n${text}` }; // to support Vietnamese
        return axiosClient.post<any, IResponse>(url, data);
    };
}

const runOpenAIApis = new RunOpenAIApis();
export default runOpenAIApis;
