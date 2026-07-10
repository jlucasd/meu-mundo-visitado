import { useEffect, useRef } from 'react'
import { continents, countriesByContinent, TOTAL_COUNTRIES } from '../data/countries'
import { useCountryStore } from '../store/useCountryStore'

const SIZE = 1080

interface ShareCardProps {
  onClose: () => void
}

function drawCard(canvas: HTMLCanvasElement, visited: string[]) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const percent = (visited.length / TOTAL_COUNTRIES) * 100

  // fundo
  ctx.fillStyle = '#07070b'
  ctx.fillRect(0, 0, SIZE, SIZE)

  // estrelas sutis
  for (let i = 0; i < 90; i++) {
    const x = ((i * 727) % SIZE) + ((i * 31) % 17)
    const y = ((i * 389) % SIZE) + ((i * 13) % 23)
    ctx.fillStyle = `rgba(255,255,255,${0.08 + ((i * 7) % 10) / 40})`
    ctx.fillRect(x % SIZE, y % SIZE, 2, 2)
  }

  // moldura
  ctx.strokeStyle = '#1e1e2a'
  ctx.lineWidth = 2
  ctx.strokeRect(40, 40, SIZE - 80, SIZE - 80)

  // título
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 52px "Space Grotesk", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('MEU MUNDO', SIZE / 2, 150)
  ctx.fillStyle = '#00e5ff'
  ctx.fillText('VISITADO', SIZE / 2, 212)

  // número gigante
  ctx.fillStyle = '#00e5ff'
  ctx.font = 'bold 260px "Space Grotesk", sans-serif'
  ctx.shadowColor = 'rgba(0,229,255,0.5)'
  ctx.shadowBlur = 40
  ctx.fillText(String(visited.length), SIZE / 2, 500)
  ctx.shadowBlur = 0

  ctx.fillStyle = '#8b8b9e'
  ctx.font = '36px "JetBrains Mono", monospace'
  ctx.fillText(`de ${TOTAL_COUNTRIES} países · ${percent.toFixed(1)}% do mundo`, SIZE / 2, 570)

  // barra de progresso
  const barX = 140
  const barW = SIZE - 280
  ctx.fillStyle = '#1e1e2a'
  ctx.fillRect(barX, 610, barW, 14)
  ctx.fillStyle = '#00e5ff'
  ctx.fillRect(barX, 610, Math.max(barW * (percent / 100), percent > 0 ? 8 : 0), 14)

  // breakdown por continente
  ctx.textAlign = 'left'
  let y = 680
  for (const cont of continents) {
    const all = countriesByContinent.get(cont) ?? []
    const count = all.filter((c) => visited.includes(c.id)).length
    ctx.fillStyle = '#ffffff'
    ctx.font = '28px "Space Grotesk", sans-serif'
    ctx.fillText(cont, barX, y)
    ctx.fillStyle = count > 0 ? '#00e5ff' : '#8b8b9e'
    ctx.font = 'bold 28px "JetBrains Mono", monospace'
    ctx.textAlign = 'right'
    ctx.fillText(`${count}/${all.length}`, barX + barW, y)
    ctx.textAlign = 'left'
    ctx.fillStyle = '#1e1e2a'
    ctx.fillRect(barX, y + 12, barW, 6)
    if (all.length > 0 && count > 0) {
      ctx.fillStyle = '#00e5ff'
      ctx.fillRect(barX, y + 12, barW * (count / all.length), 6)
    }
    y += 60
  }

  // rodapé
  ctx.fillStyle = '#8b8b9e'
  ctx.font = '24px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  ctx.fillText('meu-mundo-visitado', SIZE / 2, SIZE - 44)
}

export default function ShareCard({ onClose }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const visited = useCountryStore((s) => s.visited)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // garante que as fontes web já estão disponíveis antes de desenhar
    document.fonts.ready.then(() => drawCard(canvas, visited))
    drawCard(canvas, visited)
  }, [visited])

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.download = 'meu-mundo-visitado.png'
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  const share = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(async (blob) => {
      if (!blob) return
      const file = new File([blob], 'meu-mundo-visitado.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Meu Mundo Visitado',
            text: `Já visitei ${visited.length} países, ${((visited.length / TOTAL_COUNTRIES) * 100).toFixed(1)}% do mundo! 🌍`,
          })
        } catch {
          // usuário cancelou o compartilhamento
        }
      } else {
        download()
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-full w-full max-w-md flex-col gap-3 border border-line bg-panel p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-sm uppercase tracking-widest text-neon">
            Compartilhar
          </h2>
          <button
            onClick={onClose}
            className="font-mono text-dim transition-colors hover:text-white"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          className="min-h-0 w-full border border-line object-contain"
        />
        <div className="flex gap-2">
          <button
            onClick={download}
            className="flex-1 border border-neon px-4 py-2 font-mono text-xs uppercase tracking-wider text-neon transition-colors hover:bg-neon hover:text-ink"
          >
            ⬇ Baixar PNG
          </button>
          <button
            onClick={share}
            className="flex-1 border border-gold px-4 py-2 font-mono text-xs uppercase tracking-wider text-gold transition-colors hover:bg-gold hover:text-ink"
          >
            ↗ Compartilhar
          </button>
        </div>
      </div>
    </div>
  )
}
