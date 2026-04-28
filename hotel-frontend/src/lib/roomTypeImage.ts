function encodeSvg(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`
}

type RoomTypeVisual = {
  title: string
  subtitle: string
  palette: {
    start: string
    end: string
    accent: string
    surface: string
  }
  bedVariant: 'single' | 'double' | 'twin' | 'family' | 'suite'
}

function resolveRoomTypeVisual(name: string): RoomTypeVisual {
  const text = name.trim()

  if (/(套房|suite)/i.test(text)) {
    return {
      title: 'SUITE',
      subtitle: '会客休闲',
      palette: {
        start: '#4C4E8F',
        end: '#7B5BE6',
        accent: '#F7D774',
        surface: '#F3EEFF',
      },
      bedVariant: 'suite',
    }
  }

  if (/(亲子|家庭|family)/i.test(text)) {
    return {
      title: 'FAMILY',
      subtitle: '亲子舒住',
      palette: {
        start: '#F08B5A',
        end: '#F6C35B',
        accent: '#FFF2B2',
        surface: '#FFF5E8',
      },
      bedVariant: 'family',
    }
  }

  if (/(双床|标间|标准间|双人)/i.test(text)) {
    return {
      title: 'TWIN',
      subtitle: '双床布局',
      palette: {
        start: '#316B8C',
        end: '#4FA7C9',
        accent: '#9EE3F5',
        surface: '#EAF8FD',
      },
      bedVariant: 'twin',
    }
  }

  if (/(单人|single)/i.test(text)) {
    return {
      title: 'SINGLE',
      subtitle: '一人入住',
      palette: {
        start: '#4D7C4A',
        end: '#8ABA58',
        accent: '#D9F48A',
        surface: '#F3F8E9',
      },
      bedVariant: 'single',
    }
  }

  if (/(大床|双人大床|king|queen)/i.test(text)) {
    return {
      title: 'KING',
      subtitle: '大床舒眠',
      palette: {
        start: '#AF4D6D',
        end: '#E27A8A',
        accent: '#FFD0D0',
        surface: '#FFF1F2',
      },
      bedVariant: 'double',
    }
  }

  return {
    title: 'ROOM',
    subtitle: '精选房型',
    palette: {
      start: '#546375',
      end: '#7A92A8',
      accent: '#D6E5F7',
      surface: '#F3F7FB',
    },
    bedVariant: 'double',
  }
}

function renderBed(variant: RoomTypeVisual['bedVariant'], accent: string, surface: string) {
  if (variant === 'single') {
    return `
      <rect x="92" y="102" width="56" height="78" rx="14" fill="${accent}" opacity="0.94"/>
      <rect x="100" y="112" width="40" height="20" rx="10" fill="${surface}"/>
      <rect x="85" y="176" width="70" height="10" rx="5" fill="#ffffff" opacity="0.42"/>
    `
  }

  if (variant === 'twin') {
    return `
      <rect x="44" y="104" width="58" height="76" rx="14" fill="${accent}" opacity="0.94"/>
      <rect x="53" y="114" width="40" height="18" rx="9" fill="${surface}"/>
      <rect x="138" y="104" width="58" height="76" rx="14" fill="${accent}" opacity="0.94"/>
      <rect x="147" y="114" width="40" height="18" rx="9" fill="${surface}"/>
      <rect x="36" y="176" width="168" height="10" rx="5" fill="#ffffff" opacity="0.34"/>
    `
  }

  if (variant === 'family') {
    return `
      <rect x="30" y="108" width="124" height="72" rx="14" fill="${accent}" opacity="0.94"/>
      <rect x="39" y="118" width="34" height="18" rx="9" fill="${surface}"/>
      <rect x="76" y="118" width="34" height="18" rx="9" fill="${surface}"/>
      <rect x="113" y="118" width="32" height="18" rx="9" fill="${surface}"/>
      <rect x="162" y="122" width="48" height="58" rx="14" fill="${surface}" opacity="0.94"/>
      <rect x="169" y="131" width="34" height="14" rx="7" fill="${accent}" opacity="0.92"/>
      <rect x="22" y="176" width="192" height="10" rx="5" fill="#ffffff" opacity="0.32"/>
    `
  }

  if (variant === 'suite') {
    return `
      <rect x="34" y="112" width="118" height="68" rx="14" fill="${accent}" opacity="0.94"/>
      <rect x="45" y="122" width="42" height="18" rx="9" fill="${surface}"/>
      <rect x="94" y="122" width="42" height="18" rx="9" fill="${surface}"/>
      <rect x="162" y="128" width="42" height="38" rx="12" fill="${surface}" opacity="0.96"/>
      <rect x="156" y="164" width="54" height="10" rx="5" fill="${accent}" opacity="0.96"/>
      <rect x="28" y="176" width="184" height="10" rx="5" fill="#ffffff" opacity="0.32"/>
    `
  }

  return `
    <rect x="46" y="102" width="148" height="78" rx="16" fill="${accent}" opacity="0.94"/>
    <rect x="58" y="113" width="52" height="20" rx="10" fill="${surface}"/>
    <rect x="130" y="113" width="52" height="20" rx="10" fill="${surface}"/>
    <rect x="38" y="176" width="164" height="10" rx="5" fill="#ffffff" opacity="0.34"/>
  `
}

export function getRoomTypeImage(name: string) {
  const visual = resolveRoomTypeVisual(name)
  const bed = renderBed(visual.bedVariant, visual.palette.accent, visual.palette.surface)

  return encodeSvg(`
    <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="240" rx="28" fill="url(#bg)"/>
      <rect x="18" y="18" width="204" height="204" rx="22" fill="#ffffff" opacity="0.08"/>
      <circle cx="190" cy="52" r="26" fill="#ffffff" opacity="0.16"/>
      <circle cx="58" cy="196" r="42" fill="#ffffff" opacity="0.08"/>
      <rect x="28" y="30" width="82" height="26" rx="13" fill="#ffffff" opacity="0.16"/>
      <text x="40" y="48" font-size="16" font-family="Arial, sans-serif" font-weight="700" fill="#ffffff">${visual.title}</text>
      <text x="28" y="82" font-size="24" font-family="Arial, sans-serif" font-weight="700" fill="#ffffff">${name}</text>
      <text x="28" y="104" font-size="14" font-family="Arial, sans-serif" fill="#ffffff" opacity="0.88">${visual.subtitle}</text>
      <rect x="28" y="132" width="184" height="64" rx="20" fill="#1F2A37" opacity="0.14"/>
      ${bed}
      <defs>
        <linearGradient id="bg" x1="20" y1="22" x2="214" y2="220" gradientUnits="userSpaceOnUse">
          <stop stop-color="${visual.palette.start}"/>
          <stop offset="1" stop-color="${visual.palette.end}"/>
        </linearGradient>
      </defs>
    </svg>
  `)
}
