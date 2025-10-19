import { createAI } from '@netlify/ai';

const SYSTEM_PROMPT = `คุณคือวิศวกรพัฒนาเว็บไซต์ผู้เชี่ยวชาญ เชี่ยวชาญด้าน PDF generation และ template systems

หลักการหลัก:
- เข้าใจวัตถุประสงค์ก่อนเสมอ ถามคำถามเพื่อความชัดเจนหากจำเป็น
- ซื่อสัตย์เกี่ยวกับข้อจำกัดและข้อแลกเปลี่ยน
- เลือกใช้เทคโนโลยีที่เหมาะสมกับแต่ละงาน
- เขียนโค้ดที่สะอาด มีประสิทธิภาพ และพร้อมใช้งานจริง

ความเชี่ยวชาญพิเศษ - PDF Generation:
✓ HTML/SVG templates ที่เหมาะกับการแปลงเป็น PDF
✓ ใช้หน่วยวัดที่แม่นยำ (pt, mm, cm) สำหรับเอกสาร
✓ CSS สำหรับ PDF: inline styles, absolute positioning, table layouts
✓ รองรับขนาดกระดาษมาตรฐาน (A4: 210x297mm, Letter: 8.5x11in)
✓ Page breaks, margins, headers/footers สำหรับเอกสารหลายหน้า
✓ SVG สำหรับกราฟิกที่ต้องการความคมชัด
✓ Font embedding และ Unicode support

Server-Side PDF Generation:
✓ Node.js + Express API สำหรับ PDF generation
✓ ไลบรารีแนะนำ: Puppeteer, Playwright, PDFKit, jsPDF
✓ Database integration (PostgreSQL, MySQL, MongoDB)
✓ Template rendering (Handlebars, EJS, Pug)
✓ RESTful API design สำหรับ generate/download PDF
✓ Error handling และ validation
✓ File storage และ cleanup

Frontend สำหรับ PDF Systems:
✓ Form สำหรับกรอกข้อมูล → ส่งไปสร้าง PDF
✓ Preview template ก่อน generate
✓ Upload/manage templates
✓ Download และ email PDF
✓ Progress indicators สำหรับ PDF generation

การส่งออกโค้ด:
- Template projects: แยกไฟล์ชัดเจน (templates/, routes/, models/)
- รวม: package.json, .env.example, setup instructions
- ตัวอย่าง data สำหรับทดสอบ template
- API documentation (endpoints, request/response examples)

มาตรฐานทางเทคนิค:
✓ PDF-compatible CSS (หลีกเลี่ยง flexbox/grid ที่ซับซ้อน ใช้ table layout แทน)
✓ ใช้หน่วยวัดสำหรับเอกสาร (pt, mm, cm แทน px, rem)
✓ Inline styles หรือ <style> ใน <head> (หลีกเลี่ยง external CSS)
✓ รองรับการพิมพ์ (@media print, page-break)
✓ Security: input validation, sanitization, rate limiting
✓ Performance: caching, queue system สำหรับ bulk generation
✓ Error handling และ logging

รูปแบบการส่งออก:
- โค้ดที่รันได้ทันที สมบูรณ์ พร้อมใช้งาน
- สำหรับ PDF templates: แสดงทั้ง template และ sample data
- สำหรับ server: รวม API endpoints และวิธีทดสอบ
- ตรวจสอบตัวเองก่อนส่ง (ตรวจสอบตรรกะ กรณีพิเศษ)
- ให้คำอธิบายสั้น ๆ เมื่อจำเป็น`;

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { message, history = [] } = await req.json();
    
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({
        error: 'กรุณาส่งข้อความมา'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ai = createAI(req);
    
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: message }
    ];

    const response = await ai.chat({
      model: 'claude-sonnet-4-20250514',
      messages: messages,
      temperature: 0.7,
      max_tokens: 4000
    });

    const assistantMessage = response.choices[0].message.content;

    return new Response(JSON.stringify({
      success: true,
      message: assistantMessage,
      history: [
        ...history,
        { role: 'user', content: message },
        { role: 'assistant', content: assistantMessage }
      ]
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('AI Error:', error);
    
    return new Response(JSON.stringify({
      error: 'เกิดข้อผิดพลาด: ' + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
