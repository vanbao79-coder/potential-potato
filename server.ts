import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

const SYSTEM_INSTRUCTION = `Bạn là một Chuyên gia Tư vấn Công nghệ Giáo dục (EdTech Specialist) và là Giảng viên Hóa học Cao cấp. Nhiệm vụ của bạn là kiến trúc và vận hành một hệ sinh thái ứng dụng học thuật chuyên biệt cho môn Hóa học lớp 12 theo Chương trình Giáo dục phổ thông (GDPT) mới (2018) của Việt Nam. Bạn đóng vai trò là cầu nối giữa kiến thức khoa học hàn lâm, phương pháp sư phạm hiện đại và công nghệ tương tác 3D.

MỤC TIÊU:
- Tối ưu hóa hiệu suất giảng dạy: Hỗ trợ giáo viên soạn thảo giáo án định hướng phát triển năng lực, quản lý lớp học dựa trên dữ liệu thời gian thực và tự động hóa quy trình kiểm tra đánh giá.
- Cá nhân hóa lộ trình học tập: Tạo ra môi trường học tập chủ động cho học sinh thông qua Gamification và lộ trình rèn luyện riêng biệt.
- Trực quan hóa khái niệm trừu tượng: Giải thích và mô phỏng các cơ chế hóa học phức tạp (Este, Lipit, Polime, Phức chất...) ở cấp độ phân tử thông qua tư duy mô phỏng 3D.
- Thúc đẩy tương tác: Thiết kế các hoạt động kết nối trực tiếp tại lớp học để tăng cường hứng thú và đánh giá nhanh năng lực học sinh.

QUY TẮC & CHUẨN MỰC:
- Mọi nội dung bám sát khung chương trình GDPT 2018. Dùng chuẩn danh pháp quốc tế IUPAC theo sách giáo khoa mới (ví dụ: ethyl acetate/ethyl ethanoate, methyl methacrylate, amine, amino acid, glucose, fructose, saccharose/sucrose, maltose, cellulose, phức chất coordination: phức cation [Cu(H2O)6]2+, [Ag(NH3)2]+, phức anion, phối tử ligand...).
- Phân loại chính xác 4 mức độ nhận thức: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao.
- Phong cách: Chuyên nghiệp, khoa học, đầy cảm hứng, chuẩn mực sư phạm tiếng Việt.

ĐỊNH DẠNG ĐẦU RA THEO PHÂN HỆ:
- Phân hệ 1: Công cụ Giáo viên:
  + Giáo án: [Tên bài học] -> [Mục tiêu năng lực] -> [Kịch bản chi tiết: Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng] -> [Gợi ý học liệu số].
  + Ngân hàng đề: [Ma trận đề] -> [Danh sách câu hỏi theo mức độ] -> [Đáp án & Giải thích chi tiết].
- Phân hệ 2: Trải nghiệm Học sinh:
  + Lộ trình: [Chủ đề] -> [Nhiệm vụ cần hoàn thành] -> [Thử thách Gamification].
  + Hướng dẫn: Các bước giải bài tập theo tư duy logic thay vì chỉ đưa ra đáp án.
- Phân hệ 3: Thư viện 3D & Thí nghiệm:
  + Mô tả mô phỏng: [Tên thí nghiệm] -> [Cơ chế phân tử] -> [Các biến số tương tác] -> [Kết quả quan sát].
- Phân hệ 4: Tương tác tại lớp:
  + Hoạt động: [Tên trò chơi/Thảo luận] -> [Cách thức tổ chức] -> [Bộ câu hỏi nhanh/Quiz].`;

let genAIClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  genAIClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Endpoint chat tổng quát
app.post('/api/chat', async (req, res) => {
  try {
    const { message, moduleContext, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!genAIClient) {
      // Offline fallback responses for when key is missing or testing
      return res.json({
        reply: `[Chế độ Cố vấn Sư phạm Offline]\n\nChào Thầy/Cô và các em học sinh! Tôi là trợ lý AI của App Giáo Dục. Vì chưa phát hiện API Key hợp lệ, tôi cung cấp định hướng chuẩn kiến thức GDPT 2018 cho chủ đề: "${message}".\n\n- Danh pháp IUPAC chuẩn: Tuân thủ quy định SGK Hóa 12 mới (KNTT, CD, CTST).\n- Khuyến nghị: Sử dụng Phân hệ Mô phỏng 3D để trực quan hóa cơ chế chuyển dịch e- và phản ứng Este hóa/Trùng hợp!`,
        source: 'local_fallback',
      });
    }

    const promptContext = moduleContext
      ? `[Ngữ cảnh phân hệ hiện tại: ${moduleContext}]\n\nYêu cầu từ người dùng: ${message}`
      : message;

    const formattedHistory = Array.isArray(history)
      ? history.slice(-6).map((h: { role: string; content: string }) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        }))
      : [];

    const contents = [...formattedHistory, { role: 'user', parts: [{ text: promptContext }] }];

    const response = await genAIClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Không có phản hồi từ mô hình.';
    res.json({ reply, source: 'gemini' });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    res.status(500).json({
      error: error?.message || 'Lỗi xử lý yêu cầu AI',
      reply: 'Hệ thống AI đang tạm thời bận hoặc gặp sự cố kết nối. Vui lòng thử lại sau giây lát!',
    });
  }
});

// Endpoint sinh giáo án chuẩn 4 bước định hướng năng lực
app.post('/api/generate-lesson-plan', async (req, res) => {
  try {
    const { topic, gradeLevel, targetCompetencies, duration } = req.body;

    if (!genAIClient) {
      return res.json({
        lessonPlan: {
          title: topic || 'Este - Lipit và Chất giặt rửa tổng hợp',
          competencies: [
            'Năng lực nhận thức hóa học: Trình bày được cấu tạo, tính chất của ester',
            'Năng lực tìm hiểu tự nhiên: Tiến hành thí nghiệm xà phòng hóa',
            'Năng lực vận dụng: Giải thích ứng dụng của lipid và chất béo trong công nghiệp chế biến và xà phòng',
          ],
          stages: [
            {
              name: 'Hoạt động 1: Khởi động',
              time: '5 - 7 phút',
              activity: 'Chiếu video mùi hương hoa quả (chuối chín, táo, hoa nhài) và đặt câu hỏi gợi mở về nguồn gốc hóa học.',
            },
            {
              name: 'Hoạt động 2: Hình thành kiến thức',
              time: '20 - 25 phút',
              activity: 'Sử dụng mô hình 3D Este phân tích nhóm chức -COO-, cơ chế phản ứng este hóa giữa acetic acid và ethanol với xúc tác H2SO4 đặc.',
            },
            {
              name: 'Hoạt động 3: Luyện tập',
              time: '10 phút',
              activity: 'Tổ chức Live Quiz nhanh 5 câu hỏi phân loại 4 mức độ nhận thức.',
            },
            {
              name: 'Hoạt động 4: Vận dụng & Mở rộng',
              time: '5 phút',
              activity: 'Dự án nhỏ tìm hiểu chỉ số xà phòng hóa và bảo quản dầu thực vật tránh ôi thiu.',
            },
          ],
          digitalMaterials: ['Mô phỏng 3D Este phân tử', 'Slide bài giảng tương tác', 'Bộ trắc nghiệm phân hóa'],
        },
      });
    }

    const prompt = `Hãy soạn một giáo án chuẩn mực theo Công văn 5512/GDPT 2018 cho môn Hóa học 12.
Chủ đề bài học: "${topic || 'Este và Lipit'}"
Thời lượng: ${duration || '2 tiết (90 phút)'}
Mục tiêu trọng tâm: ${targetCompetencies || 'Phát triển năng lực nhận thức hóa học và vận dụng thực tiễn'}

Yêu cầu xuất ra cấu trúc JSON chuẩn với các khóa:
{
  "title": "Tên bài học",
  "competencies": ["Mục tiêu năng lực 1", "Mục tiêu năng lực 2", ...],
  "stages": [
    {
      "name": "Hoạt động 1: Khởi động (Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện)",
      "time": "thời gian",
      "activity": "Mô tả chi tiết kịch bản sư phạm"
    },
    ... (Hoạt động 2: Hình thành kiến thức, Hoạt động 3: Luyện tập, Hoạt động 4: Vận dụng)
  ],
  "digitalMaterials": ["Học liệu số gợi ý 1", "Học liệu số gợi ý 2", ...]
}
Chỉ trả về duy nhất chuỗi JSON hợp lệ, không bọc markdown khác.`;

    const response = await genAIClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ lessonPlan: parsed });
  } catch (error: any) {
    console.error('Error generating lesson plan:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint sinh ma trận và ngân hàng câu hỏi 4 mức độ
app.post('/api/generate-exam', async (req, res) => {
  try {
    const { topic, questionCount = 6 } = req.body;

    if (!genAIClient) {
      return res.json({
        matrix: {
          recognition: 2,
          comprehension: 2,
          application: 1,
          advancedApplication: 1,
        },
        questions: [
          {
            id: 1,
            level: 'Nhận biết',
            question: 'Công thức phân tử tổng quát của este no, đơn chức, mạch hở là gì?',
            options: ['CnH2nO2 (n ≥ 2)', 'CnH2n-2O2 (n ≥ 3)', 'CnH2nO (n ≥ 1)', 'CnH2n+2O2 (n ≥ 1)'],
            correctIndex: 0,
            explanation: 'Este no đơn chức mạch hở tạo bởi acid no đơn chức và alcohol no đơn chức có CTPT CnH2nO2 (n ≥ 2).',
          },
          {
            id: 2,
            level: 'Thông hiểu',
            question: 'Thủy phân hoàn toàn ethyl acetate (CH3COOC2H5) trong dung dịch NaOH đun nóng thu được sản phẩm gồm:',
            options: ['CH3COONa và C2H5OH', 'C2H5COONa và CH3OH', 'CH3COOH và C2H5OH', 'HCOONa và C3H7OH'],
            correctIndex: 0,
            explanation: 'CH3COOC2H5 + NaOH -> CH3COONa + C2H5OH (Phản ứng xà phòng hóa este).',
          },
        ],
      });
    }

    const prompt = `Hãy thiết kế một đề kiểm tra đánh giá ngắn gồm ${questionCount} câu hỏi trắc nghiệm theo 4 mức độ nhận thức GDPT 2018 cho chủ đề: "${topic || 'Hóa học hữu cơ lớp 12'}".
Bắt buộc dùng danh pháp IUPAC mới (như ethyl acetate/ethanoate, amine, amino acid, glucose, v.v.).
Yêu cầu định dạng JSON:
{
  "matrix": {
    "recognition": 2,
    "comprehension": 2,
    "application": 1,
    "advancedApplication": 1
  },
  "questions": [
    {
      "id": 1,
      "level": "Nhận biết" | "Thông hiểu" | "Vận dụng" | "Vận dụng cao",
      "question": "Nội dung câu hỏi",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctIndex": 0,
      "explanation": "Lời giải thích cặn kẽ chuẩn hóa học"
    }
  ]
}
Chỉ trả về JSON hợp lệ.`;

    const response = await genAIClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating exam:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint giải bài tập theo logic từng bước (Step-by-step logic solver)
app.post('/api/solve-logic', async (req, res) => {
  try {
    const { problem } = req.body;

    if (!problem) {
      return res.status(400).json({ error: 'Problem statement required' });
    }

    if (!genAIClient) {
      return res.json({
        steps: [
          { step: 1, title: 'Phân tích bản chất hóa học & giả thiết', description: 'Xác định các chất tham gia, phản ứng chính và phương trình bảo toàn electron/khối lượng.' },
          { step: 2, title: 'Thiết lập phương trình toán học', description: 'Đặt ẩn số mol x, y và liên hệ với các dữ kiện thực nghiệm (khối lượng, thể tích khí, nồng độ).' },
          { step: 3, title: 'Giải hệ và biện luận logic', description: 'Tìm ra nghiệm và kiểm tra điều kiện hóa học phù hợp (mạch hở, đơn chức, điều kiện nghiệm).' },
          { step: 4, title: 'Kết luận & Bài học kinh nghiệm', description: 'Đáp số cuối cùng và lưu ý các bẫy thường gặp trong đề thi tốt nghiệp THPT.' },
        ],
      });
    }

    const prompt = `Người học cần hướng dẫn tư duy logic giải bài toán hóa học lớp 12 sau:
"${problem}"

Hãy hướng dẫn học sinh giải bài theo TƯ DUY LOGIC SƯ PHẠM (không chỉ ném ra đáp án, mà chỉ dẫn cách tư duy):
Trả về JSON cấu trúc:
{
  "problemSummary": "Tóm tắt ngắn bản chất bài toán",
  "steps": [
    {
      "step": 1,
      "title": "Tên bước tư duy (vd: Nhận diện phản ứng & bản chất e-)",
      "description": "Chi tiết phân tích và gợi ý người học",
      "formula": "Công thức hoặc phương trình liên quan"
    }
  ],
  "finalAnswer": "Kết luận nghiệm hoặc công thức",
  "pedagogicalTip": "Lời khuyên sư phạm để không mắc sai lầm tương tự"
}`;

    const response = await genAIClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error solving logic problem:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint phân tích nội dung SGK Hóa 12
app.post('/api/analyze-textbook', async (req, res) => {
  try {
    const { title, chapter, bookSeries, periods = 2, rawContent, customFocus } = req.body;

    if (!genAIClient) {
      return res.json({
        title: title || 'Bài 1: Ester - Lipid',
        bookSeries: bookSeries || 'Kết nối tri thức',
        chapter: chapter || 'CH1',
        periods,
        targetCompetencies: {
          chemistryCognition: [
            'Nêu được khái niệm ester, nhóm chức -COO- và công thức tổng quát CnH2nO2.',
            'Đọc tên theo danh pháp IUPAC 2024 của các ester thông dụng.',
            'Giải thích nhiệt độ sôi thấp hơn acid và alcohol do không có liên kết hydrogen liên phân tử.',
          ],
          natureExploration: [
            'Tiến hành thí nghiệm điều chế ethyl acetate và phản ứng xà phòng hóa.',
            'Quan sát hiện tượng phân lớp và mùi hương thơm đặc trưng.',
          ],
          practicalApplication: [
            'Giải thích ứng dụng làm dung môi hòa tan và hương liệu thực phẩm.',
          ],
          qualities: ['Cẩn thận, tuân thủ an toàn phòng thí nghiệm.'],
        },
        coreKnowledge: {
          keyDefinitions: [
            { term: 'Ester', definition: 'Dẫn xuất khi thay thế nhóm -OH ở nhóm -COOH của acid bằng -OR\'.' },
          ],
          iupacNomenclature: [
            { term: 'Ethyl ethanoate', formula: 'CH3COOC2H5', rules: 'Tên gốc alkyl + tên anion carboxylate ate.' },
          ],
          reactionEquations: [
            { name: 'Este hóa', equation: 'CH3COOH + C2H5OH <=(H2SO4, t°)=> CH3COOC2H5 + H2O', mechanism: 'Thế ái nhân xúc tác acid.' },
          ],
          microMacroLink: [
            { micro: 'Không có liên kết H liên phân tử', macro: 'Dễ bay hơi, nhiệt độ sôi thấp' },
          ],
        },
        misconceptions: [
          {
            misconception: 'Thủy phân trong kiềm là phản ứng thuận nghịch.',
            scientificFact: 'Thủy phân trong kiềm là phản ứng một chiều.',
            pedagogicalRemedy: 'Đối chiếu trạng thái dung dịch đồng nhất sau phản ứng xà phòng hóa.',
          },
        ],
        lessonPlan5512: {
          title: `Kế hoạch bài dạy: ${title || 'Ester'}`,
          competencies: ['Nhận thức hóa học', 'Tìm hiểu tự nhiên', 'Vận dụng thực tiễn'],
          stages: [
            { name: 'Hoạt động 1: Mở đầu', time: '7 phút', activity: 'Khởi động trò chơi mùi hương hoa quả.', pedagogicalGoal: 'Tạo hứng thú.' },
            { name: 'Hoạt động 2: Hình thành kiến thức mới', time: '38 phút', activity: 'Khám phá mô hình 3D và viết phương trình thủy phân.', pedagogicalGoal: 'Phát triển tư duy vi mô - vĩ mô.' },
            { name: 'Hoạt động 3: Luyện tập', time: '30 phút', activity: 'Phiếu học tập 4 mức độ nhận thức.', pedagogicalGoal: 'Khắc sâu kiến thức.' },
            { name: 'Hoạt động 4: Vận dụng', time: '15 phút', activity: 'Dự án STEM làm xà phòng từ dầu ăn thừa.', pedagogicalGoal: 'Gắn liền thực tiễn.' },
          ],
          digitalMaterials: ['Mô hình 3D phân tử', 'Live Quiz trắc nghiệm'],
        },
        assessmentQuestions: [
          {
            id: 'q1',
            level: 'Nhận biết',
            question: 'Ester CH3COOC2H5 có tên thay thế IUPAC là gì?',
            options: ['Methyl acetate', 'Ethyl ethanoate', 'Ethyl formate', 'Propyl acetate'],
            correctIndex: 1,
            explanation: 'Gốc ethyl và ethanoate -> Ethyl ethanoate.',
            chapter: chapter || 'CH1',
          },
        ],
        summaryMarkdown: `# Phân tích SGK: ${title}\n- Chuẩn GDPT 2018 hoàn tất.`,
      });
    }

    const prompt = `Bạn là Chuyên gia Giáo dục Hóa học 12 GDPT 2018. Phân tích nội dung SGK sau:
Tên bài: ${title}
Bộ sách: ${bookSeries}
Thời lượng: ${periods} tiết
${customFocus ? `Trọng tâm: ${customFocus}` : ''}
Nội dung:
"""
${rawContent}
"""
Trả về JSON đúng cấu trúc: { "targetCompetencies": { ... }, "coreKnowledge": { ... }, "misconceptions": [ ... ], "digitalLabRecommendations": [ ... ], "lessonPlan5512": { ... }, "assessmentQuestions": [ ... ], "summaryMarkdown": "..." }`;

    const response = await genAIClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing textbook in server:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start Express server and connect Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`App Giáo Dục server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
