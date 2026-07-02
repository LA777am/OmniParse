from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def create_pdf(filename):
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, "Q3 Financial Performance Summary")
    
    # Paragraph
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 80, "The third quarter results demonstrated strong growth across all sectors.")
    c.drawString(50, height - 100, "Revenue increased significantly compared to the previous quarter.")
    c.drawString(50, height - 120, "This growth was primarily driven by our enterprise software division.")
    
    # Table Header
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, height - 160, "Division")
    c.drawString(200, height - 160, "Q2 Revenue ($M)")
    c.drawString(350, height - 160, "Q3 Revenue ($M)")
    c.drawString(500, height - 160, "Growth (%)")
    
    # Table Row 1
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 180, "Enterprise")
    c.drawString(200, height - 180, "120.5")
    c.drawString(350, height - 180, "145.0")
    c.drawString(500, height - 180, "+20.3%")
    
    # Table Row 2
    c.drawString(50, height - 200, "Consumer")
    c.drawString(200, height - 200, "85.0")
    c.drawString(350, height - 200, "88.5")
    c.drawString(500, height - 200, "+4.1%")
    
    # Table Row 3
    c.drawString(50, height - 220, "Hardware")
    c.drawString(200, height - 220, "42.0")
    c.drawString(350, height - 220, "40.0")
    c.drawString(500, height - 220, "-4.7%")
    
    c.save()

if __name__ == "__main__":
    create_pdf("financial_demo.pdf")
