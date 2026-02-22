import { useState, useCallback } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  PRIVACY_POLICY_SECTIONS,
  PRIVACY_POLICY_LAST_UPDATED,
} from '@/lib/privacy-content'
function addTextToPdf(
  doc: { text: (s: string, x: number, y: number) => void; splitTextToSize: (s: string, w: number) => string[] },
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = doc.splitTextToSize(text, maxWidth)
  for (const line of lines) {
    doc.text(line, x, y)
    y += lineHeight
  }
  return y
}

export function PrivacyDownloadButton() {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = useCallback(async () => {
    setIsGenerating(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ format: 'a4', unit: 'mm' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      const maxWidth = pageWidth - margin * 2
      let y = 20

      const checkNewPage = () => {
        if (y > pageHeight - 25) {
          doc.addPage()
          y = 20
        }
      }

      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('AgentForm Privacy Policy', margin, y)
      y += 10

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Last updated: ${PRIVACY_POLICY_LAST_UPDATED}`, margin, y)
      y += 15

      for (const section of PRIVACY_POLICY_SECTIONS) {
        checkNewPage()
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        y = addTextToPdf(doc, section.title, margin, y, maxWidth, 6)
        y += 4

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')

        if (section.content) {
          checkNewPage()
          y = addTextToPdf(doc, section.content, margin, y, maxWidth, 5)
          y += 4
        }

        if (section.subsections) {
          for (const sub of section.subsections) {
            checkNewPage()
            doc.setFont('helvetica', 'bold')
            y = addTextToPdf(doc, sub.title, margin, y, maxWidth, 5)
            y += 2
            doc.setFont('helvetica', 'normal')
            checkNewPage()
            y = addTextToPdf(doc, sub.content, margin, y, maxWidth, 5)
            y += 4
          }
        }
      }

      doc.save('AgentForm-Privacy-Policy.pdf')
      toast.success('Privacy policy downloaded successfully')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate PDF'
      toast.error(`${message}. Click the button again to retry.`)
    } finally {
      setIsGenerating(false)
    }
  }, [])

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isGenerating}
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        inline-flex items-center justify-center gap-2
        px-8 py-4 rounded-xl font-bold text-white
        bg-[#FFE066] shadow-lg
        transition-all duration-200
        hover:scale-[1.02] hover:shadow-xl hover:brightness-110
        active:scale-[0.98]
        disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE066] focus-visible:ring-offset-2
      `}
      aria-label={isGenerating ? 'Generating PDF...' : 'Download privacy policy as PDF'}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <Download className="h-5 w-5" aria-hidden />
          <span>Download PDF</span>
        </>
      )}
    </button>
  )
}
