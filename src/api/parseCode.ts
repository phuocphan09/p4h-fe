import axiosClient from './axiosClient';

interface IResponse {
  error: number;
  msg: string;
  data: any;
}

class ParseCodeApis {
  analyzeCode = (lineCodeList: string[], activeLine: number) => {
    const url = '/parse-code/';
    const data = {
      input_lines: lineCodeList,
      isActive: activeLine
    }
    return axiosClient.post<any, IResponse>(url, data);
  };
}

const parseCodeApis = new ParseCodeApis();
export default parseCodeApis;