import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

def generate_credentials_pdf(output_paths):
    for out_path in output_paths:
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        doc = SimpleDocTemplate(
            out_path,
            pagesize=letter,
            leftMargin=36,
            rightMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Custom typography styles
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#1E3A8A'),
            alignment=TA_LEFT
        )
        subtitle_style = ParagraphStyle(
            'DocSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#6B7280'),
            alignment=TA_LEFT
        )
        section_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=16,
            textColor=colors.HexColor('#111827'),
            spaceBefore=14,
            spaceAfter=6
        )
        cell_header_style = ParagraphStyle(
            'CellHeader',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=11,
            textColor=colors.HexColor('#FFFFFF')
        )
        cell_bold_style = ParagraphStyle(
            'CellBold',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor('#1F2937')
        )
        cell_mono_style = ParagraphStyle(
            'CellMono',
            parent=styles['Normal'],
            fontName='Courier-Bold',
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor('#1D4ED8')
        )
        cell_pwd_style = ParagraphStyle(
            'CellPwd',
            parent=styles['Normal'],
            fontName='Courier-Bold',
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor('#DC2626')
        )
        cell_text_style = ParagraphStyle(
            'CellText',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=10.5,
            textColor=colors.HexColor('#4B5563')
        )

        story = []

        # Header Block
        story.append(Paragraph("🛍️ ShopSphere Marketplace — User Credentials", title_style))
        story.append(Spacer(1, 4))
        story.append(Paragraph(f"Official Account Access Directory · Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", subtitle_style))
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#3B82F6'), spaceBefore=2, spaceAfter=14))

        # Quick Access Info Box
        quick_info_data = [
            [
                Paragraph("<b>Frontend Web Application:</b> <font color='#2563EB'>http://localhost:5173</font>", cell_text_style),
                Paragraph("<b>FastAPI Swagger Docs:</b> <font color='#2563EB'>http://127.0.0.1:8000/docs</font>", cell_text_style)
            ],
            [
                Paragraph("<b>Seller Studio Portal:</b> <font color='#2563EB'>http://localhost:5173/seller</font>", cell_text_style),
                Paragraph("<b>Admin Console Portal:</b> <font color='#2563EB'>http://localhost:5173/admin</font>", cell_text_style)
            ]
        ]
        t_info = Table(quick_info_data, colWidths=[270, 270])
        t_info.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#EFF6FF')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#BFDBFE')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#DBEAFE')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(t_info)
        story.append(Spacer(1, 10))

        # Section 1: Administrator
        story.append(Paragraph("1. Administrator Account", section_style))
        admin_data = [
            [
                Paragraph("Account Name", cell_header_style),
                Paragraph("Email / Login ID", cell_header_style),
                Paragraph("Password", cell_header_style),
                Paragraph("Role", cell_header_style),
                Paragraph("Permissions & Scope", cell_header_style)
            ],
            [
                Paragraph("ShopSphere Admin", cell_bold_style),
                Paragraph("admin@shopsphere.com", cell_mono_style),
                Paragraph("Admin123!", cell_pwd_style),
                Paragraph("<b>admin</b>", cell_bold_style),
                Paragraph("Full platform control: user moderation, listing approval, order oversight, stats.", cell_text_style)
            ]
        ]
        t_admin = Table(admin_data, colWidths=[95, 125, 75, 55, 190])
        t_admin.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E3A8A')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#F9FAFB')),
        ]))
        story.append(t_admin)
        story.append(Spacer(1, 10))

        # Section 2: Sellers
        story.append(Paragraph("2. Seller Profiles (Studio & Shop Management)", section_style))
        seller_data = [
            [
                Paragraph("Seller / Shop Name", cell_header_style),
                Paragraph("Email ID", cell_header_style),
                Paragraph("Password", cell_header_style),
                Paragraph("Active Listings & Specialty", cell_header_style),
                Paragraph("Studio Location", cell_header_style)
            ],
            [
                Paragraph("<b>Priya Sharma</b><br/><font color='#6B7280' size='7'>EduTech & Stationery Hub</font>", cell_bold_style),
                Paragraph("priya.seller@shopsphere.com", cell_mono_style),
                Paragraph("Seller123!", cell_pwd_style),
                Paragraph("5 Listings: Casio FX-991CW, TI-30XS, Parker Fountain Pen, Uni-ball Air, Classmate Pulse", cell_text_style),
                Paragraph("Malleshwaram, Bengaluru<br/>Ph: +91 98112 34567", cell_text_style)
            ],
            [
                Paragraph("<b>Rohan Verma</b><br/><font color='#6B7280' size='7'>Lumina Study & Living Co.</font>", cell_bold_style),
                Paragraph("rohan.seller@shopsphere.com", cell_mono_style),
                Paragraph("Seller123!", cell_pwd_style),
                Paragraph("5 Listings: Rhodia Webbie Journal, Philips LED Lamp, Nordic Wood Lamp, Braun Clock, Sunrise Clock", cell_text_style),
                Paragraph("Powai, Mumbai<br/>Ph: +91 97420 67890", cell_text_style)
            ],
            [
                Paragraph("<b>Ashish Garg</b><br/><font color='#6B7280' size='7'>Independent Seller</font>", cell_bold_style),
                Paragraph("gargashish1603@gmail.com", cell_mono_style),
                Paragraph("<i>(Existing account)</i>", cell_text_style),
                Paragraph("Stationery & Roller Pens (FLAIR Zoox U7)", cell_text_style),
                Paragraph("Bengaluru, India", cell_text_style)
            ]
        ]
        t_seller = Table(seller_data, colWidths=[120, 130, 75, 125, 90])
        t_seller.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#065F46')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#FFFFFF'), colors.HexColor('#F9FAFB')]),
        ]))
        story.append(t_seller)
        story.append(Spacer(1, 10))

        # Section 3: Buyers
        story.append(Paragraph("3. Buyer Profiles (Simulated Orders & Purchases)", section_style))
        buyer_data = [
            [
                Paragraph("Buyer Name", cell_header_style),
                Paragraph("Email ID", cell_header_style),
                Paragraph("Password", cell_header_style),
                Paragraph("Order History & Items Bought", cell_header_style),
                Paragraph("Default Delivery Address", cell_header_style)
            ],
            [
                Paragraph("<b>Aarav Mehta</b>", cell_bold_style),
                Paragraph("aarav.mehta@gmail.com", cell_mono_style),
                Paragraph("Buyer123!", cell_pwd_style),
                Paragraph("• Order #ord-1092a1: Casio 991CW + Notebooks (Delivered)<br/>• Order #ord-2041b3: Philips Lamp + Braun Clock (Shipped)", cell_text_style),
                Paragraph("Flat 402, Sunshine Residency, HSR Layout, Bengaluru 560102", cell_text_style)
            ],
            [
                Paragraph("<b>Sneha Kulkarni</b>", cell_bold_style),
                Paragraph("sneha.kulkarni@gmail.com", cell_mono_style),
                Paragraph("Buyer123!", cell_pwd_style),
                Paragraph("• Order #ord-3055c8: Parker Pen + Rhodia + Uni-ball (Delivered)<br/>• Order #ord-4019d4: Sunrise Wake-Up Alarm Clock (Packed)", cell_text_style),
                Paragraph("B-12, Green Glen Layout, Bellandur, Bengaluru 560103", cell_text_style)
            ],
            [
                Paragraph("<b>Vikramaditya Rao</b>", cell_bold_style),
                Paragraph("vikram.rao@gmail.com", cell_mono_style),
                Paragraph("Buyer123!", cell_pwd_style),
                Paragraph("• Order #ord-5077e6: TI-30XS Calculator + 2x Parker Pens (Placed)<br/>• Order #ord-6088f9: Nordic Table Lamp + Braun Clock (Shipped)", cell_text_style),
                Paragraph("Penthouse 8A, Prestige Shantiniketan, Whitefield, Bengaluru 560066", cell_text_style)
            ],
            [
                Paragraph("<b>Aditya Tayal</b>", cell_bold_style),
                Paragraph("aditya123@gmail.com1", cell_mono_style),
                Paragraph("<i>(Existing account)</i>", cell_text_style),
                Paragraph("• Earlier test orders & pen purchases", cell_text_style),
                Paragraph("Bengaluru, India", cell_text_style)
            ]
        ]
        t_buyer = Table(buyer_data, colWidths=[95, 125, 75, 135, 110])
        t_buyer.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4338CA')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#FFFFFF'), colors.HexColor('#F9FAFB')]),
        ]))
        story.append(t_buyer)
        story.append(Spacer(1, 14))

        # Footer Notice
        footer_data = [
            [
                Paragraph("<b>Security & Testing Notice:</b> These credentials are for local development and demonstration testing. To switch roles, sign in via <u>http://localhost:5173/login</u> or use the top navigation [Buy / Sell] toggle.", cell_text_style)
            ]
        ]
        t_footer = Table(footer_data, colWidths=[540])
        t_footer.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F3F4F6')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#D1D5DB')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(t_footer)

        doc.build(story)
        print(f"Generated PDF: {out_path}")

if __name__ == "__main__":
    targets = [
        os.path.abspath("c:/Users/dbfqz/Downloads/ShopSphere-Marketplace/ShopSphere_User_Credentials.pdf"),
        os.path.abspath("c:/Users/dbfqz/Downloads/ShopSphere-Marketplace/artifacts/shopsphere/public/ShopSphere_User_Credentials.pdf"),
    ]
    generate_credentials_pdf(targets)
