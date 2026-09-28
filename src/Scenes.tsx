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

function Person({ x, y, body, flip = false, className = '' }: { x: number; y: number; body: string; flip?: boolean; className?: string }) {
  return (
    <g className={`person ${className}`} transform={`translate(${x} ${y})${flip ? ' scale(-1 1)' : ''}`}>
      <path className={`s-ink fill-${body}`} d="M-14 64 C -16 30, -12 22, 0 22 C 12 22, 16 30, 14 64 Z" />
      <circle className="s-ink fill-skin" cx="0" cy="8" r="11" />
      <path className="s-ink" d="M-11 5 C -8 -6, 8 -6, 11 5" />
      <line className="s-ink" x1="-6" y1="64" x2="-6" y2="84" />
      <line className="s-ink" x1="6" y1="64" x2="6" y2="84" />
    </g>
  )
}

function Robot({ x, y }: { x: number; y: number }) {
  return (
    <g className="robot" transform={`translate(${x} ${y})`}>
      <line className="s-ink" x1="25" y1="0" x2="25" y2="-14" />
      <circle className="s-ink fill-ochre antenna" cx="25" cy="-18" r="5" />
      <rect className="s-ink fill-paper" x="5" y="0" width="40" height="32" rx="9" />
      <circle className="s-dot eye" cx="18" cy="16" r="3" />
      <circle className="s-dot eye" cx="32" cy="16" r="3" />
      <rect className="s-ink fill-ultra-soft" x="0" y="38" width="50" height="56" rx="12" />
      <circle className="s-ink fill-paper" cx="25" cy="62" r="7" />
      <line className="s-ink" x1="15" y1="94" x2="15" y2="116" />
      <line className="s-ink" x1="35" y1="94" x2="35" y2="116" />
    </g>
  )
}

// I: a queue for tickets, or one form that drops a bucket.
export function ProvisionScene() {
  return (
    <svg className="scene" data-scene="provision" viewBox="0 0 520 360" role="img" aria-label="Illustration: people queue at a ticket window while a self-service machine drops out an S3 bucket">
      <Wash blobs={[['ochre', 120, 200, 120, 110], ['ultra', 420, 170, 110, 140]]} />
      <g filter="url(#rough)">
        <line className="s-ink floor" x1="10" y1="330" x2="510" y2="330" />
        {/* ticket booth */}
        <rect className="s-ink fill-paper" x="20" y="96" width="112" height="234" rx="3" />
        <rect className="s-ink fill-ochre-soft" x="30" y="108" width="92" height="26" />
        <text className="sign" x="76" y="126">
          TICKETS
        </text>
        <rect className="s-ink fill-ink" x="40" y="160" width="72" height="50" rx="2" />
        {[168, 178, 188, 198].map((y) => (
          <line key={y} className="s-ink shutter" x1="42" y1={y} x2="110" y2={y} />
        ))}
        {/* clock over the queue */}
        <circle className="s-ink fill-paper" cx="226" cy="84" r="30" />
        <line className="s-ink hand-long" x1="226" y1="84" x2="226" y2="62" />
        <line className="s-ink hand-short" x1="226" y1="84" x2="240" y2="84" />
        {/* self-service machine */}
        <rect className="s-ink fill-paper" x="346" y="40" width="150" height="290" rx="10" />
        <rect className="s-ink fill-screen" x="362" y="58" width="118" height="88" rx="4" />
        {[80, 102, 124].map((y, i) => (
          <line key={y} className={`s-ink field field-${i}`} x1="376" y1={y} x2={460 - i * 14} y2={y} />
        ))}
        <circle className="s-ink fill-ultra btn-press" cx="421" cy="176" r="14" />
        <rect className="s-ink fill-ink" x="372" y="232" width="98" height="64" rx="4" />
      </g>
      <Person x={176} y={236} body="vermilion" className="q0" />
      <Person x={220} y={238} body="sap" className="q1" />
      <Person x={264} y={236} body="ochre" className="q2" />
      <g className="ticket-hold" filter="url(#rough)">
        <rect className="s-ink fill-paper" x="190" y="262" width="16" height="11" transform="rotate(-10 198 268)" />
      </g>
      <text className="scene-note" x="190" y="30">
        45 min
      </text>
      {/* the bucket (a pail, obviously) */}
      <g className="pail" filter="url(#rough)">
        <path className="s-ink fill-ultra" d="M402 250 L 440 250 L 434 286 L 408 286 Z" />
        <path className="s-ink" d="M404 252 C 404 232, 438 232, 438 252" />
        <text className="pail-t" x="412" y="274">
          s3
        </text>
      </g>
      <g className="cursor" transform="translate(430 186)">
        <path className="s-ink fill-paper" d="M0 0 L 0 26 L 7 19 L 12 30 L 17 28 L 12 17 L 22 17 Z" />
      </g>
      <text className="scene-note n-ultra-t tag-8" x="480" y="350" textAnchor="end">
        8 min
      </text>
    </svg>
  )
}

// III: buckets keep spawning; a policy sweeps them away.
export function GovernScene() {
  const pails = [
    [70, 262],
    [120, 262],
    [170, 262],
    [96, 226],
    [146, 226],
    [220, 262],
    [122, 190],
  ]
  return (
    <svg className="scene" data-scene="govern" viewBox="0 0 520 320" role="img" aria-label="Illustration: S3 buckets and EC2 boxes keep spawning until a policy broom sweeps them away in under two minutes">
      <Wash blobs={[['vermilion', 150, 240, 110, 56], ['ochre', 440, 80, 60, 52]]} />
      <g filter="url(#rough)">
        <line className="s-ink floor" x1="10" y1="290" x2="510" y2="290" />
        {/* alarm light */}
        <path className="s-ink fill-paper" d="M40 60 L 72 60 L 68 88 L 44 88 Z" />
        <path className="s-ink fill-vermilion alarm" d="M44 60 C 44 36, 68 36, 68 60 Z" />
        {/* hourglass */}
        <g className="hourglass" style={{ transformOrigin: '440px 80px' }}>
          <line className="s-ink" x1="420" y1="48" x2="460" y2="48" />
          <line className="s-ink" x1="420" y1="112" x2="460" y2="112" />
          <path className="s-ink fill-paper" d="M426 48 L 454 48 L 440 80 L 454 112 L 426 112 L 440 80 Z" />
          <path className="fill-sand" d="M432 106 L 448 106 L 440 94 Z" />
        </g>
      </g>
      <text className="scene-note n-red-t" x="440" y="136" textAnchor="middle">
        under 2 min
      </text>
      <g className="spawn">
        {pails.map(([x, y], i) =>
          i % 3 === 2 ? (
            <g key={i} className="thing" transform={`translate(${x} ${y})`} filter="url(#rough)">
              <path className="s-ink fill-ochre-soft" d="M0 0 L 30 0 L 40 -10 L 10 -10 Z M0 0 L 0 28 L 30 28 L 30 0 M30 28 L 40 18 L 40 -10" />
              <text className="thing-t" x="4" y="19">
                ec2
              </text>
            </g>
          ) : (
            <g key={i} className="thing" transform={`translate(${x} ${y})`} filter="url(#rough)">
              <path className="s-ink fill-ultra" d="M0 0 L 36 0 L 31 28 L 5 28 Z" />
              <path className="s-ink" d="M2 2 C 2 -16, 34 -16, 34 2" />
            </g>
          ),
        )}
      </g>
      <g className="broom" filter="url(#rough)">
        <line className="s-ink broom-handle" x1="380" y1="140" x2="340" y2="262" />
        <path className="s-ink fill-ochre-soft" d="M322 252 L 364 264 L 356 294 L 306 282 Z" />
        {[312, 322, 332, 342, 352].map((x) => (
          <line key={x} className="s-ink thin" x1={x + 2} y1="268" x2={x - 4} y2="290" />
        ))}
        <rect className="s-ink fill-paper" x="362" y="160" width="74" height="24" rx="3" transform="rotate(-12 399 172)" />
        <text className="tag-t" x="370" y="178" transform="rotate(-12 399 172)">
          policy.yml
        </text>
      </g>
    </svg>
  )
}

// IV: the robot reads logs, asks you, you tap PR, the branch merges.
export function HealScene() {
  return (
    <svg className="scene" data-scene="heal" viewBox="0 0 520 340" role="img" aria-label="Illustration: the agent reads logs, asks a human to approve in Slack, then a pull request merges into main">
      <Wash blobs={[['ultra', 140, 150, 130, 100], ['sap', 400, 280, 120, 50]]} />
      <g filter="url(#rough)">
        {/* desk + laptop */}
        <line className="s-ink" x1="30" y1="200" x2="240" y2="200" />
        <path className="s-ink fill-paper" d="M120 200 L 132 146 L 214 146 L 202 200 Z" />
        {[160, 170, 180].map((y, i) => (
          <line key={y} className={`s-ink thin log log-${i}`} x1={140 - i} y1={y} x2={192 - i * 8} y2={y} />
        ))}
        {/* git: main + a PR branch */}
        <line className="s-ink main-line" x1="40" y1="290" x2="490" y2="290" />
        <path className="s-ink branch" d="M170 290 C 200 250, 220 250, 250 250 L 330 250 C 360 250, 380 250, 410 290" />
        {[80, 130, 170, 410, 460].map((x) => (
          <circle key={x} className="s-ink fill-paper commit" cx={x} cy="290" r="7" />
        ))}
      </g>
      <Robot x={44} y={96} />
      <path id="pr-branch" className="route" d="M170 290 C 200 250, 220 250, 250 250 L 330 250 C 360 250, 380 250, 410 290" />
      <circle className="merge-dot" cx="410" cy="290" r="9" />
      <g className="bubble" filter="url(#rough)">
        <path className="s-ink fill-paper" d="M246 70 L 414 70 C 422 70, 426 74, 426 82 L 426 122 C 426 130, 422 134, 414 134 L 280 134 L 262 150 L 266 134 L 246 134 C 238 134, 234 130, 234 122 L 234 82 C 234 74, 238 70, 246 70 Z" />
      </g>
      <text className="bubble-t" x="250" y="96">
        Patch the manifest?
      </text>
      <g className="bubble-btns">
        <rect className="s-ink fill-paper" x="250" y="106" width="52" height="18" rx="4" />
        <text className="btn-t" x="276" y="119" textAnchor="middle">
          Approve
        </text>
        <rect className="s-ink fill-paper pr-btn" x="308" y="106" width="30" height="18" rx="4" />
        <text className="btn-t pr-t" x="323" y="119" textAnchor="middle">
          PR
        </text>
        <rect className="s-ink fill-paper" x="344" y="106" width="46" height="18" rx="4" />
        <text className="btn-t" x="367" y="119" textAnchor="middle">
          Reject
        </text>
      </g>
      <Person x={470} y={116} body="ochre" flip className="human" />
      <g className="finger" transform="translate(323 115)">
        <circle className="s-ink fill-skin" cx="0" cy="0" r="6" />
      </g>
      <g className="pr-card">
        <rect className="s-ink fill-paper" x="-20" y="-13" width="40" height="26" rx="4" />
        <text className="pr-card-t" x="0" y="4" textAnchor="middle">
          PR
        </text>
      </g>
      <text className="scene-note n-sap-t synced" x="410" y="326" textAnchor="middle">
        merged, synced
      </text>
    </svg>
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
