/* eslint-disable class-methods-use-this */
import axiosClient from './axiosClient';

interface IResponse {
  error: number;
  msg: string;
  data: any;
}

class RunScriptApis {
  runPythonScript = (script: string) => {
    const url = '/run-code/';
    const data = { script };
    return axiosClient.post<any, IResponse>(url, data);
  };

  getSampleCode = () => {
    const url = '/run-code/';
    return axiosClient.get<any, IResponse>(url);
  }
}

const runScriptApis = new RunScriptApis();
export default runScriptApis;
