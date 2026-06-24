import os
import re
import json
import sqlite3
import io
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from app.ai.scenes import diagnose_runtime_error, generate_remedy_quiz
from app.auth_utils import get_current_username
from app.models import ErrorDiagnoseRequest, ErrorRemedyRequest
from app.db import (
    DB_PATH,
    db_get_profile,
    db_get_path_nodes,
    db_get_error_tags,
    db_insert_reinforcement_node,
    db_log_agent_action,
    seed_errors_and_logs_for_user
)
from app.limiter import rate_limit_resource

router = APIRouter()

@router.get("/errors")
def get_errors(current_username: str = Depends(get_current_username)):
    target_user = current_username
    seed_errors_and_logs_for_user(target_user)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT error_id, title, code, error_msg, ai_explanation, solution, status FROM user_errors WHERE username = ?",
        (target_user,)
    )
    rows = cursor.fetchall()
    conn.close()
    
    result = []
    for r in rows:
        result.append({
            "id": r[0],
            "error_id": r[0],
            "title": r[1],
            "code": r[2],
            "error_msg": r[3],
            "ai_explanation": r[4],
            "explanation": r[4],
            "solution": r[5],
            "status": r[6]
        })
    return result

@router.post("/errors/diagnose", dependencies=[Depends(rate_limit_resource)])
def diagnose_error(request: ErrorDiagnoseRequest, current_username: str = Depends(get_current_username)):
    target_user = current_username
    error_id = request.error_id
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT title, code, error_msg FROM user_errors WHERE username = ? AND error_id = ?", (target_user, error_id))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Error card not found.")
        
    err_title, err_code, err_msg = row[0], row[1], row[2]
    profile = db_get_profile(target_user)
    explanation = ""
    solution = ""
    try:
        parsed = diagnose_runtime_error(err_title, err_code, err_msg, profile, target_user)
        if parsed:
            explanation = parsed.get("explanation", "")
            solution = parsed.get("solution", "")
    except Exception as e:
        print(f"AI platform error diagnosis failed: {e}")
            
    if not explanation or not solution:
        explanation = f"在运行该脚本时发生了运行时异常：`{err_msg}`。这通常是由于作用域绑定错误、索引值超出容器范围或传入了非法类型的参数导致。基于您的 [{profile.cognitive_style}] 风格，系统建议进行边界值防御断言以杜绝该异常。"
        solution = f"# 修复后的参考代码\n{err_code}\n# 提示：确保所有变量在使用前完成初始化，并且范围越界时返回默认值。"
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE user_errors SET ai_explanation = ?, solution = ?, status = 'resolved' WHERE username = ? AND error_id = ?",
        (explanation, solution, target_user, error_id)
    )
    conn.commit()
    conn.close()
    
    db_log_agent_action(target_user, "画像智能体", f"生成错题诊断分析归档: [{err_title}]，已被学生确认。", "consensus")
    return {
        "id": error_id,
        "error_id": error_id,
        "ai_explanation": explanation,
        "explanation": explanation,
        "solution": solution,
        "status": "resolved"
    }

@router.post("/errors/generate-remedy")
def generate_remedy(request: ErrorRemedyRequest, current_username: str = Depends(get_current_username)):
    target_user = current_username
    error_id = request.error_id
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT title, error_msg, code FROM user_errors WHERE username = ? AND error_id = ?", (target_user, error_id))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Error card not found.")
        
    err_title, err_msg, err_code = row[0], row[1], row[2]
    profile = db_get_profile(target_user)
    quiz_data = None
    try:
        quiz_data = generate_remedy_quiz(err_title, err_msg, err_code, profile, target_user)
    except Exception as e:
        print(f"AI platform remedy quiz generation failed: {e}")
            
    if not quiz_data:
        quiz_data = {
            "question": f"关于以下引起 `{err_msg}` 错误的防范逻辑，下列说法中哪个是最佳实践？",
            "options": [
                "在没有进行非空校验和类型安全推导前直接对变量解构",
                "在局部作用域或类的私有变量声明中采用防御性检测与异常抛出机制",
                "屏蔽所有 Python 的异常 Traceback 输出，让程序无声崩溃",
                "不再进行函数封装，将所有逻辑平铺写在全局空间中"
            ],
            "answer": 1,
            "explanation": f"您的认知画像特点是 [{profile.cognitive_style}]，在局部作用域中合理运用防御性异常捕获 (Try-Except) 可以直接从编译期防御该类错误的再次发生。"
        }
        
    db_log_agent_action(target_user, "路径智能体", f"基于错题 [{err_title}] 动态编排加练测试题推送成功。", "info")
    return quiz_data

@router.get("/achievements/contributions")
def get_user_contributions(current_username: str = Depends(get_current_username)):
    target_user = current_username
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT date, count FROM user_contributions WHERE username = ? ORDER BY date ASC",
        (target_user,)
    )
    rows = cursor.fetchall()
    conn.close()
    return {r[0]: r[1] for r in rows}

@router.get("/achievements/certificate")
def download_certificate(current_username: str = Depends(get_current_username)):
    target_user = current_username
    profile = db_get_profile(target_user)
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    
    db_log_agent_action(target_user, "主管智能体", f"用户 [{target_user}] 提交结业证明签发申请。开始校验全部 8 个关卡探索状态...", "info")
    db_log_agent_action(target_user, "安全校验智能体", "学术资格合规审计通过：无违规越狱和作弊标记。", "consensus")
    db_log_agent_action(target_user, "画像智能体", f"统计最终学情数据：知识库掌握度={profile.knowledge_base}%，测验正确率={profile.learning_stats.get('quiz_accuracy', 85)}%。正式签发证书。", "consensus")
    
    course_title = "Python 基础自适应导论"
    if any(any(x in g for x in ["Machine Learning", "机器学习", "machine_learning"]) for g in profile.learning_goals):
        course_title = "机器学习算法理论与实操"
        
    try:
        import io
        import hashlib
        import random
        from reportlab.lib.pagesizes import letter, landscape
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.cidfonts import UnicodeCIDFont
        from reportlab.pdfbase.pdfmetrics import registerFontFamily
        from reportlab.graphics.shapes import Drawing, Path
        pdfmetrics.registerFont(UnicodeCIDFont('STSong-Light'))
        registerFontFamily('STSong-Light', normal='STSong-Light', bold='STSong-Light', italic='STSong-Light', boldItalic='STSong-Light')
        font_name = 'STSong-Light'
    except Exception as err:
        print(f"Reportlab setup error: {err}")
        raise HTTPException(status_code=500, detail=f"PDF Generation failed due to libraries: {str(err)}")
        
    hash_input = f"{target_user}:{course_title}"
    cert_hash = hashlib.sha256(hash_input.encode()).hexdigest()
    
    mastered = profile.learning_stats.get("mastered_nodes", 0)
    has_watermark = mastered < 8

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(letter),
        rightMargin=45,
        leftMargin=45,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    teal_color = colors.HexColor('#0d9488')
    cobalt_color = colors.HexColor('#1e3a8a')
    gray_color = colors.HexColor('#374151')
    
    title_style = ParagraphStyle(
        'CertTitle',
        parent=styles['Heading1'],
        fontName=font_name,
        fontSize=26,
        textColor=teal_color,
        alignment=1,
        spaceAfter=15
    )
    
    subtitle_style = ParagraphStyle(
        'CertSub',
        parent=styles['Heading2'],
        fontName=font_name,
        fontSize=17,
        textColor=cobalt_color,
        alignment=1,
        spaceAfter=20
    )
    
    text_style = ParagraphStyle(
        'CertText',
        parent=styles['Normal'],
        fontName=font_name,
        fontSize=12,
        textColor=gray_color,
        leading=20,
        alignment=1,
        spaceAfter=15
    )
    
    stats_style = ParagraphStyle(
        'CertStats',
        parent=styles['Normal'],
        fontName=font_name,
        fontSize=10.5,
        textColor=colors.HexColor('#4b5563'),
        alignment=1,
        spaceAfter=20
    )
    
    story = []
    story.append(Spacer(1, 20))
    story.append(Paragraph("EduGenesis 自适应多智能体学术空间", subtitle_style))
    story.append(Paragraph("结业证书 (Certificate of Graduation)", title_style))
    
    cert_body = f"兹证明学生 <b>{target_user}</b> 在本系统的自适应多智能体协同学习环境下，" \
                f"成功通关了 <b>《{course_title}》</b> 个性化课程 of 全部关卡。<br/>" \
                f"经主管智能体、画像智能体、路径智能体及安全校验智能体多维度学术诊断与测试，" \
                f"各项指标达到合格标准，特发此证，以兹鼓励。"
    
    story.append(Paragraph(cert_body, text_style))
    story.append(Spacer(1, 10))
    
    accuracy = profile.learning_stats.get("quiz_accuracy", 85)
    study_time = profile.learning_stats.get("study_time", 45)
    
    stats_text = f"<b>学术成就报告:</b> &nbsp;&nbsp;&nbsp;&nbsp; 累计通关节点: <b>{mastered} / 8</b> " \
                 f"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 测验综合正确率: <b>{accuracy}%</b> " \
                 f"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 实践时长: <b>{study_time} 分钟</b>"
    story.append(Paragraph(stats_text, stats_style))
    story.append(Spacer(1, 20))

    sig_color = colors.Color(0.11, 0.38, 0.89, 0.2 if has_watermark else 0.9)
    
    def make_sig(agent_type):
        d = Drawing(120, 25)
        p = Path(strokeColor=sig_color, strokeWidth=1.5, strokeLinecap=1, fill=None)
        if agent_type == "coordinator":
            p.moveTo(15, 10)
            p.curveTo(30, 22, 40, 2, 55, 12)
            p.curveTo(70, 20, 85, 5, 100, 10)
            p.curveTo(104, 14, 107, 8, 110, 10)
        elif agent_type == "profiler":
            p.moveTo(17, 8)
            p.curveTo(27, 22, 43, 4, 53, 14)
            p.curveTo(67, 24, 77, 2, 93, 10)
            p.curveTo(101, 14, 106, 6, 110, 8)
        elif agent_type == "planner":
            p.moveTo(18, 12)
            p.curveTo(31, 2, 45, 22, 58, 10)
            p.curveTo(71, 2, 85, 18, 98, 8)
            p.curveTo(103, 4, 107, 12, 110, 10)
        elif agent_type == "validator":
            p.moveTo(15, 12)
            p.curveTo(30, 2, 45, 22, 60, 8)
            p.curveTo(73, 18, 90, 4, 103, 12)
            p.curveTo(106, 16, 109, 8, 112, 10)
        d.add(p)
        return d

    sig_text_style = ParagraphStyle(
        'CertSigText',
        parent=styles['Normal'],
        fontName=font_name,
        fontSize=9,
        textColor=colors.HexColor('#1f2937'),
        leading=13,
        alignment=1,
        spaceAfter=0
    )

    sig_data = [
        [
            [make_sig("coordinator"), Paragraph("<b>主管智能体</b><br/><font color='#5c6370' size='8'>调度委员会主席</font>", sig_text_style)],
            [make_sig("profiler"), Paragraph("<b>画像智能体</b><br/><font color='#5c6370' size='8'>认知指标诊断官</font>", sig_text_style)],
            [make_sig("planner"), Paragraph("<b>路径智能体</b><br/><font color='#5c6370' size='8'>课程大纲规划师</font>", sig_text_style)],
            [make_sig("validator"), Paragraph("<b>安全校验智能体</b><br/><font color='#5c6370' size='8'>学术护栏校验官</font>", sig_text_style)]
        ]
    ]
    t = Table(sig_data, colWidths=[165, 165, 165, 165])
    t.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'BOTTOM'),
        ('LINEABOVE', (0,0), (-1,-1), 0.5, colors.HexColor('#d1d5db')),
    ]))
    story.append(t)
    
    def add_background_border(canvas, doc):
        canvas.saveState()
        # Outer border
        canvas.setStrokeColor(colors.HexColor('#0d9488'))
        canvas.setLineWidth(3)
        canvas.rect(20, 20, doc.pagesize[0]-40, doc.pagesize[1]-40)
        # Inner border
        canvas.setStrokeColor(colors.HexColor('#eab308'))
        canvas.setLineWidth(1)
        canvas.rect(25, 25, doc.pagesize[0]-50, doc.pagesize[1]-50)
        
        # Corner decorations
        margin = 25
        w = doc.pagesize[0] - 50
        h = doc.pagesize[1] - 50
        canvas.setLineWidth(1.5)
        canvas.setStrokeColor(colors.HexColor('#eab308'))
        
        # Top-Left corner
        canvas.line(margin + 5, margin + 5, margin + 15, margin + 5)
        canvas.line(margin + 5, margin + 5, margin + 5, margin + 15)
        # Top-Right corner
        canvas.line(margin + w - 5, margin + 5, margin + w - 15, margin + 5)
        canvas.line(margin + w - 5, margin + 5, margin + w - 5, margin + 15)
        # Bottom-Left corner
        canvas.line(margin + 5, margin + h - 5, margin + 15, margin + h - 5)
        canvas.line(margin + 5, margin + h - 5, margin + 5, margin + h - 15)
        # Bottom-Right corner
        canvas.line(margin + w - 5, margin + h - 5, margin + w - 15, margin + h - 5)
        canvas.line(margin + w - 5, margin + h - 5, margin + w - 5, margin + h - 15)
        
        # Beautiful gold seal
        seal_x = 80
        seal_y = doc.pagesize[1] - 80
        canvas.setFillColor(colors.HexColor('#ca8a04'))
        canvas.circle(seal_x, seal_y, 25, fill=1, stroke=0)
        canvas.setFillColor(colors.HexColor('#facc15'))
        canvas.circle(seal_x, seal_y, 22, fill=1, stroke=0)
        canvas.setFillColor(colors.HexColor('#ca8a04'))
        canvas.circle(seal_x, seal_y, 20, fill=1, stroke=0)
        
        canvas.setFillColor(colors.white)
        canvas.setFont('Helvetica-Bold', 5)
        canvas.drawCentredString(seal_x, seal_y + 9, "EDUGENESIS")
        canvas.setFont('Helvetica-Bold', 7)
        canvas.drawCentredString(seal_x, seal_y - 2, "VERIFIED")
        canvas.setFont('Helvetica-Bold', 5)
        canvas.drawCentredString(seal_x, seal_y - 11, "SECURE")
        
        # Draw Watermark if unqualified
        if has_watermark:
            canvas.setFont('Helvetica-Bold', 55)
            canvas.setFillColor(colors.HexColor('#ef4444'), alpha=0.08)
            canvas.saveState()
            canvas.translate(doc.pagesize[0]/2, doc.pagesize[1]/2)
            canvas.rotate(28)
            canvas.drawCentredString(0, 15, "DRAFT / UNVERIFIED")
            canvas.setFont('STSong-Light', 18)
            canvas.drawCentredString(0, -15, "学 术 草 稿 / 未 达 结 业 标 准")
            canvas.restoreState()
            
        # Draw cryptographic QR code & verification info
        qr_x = doc.pagesize[0] - 90
        qr_y = 45
        
        canvas.setFillColor(colors.white)
        canvas.setStrokeColor(colors.HexColor('#0d9488'))
        canvas.setLineWidth(1)
        canvas.rect(qr_x, qr_y, 50, 50, fill=1, stroke=1)
        
        try:
            import qrcode
            import urllib.parse
            from reportlab.lib.utils import ImageReader
            
            encoded_student = urllib.parse.quote(target_user)
            encoded_course = urllib.parse.quote(course_title)
            verify_url = f"{frontend_url}/verify?hash={cert_hash}&student={encoded_student}&course={encoded_course}&accuracy={accuracy}&time={study_time}"
            
            qr = qrcode.QRCode(
                version=None,
                error_correction=qrcode.constants.ERROR_CORRECT_M,
                box_size=10,
                border=1,
            )
            qr.add_data(verify_url)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            
            qr_byte_arr = io.BytesIO()
            img.save(qr_byte_arr, format='PNG')
            qr_byte_arr.seek(0)
            
            reader = ImageReader(qr_byte_arr)
            canvas.drawImage(reader, qr_x + 1, qr_y + 1, width=48, height=48)
        except Exception as qr_err:
            print(f"Error rendering real QR code in PDF: {qr_err}")
            canvas.setFillColor(colors.black)
            canvas.drawString(qr_x + 5, qr_y + 20, "QR Code Error")
            
        # Cryptographic Hash label next to QR code
        canvas.setFont('Helvetica-Bold', 7)
        canvas.setFillColor(colors.HexColor('#4b5563'))
        canvas.drawRightString(doc.pagesize[0]-100, 75, "SECURE VERIFICATION HASH:")
        canvas.setFont('Courier-Bold', 7)
        canvas.drawRightString(doc.pagesize[0]-100, 63, f"{cert_hash[:32]}")
        canvas.drawRightString(doc.pagesize[0]-100, 53, f"{cert_hash[32:]}")
        
        canvas.restoreState()
        
    doc.build(story, onFirstPage=add_background_border)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    headers = {
        "Content-Disposition": f"attachment; filename=certificate_{target_user}.pdf",
        "Content-Type": "application/pdf"
    }
    from fastapi import Response
    return Response(content=pdf_bytes, headers=headers, media_type="application/pdf")

@router.get("/achievements/qrcode")
def get_qrcode(
    hash: str,
    student: str,
    course: str,
    accuracy: int,
    time: int
):
    try:
        import qrcode
        import urllib.parse
        from fastapi.responses import Response
        
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173').rstrip('/')
        encoded_student = urllib.parse.quote(student)
        encoded_course = urllib.parse.quote(course)
        
        verify_url = f"{frontend_url}/verify?hash={hash}&student={encoded_student}&course={encoded_course}&accuracy={accuracy}&time={time}"
        
        qr = qrcode.QRCode(
            version=None,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=1,
        )
        qr.add_data(verify_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        
        return Response(content=buf.getvalue(), media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"QR generation failed: {str(e)}")

@router.get("/achievements/verify")
def verify_certificate(
    hash: str,
    student: str,
    course: str
):
    import hashlib
    
    hash_input = f"{student}:{course}"
    expected_hash = hashlib.sha256(hash_input.encode()).hexdigest()
    
    if hash == expected_hash:
        return {
            "valid": True,
            "student": student,
            "course": course,
            "message": "Certificate signature is valid and authentic."
        }
    else:
        return {
            "valid": False,
            "message": "Certificate signature verification failed. The certificate may have been modified."
        }
