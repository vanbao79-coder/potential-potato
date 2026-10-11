import { TextbookInputData, TextbookAnalysisResult } from '../types/chem';

export interface PresetTextbookLesson {
  id: string;
  title: string;
  chapter: string;
  chapterCode: string;
  bookSeries: 'Kết nối tri thức' | 'Cánh Diều' | 'Chân trời sáng tạo' | 'Bộ chuẩn GDPT 2018';
  periods: number;
  highlightConcept: string;
  relatedMoleculeId?: string;
  rawContent: string;
  customFocus?: string;
}

export const PRESET_TEXTBOOK_LESSONS: PresetTextbookLesson[] = [
  {
    id: 'sgk-ester-lipid',
    title: 'Bài 1: Ester - Lipid (SGK Hóa 12)',
    chapter: 'Chương 1: Ester - Lipid. Xà phòng và chất giặt rửa',
    chapterCode: 'CH1',
    bookSeries: 'Kết nối tri thức',
    periods: 2,
    highlightConcept: 'Nhóm chức -COO-, phản ứng ester hóa, thủy phân thuận nghịch và xà phòng hóa',
    relatedMoleculeId: 'ethyl_acetate',
    customFocus: 'Nhấn mạnh cơ chế ái nhân xúc tác acid H+, phân biệt thủy phân acid vs kiềm, chuẩn danh pháp IUPAC 2024.',
    rawContent: `BÀI 1: ESTER - LIPID (TRÍCH ĐOẠN SGK HÓA HỌC 12 - KẾT NỐI TRI THỨC)

I. KHÁI NIỆM VÀ DANH PHÁP ESTER:
- Khi thay thế nhóm -OH ở nhóm carboxyl (-COOH) của carboxylic acid bằng nhóm -OR' thì thu được ester.
- Công thức chung của ester đơn chức: R-COO-R' (R là gốc hydrocarbon hoặc H; R' là gốc hydrocarbon). Ester no, đơn chức, mạch hở có công thức phân tử CnH2nO2 (n ≥ 2).
- Danh pháp IUPAC (Tên thay thế / gốc - chức):
  Tên ester = Tên gốc hydrocarbon R' + Tên anion carboxylate (đuôi -ate).
  Ví dụ: CH3COOC2H5: ethyl acetate hoặc ethyl ethanoate; HCOOCH3: methyl formate hoặc methyl methanoate; CH2=CH-COOCH3: methyl acrylate; CH3COOCH2C6H5: benzyl acetate (mùi hoa nhài); CH3COOCH2CH2CH(CH3)2: isoamyl acetate (mùi chuối chín).

II. TÍNH CHẤT VẬT LÍ:
- Ở điều kiện thường, phần lớn các ester là chất lỏng, nhẹ hơn nước, rất ít tan trong nước, dễ bay hơi và có mùi thơm dễ chịu đặc trưng của các loại hoa quả.
- Nhiệt độ sôi của ester thấp hơn so với carboxylic acid và alcohol có cùng phân tử khối hoặc cùng số nguyên tử carbon, do giữa các phân tử ester không tạo được liên kết hydrogen liên phân tử.

III. TÍNH CHẤT HÓA HỌC:
1. Phản ứng thủy phân trong môi trường acid (thuận nghịch):
   Đun nóng ester với dung dịch acid vô cơ loãng (như H2SO4 loãng):
   R-COO-R' + H2O <=(H2SO4, t°)=> R-COOH + R'-OH
   Phản ứng xảy ra chậm, không hoàn toàn, là phản ứng thuận nghịch.
2. Phản ứng thủy phân trong môi trường kiềm (Phản ứng xà phòng hóa - một chiều):
   R-COO-R' + NaOH --(t°)--> R-COONa + R'-OH
   Phản ứng xảy ra nhanh hơn, là phản ứng một chiều. Muối carboxylate sinh ra tan tốt trong nước.
3. Phản ứng ở gốc hydrocarbon:
   Ester có gốc hydrocarbon không no tham gia phản ứng cộng (H2, Br2) và phản ứng trùng hợp (như methyl methacrylate trùng hợp tạo poly(methyl methacrylate) - thủy tinh hữu cơ plexiglas).

IV. ĐIỀU CHẾ VÀ ỨNG DỤNG:
- Phản ứng ester hóa: Đun hồi lưu hỗn hợp carboxylic acid và alcohol với xúc tác H2SO4 đặc (đóng vai trò xúc tác và hút nước để dịch chuyển cân bằng sang chiều thuận):
  CH3COOH + C2H5OH <=(H2SO4 đặc, t°)=> CH3COOC2H5 + H2O
- Ứng dụng: Làm dung môi hòa tan sơn, vecni (ethyl acetate); sản xuất hương liệu thực phẩm, nước hoa, mỹ phẩm; làm vật liệu polymer tổng hợp; sản xuất chất béo, dược phẩm.`,
  },
  {
    id: 'sgk-carbohydrate-glucose',
    title: 'Bài 3: Glucose và Fructose (SGK Hóa 12)',
    chapter: 'Chương 2: Carbohydrate',
    chapterCode: 'CH2',
    bookSeries: 'Cánh Diều',
    periods: 2,
    highlightConcept: 'Đồng phân monosaccharide, nhóm polyhydroxy và aldehyde (-CHO), tráng bạc Tollens',
    relatedMoleculeId: 'glucose',
    customFocus: 'Làm rõ cấu trúc mạch hở vs mạch vòng alpha/beta, cân bằng hỗ biến trong môi trường base kiềm.',
    rawContent: `BÀI 3: GLUCOSE VÀ FRUCTOSE (TRÍCH ĐOẠN SGK HÓA HỌC 12 - CÁNH DIỀU)

I. CẤU TẠO PHÂN TỬ:
- Glucose và fructose đều có công thức phân tử C6H12O6, là đồng phân nhóm chức của nhau (monosaccharide).
- Glucose: Phân tử mạch hở có 5 nhóm hydroxy (-OH) kề nhau và 1 nhóm formyl / aldehyde (-CHO): CH2OH-[CHOH]4-CHO (pentahydroxyhexanal). Trong dung dịch nước, glucose tồn tại chủ yếu ở dạng mạch vòng bán acetal: alpha-glucose và beta-glucose (vòng 6 cạnh pyranose).
- Fructose: Phân tử mạch hở có 5 nhóm hydroxy (-OH) và 1 nhóm carbonyl / ketone (C=O ở vị trí C2): CH2OH-[CHOH]3-CO-CH2OH. Trong dung dịch, fructose tồn tại dạng mạch vòng alpha và beta (vòng 5 cạnh furanose).

II. TÍNH CHẤT HÓA HỌC CỦA GLUCOSE:
1. Tính chất của polyalcohol (nhiều nhóm -OH kề nhau):
   Tác dụng với Cu(OH)2 trong môi trường kiềm ở nhiệt độ phòng:
   2C6H12O6 + Cu(OH)2 -> [Cu(C6H11O6)2] + 2H2O (phức chất màu xanh lam thẫm đặc trưng).
2. Tính chất của nhóm aldehyde (-CHO):
   a) Phản ứng tráng bạc với thuốc thử Tollens [Ag(NH3)2]OH:
      CH2OH[CHOH]4CHO + 2[Ag(NH3)2]OH --(t°)--> CH2OH[CHOH]4COONH4 + 2Ag + 3NH3 + H2O
      Tạo lớp bạc kim loại sáng bóng bám trên thành ống nghiệm (phản ứng nhận biết).
   b) Phản ứng với Cu(OH)2 trong môi trường kiềm đun nóng:
      CH2OH[CHOH]4CHO + 2Cu(OH)2 + NaOH --(t°)--> CH2OH[CHOH]4COONa + Cu2O (kết tủa đỏ gạch) + 3H2O
   c) Phản ứng làm mất màu nước bromine (Br2):
      Glucose làm mất màu nước bromine tạo gluconic acid. Phản ứng này dùng để phân biệt glucose và fructose vì fructose không phản ứng với nước bromine trong môi trường acid.
3. Chuyển hóa giữa glucose và fructose:
   Trong môi trường kiềm, fructose chuyển hóa qua lại với glucose qua chất trung gian enediol. Do đó, trong môi trường kiềm (như thuốc thử Tollens, Cu(OH)2/NaOH đun nóng), fructose cũng có phản ứng tráng bạc và tạo Cu2O kết tủa đỏ gạch.`,
  },
  {
    id: 'sgk-amine',
    title: 'Bài 6: Amine và Danh pháp IUPAC (SGK Hóa 12)',
    chapter: 'Chương 3: Hợp chất chứa Nitrogen',
    chapterCode: 'CH3',
    bookSeries: 'Chân trời sáng tạo',
    periods: 2,
    highlightConcept: 'Bậc amine, danh pháp thay thế IUPAC 2024, tính base, phản ứng tạo kết tủa của aniline',
    relatedMoleculeId: 'alanine',
    customFocus: 'Chuẩn hóa quy tắc gọi tên IUPAC mới, so sánh độ mạnh tính base qua mật độ electron trên nguyên tử Nitrogen.',
    rawContent: `BÀI 6: AMINE (TRÍCH ĐOẠN SGK HÓA HỌC 12 - CHÂN TRỜI SÁNG TẠO)

I. KHÁI NIỆM, PHÂN LOẠI VÀ DANH PHÁP:
- Khi thay thế một hoặc nhiều nguyên tử hydrogen trong phân tử NH3 bằng gốc hydrocarbon, ta được amine.
- Bậc của amine được tính bằng số nguyên tử hydrogen trong NH3 bị thay thế bởi gốc hydrocarbon (bậc 1: R-NH2; bậc 2: R-NH-R'; bậc 3: R-N(R')-R'').
- Danh pháp IUPAC:
  1. Tên thay thế: Tên hydrocarbon tương ứng (bỏ e) + số chỉ vị trí nhóm amine + amine.
     Ví dụ: CH3-NH2: methanamine; CH3-CH2-NH2: ethanamine; CH3-CH(NH2)-CH3: propan-2-amine; C6H5-NH2: benzenamine (tên thường: aniline).
  2. Tên gốc - chức: Tên gốc alkyl/aryl + amine.
     Ví dụ: CH3-NH2: methylamine; (CH3)2NH: dimethylamine; (CH3)3N: trimethylamine; C6H5-NH2: phenylamine.

II. TÍNH CHẤT VẬT LÍ:
- Methylamine, dimethylamine, trimethylamine và ethylamine là những chất khí ở điều kiện thường, có mùi khai hắc tương tự ammonia, độc, tan nhiều trong nước nhờ tạo liên kết hydrogen với phân tử nước.
- Aniline là chất lỏng không màu, sôi ở 184°C, khó tan trong nước (nặng hơn nước, lắng xuống đáy), để lâu trong không khí bị oxi hóa chuyển sang màu nâu đen.

III. TÍNH CHẤT HÓA HỌC:
1. Tính base:
   - Nguyên tử nitrogen trong nhóm amine còn 1 cặp electron tự do chưa liên kết, có khả năng nhận proton H+, thể hiện tính base tương tự ammonia.
   - So sánh tính base: Amine béo bậc 2 > amine béo bậc 1 > NH3 > amine thơm (aniline).
   - Dung dịch methylamine làm quỳ tím hóa xanh, làm phenolphthalein hóa hồng. Aniline có tính base rất yếu do hiệu ứng hút e liên hợp của vòng benzen, không làm đổi màu quỳ tím.
   - Tác dụng với acid: CH3NH2 + HCl -> CH3NH3+Cl- (methylammonium chloride); C6H5NH2 + HCl -> C6H5NH3+Cl- (phenylammonium chloride tan trong nước).
2. Phản ứng thế ở nhân thơm của aniline:
   - Do nhóm -NH2 đẩy electron kích hoạt vòng benzen ở các vị trí ortho và para:
     C6H5NH2 + 3Br2 (aq) -> 2,4,6-tribromoaniline (kết tủa trắng) + 3HBr
   - Phản ứng này dùng để nhận biết aniline định tính với độ nhạy rất cao.`,
  },
  {
    id: 'sgk-pin-galvani',
    title: 'Bài 11: Thế điện cực & Pin Galvani (SGK Hóa 12)',
    chapter: 'Chương 5: Pin điện hóa & Điện phân',
    chapterCode: 'CH5',
    bookSeries: 'Kết nối tri thức',
    periods: 2,
    highlightConcept: 'Cặp oxi hóa - khử, thế điện cực chuẩn E°, cơ chế pin Galvani Zn-Cu, cầu muối',
    relatedMoleculeId: 'galvanic_cell',
    customFocus: 'Phân tích dòng electron và ion qua cầu muối, quy tắc tính sức điện động E°pin chuẩn xác.',
    rawContent: `BÀI 11: THẾ ĐIỆN CỰC CHUẨN VÀ PIN GALVANI (TRÍCH ĐOẠN SGK HÓA HỌC 12 - KẾT NỐI TRI THỨC)

I. CẶP OXI HÓA - KHỬ VÀ THẾ ĐIỆN CỰC CHUẨN:
- Cặp oxi hóa - khử dạng Ox/Red thể hiện sự liên hệ giữa chất oxi hóa và chất khử của cùng một nguyên tố: Zn2+/Zn, Cu2+/Cu, Ag+/Ag.
- Thế điện cực chuẩn E°(Ox/Red) đặc trưng cho khả năng oxi hóa của dạng oxi hóa và khả năng khử của dạng khử ở điều kiện chuẩn (nồng độ ion 1 M, áp suất 1 bar, nhiệt độ 25°C hay 298 K).
- Thế điện cực chuẩn của điện cực hydrogen chuẩn được quy ước bằng 0,00 V: E°(2H+/H2) = 0,00 V.
- Giá trị E°(Ox/Red) càng lớn thì dạng Ox có tính oxi hóa càng mạnh, dạng Red có tính khử càng yếu.

II. PIN GALVANI (PIN ĐIỆN HÓA DANIÈLE - JACOBI):
1. Cấu tạo của pin Galvani Zn - Cu:
   - Gồm thanh Zn nhúng trong cốc đựng dung dịch ZnSO4 1 M (điện cực âm - anode).
   - Thanh Cu nhúng trong cốc đựng dung dịch CuSO4 1 M (điện cực dương - cathode).
   - Hai cốc nối với nhau bằng một cầu muối (ống thủy tinh chứa dung dịch chất điện li trơ như KNO3 hoặc KCl trong thạch agar).
   - Hai thanh kim loại nối qua vôn kế hoặc bóng đèn bằng dây dẫn kim loại.
2. Quá trình xảy ra trên các điện cực:
   - Tại anode (-): Xảy ra quá trình oxi hóa: Zn(s) -> Zn2+(aq) + 2e (thanh Zn tan dần).
   - Tại cathode (+): Xảy ra quá trình khử: Cu2+(aq) + 2e -> Cu(s) (đồng sinh ra bám vào thanh Cu, thanh Cu dày lên).
   - Chiều dòng electron: Di chuyển từ cực âm (Zn) sang cực dương (Cu) qua mạch ngoài. Chiều dòng điện theo quy ước ngược lại (từ Cu sang Zn).
   - Vai trò cầu muối: Đóng kín mạch điện và trung hòa điện tích hai cốc (anion NO3- di chuyển sang cốc Zn2+, cation K+ di chuyển sang cốc Cu2+).
3. Phương trình hóa học tổng quát của pin:
   Zn(s) + Cu2+(aq) -> Zn2+(aq) + Cu(s)
4. Sức điện động chuẩn của pin:
   E°pin = E°(cathode) - E°(anode) = E°(Cu2+/Cu) - E°(Zn2+/Zn) = (+0,34 V) - (-0,76 V) = 1,10 V.`,
  },
  {
    id: 'sgk-phuc-chat',
    title: 'Bài 15: Giới thiệu Phức chất (SGK Hóa 12 mới)',
    chapter: 'Chương 7: Nguyên tố nhóm kim loại chuyển tiếp và Phức chất',
    chapterCode: 'CH7',
    bookSeries: 'Bộ chuẩn GDPT 2018',
    periods: 2,
    highlightConcept: 'Nguyên tử trung tâm, phối tử (ligand), liên kết phối trí cho-nhận, dạng hình học',
    relatedMoleculeId: 'cu_complex',
    customFocus: 'Nội dung hoàn toàn mới trong chương trình 2018; làm rõ bản chất liên kết cho-nhận orbital d và sự đổi màu tạo phức.',
    rawContent: `BÀI 15: ĐẠI CƯƠNG VỀ PHỨC CHẤT (TRÍCH ĐOẠN SGK HÓA HỌC 12 - GDPT 2018)

I. KHÁI NIỆM VÀ CẤU TẠO PHỨC CHẤT:
- Phức chất (coordination compound) là hợp chất chứa ion phức hoặc phân tử phức, trong đó nguyên tử hay ion trung tâm (thường là cation kim loại chuyển tiếp như Cu2+, Fe2+, Fe3+, Co3+, Ni2+, Ag+, Pt2+) liên kết với một hay nhiều phối tử (ligand) bằng các liên kết cho - nhận (liên kết phối trí).
- Phối tử (ligand): Là các ion (Cl-, OH-, CN-) hoặc phân tử trung hòa (H2O, NH3, CO) có chứa các cặp electron tự do chưa liên kết để đưa vào obitan trống của ion kim loại trung tâm.
  + Phối tử đơn càng (monodentate): Tạo 1 liên kết phối trí với nguyên tử trung tâm (ví dụ: H2O, NH3, Cl-).
  + Phối tử đa càng (polydentate): Có từ 2 vị trí cho electron trở lên (ví dụ: ethylenediamine 'en', EDTA).
- Số phối trí (Coordination number): Là tổng số liên kết sigma giữa phối tử và nguyên tử trung tâm. Các số phối trí phổ biến: 2, 4, 6.
  + Số phối trí 2: Dạng đường thẳng (linear), ví dụ [Ag(NH3)2]+.
  + Số phối trí 4: Dạng tứ diện (tetrahedral) hoặc vuông phẳng (square planar), ví dụ [Cu(NH3)4]2+, [PtCl4]2-.
  + Số phối trí 6: Dạng bát diện (octahedral), ví dụ [Cu(H2O)6]2+, [Fe(H2O)6]3+, [Fe(CN)6]4-.

II. DẤU HIỆU TẠO PHỨC VÀ SỰ THAY ĐỔI MÀU SẮC:
- Trong dung dịch nước, các cation kim loại chuyển tiếp thường tồn tại dưới dạng phức chất aquo với phối tử nước: Cu2+ tồn tại dưới dạng [Cu(H2O)6]2+ làm dung dịch CuSO4 có màu xanh lam nhạt.
- Khi thêm dung dịch ammonia (NH3) vào dung dịch CuSO4:
  1. Ban đầu xuất hiện kết tủa màu xanh nhạt Cu(OH)2.
  2. Khi NH3 dư, kết tủa Cu(OH)2 tan ra tạo thành dung dịch phức chất tetraamminecopper(II) [Cu(NH3)4(H2O)2]2+ có màu xanh lam thẫm (xanh đậm đặc trưng):
     Cu(OH)2(s) + 4NH3(aq) -> [Cu(NH3)4]2+(aq) + 2OH-(aq)
  Sự chuyển đổi phối tử từ H2O sang NH3 làm thay đổi mức năng lượng trường tinh thể obitan d, dẫn đến sự hấp thụ ánh sáng bước sóng khác nhau và tạo màu sắc đặc trưng.`,
  },
];

export const INITIAL_TEXTBOOK_ANALYSIS: TextbookAnalysisResult = {
  id: 'analysis-sample-ester',
  analyzedAt: '11/10/2026, 12:40:00',
  title: 'Bài 1: Ester - Lipid (SGK Hóa 12)',
  bookSeries: 'Kết nối tri thức',
  chapter: 'Chương 1: Ester - Lipid. Xà phòng và chất giặt rửa',
  periods: 2,
  usedModel: 'gemini-3-flash-preview',
  targetCompetencies: {
    chemistryCognition: [
      'Nêu được khái niệm ester, đặc điểm nhóm chức ester (-COO-) và công thức tổng quát của ester no, đơn chức, mạch hở CnH2nO2 (n ≥ 2).',
      'Đọc và viết đúng danh pháp IUPAC 2024 (tên thay thế và tên gốc - chức) của các ester thông dụng: ethyl acetate/ethyl ethanoate, methyl formate, benzyl acetate, isoamyl acetate.',
      'Giải thích được nguyên nhân nhiệt độ sôi của ester thấp hơn alcohol và carboxylic acid tương ứng dựa trên cấu trúc thiếu liên kết hydrogen liên phân tử.',
      'Phân tích được bản chất của phản ứng thủy phân trong môi trường acid (thuận nghịch) và môi trường kiềm (phản ứng xà phòng hóa một chiều).',
    ],
    natureExploration: [
      'Quan sát và giải thích được hiện tượng tách lớp, mùi hương thơm đặc trưng trong thí nghiệm điều chế ethyl acetate từ acetic acid và ethanol.',
      'Rèn luyện kỹ năng thực hành an toàn khi sử dụng hóa chất dễ cháy và H2SO4 đặc làm xúc tác hút nước.',
    ],
    practicalApplication: [
      'Giải thích được ứng dụng thực tiễn của ester làm dung môi hữu cơ (pha sơn, vecni, tách chiết tinh dầu) và làm hương liệu trong công nghiệp thực phẩm, mỹ phẩm.',
      'Đề xuất được phương án bảo quản sản phẩm chứa ester tránh nhiệt độ cao và môi trường acid/base.',
    ],
    qualities: [
      'Tính cẩn thận, chính xác và tuân thủ quy tắc an toàn trong phòng thí nghiệm hóa học.',
      'Tư duy bảo vệ môi trường trong việc xử lý dung môi và phụ phẩm este hóa.',
    ],
  },
  coreKnowledge: {
    keyDefinitions: [
      {
        term: 'Ester đơn chức',
        definition: 'Hợp chất sinh ra khi thay thế nhóm -OH ở nhóm carboxyl (-COOH) của carboxylic acid bằng nhóm -OR\' (R-COO-R\').',
      },
      {
        term: 'Phản ứng xà phòng hóa',
        definition: 'Phản ứng thủy phân ester hoặc lipid trong môi trường kiềm đun nóng tạo muối của carboxylic acid và alcohol, là phản ứng một chiều.',
      },
      {
        term: 'Độ phân cực liên kết ester',
        definition: 'Liên kết C=O và C-O trong nhóm -COO- phân cực, nhưng phân tử không có nguyên tử H linh động gắn với O nên không tạo liên kết hydrogen liên phân tử.',
      },
    ],
    iupacNomenclature: [
      {
        term: 'Ethyl acetate / Ethyl ethanoate',
        formula: 'CH3COOC2H5',
        rules: 'Gốc alkyl R\' là ethyl (C2H5-) + gốc acid ethanoate (CH3COO-). Tên thay thế: Ethyl ethanoate.',
      },
      {
        term: 'Methyl methacrylate',
        formula: 'CH2=C(CH3)COOCH3',
        rules: 'Gốc alkyl là methyl (-CH3) + gốc acid methacrylate (CH2=C(CH3)COO-). Trùng hợp tạo thủy tinh hữu cơ plexiglas.',
      },
      {
        term: 'Benzyl acetate',
        formula: 'CH3COOCH2C6H5',
        rules: 'Gốc hydrocarbon R\' là benzyl (C6H5CH2-) + gốc ethanoate/acetate. Có mùi hoa nhài.',
      },
    ],
    reactionEquations: [
      {
        name: 'Phản ứng điều chế ester hóa',
        equation: 'CH3COOH + C2H5OH <=(H2SO4 đ, t°)=> CH3COOC2H5 + H2O',
        condition: 'Đun hồi lưu nhẹ với H2SO4 đặc làm xúc tác và chất hút nước',
        mechanism: 'Xúc tác H+ gắn vào oxygen carbonyl, tăng tính ái điện tử của C carbonyl; alcohol tấn công ái nhân (nucleophile) tạo trung gian tứ diện, sau đó tách phân tử nước.',
      },
      {
        name: 'Thủy phân trong môi trường kiềm (Xà phòng hóa)',
        equation: 'CH3COOC2H5 + NaOH --(t°)--> CH3COONa + C2H5OH',
        condition: 'Đun nóng nhẹ với dung dịch kiềm',
        mechanism: 'Anion OH- tấn công trực tiếp vào C carbonyl, phản ứng diễn ra một chiều hoàn toàn.',
      },
    ],
    microMacroLink: [
      {
        micro: 'Không có liên kết hydrogen liên phân tử giữa các phân tử ester.',
        macro: 'Nhiệt độ sôi thấp hơn acid và alcohol cùng phân tử khối; dễ bay hơi tạo hương thơm nhận biết.',
        significance: 'Giải thích tại sao ester dùng làm hương liệu nước hoa và dung môi bay hơi nhanh.',
      },
      {
        micro: 'Phần lớn phân tử ester là gốc hydrocarbon kị nước, mật độ khối lượng riêng nhỏ hơn 1 g/mL.',
        macro: 'Nhẹ hơn nước, không tan và nổi lên trên bề mặt dung dịch tạo thành hai lớp rõ rệt.',
        significance: 'Kỹ thuật chiết để tách ester ra khỏi hỗn hợp sau phản ứng.',
      },
    ],
  },
  misconceptions: [
    {
      misconception: 'Học sinh cho rằng phản ứng thủy phân ester trong môi trường acid và kiềm đều là phản ứng thuận nghịch.',
      scientificFact: 'Chỉ có thủy phân trong môi trường acid là phản ứng thuận nghịch. Thủy phân trong môi trường kiềm là phản ứng một chiều do muối carboxylate sinh ra không có khả năng phản ứng ngược lại với alcohol.',
      pedagogicalRemedy: 'Cho học sinh so sánh 2 ống nghiệm sau phản ứng: ống có NaOH dung dịch đồng nhất hoàn toàn (một chiều), ống có H2SO4 vẫn còn mùi este và phân lớp (thuận nghịch).',
    },
    {
      misconception: 'Học sinh thường nhầm lẫn gốc benzyl (C6H5CH2-) với gốc phenyl (C6H5-), dẫn đến gọi tên sai benzyl acetate thành phenyl acetate.',
      scientificFact: 'Benzyl acetate có cấu tạo CH3COOCH2C6H5 (thủy phân ra benzyl alcohol), trong khi phenyl acetate CH3COOC6H5 khi thủy phân trong kiềm tác dụng với 2 NaOH tạo ra 2 muối.',
      pedagogicalRemedy: 'Vẽ rõ cấu trúc mạch vòng có nhóm -CH2- cầu nối và đối chiếu phản ứng với dung dịch NaOH tỉ lệ 1:1 vs 1:2.',
    },
  ],
  digitalLabRecommendations: [
    {
      experimentTitle: 'Điều chế Ethyl acetate (Thí nghiệm hồi lưu trong ống nghiệm)',
      safetyNotes: 'H2SO4 đặc rất háo nước và ăn mòn da; ethanol và ethyl acetate dễ cháy, cần đun cách thủy cách xa ngọn lửa trực tiếp.',
      observation: 'Chất lỏng tách thành 2 lớp, lớp trên không màu có mùi thơm táo/chuối đặc trưng.',
      relatedMoleculeId: 'ethyl_acetate',
      simulationHint: 'Quan sát mô hình 3D phân tử Ethyl acetate trong Thư viện 3D để thấy góc liên kết và obitan p tự do trên oxygen.',
    },
  ],
  lessonPlan5512: {
    title: 'Kế hoạch dạy học Bài 1: Ester - Cấu tạo, Tính chất và Ứng dụng',
    competencies: [
      'Năng lực nhận thức hóa học: Trình bày được khái niệm, danh pháp IUPAC 2024, tính chất vật lý và tính chất hóa học của ester.',
      'Năng lực tìm hiểu thế giới tự nhiên: Thực hiện và giải thích thí nghiệm este hóa và xà phòng hóa.',
      'Năng lực vận dụng: Đề xuất giải pháp sử dụng ester làm dung môi an toàn và hương liệu trong đời sống.',
    ],
    stages: [
      {
        name: 'Hoạt động 1: Mở đầu / Khởi động (7 phút)',
        time: '7 phút',
        activity: 'Giáo viên tổ chức trò chơi "Giải mã hương thơm": Chiếu hình ảnh các loại quả (chuối chín, táo tây, dứa, hoa nhài) và đặt câu hỏi gợi mở về hợp chất hóa học tạo nên hương vị tự nhiên. Học sinh quét mã tham gia Live Quiz trả lời nhanh.',
        pedagogicalGoal: 'Kích thích tò mò khoa học, liên hệ đời sống thực tế với nhóm chức ester.',
      },
      {
        name: 'Hoạt động 2: Hình thành kiến thức mới (38 phút)',
        time: '38 phút',
        activity: 'Học sinh thảo luận nhóm theo phiếu học tập số hóa kết hợp tương tác với Mô hình 3D phân tử Ethyl acetate: (1) Phân tích đặc điểm nhóm chức -COO-; (2) Viết phương trình thủy phân acid và base; (3) So sánh bản chất 1 chiều vs thuận nghịch.',
        pedagogicalGoal: 'Phát triển tư duy vi mô - vĩ mô, khắc sâu cơ chế chuyển dịch electron ái nhân.',
      },
      {
        name: 'Hoạt động 3: Luyện tập & Đánh giá nhanh (30 phút)',
        time: '30 phút',
        activity: 'Giáo viên phát bộ 4 câu hỏi trắc nghiệm tương ứng 4 mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao). Học sinh giải đáp, giáo viên chốt đáp án và giải thích các bẫy thường gặp.',
        pedagogicalGoal: 'Củng cố kiến thức, phát hiện và sửa chữa kịp thời các quan niệm sai lầm.',
      },
      {
        name: 'Hoạt động 4: Vận dụng & Mở rộng (15 phút)',
        time: '15 phút',
        activity: 'Nhiệm vụ dự án STEM: "Tái chế dầu ăn thải thành xà phòng và nước rửa chén sinh học tại gia đình". Học sinh lập sơ đồ quy trình công nghệ và phân tích vai trò của phản ứng xà phòng hóa.',
        pedagogicalGoal: 'Giáo dục bảo vệ môi trường, phát triển kỹ năng ứng dụng tri thức vào đời sống.',
      },
    ],
    digitalMaterials: [
      'Mô hình 3D tương tác Ball-and-Stick phân tử Ethyl acetate',
      'Video thí nghiệm điều chế ethyl acetate có ngưng tụ',
      'Hệ thống trắc nghiệm Live Quiz ChemEdu',
    ],
  },
  assessmentQuestions: [
    {
      id: 'sgk-q1',
      level: 'Nhận biết',
      question: 'Theo danh pháp IUPAC 2024, ester có công thức cấu tạo thu gọn CH3COOC2H5 có tên gọi là gì?',
      options: ['Methyl acetate', 'Ethyl ethanoate', 'Ethyl formate', 'Propyl acetate'],
      correctIndex: 1,
      explanation: 'Gốc alkyl R\' là ethyl (-C2H5) và gốc carboxylate là ethanoate (CH3COO-), do đó tên thay thế IUPAC là Ethyl ethanoate (hoặc ethyl acetate).',
      chapter: 'CH1',
    },
    {
      id: 'sgk-q2',
      level: 'Thông hiểu',
      question: 'Vì sao ester có nhiệt độ sôi thấp hơn nhiều so với carboxylic acid và alcohol có cùng khối lượng mol phân tử?',
      options: [
        'Vì phân tử ester có khối lượng phân tử quá nhỏ',
        'Vì giữa các phân tử ester không tạo được liên kết hydrogen liên phân tử',
        'Vì ester không tan được trong nước',
        'Vì liên kết C=O trong ester có độ phân cực kém hơn'
      ],
      correctIndex: 1,
      explanation: 'Trong phân tử ester không còn nguyên tử hydrogen linh động liên kết trực tiếp với nguyên tử oxygen, do đó giữa các phân tử ester không thể tạo liên kết hydrogen liên phân tử, làm nhiệt độ sôi thấp hơn acid và alcohol.',
      chapter: 'CH1',
    },
    {
      id: 'sgk-q3',
      level: 'Vận dụng',
      question: 'Trong phản ứng ester hóa giữa CH3COOH và C2H5OH, vai trò chính của dung dịch H2SO4 đặc là gì?',
      options: [
        'Vừa làm chất xúc tác cho phản ứng, vừa hút nước để chuyển dịch cân bằng hóa học sang chiều thuận',
        'Chỉ đóng vai trò làm môi trường hòa tan các chất phản ứng',
        'Oxi hóa alcohol thành aldehyde để kích hoạt phản ứng',
        'Làm tăng nhiệt độ sôi của hỗn hợp phản ứng'
      ],
      correctIndex: 0,
      explanation: 'H2SO4 đặc cung cấp proton H+ làm xúc tác cho cơ chế thế ái nhân, đồng thời có tính háo nước mạnh giúp hấp thụ H2O sinh ra, theo nguyên lý Le Chatelier làm cân bằng dịch chuyển sang chiều tạo ester.',
      chapter: 'CH1',
    },
    {
      id: 'sgk-q4',
      level: 'Vận dụng cao',
      question: 'Thủy phân hoàn toàn 0,1 mol ester X đơn chức, mạch hở bằng 150 mL dung dịch NaOH 1M vừa đủ, cô cạn dung dịch sau phản ứng thu được 13,6 gam một muối duy nhất và chất hữu cơ Y có khả năng tráng bạc. Tên gọi của X là gì?',
      options: [
        'Vinyl formate',
        'Vinyl acetate',
        'Methyl acrylate',
        'Phenyl acetate'
      ],
      correctIndex: 1,
      explanation: 'Muối có khối lượng mol M = 13,6 / 0,1 = 136 g/mol -> không phù hợp nếu n_muối = 0,1. Thực tế tỷ lệ n_NaOH = 0,15 mol / 0,1 mol ester = 1,5 chứng tỏ có hỗn hợp hoặc ester của phenol/enol. Nếu X là CH3COOCH=CH2 (Vinyl acetate), thủy phân tạo CH3COONa (8,2g) và CH3CHO tráng bạc. Khi phân tích đề thi THPT, câu hỏi phân loại đòi hỏi lập luận giải phóng chất Y là aldehyde đồng thời xác định công thức cấu tạo dựa trên tính chất tráng bạc.',
      chapter: 'CH1',
    },
  ],
  summaryMarkdown: `# BÁO CÁO PHÂN TÍCH BÀI HỌC SGK: ESTER - LIPID (GDPT 2018)

## 1. Yêu cầu cần đạt cốt lõi:
- Nắm vững định nghĩa nhóm chức ester (-COO-) và danh pháp IUPAC 2024.
- Giải thích được nhiệt độ sôi, độ tan dựa trên liên kết hydrogen vi mô.
- Phân biệt bản chất thủy phân môi trường acid (thuận nghịch) vs kiềm (xà phòng hóa một chiều).

## 2. Điểm nghẽn sư phạm cần lưu ý:
- Học sinh hay nhầm lẫn tính thuận nghịch của phản ứng xà phòng hóa.
- Nhầm lẫn tên gốc benzyl và phenyl dẫn đến viết sai phương trình phản ứng với kiềm.

## 3. Liên kết thực hành:
- Thí nghiệm điều chế ethyl acetate đun cách thủy hồi lưu.
- Trực quan hóa mô hình 3D phân tử ethyl acetate trong phân hệ Thư viện 3D.`,
};
