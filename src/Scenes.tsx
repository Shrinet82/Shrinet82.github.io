// Illustrated scenes, one per plate, drawn in the same ink-and-wash hand as
// the rest of the sketchbook. Each is composed in its "resting" state;
// motion.ts loops them like short motion-graphics clips while on screen.

type WashBlob = [string, number, number, number, number]

function Wash({ blobs }: { blobs: WashBlob[] }) {
  return (
    <g filter="url(#wash)" className="scene-wash">
      {blobs.map(([c, cx, cy, rx, ry], i) => (
        <ellipse key={i} className={`pig-${c}`} cx={cx} cy={cy} rx={rx} ry={ry} />
      ))}
    </g>
  )
}

// V: a chart on the easel, painted as you watch.
export function EaselScene() {
  return (
    <svg className="scene scene-sm" data-scene="easel" viewBox="0 0 360 300" role="img" aria-label="Illustration: a brush paints a chart on an easel">
      <Wash blobs={[['ochre', 180, 150, 120, 110]]} />
      <g filter="url(#rough)">
        <line className="s-ink" x1="120" y1="290" x2="170" y2="40" />
        <line className="s-ink" x1="240" y1="290" x2="190" y2="40" />
        <line className="s-ink" x1="180" y1="60" x2="180" y2="290" />
        <rect className="s-ink fill-paper" x="96" y="70" width="168" height="130" />
        <line className="s-ink" x1="84" y1="200" x2="276" y2="200" />
        <line className="s-ink thin" x1="112" y1="184" x2="248" y2="184" />
        <path id="paint-path" className="s-ink paint-line" d="M114 180 C 140 170, 150 120, 176 128 S 214 96, 246 88" />
        {[132, 158, 184, 210, 236].map((x, i) => (
          <rect key={x} className={`fill-ultra-soft paint-bar pb-${i}`} x={x - 6} y={184 - [18, 30, 44, 56, 70][i]} width="12" height={[18, 30, 44, 56, 70][i]} />
        ))}
      </g>
      <g className="brush" transform="translate(246 88)" filter="url(#rough)">
        <line className="s-ink" x1="0" y1="0" x2="52" y2="-44" />
        <path className="s-ink fill-ochre" d="M-4 4 L 4 -4 L 0 -8 L -8 0 Z" />
      </g>
    </svg>
  )
}

// VII: the desk after hours. Coffee, brushes, a sketchbook, a quiet pager.
export function DeskScene() {
  return (
    <svg className="scene" data-scene="desk" viewBox="0 0 440 300" role="img" aria-label="Illustration: a desk with coffee, a jar of brushes, a sketchbook and a quiet pager">
      <Wash blobs={[['ochre', 120, 190, 110, 80], ['ultra', 330, 200, 100, 70]]} />
      <g filter="url(#rough)">
        <line className="s-ink" x1="10" y1="260" x2="430" y2="260" />
        {/* mug */}
        <path className="s-ink fill-paper" d="M40 180 L 100 180 L 96 258 L 44 258 Z" />
        <path className="s-ink" d="M100 196 C 124 196, 124 236, 98 236" />
        {/* brush jar */}
        <path className="s-ink fill-jar" d="M140 200 L 196 200 L 192 258 L 144 258 Z" />
        {[
          [150, 'ochre', 110],
          [166, 'ultra', 96],
          [182, 'vermilion', 116],
        ].map(([x, c, top]) => (
          <g key={x as number}>
            <line className="s-ink" x1={x as number} y1="204" x2={(x as number) + 4} y2={top as number} />
            <path className={`s-ink fill-${c}`} d={`M${(x as number) + 4} ${top} l -4 -16 l 8 0 z`} />
          </g>
        ))}
        {/* sketchbook */}
        <path className="s-ink fill-paper" d="M220 246 L 300 234 L 380 246 L 300 258 Z" />
        <line className="s-ink thin" x1="300" y1="234" x2="300" y2="258" />
        <path className="s-ink thin" d="M244 244 C 256 236, 270 238, 282 242" />
        {/* pager */}
        <rect className="s-ink fill-ink" x="318" y="190" width="84" height="44" rx="8" />
        <rect className="fill-screen" x="326" y="198" width="54" height="20" rx="3" />
      </g>
      <text className="pager-t" x="330" y="212">
        all quiet
      </text>
      <circle className="pager-led" cx="392" cy="208" r="4" />
      <g className="steam">
        {[58, 72, 86].map((x) => (
          <path key={x} className="steam-line" d={`M${x} 170 C ${x - 8} 156, ${x + 8} 146, ${x} 132 C ${x - 8} 120, ${x + 6} 112, ${x} 100`} />
        ))}
      </g>
    </svg>
  )
}
