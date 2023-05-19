/* eslint-disable react/button-has-type */
import React, { useEffect, useState, useRef } from 'react';
import { Modal, Container, Row, Col, Spinner, Button } from 'react-bootstrap';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsFillPlayFill, BsSearch } from 'react-icons/bs';
import Cookies from 'universal-cookie';
import TextEditor from './components/TextEditor';
import ResultBox from './components/ResultBox';
import runScriptApis from './api/runScriptApis';
import runOpenAIApis from './api/RunOpenAIApis';
import parseCodeApis from './api/parseCode';
import compileCodeApis from './api/compileCode';
import runActionLogApis from './api/RunActionLogApis';
import OutlineTree from './components/OutlineTree';
import NavigationCenter from './components/NavigationCenter';
import TreeForOpenAI from './components/TreeForOpenAI';

const menuLst = [
  {
    title: 'Chạy',
    funcName: 'RunPythonScript',
    keyword: ['run', 'chạy', 'Run', 'Chạy']
  },
  {
    title: 'Đọc lại kết quả',
    funcName: 'repeatVoice',
    keyword: ['Repeat voice', 'repeat voice', 'Phát lại', 'phát lại']
  },
  {
    title: 'Tìm hiểu cấu trúc code',
    funcName: 'analyzeCode',
    keyword: ['Outline', 'outline', 'tree', 'cấu trúc mã nguồn']
  },
  ,
  {
    title: 'Giải thích code',
    funcName: 'analyzeCodeForExplain',
    keyword: ['Outline', 'outline', 'tree', 'cấu trúc mã nguồn']
  },
  {
    title: 'Quay về khu vực lập trình',
    funcName: 'openUpcomingFeatureDialog',
    keyword: ['Outline', 'outline', 'tree', 'cấu trúc mã nguồn']
  },
  {
    title: 'Định vị dòng code hiện tại',
    funcName: 'openUpcomingFeatureDialog',
    keyword: ['Outline', 'outline', 'tree', 'cấu trúc mã nguồn']
  },
  {
    title: 'Tìm kiếm và thay thế',
    funcName: 'openUpcomingFeatureDialog',
    keyword: ['Outline', 'outline', 'tree', 'cấu trúc mã nguồn']
  },
  {
    title: 'Đi đến dòng có số thứ tự',
    funcName: 'openUpcomingFeatureDialog',
    keyword: ['Outline', 'outline', 'tree', 'cấu trúc mã nguồn']
  },,
  {
    title: 'Tải về file code có định dạng .py',
    funcName: 'openUpcomingFeatureDialog',
    keyword: ['Outline', 'outline', 'tree', 'cấu trúc mã nguồn']
  },,
  {
    title: 'Upload file code có định dạng .py',
    funcName: 'openUpcomingFeatureDialog',
    keyword: ['Outline', 'outline', 'tree', 'cấu trúc mã nguồn']
  },
  {
    title: 'Điều chỉnh tốc độ phát âm',
    funcName: 'openUpcomingFeatureDialog',
    keyword: ['Outline', 'outline', 'tree', 'cấu trúc mã nguồn']
  },{
    title: 'Bật/Tắt chế độ tự động báo lỗi khi đang gõ',
    funcName: 'openUpcomingFeatureDialog',
    keyword: ['Outline', 'outline', 'tree', 'cấu trúc mã nguồn']
  },{
    title: 'Cài đặt phím tắt',
    funcName: 'openUpcomingFeatureDialog',
    keyword: ['Outline', 'outline', 'tree', 'cấu trúc mã nguồn']
  },{
    title: 'Giới thiệu cách hoạt động của các tính năng',
    funcName: 'openUpcomingFeatureDialog',
    keyword: ['Outline', 'outline', 'tree', 'cấu trúc mã nguồn']
  },{
    title: 'Yêu cầu hỗ trợ',
    funcName: 'openUpcomingFeatureDialog',
    keyword: ['Outline', 'outline', 'tree', 'cấu trúc mã nguồn']
  }
];

function App() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');
  const [repeatState, setRepeatState] = useState({ text: '', lang: ''});
  // const [synthRate, setSynthRate] = useState(1);
  const [lineError, setLineError] = useState(0);
  const [charError, setCharError] = useState(0);
  const [showNavModal, setShowNavModal] = useState(false);
  const [showOutlineModal, setShowOutlineModal] = useState(false);
  const [showOutlineExplainModal, setShowOutlineExplainModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [showUpcomingFeatureDialog, setShowUpcomingFeatureDialog] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [outlineItems, setOutlineItems] = useState([]);
  const [outlineItemsExplain, setOutlineItemsExplain] = useState([]);
  const [lintError, setLintError] = useState('');
  const [lineBeforeInfo, setLineBeforeInfo] = useState({ lineNo: -1, charNo: -1, errorStr: ''});
  const cookies = new Cookies();

  const codeRef = useRef(code);

  /*----------------Chuc nang doc text va cap nhat gia tri Code Editor-----------------*/
  const synth = window.speechSynthesis;
  const defaultLang = 'vi-VN';
  const defaultRate = 1; // for blind: rate 2
  
  const SpeakSpeech = (text: string, lang = defaultLang, rate = defaultRate) => {
    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.lang = lang;
    utterThis.rate = rate;
    synth.speak(utterThis);
  };

  // const handleRateChange = (e: any) => {
  //   setSynthRate(e.target.value);
  // };

  const repeatVoice = () => {
    SpeakSpeech(repeatState.text, repeatState.lang);
  }

  const UpdateResult = (value: string, lang = defaultLang, doSpeak = true) => {
    setResult(value);
    if (doSpeak) {
      SpeakSpeech(value, lang);
      setRepeatState({ text: value, lang });
    }
  };

  const onChangeCode = (newCode: string) => {
    codeRef.current = newCode;
    setCode(newCode);
  };

  /*---------------------------------------------------*/
  /*----------------Chuc nang Run code-----------------*/
  const RunPythonScript = async () => {
    SpeakSpeech('Đang xử lý');
    const resData = await runScriptApis.runPythonScript(codeRef.current);
    if (resData.error === 0) {
      SpeakSpeech('Hoàn thành. Kết quả là\n');
      UpdateResult(resData.data);
      setLineError(0);
      setCharError(0);
    } else if (resData.error === 23) {
      SpeakSpeech('Lỗi\n');
      UpdateResult(`${resData.data.error_class}: ${resData.data.detail}`, 'en-US');
      setLineError(resData.data.line_no);
      setCharError(resData.data.char_no);
    }
    
    await runActionLogApis.runActionLog("Run Python Script");
  };

  const handleRunShortCutKey = async (event: any) => {
    if (event.keyCode === 10 || event.keyCode === 13) {
      event.preventDefault();
      if (event.shiftKey) {
        await RunPythonScript();
      } else {
        const codeByLine = codeRef.current.split('\n');
        const lastLineCode = codeByLine[codeByLine.length - 2];
        const compileResult = await compileCodeApis.compileCode(lastLineCode);
        if (compileResult?.data?.error_code == 1) {
          SpeakSpeech('Dòng trước gặp lỗi, nhấn control E để quay lại vị trí gặp lỗi');
          setLintError(`${compileResult?.data?.error_class} ${compileResult?.data?.detail}`);
          SpeakSpeech(lintError, 'en-US');
          setLineBeforeInfo({ lineNo: compileResult.data.line_no[0], charNo: compileResult.data.char_no[0], errorStr: `${compileResult?.data?.error_class} ${compileResult?.data?.detail}`});
        } else {
          setLineBeforeInfo({ lineNo: 0, charNo: 0, errorStr: ''});
        }

        await runActionLogApis.runActionLog("Compile Code");
      }
    }

    if ((event.ctrlKey || event.metaKey) && event.keyCode == 69) {
      if (lineBeforeInfo.lineNo != -1) {
        event.preventDefault();
        setCharError(lineBeforeInfo.charNo);
        setLineError(lineBeforeInfo.lineNo);
        SpeakSpeech(`Bạn đã được đưa về vị trí có lỗi ở dòng ${lineBeforeInfo.lineNo} ký tự ${lineBeforeInfo.charNo}`);
        SpeakSpeech(lineBeforeInfo.errorStr, 'en-US');
      }
    }

    if (showWelcomeModal) {
      if (event.keyCode == 89) {
        saveLoggingState(true);
      } else if (event.keyCode == 78) {
        saveLoggingState(false);
      }
    }
  }

  useEffect(() => {
    const saveLogForWelcome = async () => {
      await runActionLogApis.runActionLog('0000');
    }
    if (cookies.get('user_accept_logging')) {
      setShowWelcomeModal(false);
    } else {
      saveLogForWelcome();
      // SpeakSpeech('Chào mừng bạn đến với dự án P4H!');
      // SpeakSpeech('P4H là dự án phần mềm lập trình dành cho người khiếm thị đầu tiên tại Việt Nam. Hiện tại dự án đang trong giai đoạn thử nghiệm. Để có thể cập nhật thêm nhiều tính năng mới, chúng tôi mong muốn được lưu lại dữ liệu về các thao tác sử dụng của bạn (ví dụ như những trường hợp bạn gặp sự cố). Mọi dữ liệu được sẽ được lưu trữ và bảo mật dưới dạng ẩn danh, nghĩa là P4H hoàn toàn không biết danh tính của bạn. Vui lòng nhấn phím Y nếu bạn cho phép. Nếu không, vui lòng nhấn phím N để tiếp tục sử dụng chương trình.');
    }

    document.addEventListener('keydown', handleRunShortCutKey);

    return () => {
      document.removeEventListener('keydown', handleRunShortCutKey);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*----------------------------------------------------------*/
  /*----------------Chuc nang Giai thich code-----------------*/
  const CallOpenAI = async () => {
    const selectedCode = window.getSelection()!.toString();
    if (selectedCode !== null) {

      // for debugging

      // start
      UpdateResult('Đang xử lý...');

      // call API
      const resData = await runOpenAIApis.runOpenAIScript(selectedCode);
      if (resData.error === 0) {
        UpdateResult(resData.data);
      }
    } else {
      alert('Nothing is selected');
    }
  };

  /*--------------------------------------------------*/
  /*------------Phan tich cau truc code---------------*/
  const analyzeCode = async () => {
    setShowOutlineModal(true);
    const outLineData = await parseCodeApis.analyzeCode(code.split('\n'));
    if (outLineData.error == 0) {
      setOutlineItems(outLineData.data);
    } else {
      setOutlineItems([]);
    }
  }

  const handleCloseOutlineModelState = () => {
    setShowOutlineModal(false);
  }

  const goToLineOfOutline = (lineNo: number) => {
    setShowOutlineModal(false);
    setTimeout(() => {
      setLineError(lineNo);
      setCharError(0);
    }, 500);
  }
  /*--------------------------------------------------*/
  /*--------Giai thich code theo outline tree---------*/
  const analyzeCodeForExplain = async () => {
    setShowOutlineExplainModal(true);
    const outLineData = await parseCodeApis.analyzeCode(code.split('\n'));
    if (outLineData.error == 0) {
      if (outLineData.data?.length) {
        setOutlineItemsExplain(outLineData.data);
      } else {
        setOutlineItemsExplain([]);
        UpdateResult('Không thể tạo cấu trúc mã nguồn do mã nguồn không phân cấp');
      }
    } else {
      setOutlineItemsExplain([]);
    }

    await runActionLogApis.runActionLog("Parse Code");
  }

  const explainCodeRange = async (startLineIdx: number, endLineIdx: number) => {
    setShowOutlineExplainModal(state => !state);
    setShowLoadingModal(true);
    SpeakSpeech('Đang xử lý...');
    const codeBlockArr = code.split('\n').slice(startLineIdx, endLineIdx + 1);
    const codeBlockStr = codeBlockArr.join('\n');
    const resData = await runOpenAIApis.runOpenAIScript(codeBlockStr);
    if (resData.error === 0) {
      UpdateResult(resData.data);
    } else {
      UpdateResult('Có lỗi xảy ra hoặc không thể giải thích đoạn code này!');
    }
    setShowLoadingModal(false);
    await runActionLogApis.runActionLog("Explain Code By OpenAI");
  }

  const handleCloseOutlineExplainModelState = () => {
    setShowOutlineExplainModal(false);
  }
  /*--------------------------------------------------*/
  /*--------------Navigation Center-------------------*/
  const handleNavModalState = () => {
    setShowNavModal(state => !state);
  }

  const runFuncFromNavigation = async (funcName: string) => {
    setShowNavModal(state => !state);
    
    switch (funcName) {
      case 'repeatVoice':
        repeatVoice();
        break;
      
      case 'RunPythonScript':
        setTimeout(async () => {
          await RunPythonScript();
        }, 500);
        break;
      
      case 'CallOpenAI':
        await CallOpenAI();
        break;

      case 'analyzeCode':
        await analyzeCode();
        break;
      
      case 'analyzeCodeForExplain':
        await analyzeCodeForExplain();
        break;

      case 'openUpcomingFeatureDialog':
        openUpcomingFeatureDialog();
        break;

      default:
        break;
    }
  }
  /*--------------------------------------------------*/
  /*----------------Logging---------------------------*/
  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
  }

  const saveLoggingState = async (state: boolean) => {
    setShowWelcomeModal(false);
    cookies.set('user_accept_logging', state);
    if (state) {
      await runActionLogApis.runActionLog('0002');
    } else {
      await runActionLogApis.runActionLog('0003');
    }
  }
  /*--------------------------------------------------*/

  const handleCloseUpcomingFeatureDialog = () => {
    setShowUpcomingFeatureDialog(false);
  }

  const openUpcomingFeatureDialog = () => {
    setShowUpcomingFeatureDialog(true);
    SpeakSpeech('Tính năng đang được gỡ xuống để thử nghiệm, vui lòng quay lại sau');
  }

  const handleCloseLoadingModal = () => {
    setShowLoadingModal(false);
  }

  return (
    <Container fluid className='vh-100'>
      <Row className='h-100'>
        <Col md={2} className='side-bar p-0'>
          <Row className='w-100 mx-0'>
            <button className='run-btn text-start fw-bold' onClick={RunPythonScript}>
              <BsFillPlayFill color='#72A24D' style={{margin: '10px'}}/> Chạy 
            </button>
          </Row>
          <Row className='w-100 mx-0'>
            <button className='run-btn text-start fw-bold' onClick={handleNavModalState}>
              <BsSearch color='#72A24D' style={{margin: '10px'}}/> Tìm kiếm
            </button>
          </Row>
        </Col>
        <Col md={10} className='h-100 border-side-bar ide-content'>
          <Row className='h-50 d-flex flex-column flex-grow-1'>
            <TextEditor code={code} onChangeCode={onChangeCode} lineError={lineError} charError={charError}/>
          </Row>
          <Row className='h-50 border-result-box d-flex flex-column flex-grow-1'>
            <ResultBox content={result} />
          </Row>
        </Col>
      </Row>
      <Modal show={showNavModal} onHide={handleNavModalState}>
        <NavigationCenter menuLstInit={menuLst} runFunc={runFuncFromNavigation}/>
      </Modal>
      <Modal show={showOutlineModal} onHide={handleCloseOutlineModelState} >
        { outlineItems.length 
              ? <OutlineTree data={outlineItems} goToLine={goToLineOfOutline} /> 
              : <div className='spinner-container d-flex align-items-center justify-content-center'>
                  <Spinner animation="border"/>
                </div> 
        }
      </Modal>
      <Modal show={showOutlineExplainModal} onHide={handleCloseOutlineExplainModelState} >
        { outlineItemsExplain.length
              ? <TreeForOpenAI data={outlineItemsExplain} setLineRange={explainCodeRange} /> 
              : <div className='spinner-container d-flex align-items-center justify-content-center'>
                  <Spinner animation="border"/>
                </div> 
        }
      </Modal>
      <Modal show={showWelcomeModal} onHide={handleCloseWelcomeModal} >
        <Modal.Body className='text-center'>
          <img src={window.location.origin + '/logo.svg'} />
          <div className='mt-4'>
            <h4>Chào mừng bạn đến với dự án P4H!</h4>
          </div>
          <p className='mt-4 welcome-txt'>P4H là dự án phần mềm lập trình dành cho người khiếm thị đầu tiên tại Việt Nam. Hiện tại dự án đang trong giai đoạn thử nghiệm. Để có thể cập nhật thêm nhiều tính năng mới, chúng tôi mong muốn được lưu lại dữ liệu về các thao tác sử dụng của bạn (ví dụ như những trường hợp bạn gặp sự cố). Mọi dữ liệu được sẽ được lưu trữ và bảo mật dưới dạng ẩn danh, nghĩa là P4H hoàn toàn không biết danh tính của bạn. Vui lòng nhấn phím Y nếu bạn cho phép. Nếu không, vui lòng nhấn phím N để tiếp tục sử dụng chương trình.</p>
          <div className='mt-4'>
          <Button variant="light" className='me-4 logging-btn' style={{backgroundColor: "#F0F4F5", color: "#56595A"}} onClick={() => { saveLoggingState(false) }}>
            Từ chối (N)
          </Button>
          <Button style={{backgroundColor: "#ABE4B8", borderColor: '#ABE4B8', color: '#1B202B'}} className='logging-btn' onClick={() => { saveLoggingState(true) }}>
            Tham gia (Y)
          </Button>
          </div>
        </Modal.Body>
      </Modal>
      <Modal show={showUpcomingFeatureDialog} onHide={handleCloseUpcomingFeatureDialog} >
        <Modal.Body className='text-center p-10 d-flex align-items-center'>
          Tính năng đang được gỡ xuống để thử nghiệm, vui lòng quay lại sau
        </Modal.Body>
      </Modal>
      <Modal show={showLoadingModal} onHide={handleCloseLoadingModal} >
        <div className='spinner-container d-flex align-items-center justify-content-center' style={{height: '200px'}}>
          <Spinner animation="border"/>
        </div>
      </Modal>
    </Container>
  );
}

export default App;
