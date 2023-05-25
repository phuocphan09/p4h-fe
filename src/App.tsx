/* eslint-disable react/button-has-type */
import React, { useEffect, useState, useRef } from 'react';
import { Modal, Container, Row, Col, Spinner, Button, ListGroup } from 'react-bootstrap';
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
import { environment } from './environments/environment';
import describeLineApis from "./api/describeLineAPI";

const menuLst = [
  {
    title: 'Chạy',
    funcName: 'RunPythonScript',
    keyword: ['run', 'chạy', 'Run', 'Chạy'],
    desc: null
  },
  {
    title: 'Đọc kết quả',
    funcName: 'repeatVoice',
    keyword: ['Đọc kết quả', 'output', 'return', 'read'],
    desc: null
  },
  {
    title: 'Tìm hiểu cấu trúc code',
    funcName: 'analyzeCode',
    keyword: ['Tìm hiểu cấu trúc code', 'Outline', 'outline', 'tree', 'cấu trúc mã nguồn'],
    desc: 'Cấu trúc code đang được hiển thị. Con trỏ đang đứng tại vị trí hiện tại. Hãy sử dụng phím lên và xuống để tìm hiểu cấu trúc.'
  },
  {
    title: 'Giải thích code bằng ChatGPT',
    funcName: 'analyzeCodeForExplain',
    keyword: ['Giải thích code bằng ChatGPT', 'Explain', 'Chat GPT', 'ChatGPT'],
    desc: 'Cấu trúc code đang được hiển thị. Con trỏ đang đứng tại vị trí hiện tại. Hãy sử dụng phím lên và xuống để tìm hiểu cấu trúc, và nhấn enter để yêu cầu phần mềm giải thích.'
  },
  {
    title: 'Quay về khu vực lập trình',
    funcName: 'returnToEditor',
    keyword: ['Quay về khu vực lập trình'],
    desc: 'Con trỏ đã được đưa về khu vực lập trình'
  },
  {
    title: 'Mô tả vị trí của dòng code hiện tại',
    funcName: 'handleNavModalState', // TODO: hard code for demo
    keyword: ['Mô tả vị trí của dòng code hiện tại'],
    desc: 'Bạn hãy sử dụng phím lên xuống để chọn vị trí mà bạn muốn được miêu tả'
  },
  {
    title: 'Đọc lại',
    funcName: 'openUpcomingFeatureDialog',
    keyword: ['Đọc lại', 'Phát lại', 'repeat'],
    desc: null
  },
  {
    title: 'Tìm kiếm và thay thế',
    funcName: 'openUpcomingFeatureDialog',
    keyword: ['Tìm kiếm và thay thế'],
    desc: null
  },
  {
    title: 'Đi đến dòng có số thứ tự',
    funcName: 'openUpcomingFeatureDialog',
    keyword: ['Đi đến dòng có số thứ tự'],
    desc: null
  },
  {
    title: 'Tải về file code có định dạng .py',
    funcName: 'openUpcomingFeatureDialog',
    keyword: ['Tải về file code có định dạng .py'],
    desc: null
  },
  {
    title: 'Upload file code có định dạng .py',
    funcName: 'openUpcomingFeatureDialog',
    keyword: ['Upload file code có định dạng .py'],
    desc: null
  },
  {
    title: 'Điều chỉnh tốc độ phát âm',
    funcName: 'openUpcomingFeatureDialog',
    keyword: ['Điều chỉnh tốc độ phát âm'],
    desc: null
  },
  {
    title: 'Bật hoặc Tắt chế độ tự động báo lỗi khi đang gõ',
    funcName: 'openUpcomingFeatureDialog',
    keyword: ['Bật hoặc Tắt chế độ tự động báo lỗi khi đang gõ'],
    desc: null
  },
  {
    title: 'Cài đặt phím tắt',
    funcName: 'openUpcomingFeatureDialog',
    keyword: ['Cài đặt phím tắt'],
    desc: null
  },
  {
    title: 'Giới thiệu cách hoạt động của các tính năng',
    funcName: 'openUpcomingFeatureDialog',
    keyword: ['Giới thiệu cách hoạt động của các tính năng'],
    desc: null
  },
  {
    title: 'Yêu cầu hỗ trợ',
    funcName: 'openUpcomingFeatureDialog',
    keyword: ['Yêu cầu hỗ trợ'],
    desc: null
  }
];

function App() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');
  const [typingResult, setTypingResult] = useState(false)
  // let typingResult = false;
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
  const [outlineItems, setOutlineItems] = useState({ active_line: 0, parsed_line: []});
  const [outlineItemsExplain, setOutlineItemsExplain] = useState({ active_line: 0, parsed_line: []});
  // const [describeLine, setDescribeLine] = useState(false);
  const [toggleEditor, setToggleEditor] = useState(true);
  const currLineNo = useRef(0);
  const editorRef = useRef<any>();
  // const [lintError, setLintError] = useState('');
  // const [lineBeforeInfo, setLineBeforeInfo] = useState({ lineNo: 0, charNo: 0, errorStr: ''});
  // const [test_linenobeforeerror, set_test_linenobeforeerror] = useState(0);
  const cookies = new Cookies();

  const codeRef = useRef(code);

  let lineBeforeInfo = { lineNo: 0, charNo: 0, errorStr: ''};
  let describeLine = false; // set to true to use the feature TODO: add toggle to nav center

  /*----------------Chuc nang doc text va cap nhat gia tri Code Editor-----------------*/
  const synth = window.speechSynthesis;
  const defaultLang = 'vi-VN';
  const defaultRate = 1.2; // for blind: rate 2
  
  const SpeakSpeech = (text: string, wait=false, lang = defaultLang, rate = defaultRate, speakSpecialChar=false) => {
    if (!wait && synth.speaking) {
      synth.cancel();
    }

    let speakText = text;
    if (speakSpecialChar) {
      speakText = fromStringtoFriendlyString(text, lang);
    }

    const utterThis = new SpeechSynthesisUtterance(speakText);
    utterThis.lang = lang;
    utterThis.rate = rate;
    synth.speak(utterThis);

  };

  // const handleRateChange = (e: any) => {
  //   setSynthRate(e.target.value);
  // };

  const repeatVoice = () => {
    SpeakSpeech(repeatState.text, false, repeatState.lang);
  }

  const UpdateResult = (value: string, wait=false, lang = defaultLang, doSpeak = true, isTyping=false) => {
    setTypingResult(isTyping);
    setResult(value);
    if (doSpeak) {
      SpeakSpeech(value, wait, lang, defaultRate, true);
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
    await runActionLogApis.runActionLog('0001');
    SpeakSpeech('Đang xử lý');
    const resData = await runScriptApis.runPythonScript(codeRef.current);
    if (resData.error === 0) {
      SpeakSpeech('Hoàn thành. Kết quả là\n');
      UpdateResult(resData.data, true);
      setLineError(0);
      setCharError(0);
    } else if (resData.error === 23) {
      SpeakSpeech('Hoàn thành. Có lỗi xảy ra\n');
      UpdateResult(`${resData.data.error_class}: ${resData.data.detail}`, true, 'en-US');
      setLineError(resData.data.line_no);
      setCharError(resData.data.char_no);
    }
    setToggleEditor(state => !state);
  };

  const handleRunShortCutKey = async (event: any) => {
    const hasFocus = editorRef.current?.getFocusStateEditor();

    if (event.keyCode === 10 || event.keyCode === 13) {
      event.preventDefault();
      if (event.shiftKey) {
        // shift + enter --> run code
        await RunPythonScript();
      } else if (!showNavModal && hasFocus) {
        // enter
        const codeByLine = codeRef.current.split('\n');
        const lastLineCode = codeByLine[currLineNo.current - 2];
        const compileResult = await compileCodeApis.compileCode(lastLineCode);
        if (compileResult?.data?.error_code == 1) {

          // set line error
          lineBeforeInfo = { lineNo: codeByLine.length - 1, charNo: compileResult.data.char_no[0], errorStr: `${compileResult?.data?.error_class} ${compileResult?.data?.detail}`};
          // setLineBeforeInfo({ lineNo: codeByLine.length - 1, charNo: compileResult.data.char_no[0], errorStr: `${compileResult?.data?.error_class} ${compileResult?.data?.detail}`});

          // SpeakSpeech('Dòng trước gặp lỗi, nhấn command E để quay lại vị trí gặp lỗi');
          const message = Array({text: 'Dòng trước gặp lỗi, nhấn ', lang: 'vi-VN'}, {text: 'Command E', lang: 'en-US'}, {text: 'để quay lại vị trí gặp lỗi', lang: 'vi-VN'})
          SpeakSpeechDiffLang(message);

        } else {
          // setLineBeforeInfo({ lineNo: 0, charNo: 0, errorStr: ''});
          lineBeforeInfo = { lineNo: 0, charNo: 0, errorStr: ''};
        }
        await runActionLogApis.runActionLog("Compile Code");
      }
    }

    // control e
    if ((event.ctrlKey || event.metaKey) && event.keyCode == 69) {
      if (lineBeforeInfo.lineNo != 0) {
        event.preventDefault();
        setCharError(lineBeforeInfo.charNo);
        setLineError(lineBeforeInfo.lineNo);
        SpeakSpeech(`Bạn đã được đưa về vị trí có lỗi ở dòng ${lineBeforeInfo.lineNo} ký tự ${lineBeforeInfo.charNo}.\n Dòng này bị lỗi sau`);
        SpeakSpeech(lineBeforeInfo.errorStr, true, 'en-US', defaultRate, true);
      }
    }

    // show modal behavior
    if (showWelcomeModal) {
      if (event.keyCode == 89) {
        saveLoggingState(true);
      } else if (event.keyCode == 78) {
        saveLoggingState(false);
      }
    }

    // (command + K)
    if (((event.ctrlKey || event.metaKey) && event.keyCode === 75)) {
      console.log(event.keyCode);
      event.preventDefault();
      handleNavModalState();
    }

    // describe line
    // console.log(`in shortcut: ${describeLine}`);
    if (describeLine && hasFocus) {
      if (event.keyCode == 38 || event.keyCode == 40) { // 38 is up; 40 is down
        await describeCurrentLine();
      } else {
        // setDescribeLine(false);
        // toggleDescribeLine();
      }
    }
  }

  useEffect(() => {
    const getSamplePythonCode = async () => {
      const sampleCode = await runScriptApis.getSampleCode();
      if (sampleCode.error == 0) {
        codeRef.current = sampleCode.data;
        setCode(sampleCode.data);
      }
    }
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

    if (!cookies.get('api_token')) {
      cookies.set('api_token', environment.token, { httpOnly: true });
    }
    
    getSamplePythonCode();

    document.addEventListener('keydown', handleRunShortCutKey);

    return () => {
      document.removeEventListener('keydown', handleRunShortCutKey);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*--------------------------------------------------*/
  /*------------Describe line-------------------------*/
  const toggleDescribeLine = (value: boolean) => {
    describeLine = value;
    console.log(describeLine);
    // setDescribeLine(!describeLine);
  }

  const describeCurrentLine = async() => {

    const currentActiveLine = Array.prototype.slice.call( document.querySelector('.cm-content')?.children ).indexOf(document.querySelector('.cm-activeLine'));
    const response = await describeLineApis.describeCode(codeRef.current.split('\n'), currentActiveLine);
    if (response.error === 0) {
      const describeLineData = response.data;
      const lineContent =  codeRef.current.split('\n')[currentActiveLine].trim();

      // skip if empty line
      if (lineContent === '') {
        return;
      }

      // construct message
      const message = Array(
          {text: lineContent, lang: 'en-US'}, // trim() is like strip() on Python
          {text: 'Thụt lề ' + describeLineData.indentation + ' ô\n', lang: 'vi-VN'},
        );

      // add direct parent
      if (describeLineData.directParent !== null) {
        message.push({text: 'Nằm trong', lang: 'vi-VN'})
        message.push({text: describeLineData.directParent.dest_label, lang: 'en-US'})
        message.push({text: 'cách đó ' + describeLineData.directParent.dest_distance + ' dòng.\n', lang: 'vi-VN'})
      }

      // add highest parent
      if (describeLineData.highestParent !== null) {
        // only speak if the highest parent differs from the direct parent
        if (describeLineData.highestParent.dest_distance !== describeLineData.directParent.dest_distance) {
          message.push({text: 'Và nằm trong', lang: 'vi-VN'})
          message.push({text: describeLineData.highestParent.dest_label, lang: 'en-US'})
          message.push({text: 'cách đó ' + describeLineData.highestParent.dest_distance + ' dòng.\n', lang: 'vi-VN'})
        }
      }

      // speak the message
      SpeakSpeechDiffLang(message, true);
    }
  }

  // Speak a sentence containing multiple languages
  const SpeakSpeechDiffLang = (input: any, speakSpecialChar=false) => {
    for (let i = 0; i < input.length; i++) {
      if (i === 0){
        SpeakSpeech(input[i].text, false, input[i].lang, defaultRate, speakSpecialChar);
      } else {
        SpeakSpeech(input[i].text, true, input[i].lang, defaultRate, speakSpecialChar);
      }

    }
  }

  /*--------------------------------------------------*/
  /*------------Phan tich cau truc code---------------*/
  const analyzeCode = async () => {
    setShowOutlineModal(true);
    const currentActiveLine = Array.prototype.slice.call( document.querySelector('.cm-content')?.children ).indexOf(document.querySelector('.cm-activeLine'));
    console.log(currentActiveLine);
    const outLineData = await parseCodeApis.analyzeCode(code.split('\n'), currentActiveLine);
    if (outLineData.error == 0) {
      setOutlineItems(outLineData.data);
    } else {
      setOutlineItems({ active_line: 0, parsed_line: []});
    }
  }

  const handleCloseOutlineModelState = () => {
    setShowOutlineModal(false);
  }

  const goToLineOfOutline = (lineNo: number) => {
    setShowOutlineModal(false);
    setTimeout(() => {
      setLineError(lineNo);
      setCharError(1);
    }, 500);
  }
  /*--------------------------------------------------*/
  /*--------Giai thich code theo outline tree---------*/
  const analyzeCodeForExplain = async () => {
    setShowOutlineExplainModal(true);
    const currentActiveLine = Array.prototype.slice.call( document.querySelector('.cm-content')?.children ).indexOf(document.querySelector('.cm-activeLine'));
    const outLineData = await parseCodeApis.analyzeCode(code.split('\n'), currentActiveLine);
    if (outLineData.error == 0) {
      if (outLineData.data.parsed_line?.length) {
        setOutlineItemsExplain(outLineData.data);
      } else {
        setOutlineItemsExplain({ active_line: 0, parsed_line: []});
        UpdateResult('Không thể tạo cấu trúc mã nguồn do mã nguồn không phân cấp');
      }
    } else {
      setOutlineItemsExplain({ active_line: 0, parsed_line: []});
    }

    await runActionLogApis.runActionLog("Parse Code");
  }

  const explainCodeRange = async (startLineIdx: number, endLineIdx: number) => {
    // reset the resultbox such that the typing with type again
    setTypingResult(false);

    setShowOutlineExplainModal(state => !state);
    setShowLoadingModal(true);
    SpeakSpeech('Đang xử lý...', false);
    const codeBlockArr = code.split('\n').slice(startLineIdx, endLineIdx + 1);
    const codeBlockStr = codeBlockArr.join('\n');
    const resData = await runOpenAIApis.runOpenAIScript(codeBlockStr);
    if (resData.error === 0) {
      UpdateResult(resData.data, true, defaultLang, true, true);
    } else {
      UpdateResult('Có lỗi xảy ra hoặc không thể giải thích đoạn code này!', true);
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
    if (!showNavModal) {
      SpeakSpeech('Hãy gõ tên tính năng bạn muốn tìm kiếm, và dùng phím lên xuống để lựa chọn tính năng')
    }
    setShowNavModal(state => !state);
  }

  const runFuncFromNavigation = async (menu: any) => {

    // read instruction
    if (menu.desc) { SpeakSpeech(menu.desc); }

    // open modal
    setShowNavModal(state => !state);
    
    switch (menu.funcName) {
      case 'repeatVoice':
        repeatVoice();
        break;
      
      case 'RunPythonScript':
        setTimeout(async () => {
          await RunPythonScript();
        }, 500);
        break;

      case 'analyzeCode':
        await analyzeCode();
        break;
      
      case 'analyzeCodeForExplain':
        await analyzeCodeForExplain();
        break;

      case 'returnToEditor':
        setTimeout(() => {
          setToggleEditor(state => !state);
          const activeLine = Array.prototype.slice.call( document.querySelector('.cm-content')?.children ).indexOf(document.querySelector('.cm-activeLine')) + 1;
          setLineError(activeLine);
          setCharError(1);
        }, 500); 
        break;

      case 'toggleDescribeLine':
        toggleDescribeLine(!describeLine);
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

    // TODO: handle the logic for the following instruction -- currently hard coded
    SpeakSpeech('Con trỏ đang ở vùng gõ code. Bạn hãy nhấn phím tắt');
    SpeakSpeech('Command K', true, 'en-US');
    SpeakSpeech('để lựa chọn bất kì tính năng nào mà bạn muốn sử dụng', true);
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

  const fromStringtoFriendlyString = (str: string, lang: string) => {

    let output = str;

    const dict_map_vi = {":": "hai chấm", "+": "cộng", "-": "trừ", "*": "nhân", "/": "chia", "...": "ba chấm"};
    const dict_map_en = {":": "colon", "+": "plus", "-": "minus", "*": "multiply", "/": "divided by", "...": "ellipsis"};

    // start converting
    if (lang === "vi-VN") {
        for (let key in dict_map_vi) {
          // @ts-ignore
          output = output.replace(new RegExp('\\' + key, "g"), ' ' + dict_map_vi[key] + ' ');
        };
    };

    if (lang === "en-US") {
      for (let key in dict_map_en) {
        // @ts-ignore
        output = output.replace(new RegExp('\\' + key, "g"), ' ' + dict_map_en[key] + ' ');
      };
    };

    return output;

  }

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

  const setCurrLineNo = (lineNo: number) => {
    currLineNo.current = lineNo;
  }

  return (
    <Container fluid className='vh-100'>
      <Row className='h-100'>
        <Col md={2} className='side-bar p-0'>
          <Row className='w-100 mx-0'>
            <ListGroup.Item aria-hidden={true} as={"div"} className='run-btn text-start fw-bold' onClick={RunPythonScript}>
              <BsFillPlayFill color='#72A24D' style={{margin: '10px'}}/> Chạy
            </ListGroup.Item>
          </Row>
          <Row className='w-100 mx-0'>
            <ListGroup.Item aria-hidden={true} as={"div"} className='run-btn text-start fw-bold' action onClick={handleNavModalState}>
              <BsSearch color='#72A24D' style={{margin: '10px'}}/> Tìm kiếm
            </ListGroup.Item>
          </Row>
        </Col>
        <Col md={10} className='h-100 border-side-bar ide-content'>
          <Row className='h-50 d-flex flex-column flex-grow-1'>
            <TextEditor code={code} onChangeCode={onChangeCode} lineError={lineError} charError={charError} toggle={toggleEditor} setCurrLineNo={setCurrLineNo} ref={editorRef}/>
          </Row>
          <Row className='h-50 border-result-box d-flex flex-column flex-grow-1'>
            <ResultBox content={result} isTyping={typingResult} />
          </Row>
        </Col>
      </Row>
      <Modal show={showNavModal} onHide={handleNavModalState}>
        <NavigationCenter menuLstInit={menuLst} runFunc={runFuncFromNavigation} SpeakSpeech={SpeakSpeech}/>
      </Modal>
      <Modal show={showOutlineModal} onHide={handleCloseOutlineModelState} >
        { outlineItems.parsed_line.length 
              ? <OutlineTree data={outlineItems} goToLine={goToLineOfOutline} SpeakSpeech={SpeakSpeech}/> 
              : <div className='spinner-container d-flex align-items-center justify-content-center'>
                  <Spinner animation="border"/>
                </div> 
        }
      </Modal>
      <Modal show={showOutlineExplainModal} onHide={handleCloseOutlineExplainModelState} >
        { outlineItemsExplain.parsed_line.length
              ? <TreeForOpenAI data={outlineItemsExplain} setLineRange={explainCodeRange} SpeakSpeech={SpeakSpeech}/> 
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
