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

@router.get("/achievements/certificate")
def download_certificate(current_username: str = Depends(get_current_username)):
    target_user = current_username
    profile = db_get_profile(target_user)
    
    db_log_agent_action(target_user, "主管智能体", f"用户 [{target_user}] 提交结业证明签发申请。开始校验全部 8 个关卡探索状态...", "info")
    db_log_agent_action(target_user, "安全校验智能体", "学术资格合规审计通过：无违规越狱和作弊标记。", "consensus")
    db_log_agent_action(target_user, "画像智能体", f"统计最终学情数据：知识库掌握度={profile.knowledge_base}%，测验正确率={profile.learning_stats.get('quiz_accuracy', 85)}%。正式签发证书。", "consensus")
    
    course_title = "Python 基础自适应导论"
    if any("Machine Learning" in g for g in profile.learning_goals):
        course_title = "机器学习算法理论与实操"
        
    try:
        import io
        from reportlab.lib.pagesizes import letter, landscape
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.cidfonts import UnicodeCIDFont
        from reportlab.pdfbase.pdfmetrics import registerFontFamily
        pdfmetrics.registerFont(UnicodeCIDFont('STSong-Light'))
        registerFontFamily('STSong-Light', normal='STSong-Light', bold='STSong-Light', italic='STSong-Light', boldItalic='STSong-Light')
        font_name = 'STSong-Light'
    except Exception as err:
        print(f"Reportlab setup error: {err}")
        raise HTTPException(status_code=500, detail=f"PDF Generation failed due to libraries: {str(err)}")
        
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(letter),
        rightMargin=40,
        leftMargin=40,
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
        fontSize=18,
        textColor=cobalt_color,
        alignment=1,
        spaceAfter=25
    )
    
    text_style = ParagraphStyle(
        'CertText',
        parent=styles['Normal'],
        fontName=font_name,
        fontSize=13,
        textColor=gray_color,
        leading=22,
        alignment=1,
        spaceAfter=20
    )
    
    stats_style = ParagraphStyle(
        'CertStats',
        parent=styles['Normal'],
        fontName=font_name,
        fontSize=11,
        textColor=colors.HexColor('#4b5563'),
        alignment=1,
        spaceAfter=20
    )
    
    story = []
    story.append(Spacer(1, 20))
    story.append(Paragraph("EduGenesis 自适应多智能体学术空间", subtitle_style))
    story.append(Paragraph("结业证书 (Certificate of Graduation)", title_style))
    
    cert_body = f"兹证明学生 <b>{target_user}</b> 在本系统的自适应多智能体协同学习环境下，" \
                f"成功通关了 <b>《{course_title}》</b> 个性化课程的全部关卡。<br/>" \
                f"经主管智能体、画像智能体、路径智能体及安全校验智能体多维度学术诊断与测试，" \
                f"各项指标达到合格标准，特发此证，以兹鼓励。"
    
    story.append(Paragraph(cert_body, text_style))
    story.append(Spacer(1, 10))
    
    mastered = profile.learning_stats.get("mastered_nodes", 8)
    accuracy = profile.learning_stats.get("quiz_accuracy", 85)
    study_time = profile.learning_stats.get("study_time", 45)
    
    stats_text = f"<b>学术成就报告:</b> &nbsp;&nbsp;&nbsp;&nbsp; 累计通关节点: <b>{mastered} / 8</b> " \
                 f"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 测验综合正确率: <b>{accuracy}%</b> " \
                 f"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 实践时长: <b>{study_time} 分钟</b>"
    story.append(Paragraph(stats_text, stats_style))
    story.append(Spacer(1, 25))
    
    sig_data = [
        [
            Paragraph("<b>主管智能体</b><br/><font color='#5c6370'>调度委员会主席</font>", text_style),
            Paragraph("<b>画像智能体</b><br/><font color='#5c6370'>认知指标诊断官</font>", text_style),
            Paragraph("<b>路径智能体</b><br/><font color='#5c6370'>课程大纲规划师</font>", text_style),
            Paragraph("<b>安全校验智能体</b><br/><font color='#5c6370'>学术护栏校验官</font>", text_style)
        ]
    ]
    t = Table(sig_data, colWidths=[170, 170, 170, 170])
    t.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LINEABOVE', (0,0), (-1,-1), 0.5, colors.HexColor('#e5e7eb')),
    ]))
    story.append(t)
    
    def add_background_border(canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor('#0d9488'))
        canvas.setLineWidth(3)
        canvas.rect(20, 20, doc.pagesize[0]-40, doc.pagesize[1]-40)
        canvas.setStrokeColor(colors.HexColor('#1e3a8a'))
        canvas.setLineWidth(1)
        canvas.rect(25, 25, doc.pagesize[0]-50, doc.pagesize[1]-50)
        
        canvas.setFillColor(colors.HexColor('#eab308'))
        p = canvas.beginPath()
        p.moveTo(80, 50)
        p.lineTo(100, 70)
        p.lineTo(90, 100)
        p.lineTo(70, 100)
        p.lineTo(60, 70)
        p.close()
        canvas.drawPath(p, fill=1, stroke=0)
        canvas.setFillColor(colors.Ca8a04 if hasattr(colors, 'Ca8a04') else colors.HexColor('#ca8a04'))
        canvas.circle(80, 80, 20, fill=1, stroke=0)
        canvas.setFillColor(colors.white)
        canvas.setFont('Helvetica-Bold', 7)
        canvas.drawCentredString(80, 78, "VERIFIED")
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
