import axiosClient from './axiosClient';

interface IResponse {
  error: number;
  msg: string;
  data: any;
}

class CompileCodeApis {
  compileCode = (script: string) => {
    const url = '/compile-code/';
    return axiosClient.post<any, IResponse>(url, { script });
  };
}

const compileCodeApis = new CompileCodeApis();
export default compileCodeApis;