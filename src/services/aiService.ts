import { GoogleGenAI } from '@google/genai';
import { getStoredAISettings } from './storageService';
import { AIModelName, TextbookInputData, TextbookAnalysisResult, LessonPlan, Question } from '../types/chem';
import { PRESET_TEXTBOOK_LESSONS, INITIAL_TEXTBOOK_ANALYSIS } from '../data/textbookData';

export const MODEL_FALLBACK_CHAIN: AIModelName[] = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash',
];

const SYSTEM_INSTRUCTION = `Bạn là một Chuyên gia Tư vấn Công nghệ Giáo dục (EdTech Specialist) và là Giảng viên Hóa học Cao cấp. Nhiệm vụ của bạn là kiến trúc và vận hành hệ sinh thái học thuật chuyên biệt cho môn Hóa học lớp 12 theo Chương trình Giáo dục phổ thông (GDPT) 2018 của Việt Nam.
QUY TẮC & CHUẨN MỰC:
- Dùng chuẩn danh pháp quốc tế IUPAC theo sách giáo khoa mới (ethyl acetate/ethyl ethanoate, amine, amino acid, glucose, fructose, saccharose/sucrose, maltose, cellulose, phức chất coordination: phức cation [Cu(H2O)6]2+, [Ag(NH3)2]+, phối tử ligand...).
- Phân loại chính xác 4 mức độ nhận thức: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao.
- Phong cách: Khoa học, chuẩn mực sư phạm, truyền cảm hứng.`;

/**
 * Execute a Gemini prompt with automatic model fallback & retry
 */
export async function executeGeminiWithFallback<T = string>(
  promptOrContents: any,
  options?: {
    systemInstruction?: string;
    responseMimeType?: string;
    preferredModel?: AIModelName;
    apiKey?: string;
  }
): Promise<{ result: T; usedModel: AIModelName; source: 'client_gemini' | 'backend' | 'offline_fallback' }> {
  const settings = getStoredAISettings();
  const apiKey = options?.apiKey || settings.apiKey || '';
  const initialModel = options?.preferredModel || settings.model || 'gemini-3-flash-preview';

  // Order fallback chain starting from preferred model
  const modelsToTry: AIModelName[] = [
    initialModel,
    ...MODEL_FALLBACK_CHAIN.filter((m) => m !== initialModel),
  ];

  let lastError: any = null;

  // 1. Try client-side direct SDK call if apiKey is present
  if (apiKey) {
    const aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    for (const model of modelsToTry) {
      try {
        const config: any = {
          systemInstruction: options?.systemInstruction || SYSTEM_INSTRUCTION,
          temperature: 0.7,
        };
        if (options?.responseMimeType) {
          config.responseMimeType = options.responseMimeType;
        }

        const response = await aiClient.models.generateContent({
          model,
          contents: promptOrContents,
          config,
        });

        const text = response.text || '';
        let parsedResult: any = text;
        if (options?.responseMimeType === 'application/json') {
          try {
            parsedResult = JSON.parse(text);
          } catch {
            parsedResult = text;
          }
        }

        return {
          result: parsedResult as T,
          usedModel: model,
          source: 'client_gemini',
        };
      } catch (err: any) {
        console.warn(`[AI Fallback] Model ${model} failed, trying next... Error:`, err?.message || err);
        lastError = err;
        // Continue loop to try next model in fallback list
      }
    }
  }

  // 2. Try backend API proxy as secondary option
  for (const model of modelsToTry) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': apiKey,
          'x-gemini-model': model,
        },
        body: JSON.stringify({
          message: typeof promptOrContents === 'string' ? promptOrContents : JSON.stringify(promptOrContents),
          model,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          result: (data.reply || data) as T,
          usedModel: model,
          source: 'backend',
        };
      }
    } catch (backendErr) {
      // Backend not running or failed
    }
  }

  // 3. If all models failed and error exists, rethrow error to display red alert
  if (lastError) {
    throw new Error(lastError?.message || '429 RESOURCE_EXHAUSTED: Tất cả các model đều gặp sự cố hoặc vượt giới hạn quota.');
  }

  throw new Error('Chưa có API Key hợp lệ. Vui lòng bấm vào nút "Lấy API key để sử dụng app" trên Header để cấu hình API Key!');
}

/**
 * Test user API key validity
 */
export async function testGeminiApiKey(key: string, model: AIModelName = 'gemini-3-flash-preview'): Promise<{ success: boolean; message: string }> {
  if (!key.trim()) {
    return { success: false, message: 'Vui lòng nhập API Key trước khi kiểm tra!' };
  }

  try {
    const aiClient = new GoogleGenAI({
      apiKey: key.trim(),
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const res = await aiClient.models.generateContent({
      model,
      contents: 'Trả lời đúng 1 chữ: OK',
      config: { maxOutputTokens: 10 },
    });

    if (res.text) {
      return { success: true, message: `Kết nối thành công tới Google Gemini (${model})!` };
    }
    return { success: false, message: 'Không nhận được phản hồi từ mô hình.' };
  } catch (err: any) {
    return {
      success: false,
      message: `Lỗi kết nối: ${err?.message || 'API key không hợp lệ hoặc hết hạn mức.'}`,
    };
  }
}

/**
 * Clean & extract JSON from AI response that might be wrapped in ```json ... ```
 */
function extractJSONFromText<T>(text: string): T | null {
  try {
    return JSON.parse(text);
  } catch {
    // Try regex extraction of json block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch (err) {
        console.warn('Failed to parse extracted JSON block:', err);
      }
    }
  }
  return null;
}

/**
 * Intelligent generator for offline / fallback textbook analysis
 */
function generateOfflineTextbookAnalysis(input: TextbookInputData): TextbookAnalysisResult {
  const now = new Date().toLocaleString('vi-VN');
  const matchedPreset = PRESET_TEXTBOOK_LESSONS.find(
    (p) => p.title.toLowerCase().includes(input.title.toLowerCase()) || input.title.toLowerCase().includes(p.title.toLowerCase())
  );

  if (matchedPreset && input.title.toLowerCase().includes('ester')) {
    return {
      ...INITIAL_TEXTBOOK_ANALYSIS,
      id: `analysis-${Date.now()}`,
      analyzedAt: now,
      title: input.title,
      bookSeries: input.bookSeries,
      chapter: input.chapter,
      periods: input.periods,
      usedModel: 'Offline Educational Engine (GDPT 2018)',
    };
  }

  // Generic structured analysis based on provided input
  return {
    id: `analysis-${Date.now()}`,
    analyzedAt: now,
    title: input.title || 'Bài học Hóa học 12',
    bookSeries: input.bookSeries || 'Kết nối tri thức',
    chapter: input.chapter || 'Chương trình Hóa học 12',
    periods: input.periods || 2,
    usedModel: 'Offline Educational Engine (GDPT 2018)',
    targetCompetencies: {
      chemistryCognition: [
        `Nêu được các khái niệm cốt lõi, đặc điểm cấu tạo phân tử và định nghĩa chính liên quan đến ${input.title}.`,
        'Đọc và viết chính xác danh pháp hóa học quốc tế IUPAC 2024 theo SGK mới.',
        'Trình bày và giải thích tính chất vật lý và tính chất hóa học đặc trưng dựa trên cấu trúc phân tử.',
      ],
      natureExploration: [
        `Quan sát, mô tả và giải thích được các hiện tượng thí nghiệm thực hành hoặc mô phỏng liên quan đến ${input.title}.`,
        'Rèn luyện kỹ năng thực hành an toàn và tư duy quan sát vi mô - vĩ mô.',
      ],
      practicalApplication: [
        `Vận dụng các kiến thức về ${input.title} để giải thích các hiện tượng thực tiễn, ứng dụng sản xuất công nghiệp và đời sống thường ngày.`,
        'Đề xuất các giải pháp bảo vệ môi trường và sử dụng an toàn hóa chất.',
      ],
      qualities: [
        'Hình thành phẩm chất chăm chỉ, trung thực trong nghiên cứu khoa học thực nghiệm.',
        'Tư duy sáng tạo và trách nhiệm với cộng đồng và môi trường sống.',
      ],
    },
    coreKnowledge: {
      keyDefinitions: [
        {
          term: `Khái niệm then chốt của ${input.title}`,
          definition: `Các đặc điểm cấu trúc và bản chất hóa học được quy định trong SGK ${input.bookSeries}.`,
        },
        {
          term: 'Quy tắc phản ứng đặc trưng',
          definition: 'Cơ chế biến đổi liên kết hóa học và sự chuyển dịch electron trong phản ứng.',
        },
      ],
      iupacNomenclature: [
        {
          term: 'Danh pháp IUPAC 2024',
          formula: 'Công thức cấu tạo',
          rules: 'Áp dụng quy tắc gọi tên quốc tế thống nhất theo chuẩn GDPT 2018.',
        },
      ],
      reactionEquations: [
        {
          name: 'Phương trình hóa học cốt lõi',
          equation: 'Phương trình phản ứng minh họa tính chất',
          condition: 'Nhiệt độ, xúc tác và áp suất thích hợp',
          mechanism: 'Cắt đứt liên kết cũ và hình thành liên kết mới ở cấp độ phân tử.',
        },
      ],
      microMacroLink: [
        {
          micro: 'Cấu trúc nguyên tử / phân tử và các loại liên kết hóa học.',
          macro: 'Các biểu hiện trạng thái, màu sắc, nhiệt độ sôi và tính tan quan sát được.',
          significance: 'Liên kết tư duy giữa vi mô phân tử và hiện tượng vĩ mô thực tế.',
        },
      ],
    },
    misconceptions: [
      {
        misconception: `Học sinh dễ nhầm lẫn giữa các điều kiện phản ứng và tính thuận nghịch/một chiều trong ${input.title}.`,
        scientificFact: 'Phân tích bản chất nhiệt động học và động học của phản ứng để xác định đúng chiều phản ứng.',
        pedagogicalRemedy: 'Sử dụng bảng so sánh đối chiếu và cho học sinh thực hành tương tác mô hình.',
      },
    ],
    digitalLabRecommendations: [
      {
        experimentTitle: `Thí nghiệm khảo sát tính chất của ${input.title}`,
        safetyNotes: 'Sử dụng kính bảo hộ, găng tay và tuân thủ định mức hóa chất trong phòng thí nghiệm.',
        observation: 'Quan sát hiện tượng đổi màu, tách lớp hoặc xuất hiện kết tủa/khí thoát ra.',
        relatedMoleculeId: matchedPreset?.relatedMoleculeId,
        simulationHint: 'Sử dụng Thư viện 3D & Thí nghiệm ảo để trực quan hóa tương tác phân tử.',
      },
    ],
    lessonPlan5512: {
      title: `Kế hoạch bài dạy: ${input.title} (Công văn 5512 - GDPT 2018)`,
      competencies: [
        `Phát triển năng lực nhận thức hóa học về ${input.title}.`,
        'Phát triển năng lực tìm hiểu thế giới tự nhiên qua quan sát thí nghiệm.',
        'Phát triển năng lực vận dụng kiến thức hóa học vào đời sống và dự án STEM.',
      ],
      stages: [
        {
          name: 'Hoạt động 1: Mở đầu / Khởi động (7 phút)',
          time: '7 phút',
          activity: `Giáo viên tổ chức trò chơi tình huống thực tế hoặc Live Quiz gợi mở về ${input.title}, kết nối tri thức thực tiễn với bài học mới.`,
          pedagogicalGoal: 'Tạo tâm thế học tập hứng thú và kích thích tò mò khoa học.',
        },
        {
          name: 'Hoạt động 2: Hình thành kiến thức mới (38 phút)',
          time: '38 phút',
          activity: 'Học sinh làm việc nhóm kết hợp khai thác SGK và mô phỏng số, hoàn thành phiếu học tập về cấu trúc, tính chất và cơ chế.',
          pedagogicalGoal: 'Khắc sâu kiến thức trọng tâm và rèn luyện năng lực tự học hợp tác.',
        },
        {
          name: 'Hoạt động 3: Luyện tập (30 phút)',
          time: '30 phút',
          activity: 'Giáo viên giao hệ thống câu hỏi 4 mức độ nhận thức trên phần mềm, hướng dẫn giải thích cặn kẽ các phương án gây nhiễu.',
          pedagogicalGoal: 'Củng cố kiến thức và đánh giá kịp thời mức độ tiếp thu của học sinh.',
        },
        {
          name: 'Hoạt động 4: Vận dụng & Mở rộng (15 phút)',
          time: '15 phút',
          activity: 'Giao nhiệm vụ tìm hiểu ứng dụng thực tiễn hoặc dự án nghiên cứu nhỏ về liên hệ môi trường.',
          pedagogicalGoal: 'Mở rộng tầm nhìn ứng dụng khoa học vào đời sống.',
        },
      ],
      digitalMaterials: [
        'Mô hình phân tử tương tác 3D ChemEdu',
        'Video thí nghiệm trực quan',
        'Hệ thống câu hỏi đánh giá trực tuyến',
      ],
    },
    assessmentQuestions: [
      {
        id: `q-nb-${Date.now()}`,
        level: 'Nhận biết',
        question: `Nội dung nhận biết cơ bản về ${input.title} theo SGK ${input.bookSeries} là gì?`,
        options: [
          'Đặc điểm cấu tạo và danh pháp IUPAC',
          'Phương pháp sản xuất quy mô phức tạp',
          'Hiện tượng không có trong chương trình',
          'Định luật vật lý cổ điển'
        ],
        correctIndex: 0,
        explanation: 'Khái niệm và đặc điểm cấu tạo cơ bản là yêu cầu mức độ Nhận biết.',
        chapter: input.chapter,
      },
      {
        id: `q-th-${Date.now()}`,
        level: 'Thông hiểu',
        question: `Bản chất của các tính chất hóa học đặc trưng trong bài ${input.title} được giải thích như thế nào?`,
        options: [
          'Do sự tương tác ngẫu nhiên không có quy luật',
          'Dựa trên cấu trúc electron và liên kết hóa học trong phân tử',
          'Chỉ phụ thuộc vào áp suất môi trường bên ngoài',
          'Không thể giải thích bằng lý thuyết hóa học'
        ],
        correctIndex: 1,
        explanation: 'Cấu tạo phân tử quyết định tính chất hóa học là nguyên lý cốt lõi của hóa học.',
        chapter: input.chapter,
      },
      {
        id: `q-vd-${Date.now()}`,
        level: 'Vận dụng',
        question: `Khi tiến hành thực hành thí nghiệm liên quan đến ${input.title}, thao tác nào sau đây là chuẩn mực?`,
        options: [
          'Tuân thủ đúng trình tự hóa chất và điều kiện nhiệt độ xúc tác',
          'Tăng nồng độ hóa chất tùy ý để phản ứng nhanh',
          'Bỏ qua giai đoạn an toàn và thông gió phòng thí nghiệm',
          'Không ghi chép hiện tượng'
        ],
        correctIndex: 0,
        explanation: 'Thao tác thực hành đúng quy trình đảm bảo an toàn và kết quả chính xác.',
        chapter: input.chapter,
      },
      {
        id: `q-vdc-${Date.now()}`,
        level: 'Vận dụng cao',
        question: `Để tổng hợp và tối ưu hóa hiệu suất điều chế sản phẩm liên quan đến ${input.title}, biện pháp nào mang tính sư phạm và khoa học nhất?`,
        options: [
          'Áp dụng nguyên lý chuyển dịch cân bằng Le Chatelier và kiểm soát nhiệt độ',
          'Ngừng cung cấp chất phản ứng giữa chừng',
          'Sử dụng dung môi không tương thích',
          'Đun sôi hỗn hợp ở nhiệt độ quá giới hạn phân hủy'
        ],
        correctIndex: 0,
        explanation: 'Kiểm soát cân bằng hóa học và các yếu tố ảnh hưởng là tư duy vận dụng cao.',
        chapter: input.chapter,
      },
    ],
    summaryMarkdown: `# Báo cáo Phân tích Bài học: ${input.title}\n- Bộ sách: ${input.bookSeries}\n- Chương: ${input.chapter}\n- Phân tích hoàn tất theo chuẩn chương trình GDPT 2018.`,
  };
}

/**
 * Main AI-powered function to analyze textbook lesson content
 */
export async function analyzeTextbookContentAI(
  input: TextbookInputData,
  onProgress?: (status: string) => void
): Promise<{ result: TextbookAnalysisResult; usedModel: string }> {
  const promptText = `Bạn là một Chuyên gia Giáo dục Hóa học Cao cấp và Giảng viên Sư phạm Hóa học 12 theo Chương trình GDPT 2018 của Bộ Giáo dục & Đào tạo Việt Nam.
Nhiệm vụ của bạn là phân tích sâu sắc nội dung bài học Sách Giáo Khoa (SGK) dưới đây để hỗ trợ giáo viên soạn bài giảng, thiết kế thí nghiệm số và ra đề kiểm tra đánh giá:

THÔNG TIN BÀI HỌC:
- Tên bài: ${input.title}
- Chương: ${input.chapter}
- Bộ sách giáo khoa: ${input.bookSeries}
- Thời lượng giảng dạy: ${input.periods} tiết
${input.customFocus ? `- Trọng tâm sư phạm yêu cầu: ${input.customFocus}` : ''}

NỘI DUNG VĂN BẢN TRÍCH ĐOẠN / GHI CHÚ TỪ SGK:
"""
${input.rawContent || 'Bài học Hóa học 12 theo chuẩn GDPT 2018'}
"""

QUY TẮC BẮT BUỘC:
1. Dùng chuẩn danh pháp quốc tế IUPAC 2024 mới nhất của SGK (ethyl acetate/ethyl ethanoate, methyl methacrylate, amine, amino acid, glucose, fructose, phức chất coordination...).
2. Phân loại 4 mức độ nhận thức: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao.
3. Kế hoạch bài dạy định hướng năng lực tuân thủ Công văn 5512 gồm đúng 4 hoạt động:
   - Hoạt động 1: Mở đầu / Khởi động
   - Hoạt động 2: Hình thành kiến thức mới
   - Hoạt động 3: Luyện tập
   - Hoạt động 4: Vận dụng & Mở rộng
4. Tạo đúng 4 câu hỏi trắc nghiệm tương ứng 4 mức độ nhận thức (có options A/B/C/D, correctIndex từ 0-3, lời giải explanation chi tiết).
5. Đầu ra BẮT BUỘC trả về đúng định dạng JSON chuẩn (không có văn bản ngoài json block) với schema:
{
  "targetCompetencies": {
    "chemistryCognition": ["chuỗi YCCĐ 1", "chuỗi YCCĐ 2", "chuỗi YCCĐ 3"],
    "natureExploration": ["chuỗi YCCĐ 1", "chuỗi YCCĐ 2"],
    "practicalApplication": ["chuỗi YCCĐ 1", "chuỗi YCCĐ 2"],
    "qualities": ["chuỗi phẩm chất 1", "chuỗi phẩm chất 2"]
  },
  "coreKnowledge": {
    "keyDefinitions": [
      { "term": "Khái niệm", "definition": "Định nghĩa" }
    ],
    "iupacNomenclature": [
      { "term": "Tên IUPAC", "formula": "Công thức", "rules": "Quy tắc gọi tên" }
    ],
    "reactionEquations": [
      { "name": "Tên phản ứng", "equation": "Phương trình", "condition": "Điều kiện", "mechanism": "Cơ chế phân tử" }
    ],
    "microMacroLink": [
      { "micro": "Vi mô", "macro": "Vĩ mô", "significance": "Ý nghĩa" }
    ]
  },
  "misconceptions": [
    {
      "misconception": "Quan niệm sai lầm học sinh",
      "scientificFact": "Sự thật khoa học",
      "pedagogicalRemedy": "Giải pháp sư phạm"
    }
  ],
  "digitalLabRecommendations": [
    {
      "experimentTitle": "Tên thí nghiệm",
      "safetyNotes": "Lưu ý an toàn",
      "observation": "Hiện tượng quan sát",
      "relatedMoleculeId": "ethyl_acetate hoặc glucose hoặc alanine hoặc cu_complex",
      "simulationHint": "Gợi ý mô phỏng"
    }
  ],
  "lessonPlan5512": {
    "title": "Kế hoạch bài dạy: ...",
    "competencies": ["mục tiêu 1", "mục tiêu 2", "mục tiêu 3"],
    "stages": [
      { "name": "Hoạt động 1: Mở đầu", "time": "7 phút", "activity": "...", "pedagogicalGoal": "..." },
      { "name": "Hoạt động 2: Hình thành kiến thức mới", "time": "38 phút", "activity": "...", "pedagogicalGoal": "..." },
      { "name": "Hoạt động 3: Luyện tập", "time": "30 phút", "activity": "...", "pedagogicalGoal": "..." },
      { "name": "Hoạt động 4: Vận dụng", "time": "15 phút", "activity": "...", "pedagogicalGoal": "..." }
    ],
    "digitalMaterials": ["Học liệu 1", "Học liệu 2"]
  },
  "assessmentQuestions": [
    {
      "id": "q1",
      "level": "Nhận biết",
      "question": "Câu hỏi...",
      "options": ["A...", "B...", "C...", "D..."],
      "correctIndex": 0,
      "explanation": "Giải thích...",
      "chapter": "${input.chapter}"
    },
    {
      "id": "q2",
      "level": "Thông hiểu",
      "question": "Câu hỏi...",
      "options": ["A...", "B...", "C...", "D..."],
      "correctIndex": 1,
      "explanation": "Giải thích...",
      "chapter": "${input.chapter}"
    },
    {
      "id": "q3",
      "level": "Vận dụng",
      "question": "Câu hỏi...",
      "options": ["A...", "B...", "C...", "D..."],
      "correctIndex": 2,
      "explanation": "Giải thích...",
      "chapter": "${input.chapter}"
    },
    {
      "id": "q4",
      "level": "Vận dụng cao",
      "question": "Câu hỏi...",
      "options": ["A...", "B...", "C...", "D..."],
      "correctIndex": 3,
      "explanation": "Giải thích...",
      "chapter": "${input.chapter}"
    }
  ],
  "summaryMarkdown": "Tóm tắt ngắn gọn các luận điểm dưới dạng Markdown..."
}`;

  let contents: any = promptText;
  if (input.imagePreview && input.imagePreview.startsWith('data:')) {
    const matches = input.imagePreview.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (matches) {
      contents = [
        {
          inlineData: {
            mimeType: matches[1],
            data: matches[2],
          },
        },
        promptText + '\n\nCHÚ Ý: Người dùng đã đính kèm hình ảnh chụp trang SGK ở trên, hãy đọc kỹ nội dung trong ảnh để phân tích chính xác!',
      ];
    }
  }

  if (onProgress) onProgress('Đang gửi dữ liệu tới Gemini AI...');

  try {
    const { result, usedModel } = await executeGeminiWithFallback<any>(contents, {
      responseMimeType: 'application/json',
      systemInstruction: 'Bạn là chuyên gia thẩm định chương trình Hóa học 12 GDPT 2018 Việt Nam. Luôn xuất dữ liệu chuẩn JSON.',
    });

    let parsed = typeof result === 'string' ? extractJSONFromText<any>(result) : result;

    if (parsed && parsed.targetCompetencies && parsed.lessonPlan5512) {
      const finalResult: TextbookAnalysisResult = {
        id: `analysis-${Date.now()}`,
        analyzedAt: new Date().toLocaleString('vi-VN'),
        title: input.title,
        bookSeries: input.bookSeries,
        chapter: input.chapter,
        periods: input.periods,
        usedModel,
        targetCompetencies: parsed.targetCompetencies,
        coreKnowledge: parsed.coreKnowledge || {
          keyDefinitions: [],
          iupacNomenclature: [],
          reactionEquations: [],
          microMacroLink: [],
        },
        misconceptions: parsed.misconceptions || [],
        digitalLabRecommendations: parsed.digitalLabRecommendations || [],
        lessonPlan5512: parsed.lessonPlan5512,
        assessmentQuestions: parsed.assessmentQuestions || [],
        summaryMarkdown: parsed.summaryMarkdown || `# Phân tích bài học: ${input.title}`,
      };
      return { result: finalResult, usedModel };
    }
  } catch (err: any) {
    console.error('[AI Analysis Error] All models failed in fallback chain:', err);
    // Rethrow to adhere to Section 3 of AI_INSTRUCTIONS.md (Hiển thị lỗi nguyên văn từ API và trạng thái Đã dừng do lỗi)
    throw err;
  }

  // Fallback
  return {
    result: generateOfflineTextbookAnalysis(input),
    usedModel: 'Offline Educational Engine (GDPT 2018)',
  };
}
